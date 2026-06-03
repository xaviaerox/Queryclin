import { STATIC_FORMS, RUNTIME_FORMS, FormMapping } from '../../core/mappings';
import { formRegistryStore } from '../persistence/FormRegistryStore';

/**
 * Carga de forma segura y unificada todos los formularios registrados.
 * Garantiza la regla:
 *  - static forms overrideable = false (los estáticos no se sobrescriben)
 *  - dynamic forms = additive/overrideable (los dinámicos de base de datos sobrescriben a los de mappings.runtime.ts y custom-forms JSON si coinciden en ID, y soportan eliminación)
 */
export async function loadRuntimeForms(): Promise<FormMapping[]> {
  // 1. Obtener los formularios estáticos inmutables de Queryclin
  const staticForms = STATIC_FORMS || [];

  // 2. Obtener los formularios dinámicos persistidos y los IDs eliminados (tombstones) de IndexedDB
  let deletedIds = new Set<string>();
  let dynamicStored: any[] = [];
  try {
    deletedIds = await formRegistryStore.getDeletedFormIds();
    dynamicStored = await formRegistryStore.getAllForms();
  } catch (err) {
    console.error('[RuntimeLoader] Error al cargar datos de IndexedDB:', err);
  }

  // 3. Coleccionar formularios dinámicos activos en orden de prioridad
  const activeDynamic = new Map<string, FormMapping>();

  // A. Agregar formularios desde RUNTIME_FORMS (de mappings.runtime.ts en disco) si no están borrados
  if (Array.isArray(RUNTIME_FORMS)) {
    for (const form of RUNTIME_FORMS) {
      if (form && form.id && !deletedIds.has(form.id)) {
        activeDynamic.set(form.id, form);
      }
    }
  }

  // B. Agregar formularios autónomos de la carpeta del repositorio src/custom-forms/*.json (Vite Glob)
  try {
    const modules = import.meta.glob('../../custom-forms/*.json', { eager: true });
    for (const path in modules) {
      const module: any = modules[path];
      if (module) {
        const formMapping = module.form && module.form.id ? module.form : (module.id ? module : null);
        if (formMapping && formMapping.id && !deletedIds.has(formMapping.id)) {
          activeDynamic.set(formMapping.id, formMapping);
        }
      }
    }
  } catch (err) {
    console.error('[RuntimeLoader] Error al cargar custom-forms globs:', err);
  }

  // C. Agregar formularios desde IndexedDB (sobrescriben a RUNTIME_FORMS/custom-forms si coinciden en ID)
  for (const sf of dynamicStored) {
    if (sf && sf.payload && sf.id && !deletedIds.has(sf.id)) {
      activeDynamic.set(sf.id, sf.payload);
    }
  }

  const staticIds = new Set(staticForms.map(f => f.id));

  // 4. Filtrar para asegurar que ningún formulario dinámico colisione con los estáticos inmutables
  const filteredDynamic = Array.from(activeDynamic.values())
    .filter((payload: FormMapping) => payload && !staticIds.has(payload.id));

  // 5. Retornar la mezcla segura de ambos conjuntos
  return [...staticForms, ...filteredDynamic];
}
