# glossary.md — Glosario de Términos

## Términos Clínicos
- **HCE**: Historia Clínica Electrónica.
- **Toma (Visit)**: Un encuentro clínico único identificado por `Id_Toma`.
- **Registro (Version)**: Una versión específica de una toma, identificada por `Orden_Toma`.
- **NHC**: Número de Historia Clínica (Identificador único del paciente).
- **CIPA**: Código de Identificación Personal Autonómico.

## Términos Arquitectónicos
- **BM25**: Algoritmo de ranking de relevancia para búsqueda.
- **Local-First**: Estrategia de almacenamiento donde los datos residen en el cliente.
- **Worker**: Hilo secundario para procesamiento pesado (ingesta/búsqueda).
- **Mapping**: Diccionario que traduce cabeceras RAW a categorías clínicas.
- **Multivalor ($)**: Campos que agrupan múltiples sub-campos clínicos.
