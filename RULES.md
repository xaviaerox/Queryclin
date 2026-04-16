# Reglas Estrictas del Proyecto (Queryclin)

Este documento contiene las directrices fundamentales e inviolables para el desarrollo de este proyecto. Ningún agente ni desarrollador debe ignorar estas reglas.

## 1. Actualización Continua del Changelog
- **Regla:** Todo cambio procesado (bugs, features, refactorizaciones) **DEBE** registrarse de manera autónoma en `CHANGELOG.md`.
- **Formato:** Los registros deben ser cronológicos, detallando archivos modificados y el motivo técnico/clínico de la decisión.

## 2. Actualización Incremental del Roadmap
- **Regla:** Cada hito superado debe trasladarse de "En Progreso" a "Completado" en el `README.md` de forma inmediata.

## 3. Principio de Escala y Resiliencia (v3)
- **Regla:** Dado el volumen de datos objetivo (100k registros), se priorizará siempre el procesamiento asíncrono y la persistencia fragmentada en base de datos local.
- **Limitación:** Se evitará cargar objetos monolíticos pesados en el estado global de la aplicación para prevenir bloqueos de memoria.

## 4. Fidelidad del Dato Clínico
- **Regla:** Se prohíbe renombrar, traducir o normalizar destructivamente los campos originales del CSV. El sistema debe ser un reflejo exacto de la fuente de datos.
- **Lenguaje:** La comunicación interna y externa debe ser siempre sobria, profesional y técnica, evitando terminología comercial, exagerada o propia de modelos de lenguaje generales.
