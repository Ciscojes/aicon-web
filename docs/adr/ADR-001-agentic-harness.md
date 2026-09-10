# ADR-001 — Harness agentic ligero dentro del repositorio

## Context

Aicon ya dispone de un harness de calidad con comandos npm, pruebas, migraciones
repetibles y CI. Falta gobernar la planificación, reparación, trazabilidad y
aprobación del trabajo realizado por agentes.

## Decision

Incorporar una capa ligera y agnóstica al proveedor bajo `.agent/`, enlazada con
la documentación y GitHub. Reutilizar los gates existentes y mantener el
harness fuera del runtime de producción.

## Alternatives

- Plataforma externa especializada: más automatización, coste y dependencia.
- Agentes múltiples coordinados: complejidad innecesaria para el tamaño actual.
- Solo instrucciones conversacionales: no reproducibles ni auditables.

## Consequences

- Planes y trazas quedan revisables junto al código.
- El proceso funciona con diferentes agentes.
- Aumenta moderadamente la documentación por tarea.
- La automatización del runner se pospone hasta validar primero el proceso.
