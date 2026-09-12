# UI-001 — Implementation plan

## Status

Approved

## Objective

Eliminar las llamadas a la acción duplicadas del hero sin alterar la navegación ni el buscador.

## Approved scope

- Retirar el contenedor `public-hero-actions` del hero de la portada.
- Conservar el encabezado, texto, imagen y buscador actuales.

## Affected files

- `src/app/page.tsx`: retirar los dos enlaces redundantes.
- `.agent/specs/UI-001-remove-redundant-hero-actions.md`: contrato de la tarea.
- `.agent/plans/UI-001-remove-redundant-hero-actions.md`: plan previo.
- `.agent/runs/UI-001/summary.md`: evidencia sanitizada.

## Affected components

- Ruta pública `/`, exclusivamente su hero.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Reducir vías de navegación | Bajo | Conservar navegación superior y buscador |
| Alterar espaciado del hero | Bajo | Revisar portada en navegador y ejecutar build |

## Tests required

- `npm run verify`
- Revisión manual de `/` y del enlace superior a `/catalogo`.

## Migrations

Ninguna.

## Implementation steps

1. Retirar el bloque de acciones del hero.
2. Ejecutar el quality gate auditable.
3. Revisar el diff y preparar Pull Request.

## Security review

- No cambia entradas, autenticación, autorización, RLS, datos ni logging.

## Rollback or recovery

- Revertir el commit de la rama antes de fusionarlo.

## Approval

- Approved by: Jesús
- Date/context: 2026-09-11, solicitud directa en WebChat.
