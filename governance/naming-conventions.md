# naming-conventions.md — Convenciones de Nomenclatura

## Código (TypeScript)
- **Componentes**: PascalCase (ej: `HCEView.tsx`).
- **Funciones/Variables**: camelCase (ej: `handleExport`).
- **Interfaces**: PascalCase (ej: `PatientData`).
- **Archivos**: PascalCase para componentes, camelCase para utilidades/workers.

## Clinical Data
- **Identificadores**: Mayúsculas y Guiones Bajos si vienen de RAW (ej: `ID_TOMA`).
- **Categorías**: Mayúsculas para visualización (ej: `ANAMNESIS`).
- **Alias**: Mantener consistencia con los nombres canónicos definidos en `mappings.ts`.
