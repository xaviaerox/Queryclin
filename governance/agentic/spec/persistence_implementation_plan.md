# Plan de Implementación: Persistencia de Formularios Dinámicos + Sistema de Importación/Exportación JSON

Añadir una capa de persistencia lateral no invasiva (Form Registry Layer) para formularios generados dinámicamente en Queryclin Admin Studio, incluyendo guardado en IndexedDB (con su propia base de datos aislada), descarga automática de JSON al publicar, importación manual desde JSON y un cargador unificado en runtime.

## User Review Required

> [!IMPORTANT]
> - **Aislamiento de Almacenamiento**: Proponemos crear una base de datos IndexedDB dedicada (`QueryclinRegistryDB`) para la capa de registro de formularios. Esto asegura que la limpieza de datos médicos (`db.clear()`), que ocurre al iniciar nuevas sesiones para preservar la privacidad del paciente, no borre los esquemas y formularios diseñados/importados por el administrador.
> - **Estrategia de Fusión (Merge)**: La fusión de formularios en runtime seguirá la regla estricta de que los formularios estáticos (`STATIC_FORMS` y `FORMS` base) son prioritarios y no se pueden sobrescribir. Cualquier formulario dinámico importado o diseñado con el mismo ID que uno estático será descartado o ignorado para evitar alteraciones en el núcleo del sistema.
> - **Middleware de Desarrollo**: Añadiremos un middleware en la configuración del servidor de desarrollo de Vite (`vite.config.ts`) que solo responde en desarrollo (`npm run dev`). Este middleware interceptará las peticiones a `/api/save-custom-form` y `/api/delete-custom-form` para realizar operaciones de escritura y borrado directo en el sistema de archivos (`src/custom-forms/`).
> - **Nombres de Archivo Deterministas**: Proponemos guardar cada formulario en un archivo con el formato `form-${id}.json` (ej. `form-schema-1780482493481.json`). Esto evita colisiones de nombres, permite que cambios sucesivos se reflejen como modificaciones del mismo archivo en Git (evitando saturar el historial del repositorio con múltiples archivos redundantes), y se integra directamente con el mecanismo de recarga en caliente de Vite.
> - **Fallback Silencioso en Producción**: En el build de producción (solución estática), estas peticiones no se realizarán, garantizando que el sistema siga operando en modo estático sin requerir un backend Node activo.

## Open Questions

*Ninguna pregunta abierta. El flujo de carga dinámica ya lee automáticamente de `src/custom-forms/*.json` mediante Vite Glob, por lo que escribir directamente en esa carpeta al publicar completa el ciclo de retroalimentación autónoma de forma transparente.*

## Proposed Changes

### Capa de Persistencia y Serialización JSON

#### [NEW] [FormRegistryStore.ts](file:///c:/Users/hrmadm/Documents/GitHub/Queryclin/src/admin-studio/persistence/FormRegistryStore.ts)
Wrapper de IndexedDB para la base de datos `QueryclinRegistryDB` (almacén `forms`).
- Implementar la interfaz `StoredForm`.
- Implementar los métodos de guardado, lectura, borrado y marcas de eliminación (tombstones).

#### [NEW] [formSerializer.ts](file:///c:/Users/hrmadm/Documents/GitHub/Queryclin/src/admin-studio/persistence/formSerializer.ts)
Serializador de `FormMapping` para exportación estructurada y reconstrucción visual.

#### [NEW] [formExporter.ts](file:///c:/Users/hrmadm/Documents/GitHub/Queryclin/src/admin-studio/persistence/formExporter.ts)
Módulo encargado de generar la descarga del archivo en el navegador.

#### [NEW] [formImporter.ts](file:///c:/Users/hrmadm/Documents/GitHub/Queryclin/src/admin-studio/persistence/formImporter.ts)
Validador estricto del esquema JSON importado.

---

### Capa de Carga y Fusión en Runtime

#### [NEW] [runtimeFormsLoader.ts](file:///c:/Users/hrmadm/Documents/GitHub/Queryclin/src/admin-studio/runtime/runtimeFormsLoader.ts)
Cargador unificado para inyectar formularios en tiempo de ejecución.
- Resuelve la mezcla determinista de formularios (Estáticos -> IndexedDB -> custom-forms -> mappings.runtime).
- Filtra por tombstones (`DELETED_${id}`).

---

### Integración de Interfaz e Ingesta

#### [MODIFY] [AdminDashboard.tsx](file:///c:/Users/hrmadm/Documents/GitHub/Queryclin/src/admin-studio/ui/AdminDashboard.tsx)
- Integrar importación manual de JSON con auto-guardado en repositorio.
- Auto-recuperación de formularios en disco al inicializar.
- Integrar borrado de esquemas con eliminación del archivo físico del repositorio.

#### [MODIFY] [FormDesigner.tsx](file:///c:/Users/hrmadm/Documents/GitHub/Queryclin/src/admin-studio/ui/FormDesigner.tsx)
- Al publicar, compilar el esquema, guardarlo localmente y enviar petición a la API local de Vite para guardarlo en la carpeta del repositorio.

#### [MODIFY] [Home.tsx](file:///c:/Users/hrmadm/Documents/GitHub/Queryclin/src/components/Home.tsx)
- Utilizar `loadRuntimeForms()` para listar formularios de ingesta.

#### [MODIFY] [App.tsx](file:///c:/Users/hrmadm/Documents/GitHub/Queryclin/src/App.tsx)
- Utilizar `loadRuntimeForms()` para resolver mappings durante la carga de CSV.

#### [MODIFY] [HCEView.tsx](file:///c:/Users/hrmadm/Documents/GitHub/Queryclin/src/components/HCEView.tsx)
- Utilizar `loadRuntimeForms()` para renderizar visor clínico.

#### [MODIFY] [vite.config.ts](file:///c:/Users/hrmadm/Documents/GitHub/Queryclin/vite.config.ts)
- Middleware de desarrollo para interceptar `/api/save-custom-form` y `/api/delete-custom-form`.
