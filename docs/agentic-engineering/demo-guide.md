# Guion de demostración del TFM

Duración sugerida: 10–12 minutos.

## 1. Problema y objetivo — 1 minuto

- Mostrar el flujo inicial: desarrollador → código → tests → CI.
- Explicar el objetivo: incorporar un agente sin eliminar control humano.
- Presentar el principio `SPEC → PLAN → IMPLEMENT → VERIFY → REPAIR → REVIEW`.

## 2. Arquitectura — 2 minutos

- Abrir `AGENTS.md` como fuente de verdad.
- Mostrar `.agent/specs`, `.agent/plans` y `.agent/runs`.
- Explicar que `src/` y el runtime de Aicon no dependen del harness.
- Mostrar los niveles SAFE, CONTROLLED y REQUIRE APPROVAL.

## 3. Verificación reproducible — 2 minutos

En una rama de demostración no destructiva:

```bash
npm run agent:artifacts
npm run security
npm run verify
```

Explicar que ningún gate fallido se convierte en aprobación y que los resultados
sensibles permanecen fuera de las trazas.

## 4. Repair loop real — 2 minutos

- Abrir `.agent/runs/AEH-002/summary.md`.
- Mostrar los dos hallazgos de SonarCloud sin copiar datos sensibles.
- Explicar causa raíz, corrección mínima e intento 2.
- Señalar el límite `MAX_REPAIR_ATTEMPTS=3`.

## 5. Seguridad y evidencia — 2 minutos

- Mostrar `.agent/runs/AEH-003/summary.md`.
- Abrir el workflow `Quality` y su artefacto sanitizado.
- Explicar RLS, contrato de entorno, auditoría de dependencias y límites del escáner.
- Aclarar que el reporte conserva conteos, no valores ni logs.

## 6. Métricas y decisión humana — 1 minuto

```bash
npm run agent:metrics
```

- Mostrar el snapshot versionado y explicar su denominador.
- Abrir un PR y destacar que CI no reemplaza la revisión.
- Cerrar con las acciones que requieren aprobación: merge, producción, secretos,
  seguridad crítica y datos destructivos.

## Preguntas previsibles

**¿El agente reemplaza al desarrollador?**
No. Ejecuta trabajo controlado y produce evidencia; la persona decide alcance y
acciones irreversibles.

**¿Un CI verde demuestra que no hay defectos?**
No. Demuestra que pasaron controles definidos y reproducibles. El audit documenta
las amenazas a la validez.

**¿Por qué no usar múltiples agentes?**
Un agente controlado es suficiente para este alcance y reduce coordinación,
coste y dificultad de auditoría.

**¿Está listo para producción?**
El MVP y el harness están técnicamente avanzados. Producción requiere preproducción,
datos reales, accesibilidad manual, respaldo/restauración y proveedores aprobados.
