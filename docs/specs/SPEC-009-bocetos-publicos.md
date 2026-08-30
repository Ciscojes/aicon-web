# SPEC-009 — Bocetos públicos de baja fidelidad

## Estado

En revisión.

## Objetivo

Definir la jerarquía de contenido y las acciones principales de las pantallas públicas antes de aplicar la identidad visual o desarrollar la interfaz.

## Pantallas del primer conjunto

1. Portada.
2. Catálogo de casas.
3. Detalle de una casa.
4. Simulación y solicitud de cotización.
5. Registro del interesado.
6. Calendario y confirmación de visita.

## Decisiones representadas

- La portada dirige al catálogo, a los condominios y al contacto con un asesor.
- El catálogo inicia con todas las casas disponibles y permite filtrar por condominio.
- El detalle mantiene visibles las acciones `Cotizar`, `Agendar visita` y `Hablar con un asesor`.
- La cotización es opcional y no bloquea la agenda.
- El registro solicita nombre y teléfono; el correo se solicita para la agenda y los recordatorios.
- El calendario resume la propiedad antes de confirmar la cita.

## Criterios de aceptación

- Cada pantalla tiene una acción principal claramente identificable.
- El comprador puede distinguir entre cotizar y agendar directamente.
- Los filtros no ocultan el inventario disponible por defecto.
- El precio, estado y características principales aparecen antes de las acciones del detalle.
- La advertencia financiera acompaña el resultado de la simulación.
- El consentimiento para recibir avisos se solicita antes de confirmar una cita.
- Los bocetos funcionan como estructura y no se interpretan como diseño visual definitivo.

## Artefacto visual

- [Bocetos del recorrido público](../diagrams/bocetos-publicos.html)

## Pendiente para el siguiente conjunto

- Detalle de condominio.
- Página de contacto y asesor.
- Estados vacíos y errores.
- Bocetos del CRM y panel administrativo.

## Historial de cambios

- 2026-08-28: creación del primer conjunto de bocetos públicos.
- 2026-08-28: la adaptación para celulares pasó a SPEC-010.
