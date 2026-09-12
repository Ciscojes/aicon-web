# Anexos y mapa de evidencia

Este índice permite al tutor reproducir el argumento sin copiar logs ni secretos
dentro de la memoria.

## Anexo A — Especificaciones y planificación

- Gobierno inicial: [plan AEH-001](../../.agent/plans/AEH-001-agent-governance-foundation.md).
- Runner: [SPEC AEH-002](../../.agent/specs/AEH-002-agentic-verification-runner.md) y
  [plan](../../.agent/plans/AEH-002-agentic-verification-runner.md).
- Seguridad/CI: [SPEC AEH-003](../../.agent/specs/AEH-003-security-ci-quality-gates.md) y
  [plan](../../.agent/plans/AEH-003-security-ci-quality-gates.md).
- Auditoría/métricas: [SPEC AEH-004](../../.agent/specs/AEH-004-final-audit-and-metrics.md) y
  [plan](../../.agent/plans/AEH-004-final-audit-and-metrics.md).
- Memoria: [SPEC TFM-001](../../.agent/specs/TFM-001-academic-manuscript.md) y
  [plan](../../.agent/plans/TFM-001-academic-manuscript.md).

## Anexo B — Trazas sanitizadas

- [AEH-001](../../.agent/runs/AEH-001/summary.md).
- [AEH-002](../../.agent/runs/AEH-002/summary.md).
- [AEH-003](../../.agent/runs/AEH-003/summary.md).
- [AEH-004](../../.agent/runs/AEH-004/summary.md).

Los JSON de intento se encuentran junto a cada resumen. Contienen metadatos y no
incluyen salida de comandos ni variables de entorno.

## Anexo C — Decisiones arquitectónicas

- [ADR-001: harness dentro del repositorio](../adr/ADR-001-agentic-harness.md).
- [ADR-002: quality gate principal](../adr/ADR-002-quality-gates.md).
- [ADR-003: human-in-the-loop](../adr/ADR-003-human-in-the-loop.md).
- [ADR-004: runner de verificación](../adr/ADR-004-verification-runner.md).
- [ADR-005: seguridad y evidencia CI](../adr/ADR-005-security-ci-evidence.md).

## Anexo D — Arquitectura, seguridad y evaluación

- [Arquitectura agentic](../agentic-engineering/architecture.md).
- [Flujo de trabajo](../agentic-engineering/workflow.md).
- [Modelo de seguridad](../agentic-engineering/security.md).
- [Evaluación académica](../agentic-engineering/tfm-evaluation.md).
- [Auditoría final](../agentic-engineering/final-audit.md).
- [Guion de demostración](../agentic-engineering/demo-guide.md).

## Anexo E — Evidencia cuantitativa

- [Snapshot de métricas](../agentic-engineering/evidence/agentic-metrics.json).
- Comando de reproducción:

```bash
npm run agent:metrics -- --output docs/agentic-engineering/evidence/agentic-metrics.json
```

El snapshot tiene fecha de corte. Regenerarlo después de nuevas tareas cambia el
universo medido y requiere actualizar las cifras de la memoria.

## Anexo F — Quality gates

```bash
npm run lint
npm run typecheck
npm run test
npm run db:test
npm run build
npm run security
npm run verify
```

GitHub Actions ejecuta el mismo contrato remoto y publica evidencia de seguridad
sanitizada. SonarCloud aporta una revisión estática complementaria.

## Anexo G — Producto AICON

- [Visión del producto](../specs/SPEC-001-vision-del-producto.md).
- [Arquitectura técnica](../specs/SPEC-013-arquitectura-tecnica.md).
- [Modelo de datos](../specs/SPEC-014-modelo-de-datos.md).
- [Plan de implementación](../specs/SPEC-015-plan-de-implementacion.md).
- [Estado actual](../STATUS.md).

## Anexo H — Figuras propuestas para la memoria final

1. Arquitectura técnica de AICON.
2. Flujo SPEC → PLAN → IMPLEMENT → VERIFY → REPAIR → REVIEW.
3. Estructura de directorios del harness.
4. Captura de un plan y su traza enlazada.
5. Resultado de quality gates en GitHub Actions.
6. Caso de reparación de SonarCloud.
7. Snapshot cuantitativo de métricas.
8. Capturas de la aplicación pública y el panel.

Las capturas deben ocultar tokens, correos reales, datos de clientes y URLs de
autoservicio con secretos.
