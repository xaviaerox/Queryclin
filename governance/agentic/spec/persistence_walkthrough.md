# Walkthrough: Persistencia Autónoma de Formularios y Sistema de Importación/Exportación JSON

Hemos implementado con éxito la capa de persistencia lateral para formularios dinámicos y el mecanismo de importación/exportación autónomo con sincronización automática en el repositorio de Queryclin.

## Cambios Realizados

### 1. Persistencia y Almacenamiento Local
- **FormRegistryStore.ts**: Base de datos aislada en IndexedDB (`QueryclinRegistryDB`) para almacenar y persistir los mappings e historial de versiones de los formularios creados por el administrador de forma independiente a la base de datos de pacientes (`QueryclinDB`).
- **formSerializer.ts / formExporter.ts / formImporter.ts**: Lógica para serializar mappings, generar descargas de archivos JSON y validar estrictamente esquemas de importación manual.

### 2. Cargador Unificado en Runtime y Marcas de Borrado (Tombstones)
- **runtimeFormsLoader.ts**: Une de forma jerárquica los formularios estáticos (prioridad absoluta), mappings compilados, archivos JSON en `src/custom-forms/` y los registros editados locales en IndexedDB.
- **Tombstones**: Cuando un administrador elimina un formulario dinámico, se guarda una marca `DELETED_${id}` en IndexedDB que oculta el formulario permanentemente del sistema e impide que resurja tras recargas.

### 3. Middleware de Servidor de Desarrollo (Vite Sync)
- **vite.config.ts**: Se integró el plugin `save-custom-form-api` para interceptar llamadas locales:
  - `POST /api/save-custom-form`: Escribe de forma síncrona el JSON en `src/custom-forms/form-${form.id}.json` en el disco.
  - `POST /api/delete-custom-form`: Elimina el archivo físico de la carpeta del repositorio cuando el formulario se borra del Admin Studio.
- Las llamadas fetch se asocian con `import.meta.env.BASE_URL` para garantizar su correcto direccionamiento independientemente de la ruta base del servidor de desarrollo.

---

## Verificación de Calidad

### Pruebas de Compilación
- Ejecutamos `npm run build` con éxito. Se compiló el proyecto React + TypeScript sin errores de compilación ni problemas de empaquetado.

### Pruebas Unitarias
- Suite de pruebas lógicas unitarias implementada en `src/__tests__/formPersistence.test.ts` con cobertura de:
  - Guardado persistente correcto en IndexedDB.
  - Carga y mezcla determinista de formularios (los estáticos no se sobrescriben).
  - Validación de esquema en la importación de JSON.
  - Exportación automática genera objetos estructurados correctamente.
  - Comportamiento de marcas de borrado (tombstones).
  - Prioridad de IndexedDB sobre RUNTIME_FORMS.
- Todas las pruebas de Vitest pasaron exitosamente (71/71 tests aprobados).
