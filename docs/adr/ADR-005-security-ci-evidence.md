# ADR-005 — Gates de seguridad y evidencia sanitizada en CI

## Context

Aicon ya ejecutaba calidad, build y auditoría de dependencias, pero no validaba
automáticamente los artefactos agentic ni el contrato de entorno. Conservar logs
completos de seguridad aportaría detalle, pero podría persistir valores sensibles
y complicaría innecesariamente el TFM.

## Decision

Implementar validadores sin dependencias nuevas para estructura agentic,
referencias de entorno y un conjunto acotado de patrones de credenciales de alta
confianza. `npm run security` coordina esos controles con `npm audit` y puede
generar un JSON sanitizado. GitHub Actions conserva ese JSON durante 14 días
mediante `actions/upload-artifact@v4`, manteniendo permisos de solo lectura.

El reporte contiene metadatos y conteos, nunca coincidencias, valores de entorno
o salida de comandos. El escáner es una defensa gradual y no se presenta como
reemplazo de una plataforma especializada.

## Alternatives

- Incorporar Gitleaks u otra plataforma: mayor cobertura, pero nueva dependencia,
  configuración y posible coste antes de demostrar necesidad.
- Depender solo de revisión manual: no reproducible y fácil de omitir.
- Guardar logs completos: mejor diagnóstico, pero riesgo desproporcionado de
  exposición de secretos.
- Omitir el artefacto: CI podría pasar, pero se pierde evidencia académica portable.

## Consequences

- SPEC, PLAN y evidencia inválidos bloquean el quality gate.
- Variables públicas con nombres peligrosos y referencias no documentadas fallan.
- Patrones evidentes de credenciales bloquean CI sin revelar el valor detectado.
- Los reportes de CI pueden auditarse y expiran automáticamente.
- Cobertura exhaustiva de secretos, SAST y producción sigue siendo trabajo futuro.
