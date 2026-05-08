# workflows.md — Flujos de Trabajo

## Ciclo de Vida de una Tarea
1. **Identificación**: Localizar la tarea en `TASKS.md` o crear una nueva en `tasks/ACTIVE/`.
2. **Análisis**: Consultar `.ag/context-map.md` y `.ag/file-boundaries.md`.
3. **Ejecución**: Realizar cambios siguiendo `execution-policy.md`.
4. **Registro**: Actualizar `CHANGELOG.md` con el detalle técnico y funcional.
5. **Cierre**: Mover la tarea a `tasks/COMPLETED/`.

## Flujo de Documentación
- Cualquier cambio arquitectónico debe actualizar `docs/architecture/`.
- Cualquier cambio en mappings debe documentarse en `docs/clinical/`.
- El `README.md` se actualiza solo en hitos de versión mayor.

## Flujo de Validación
- Ejecutar `npm run lint` para asegurar integridad tipográfica.
- Validar visualmente el renderizado en todos los modelos clínicos afectados.
