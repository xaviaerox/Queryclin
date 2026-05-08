# architecture-rules.md — Reglas Arquitectónicas

## Invariantes
- **Local-First**: Prohibido el uso de APIs externas para procesamiento de datos HCE.
- **Worker-Driven**: Las operaciones pesadas (>50ms) deben ejecutarse en Workers.
- **Deterministic Rendering**: El orden de los campos está definido por el mapping, no por el archivo de origen.

## Capas
- **Domain**: Tipos y lógica de negocio clínica (`/core`).
- **Application**: Orquestación de búsqueda e ingesta (`/engine`, `/ingestion`).
- **Infrastructure**: Persistencia y UI (`/storage`, `/components`).
