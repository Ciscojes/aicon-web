# UI-001 — Retirar acciones redundantes del hero

## Status

Approved

## Problem

La portada repite dentro del hero las acciones `Explorar casas` y
`Ver condominios`, aunque esos destinos ya están disponibles en la navegación
principal. La duplicación agrega ruido visual y compite con el mensaje central.

## Objective

Simplificar el hero manteniendo su título y descripción, y conservar la
navegación superior y el buscador como vías principales hacia el catálogo.

## Scope

- Retirar los dos botones situados dentro del contenido del hero.
- Mantener intactos el encabezado, el buscador y el resto de la portada.

## Out of scope

- Cambiar rutas, filtros, datos, estilos globales o lógica del catálogo.
- Modificar otras llamadas a la acción del sitio público.

## Functional requirements

- FR-1: El hero no debe mostrar `Explorar casas` ni `Ver condominios`.
- FR-2: El encabezado debe conservar sus enlaces y su botón `Explorar casas`.
- FR-3: El buscador debe continuar navegando al catálogo con filtros reales.

## Non-functional requirements

- NFR-1: El cambio debe preservar accesibilidad, adaptación móvil y rendimiento.

## Acceptance criteria

- AC-1: Al abrir la portada, debajo de la descripción del hero no aparecen los dos botones redundantes.
- AC-2: El botón `Explorar casas` del encabezado continúa visible y enlaza a `/catalogo`.
- AC-3: `npm run verify` finaliza correctamente.

## Architectural constraints

- Limitar el cambio de aplicación a `src/app/page.tsx`.
- No modificar servidor, Supabase, autenticación ni dependencias.

## Testing strategy

- Unit: no aplica; no cambia lógica.
- Integration/database: no aplica.
- End-to-end/manual: comprobar portada y navegación superior.
- Security: confirmar que no cambia exposición de datos ni controles de acceso.

## Authority and approvals

- Task level: CONTROLLED
- Required approver and decision: Jesús aprobó retirar ambos botones en la conversación del 2026-09-11.

## Open questions

- Ninguna.
