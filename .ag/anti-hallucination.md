# anti-hallucination.md — Políticas Anti-Alucinación

## Prohibiciones Estrictas
- **No inventar mappings**: Si una clave no existe en `mappings.ts`, tratarla como campo no mapeado.
- **No crear campos clínicos**: No añadir campos ficticios a las estructuras `RegistroToma` o `Patient`.
- **No renombrar estructuras**: Los nombres de las columnas en los archivos originales son sagrados; usar alias en `mappings.ts` pero no modificar el origen.
- **No asumir layouts**: No simplificar la jerarquía visual de los formularios HCE (Categoría > Subcategoría).

## Verificación de Datos
- Siempre contrastar los cambios contra el `fieldDictionary.ts` y `mappings.ts`.
- Validar que las funciones de búsqueda respeten el motor BM25 sin introducir heurísticas paralelas.
- Asegurar que la exportación XLSX mantenga la paridad exacta con la vista del visor.
