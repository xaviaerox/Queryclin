# execution-policy.md — Política de Ejecución IA

## Operativa de Antigravity
- **Lectura Obligatoria**: Consultar `RULES.md` y `.ag/constraints.md` antes de cualquier modificación.
- **Alcance de Tareas**: Limitar los cambios estrictamente al scope definido en la tarea activa.
- **Minimización de Riesgo**: No asumir comportamiento implícito. Ante ambigüedad, preguntar.
- **Trazabilidad**: Cada cambio debe registrarse en `CHANGELOG.md` siguiendo el formato incremental.

## Gestión de Ambigüedad
- Si un campo clínico no está mapeado, no inventar una categoría; usar la sección de `debug` o consultar al arquitecto.
- No modificar el CSS global para cambios locales; usar variables del sistema de diseño existentes.

## Prevención de Errores
- Validar siempre el impacto de un cambio en los modelos HCE-ALG, HCE-MIR y HCE-OBS simultáneamente.
- No introducir dependencias externas sin validación de seguridad y aislamiento local.
