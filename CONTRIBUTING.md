# Guía de Contribución a Queryclin

¡Bienvenido al núcleo de Queryclin! Este proyecto no es solo un buscador; es un motor de inteligencia clínica diseñado para funcionar con privacidad absoluta en entornos locales. Si estás leyendo esto, es porque quieres ayudarnos a refinar la precisión de la búsqueda médica.

## 🩺 Filosofía del Proyecto

1.  **Privacidad Local-First**: Ningún dato del paciente sale del navegador. No usamos APIs externas de procesamiento de lenguaje natural (NLP) para evitar fugas de información.
2.  **Precisión Determinista**: En medicina, un falso positivo puede ser peligroso. Preferimos la exactitud clínica sobre la flexibilidad creativa.
3.  **Transparencia Semántica**: Todo el procesamiento semántico (sinónimos, acrónimos) es auditable y reside en archivos de configuración locales.

## 🏗️ Arquitectura del Motor

El corazón de Queryclin reside en `src/engine/`. Tras la unificación de la V6.4.0, este directorio contiene:

*   **`QueryEngine.ts`**: El motor de búsqueda basado en OKAPI BM25 con lógica booleana personalizada.
*   **`IndexerService.ts`**: El servicio de indexación que gestiona el "Negation Shield" y la persistencia en IndexedDB.
*   **`SemanticProcessor.ts`**: El cerebro que normaliza frases clínicas y maneja sinónimos.
*   **`clinicalSynonyms.ts`**: El diccionario médico oficial del proyecto.

## 🛠️ Cómo Contribuir

### 1. Añadir Nuevos Sinónimos o Siglas
Si detectas que una sigla médica común no se reconoce, actualiza `src/engine/clinicalSynonyms.ts`. Asegúrate de que el término canónico sea siempre el más descriptivo.

### 2. Mejorar Mappings de Formularios
Los mappings definen cómo se visualizan los datos CSV. Residen en `src/core/mappings.ts`. Si vas a añadir una nueva especialidad, sigue la estructura de `FormMapping`.

### 3. Desarrollo de la Interfaz (Aesthetics)
Queryclin utiliza una estética "Premium Clinical" basada en Vanilla CSS y variables dinámicas. Si modificas componentes, asegúrate de mantener el lenguaje visual de **glassmorphism** y micro-animaciones.

## 📜 Reglas de Gobernanza (MANDATORY)

*   **CHANGELOG.md**: Toda modificación debe quedar registrada cronológicamente con su justificación técnica.
*   **TASKS.md**: Actualiza el estado de las tareas o añade nuevas hitos en la hoja de ruta.
*   **Metaprompts**: Si eres una IA asistiendo al desarrollo, debes documentar cada metaprompt maestro en `governance/prompts/`.

## 🚀 Stack Tecnológico

*   **Framework**: React 18 + Vite.
*   **Persistencia**: IndexedDB (vía `src/storage/`).
*   **Procesamiento**: Web Workers para ingesta masiva (`csv.worker.ts`).
*   **Estilos**: TailwindCSS para layout, Vanilla CSS para estética premium.

---

**"La medicina es una ciencia de la incertidumbre y un arte de la probabilidad."** - William Osler. Ayúdanos a reducir esa incertidumbre con mejores herramientas.
