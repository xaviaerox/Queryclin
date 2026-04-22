# BATTLE_LOG.md - Diario de Combate Técnico

Este documento registra los desafíos más críticos encontrados durante el desarrollo de Queryclin, el proceso de resolución y las lecciones aprendidas. Aquí vive la narrativa de la lucha contra los bugs.

---

## 🛡️ Batalla 1: El Desbordamiento de Memoria (100k registros)
- **El Enemigo**: La memoria RAM del navegador. Al intentar cargar 34MB de CSV en un solo objeto JSON, el navegador colapsaba (Out of Memory).
- **La Estrategia**: Migrar a IndexedDB y Web Workers.
- **La Victoria**: Implementamos una arquitectura "Streaming" donde los datos se guardan en disco local (browser) y solo se pide lo necesario.
- **Lección**: "No confíes en la RAM para datos médicos masivos".

## 🛡️ Batalla 2: El Misterio de los 0 Pacientes (V2.5.1)
- **El Enemigo**: Caracteres invisibles (BOM) y finales de línea de Windows (`\r\n`).
- **El Fracaso**: Tras una ingesta exitosa, el sistema reportaba 0 pacientes. El parser se perdía en la primera línea.
- **La Victoria**: Refactorización del parser para detectar automáticamente el delimitador y limpiar el BOM. Añadimos normalización estricta de NHC.
- **Lección**: "La higiene del dato es el 90% del éxito de un analizador".

## 🛡️ Batalla 3: El Error del Sistema Fuera de Servicio (V2.5.2)
- **El Enemigo**: Un error `undefined` que bloqueaba toda la interfaz al cargar un paciente.
- **El Origen**: Discrepancia entre el diccionario de campos (que clasificaba como "Demografía") y la interfaz (que no tenía pestaña para ello).
- **La Victoria**: Implementación de una "Interfaz Resiliente" que inicializa categorías bajo demanda. Si el dato existe, el sistema le hace sitio.
- **Lección**: "El frontend debe ser defensivo ante la incertidumbre del dato".

---
*Querclin Evolución - Manteniendo la casa en orden.*
