# Historial de Tareas - Proyecto Queryclin

Este archivo mantiene el registro acumulativo de la evolución del sistema. Las tareas completadas permanecen aquí para referencia histórica y auditoría de desarrollo.

---

## 🟢 FASE 1: Cimientos y Motor Booleano (V1.0 - V2.0)
- [x] Implementación de interfaz "Clean Clinical" (Gris Niebla).
- [x] Desarrollo del motor de búsqueda Booleano (AND, OR, NOT).
- [x] Creación del parser de CSV básico (Comas).
- [x] Sistema de Temas (Modo Oscuro "Deep Slate").
- [x] **Logro**: Búsqueda instantánea en datasets pequeños (<5.000 registros).

## 🟢 FASE 2: Escalabilidad y Big Data (V2.1 - V2.3)
- [x] Migración a persistencia asíncrona con **IndexedDB**.
- [x] Delegación de procesamiento a **Web Workers** para evitar bloqueos de UI.
- [x] Implementación de **Fragmentación (Skeletons)** para manejar 100.000 registros.
- [x] Cambio de estándar de ingesta a **Pipeline (|)**.
- [x] Suite de Pruebas Automatizadas (Vitest + Playwright).
- [x] Centro de Ayuda y Guía Clínica Integrada.
- [x] **Logro**: El sistema no colapsa ante 34MB de datos clínicos.

## 🟢 FASE 3: Narrativa y Auditoría Clínica (V2.4 - V2.5)
- [x] Implementación de la vista de **Evolución del Proyecto**.
- [x] Extracción de demografía fija (Edad, Sexo, CP) fuera de pestañas.
- [x] Nueva vista de **Historia Clínica Completa** (Lectura Continua).
- [x] Limpieza de categorías "Otros" en el diccionario hospitalario.
- [x] Mecanismo de persistencia de sesión por seguridad (Cierre = Limpieza IDB).
- [x] **Logro**: Alineación con el estándar de visualización HCE-Comun.

## 🟢 FASE 4: Estabilización y Refinamiento (V2.5.3 ✅)
- [x] **A1. Resiliencia de Ingesta**: Manejo de BOM y finales de línea mixto.
- [x] **A2. Inicialización Dinámica**: Corrección de crashes por categorías faltantes.
- [x] **A3. Estructura Profesional**: Ubicación limpia en `/scripts`, `/tests/data` y `/docs`.
- [x] **A4. Consola Dashboard**: Rediseño premium con KPIs vivos en tiempo real.
- [x] **A5. Identidad Visual**: Avatares de género (Cian/Amatista) automatizados.
- [x] **Logro**: Sistema estéticamente alineado con su potencia técnica.

## 🔵 FASE 5: Inteligencia de Población y Motor V2.6 (COMPLETADA ✅)
- [x] **E3. Autocompletado Clínico**: Sugerencias inteligentes basadas en muestreo de 10k (V2.6.3).
- [x] **E5. Motor de Precisión Booleana**: Reconstrucción total de la lógica AND/OR/NOT para Big Data.
- [x] **E6. Gestión de Ruido**: Implementación de Stopwords clínicos.
- [x] **E4. Auditoría de Términos**: Lista de las palabras más frecuentes en el dataset (Optimizada en V2.7).

## 🟣 FASE 6: Arquitectura Solid-State y V3.0.0 (COMPLETADA ✅)
- [x] **E7. Ingesta por Streaming**: Refactorización de `streamCSV` para archivos ilimitados (V3.0.0).
- [x] **E8. Índice Fragmentado (Bucketing)**: Solución al error `Failed to read large IndexedDB value`.
- [x] **E9. Cumplimiento de Gobernanza**: Limpieza total de la raíz del proyecto (Regla 3).
- [x] **E10. Estabilización de UI**: Corrección de autocompletado en `Home.tsx`.
## 🟠 FASE 7: Auditoría Estructural y Motor de 2ª Generación (V3.8 - V3.9 ✅)
- [x] **A6. Refactorización a Clean Architecture**: Separación en capas (Core, Engine, Ingestion, Storage).
- [x] **A7. Escisión del God Object**: Fractura de `searchEngine.ts` en micro-servicios especializados.
- [x] **A8. Implementación de BM25**: Salto del TF-IDF lineal a **Okapi BM25** con saturación de frecuencia.
- [x] **A9. Clinical Synonym Mapper**: Diccionario de 23 patologías para expansión de consultas.
- [x] **A10. Limpieza de Deuda**: Purga total de código muerto y optimización de tipos.
- [x] **Logro**: Arquitectura de grado empresarial lista para escalado horizontal de funcionalidades.

---
## 🟣 FASE 8: Resiliencia y Soporte Legacy (V4.0.0 ✅)
- [x] **A11. Decodificación Multi-formato**: Soporte nativo para UTF-8, ISO-8859-1 y CP850 (Legacy DOS).
- [x] **A12. Motor de Normalización NFD**: Reconocimiento de caracteres especiales y tildes en cabeceras dinámicas.
- [x] **A13. Exportación Excel Nativa**: Integración de SheetJS para descarga de expedientes en formato .xlsx.
- [x] **Logro**: Compatibilidad total con exportaciones de sistemas hospitalarios de los años 90 y 2000.

## 🔴 FASE 9: Navegación Crítica y Ergonomía (V4.1.0 ✅)
- [x] **U1. Rediseño del Visor HCE**: Timeline lateral interactivo y navegación por tomas individuales.
- [x] **U2. Cabeceras Dinámicas**: Extracción automática de metadatos de proceso (Ámbito, Servicio, Facultativo).
- [x] **U3. Estética "Clinical Modern"**: Refinamiento de sombras, tipografías y contraste para entornos hospitalarios.

## 🟤 FASE 10: Ingesta Inteligente y Debug (V4.2.0 ✅)
- [x] **E12. Modos de Carga (Strict/Exploration)**: Control total sobre el mapeo de campos y auditoría de excedentes.
- [x] **E13. Gestión de Duplicados**: Sistema de registro marcado (`_is_duplicate`) para colisiones de tomas.
- [x] **E14. Trazabilidad Forense**: Registro del nombre de archivo original y marca de tiempo en cada expediente.

## 🟢 FASE 11: Modernización y Buscador Ubicuo (V4.2.1 ✅)
- [x] **U4. Buscador en Cabecera**: Integración centralizada para navegación global sin retroceder a Home.
- [x] **U5. Asistente de Carga (3 Pasos)**: Simplificación de la UX para personal no técnico.
- [x] **U6. Navegación por Teclado**: Soporte para flechas direccionales en la revisión de expedientes.

## 🟡 FASE 12: Estructura Determinista y Legibilidad (V4.2.1 ✅)
- [x] **A14. Orden Estricto de Mapping**: Forzado de la estructura visual según el modelo oficial ( mappings.ts).
- [x] **A15. Formateo Inteligente**: Conversión automática de espacios múltiples en saltos de línea legibles.
- [x] **A16. Subgrupo de Constantes Vitales**: Implementación de tabla inmutable para parámetros biométricos (IMC, Peso, etc).
- [x] **Logro**: El sistema alcanza un nivel de madurez visual y técnica industrial, listo para producción.

## 🔵 FASE 13: Trazabilidad Temporal en Navegación (V4.2.3 ✅)
- [x] **U7. Trazabilidad en Timeline**: Integración de fechas en cabeceras de Toma y horas en Orden_Toma.
- [x] **A17. Eliminación de Redundancia Demográfica**: Retirado el campo "Edad" de las categorías clínicas (Anamnesis) al estar ya presente en la cabecera.
- [x] **E16. Estabilización de Motor de Fechas**: Soporte nativo para MS-Excel (`cellDates: true`) and corrección del filtro cronológico (`getAllRecords`) con padding +24h.
- [x] **Logro**: Navegación cronológica intuitiva y motor de búsqueda de fechas 100% fiable.

## 🟢 FASE 14: Filtros Contextuales y UX Avanzada (V4.2.5 ✅)
- [x] **F21. Filtrado Bidireccional**: Sincronización de búsqueda por términos y categorías con exclusión estricta de hallazgos fuera de contexto.
- [x] **U18. Resaltado Selectivo**: Sistema de highlighting dinámico que solo actúa sobre las secciones filtradas en el visor de informe completo.
- [x] **U19. Rediseño Panel de Historial**: Implementación de grid simétrico (3x2) y Search Cards con métricas de resultados (`resultCount`).
- [x] **A18. Mejora de Narrativa Clínica**: Nueva regla de parseo de 3+ espacios seguidos como salto de línea para optimizar la lectura de informes.
- [x] **Logro**: Máxima precisión en la recuperación de información con visualización clínica íntegra y sin ruido visual.

## 🟢 FASE 15: Resaltado Ubicuo y UX Lateral (V4.2.6 ✅)
- [x] **U20. Resaltado en Navegador Lateral**: Implementación de lógica de detección de coincidencias en el sidebar.
- [x] **U21. Indicadores de Alerta (Amber Pulse)**: Sistema visual de notificación de hallazgos en tomas y versiones inactivas.
- [x] **U22. UX Adaptativa Sidebar**: Resaltado bicolor y metadatos con color de acento para coincidencias.
- [x] **Logro**: Navegación contextual completa; el clínico identifica hallazgos relevantes en todo el historial del paciente sin necesidad de exploración manual secuencial.

## 🟢 FASE 16: Persistencia de Filtros Históricos (V4.2.7 ✅)
- [x] **E17. Memoria de Filtros**: Inclusión de metadatos de filtrado en el objeto de persistencia de búsquedas recientes.
- [x] **U23. Restauración de Estado**: Sincronización de los componentes de filtro en Home al recuperar una búsqueda del historial.
- [x] **Logro**: Experiencia de usuario "Sin Fricción" al alternar entre múltiples líneas de investigación clínica.

## 🟢 FASE 17: Simplificación de Taxonomía (V4.2.8 ✅)
- [x] **U24. Depuración de Filtros**: Eliminada la categoría "General" del selector de filtros en Home.
- [x] **Logro**: Interfaz de búsqueda más limpia y enfocada exclusivamente en dominios de información clínica.

## 🟢 FASE 18: Filtrado Quirúrgico por Campos (V4.2.9 ✅)
- [x] **U25. Expansión de Categorías**: Implementada UI jerárquica para mostrar campos (sub-categorías) al seleccionar un dominio clínico.
- [x] **A19. Motor de Filtrado por Campo**: Refactorizado `applyFilters` para soportar discriminación por nombres de columna exactos.
- [x] **Logro**: Máximo nivel de granularidad en la recuperación de información; el clínico puede buscar términos exclusivamente en campos críticos como "Resultado analítica" o "Juicio Diagnóstico".

## 🟢 FASE 19: Arquitectura de Búsqueda Persistente (V4.3.0 ✅)
- [x] **U26. Cabecera Global Unificada**: Creación de `GlobalHeader.tsx` para centralizar identidad y herramientas de búsqueda.
- [x] **U27. Buscador Refinador**: Implementación de lógica de búsqueda persistente que mantiene y respeta los filtros activos entre vistas.
- [x] **U28. Indicadores de Contexto de Filtro**: Sistema visual (icono pulsante) para alertar sobre la segmentación activa en la búsqueda.
- [x] **U29. Centralización de Comandos**: Integración de botones de "Mostrar Todo", "Borrar Datos" y "Ayuda" en la cabecera persistente.
- [x] **Logro**: Transformación de la búsqueda en una experiencia de exploración continua y contextual; el clínico mantiene el control total de sus filtros sin importar su ubicación en el expediente.

## 🟢 FASE 20: Refinamiento de Mappings HCE-MIR (V4.3.6 ✅)
- [x] **A20. Mapping "Resultado Analítica"**: Integrada visualización de analíticas en la categoría de Resultados Pruebas para HCE-MIR.
- [x] **A21. Normalización de Aliases HCE-MIR**: Implementado soporte para variantes de nombres con colon y diferentes mayúsculas para campos críticos.
- [x] **A22. Mapping Oxihemoglobina (O2 Hb)**: Vinculado el campo de saturación de oxígeno al bloque de constantes MIR.
- [x] **A23. Mapping Situación Basal (Otros)**: Posicionamiento estricto de la situación basal en la sección de Anamnesis.
- [x] **A24. Persistencia Discriminada**: Corregida la sobreescritura de búsquedas recientes con mismo término pero distintos filtros.
- [x] **A25. Depuración de Ruido Visual**: Eliminados 13 campos redundantes de las vistas HCE-MIR y Debug.
- [x] **Logro**: Depuración total de la sección Debug; ya no se muestran metadatos técnicos de base de datos como Contadores o Ids de Proceso.

---
## 🟡 PRÓXIMOS OBJETIVOS (2026+)
- [ ] **E11. Motor Semántico Híbrido**: Integración de embeddings locales con Transformers.js.
- [ ] **E15. IA Generativa Local**: Resúmenes automáticos de evolución clínica mediante LLM en el cliente.

---
*Queryclin - Sistema de Análisis Clínico Local-First*
