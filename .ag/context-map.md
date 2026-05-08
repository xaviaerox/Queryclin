# context-map.md — Mapa de Responsabilidades

## Estructura de Directorios

### /src/engine
- **Responsabilidad**: Motor de búsqueda BM25, tokenización y ranking de relevancia.
- **Ownership**: Lógica de recuperación de información.

### /src/ingestion
- **Responsabilidad**: Workers de procesamiento de archivos (CSV, XLSX, TXT).
- **Ownership**: Normalización y carga de datos hacia IndexedDB.

### /src/storage
- **Responsabilidad**: Capa de persistencia IndexedDB.
- **Ownership**: Integridad y acceso a los datos locales.

### /src/components
- **Responsabilidad**: Interfaz de usuario (React).
- **Ownership**: Renderizado determinista de informes y visualización de resultados.

### /src/core
- **Responsabilidad**: Tipos, mappings y taxonomía clínica.
- **Ownership**: Definición estructural del dominio.

### /src/utils
- **Responsabilidad**: Funciones transversales (parsers de fechas, normalizadores).
- **Ownership**: Utilidades sin estado.
