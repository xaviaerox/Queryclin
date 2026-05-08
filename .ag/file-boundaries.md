# file-boundaries.md — Límites y Zonas de Riesgo

## Archivos Críticos (Alta Sensibilidad)
- `src/core/mappings.ts`: Corazón del determinismo clínico.
- `src/engine/QueryEngine.ts`: Lógica de búsqueda BM25.
- `src/storage/indexedDB.ts`: Estructura de persistencia.
- `src/ingestion/csv.worker.ts`: Motor de ingesta y validación.

## Zonas Prohibidas (No modificar sin aprobación)
- Lógica de normalización de cadenas en `utils/stringNormalizer.ts`.
- Algoritmo de ranking de relevancia en `QueryEngine.ts`.
- Estructura de `IndexedDB` (migraciones complejas).

## Módulos de Alto Riesgo
- `HCEView.tsx`: Renderizado jerárquico complejo de formularios.
- `Results.tsx`: Gestión de grandes listas y exportación masiva.
