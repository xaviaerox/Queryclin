# Plan de Pruebas de Stress y Funcional - Queryclin V4.0

Este directorio contiene los recursos necesarios para validar la robustez de Queryclin.

## Archivos
- `HC_Stress_Test.txt`: Dataset sintético de 17.379 registros (Solo lectura).
- `gen_stress_test.js`: Script generador del dataset.

## Pruebas Guiadas

### 1. Carga Masiva (Stress Test)
**Objetivo**: Validar la estabilidad del Web Worker y la persistencia en IndexedDB.
- **Acción**: Arrastrar `HC_Stress_Test.txt` al área de carga.
- **Resultado Esperado**: Carga de 5.000 pacientes sin bloqueo de UI.

### 2. Validación de Codificación (CP850)
**Objetivo**: Comprobar la interpretación de caracteres MS-DOS.
- **Acción**: Buscar el término `Cesárea`.
- **Resultado Esperado**: Visualización correcta de tildes (no símbolos como `¢`).

### 3. Búsqueda Booleana Avanzada
**Objetivo**: Validar precisión del motor.
- `Diabetes AND Cesárea`: Match de intersección.
- `Diabetes NOT Anemia`: Match de exclusión.
- `Hallazgo crítico de preeclampsia`: Match exacto (NHC 101234).

### 4. Navegación Cronológica (HCE)
**Objetivo**: Validar el sistema de "Toma Única".
- **Resultado Esperado**: Timeline lateral con 1-6 tomas por paciente, navegación fluida.

### 5. Exportación XLSX
**Objetivo**: Validar exportación a Excel masiva.
- **Resultado Esperado**: Generación de `.xlsx` con datos aplanados correctos.
