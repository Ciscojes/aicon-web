# ADR-003 — Aprobación humana según nivel de autoridad

## Context

Un agente puede ejecutar verificaciones y preparar cambios, pero algunas
acciones afectan datos, seguridad, infraestructura, dinero o usuarios externos.
Una autorización genérica no debe interpretarse como autonomía ilimitada.

## Decision

Clasificar acciones como `SAFE`, `CONTROLLED` o `REQUIRE APPROVAL`. Las tareas
controladas necesitan alcance y plan aprobados. Las acciones de mayor impacto
exigen confirmación inmediatamente antes de ejecutarse. Merge y producción
permanecen decisiones humanas.

## Alternatives

- Aprobación para cada comando: segura pero bloquea el trabajo rutinario.
- Autonomía total dentro del repositorio: insuficiente para datos y seguridad.
- Clasificación basada solo en herramienta: ignora el impacto real de la acción.

## Consequences

- El agente puede avanzar en análisis y verificación sin fricción innecesaria.
- Las decisiones irreversibles permanecen bajo control humano.
- El nivel de autoridad debe registrarse en SPEC, plan y traza.
- Algunas tareas se detendrán deliberadamente hasta recibir una decisión.
