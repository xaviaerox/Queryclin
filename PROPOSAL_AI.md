# Propuesta Técnica: Implementación de Resúmenes Inteligentes (IA)

Este documento resume las opciones evaluadas para integrar capacidades de IA en **Queryclin**, priorizando la seguridad del dato clínico y la viabilidad técnica para el centro de estudios.

---

## Opción 1: Cloud AI (Google Gemini SDK)
Uso de un modelo de lenguaje de alto rendimiento fuera de la infraestructura local.

- **Nivel de Privacidad**: Medio-Bajo (Los datos salen del dispositivo).
- **Consumo de Recursos**: Mínimo (El procesamiento se hace en la nube).
- **Implementación**: Rápida.
- **Requiere**: Conexión a internet permanente.
- **Medida de Seguridad**: Implementación de un pre-filtro de anonimización local (eliminación de NHC/Nombres) antes del envío.

## Opción 2: Local AI (WebLLM / Transformers.js) - *Recomendada por Seguridad*
Ejecución del modelo de lenguaje íntegramente dentro del navegador del usuario.

- **Nivel de Privacidad**: **Máximo (Local-First)**. Ningún dato sale de la máquina.
- **Consumo de Recursos**: Alto (Usa la memoria RAM y GPU del usuario).
- **Implementación**: Compleja (Requiere carga de modelos de 1.5GB+).
- **Requiere**: Navegador moderno con soporte WebGPU.
- **Medida de Seguridad**: Privacidad absoluta por diseño físico (Air-gapped compatible).

## Opción 3: Chrome Prompt API (Experimental)
Uso del modelo local integrado nativamente en las versiones más recientes de Chrome.

- **Nivel de Privacidad**: Máximo (Local).
- **Consumo de Recursos**: Optimizado por el navegador.
- **Implementación**: Media (Depende de flags de configuración).
- **Limitación**: Solo funciona en entornos controlados con Chrome Canary/Dev actualmente.

---

### Conclusión para Coordinación
Dada la naturaleza sensible de las **Historias Clínicas**, la **Opción 2** es la que mejor se alinea con la filosofía del proyecto. Sin embargo, para una entrega ágil del proyecto de fin de grado, la **Opción 1** (con anonimización estricta) es la más viable a corto plazo.
