# identity.md — Identidad de Queryclin

## Definición
Queryclin es un motor de exploración y análisis de Historias Clínicas Electrónicas (HCE) diseñado para entornos hospitalarios que requieren alta precisión, soberanía de datos y rendimiento masivo.

## Objetivos del Sistema
- **Exploración Clínica**: Permitir el descubrimiento de hallazgos en grandes corpus de datos.
- **Soberanía de Datos**: Funcionamiento 100% Local-First (IndexedDB).
- **Escalabilidad**: Gestión eficiente de >100,000 registros clínicos.

## Filosofía Clínica
- **Determinismo**: Los datos se visualizan y exportan según reglas explícitas, nunca inferidas.
- **Fidelidad HCE**: Preservar la integridad de los datos de origen (mappings, multivalores, jerarquías).
- **Trazabilidad**: Cada cambio o versión del sistema debe estar documentado cronológicamente.

## Límites del Sistema
- No es una herramienta de edición de HCE.
- No es un sistema de diagnóstico automático.
- No utiliza servicios en la nube para el procesamiento de datos clínicos.
