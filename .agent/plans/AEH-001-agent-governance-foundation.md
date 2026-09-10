# AEH-001 — Fundamentos de gobierno agentic

## Estado

Completado y listo para revisión humana.

## Objetivo

Establecer una capa mínima y versionada de gobierno para que un agente pueda
trabajar sobre Aicon de forma controlada, verificable, reproducible y auditable,
sin modificar el comportamiento de la aplicación.

## Alcance

- Convertir `AGENTS.md` en la fuente de verdad para agentes.
- Mantener `CLAUDE.md` como referencia a `AGENTS.md` sin duplicar reglas.
- Definir plantillas reutilizables de especificación, plan y traza.
- Documentar el ciclo `SPEC → PLAN → IMPLEMENT → VERIFY → REPAIR → REVIEW`.
- Definir niveles `SAFE`, `CONTROLLED` y `REQUIRE APPROVAL`.
- Registrar las decisiones principales mediante ADR.
- Añadir una plantilla de Pull Request alineada con la Definition of Done.
- Enlazar la documentación nueva desde el README.

## Fuera de alcance

- Crear el ejecutor automático del harness y su repair loop.
- Cambiar scripts npm, dependencias, código de aplicación o migraciones.
- Activar protección de rama o modificar configuración remota de GitHub.
- Desplegar Aicon o modificar entornos y secretos.

## Archivos previstos

- `AGENTS.md`
- `README.md`
- `.agent/README.md`
- `.agent/templates/*.md`
- `.agent/runs/README.md`
- `.github/pull_request_template.md`
- `docs/agentic-engineering/*.md`
- `docs/adr/*.md`

## Componentes afectados

Solo gobierno, documentación y flujo de contribución. No se afectan rutas,
módulos, base de datos, autenticación ni interfaz.

## Riesgos

- Duplicar reglas ya documentadas en `docs/`.
- Crear un proceso demasiado pesado para un proyecto pequeño.
- Presentar controles documentales como controles automatizados.
- Registrar accidentalmente datos sensibles en trazas.

## Mitigaciones

- `AGENTS.md` enlaza documentos especializados en vez de copiarlos completos.
- Las plantillas exigen solamente evidencia útil y campos mínimos.
- Cada control indica si es manual o automatizado.
- Las trazas prohíben secretos, datos personales y logs sin depurar.

## Pruebas necesarias

- `npm run verify`.
- `npm audit --audit-level=high`.
- Comprobar que Git permanezca sin cambios ajenos al incremento.
- Revisar enlaces Markdown y que `CLAUDE.md` siga apuntando a `AGENTS.md`.

## Migraciones

No se requieren.

## Pasos de implementación

1. Ampliar `AGENTS.md` preservando el bloque administrado por Next.js.
2. Crear las plantillas y explicar su uso.
3. Documentar arquitectura, flujo, seguridad, trazabilidad y evaluación.
4. Registrar las decisiones mediante tres ADR.
5. Añadir la plantilla de PR y enlaces desde el README.
6. Ejecutar todos los quality gates.
7. Revisar el diff y preparar un PR para aprobación humana.

## Criterios de aceptación

- Un agente puede identificar arquitectura, límites, gates y autoridad leyendo
  `AGENTS.md`.
- Toda tarea controlada requiere SPEC o alcance aprobado y plan previo.
- Existe una plantilla de traza sin datos sensibles.
- El repair loop está documentado con máximo tres intentos.
- La Definition of Done coincide con `npm run verify` y los controles de
  seguridad vigentes.
- La plantilla de PR exige objetivo, riesgos, pruebas, seguridad y aprobación.
- Ninguna funcionalidad de Aicon cambia y `npm run verify` termina correctamente.

## Aprobaciones

- Implementación documental: aprobada por el propietario.
- Protección de `main`: pendiente de aprobación separada.
- Merge del Pull Request: requiere revisión humana.
