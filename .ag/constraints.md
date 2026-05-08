# constraints.md — Restricciones de Gobernanza

## Reglas Absolutas
- **Prohibido el Refactoring Silencioso**: No se modificará código funcional sin una tarea explícita.
- **Inmutabilidad de Mappings**: Nunca inferir mappings. Los formularios HCE son deterministas.
- **Integridad de Cabeceras**: Nunca modificar las cabeceras de los archivos de origen.
- **Local-First Estricto**: No introducir dependencias que rompan el aislamiento local.

## Invariantes Clínicas
- **Identidad Temporal**: `Id_Toma` + `Orden_Toma` definen la clave primaria temporal de un registro.
- **Campos Multivalor**: Los campos que contienen el símbolo `$` son tratados como listas estructuradas.
- **Fidelidad Médica**: Prohibido renombrar campos médicos o simplificar terminología hospitalaria.

## Restricciones Arquitectónicas
- **Clean Architecture**: Mantener la separación entre UI, Engine, Storage e Ingestion.
- **Pipeline de Exportación**: Existe un único pipeline hacia XLSX; cualquier mejora debe ser incremental y desacoplada.
- **Storage**: Toda persistencia clínica reside en IndexedDB gestionada por Web Workers.
