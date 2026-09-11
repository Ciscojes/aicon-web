# ADR-004 — Runner local con evidencia sanitizada e intentos explícitos

## Context

Las reglas documentan un máximo de tres reparaciones, pero un agente podría
omitir gates, repetir indefinidamente o no dejar evidencia estructurada. Capturar
logs completos resolvería parte de la trazabilidad, pero aumentaría el riesgo de
guardar secretos o datos personales.

## Decision

Crear un CLI local, sin dependencias nuevas, que exija tarea, plan, rama e intento
explícito. El runner invoca `npm run verify`, que contiene los gates vigentes,
y permite añadir `db:lint`. Detiene la secuencia al primer fallo, rechaza intentos fuera de 1–3 y
genera un JSON inmutable con metadatos, nunca stdout, stderr o entorno.

El agente conserva la responsabilidad de diagnosticar y reparar; el runner no
modifica archivos automáticamente.

## Alternatives

- Capturar logs completos: más evidencia, pero riesgo de secretos y archivos muy grandes.
- Repair loop que edita código automáticamente: autonomía excesiva y causa raíz difícil de revisar.
- Solo documentación manual: no impide un cuarto intento ni gates omitidos.
- Plataforma externa: dependencia y coste desproporcionados para el TFM actual.

## Consequences

- Los resultados pueden relacionarse con tarea, commit y PR.
- El límite de reparación es verificable y no depende solo de instrucciones.
- Un fallo conserva su salida únicamente en la terminal; la traza requiere un
  resumen sanitizado de la causa.
- La evolución de los gates dentro de `verify` no exige duplicarlos en el runner.
