# ADR-002 — Reutilizar `npm run verify` como quality gate principal

## Context

El proyecto ya centraliza lint, tipos, pruebas, migraciones y build. Crear un
segundo contrato produciría duplicación y resultados inconsistentes.

## Decision

Mantener `npm run verify` como gate obligatorio. Añadir controles condicionados
por riesgo —cobertura, lint SQL y auditoría— sin sustituir el contrato existente.

## Alternatives

- Nuevo pipeline agentic independiente: duplicaría comandos y mantenimiento.
- Ejecutar herramientas individualmente sin coordinador: facilita omisiones.
- Incorporar una plataforma de calidad adicional de inmediato: coste sin brecha
  todavía demostrada.

## Consequences

- Desarrollo local, agente y CI comparten el mismo contrato.
- Los fallos son reproducibles fuera del entorno del agente.
- Cobertura y seguridad requieren una siguiente iteración para convertirse en
  gates automatizados y calibrados.
