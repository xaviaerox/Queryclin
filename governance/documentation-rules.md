# documentation-rules.md — Reglas de Documentación

## Principios
- **Modularidad**: Documentación separada por dominio en `/docs`.
- **Actualización Continua**: Cada cambio estructural requiere actualización documental.
- **Formato**: Markdown estándar con estructura clara.

## Estructura de /docs
- `architecture/`: Diseños de alto nivel y decisiones técnicas.
- `clinical/`: Taxonomía, mappings y reglas de negocio médico.
- `ingestion/`: Formatos soportados y lógica de workers.
- `export/`: Estructura de XLSX y pipelines de descarga.
- `search-engine/`: Algoritmos de búsqueda y optimizaciones.
- `ui/`: Guía de estilo y componentes.

## Higiene y Seguridad Documental
- **Exposición Pública**: Toda documentación en este repositorio es pública. Nunca documentar IPs internas, secretos o datos reales.
- **Uso de Mocks**: Los ejemplos deben usar exclusivamente datos sintéticos de `src/assets/mocks/`.
- **Validación**: Antes de subir imágenes o diagramas, verificar que no contengan trazas de información hospitalaria real.
