# TFM-001 — Implementation plan

## Status

Completed and verified; ready for human review.

## Objective

Consolidar la evidencia técnica de AICON en un borrador formal de TFM listo para
adaptación institucional y revisión del tutor.

## Approved scope

- Crear memoria, referencias, anexos y checklist institucional en `docs/tfm/`.
- Actualizar índices documentales y estado del proyecto.
- No modificar aplicación, base de datos ni automatización existente.

## Affected files

- `docs/tfm/memoria.md`: documento académico principal.
- `docs/tfm/referencias.md`: bibliografía y reglas de citación.
- `docs/tfm/anexos.md`: mapa de evidencia técnica.
- `docs/tfm/checklist-entrega.md`: datos y decisiones pendientes.
- `README.md` y `docs/STATUS.md`: enlaces y estado.
- `.agent/runs/TFM-001/summary.md`: trazabilidad sanitizada.

## Affected components

- Documentación y evidencia académica únicamente.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Citas imprecisas | Invalida rigor académico | Usar fuentes primarias con DOI/URL |
| Cifras desactualizadas | Contradicción con evidencia | Derivarlas del snapshot versionado |
| Confundir MVP con producción | Conclusión engañosa | Declarar alcance y riesgos restantes |
| Formato universitario desconocido | Retrabajo editorial | Usar marcadores y checklist explícitos |

## Tests required

- Revisar marcadores, enlaces relativos, citas y cifras.
- Ejecutar `npm run agent:verify -- --task TFM-001 --attempt 1`.

## Migrations

None. Sin impacto en RLS.

## Implementation steps

1. Inventariar evidencia canónica y referencias académicas.
2. Redactar la memoria principal por capítulos.
3. Añadir bibliografía, mapa de anexos y checklist institucional.
4. Actualizar índices y estado.
5. Verificar enlaces, consistencia y quality gates.
6. Registrar evidencia y preparar PR para revisión humana.

## Security review

- No incluir secretos, variables, contenido de formularios ni datos personales.
- Referenciar trazas sanitizadas en lugar de copiar logs.

## Rollback or recovery

- Revertir la rama documental antes del merge; no hay impacto en runtime.

## Approval

- Approved by: Jesús.
- Date/context: solicitud directa para preparar la documentación del TFM.
