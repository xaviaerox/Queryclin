# task-governance.md — Gobernanza de Tareas

## Flujo de Tareas
- Las tareas deben estar atomizadas.
- Una tarea no puede durar más de una sesión de trabajo sin un checkpoint documentado.
- El éxito de una tarea se mide por la validación del `Resultado Esperado`.

## Gestión de Riesgos
- Si una tarea afecta a `QueryEngine` o `csv.worker.ts`, se requiere validación cruzada con datasets de prueba existentes.
- Cualquier cambio en la base de datos IndexedDB debe incluir un plan de migración o limpieza segura.
