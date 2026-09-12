# TFM-001 — Memoria académica de AICON

## Status

Approved

## Problem

La evidencia técnica y académica de AICON está distribuida entre documentación
de arquitectura, ADR, trazas y métricas. No existe una memoria maestra con la
estructura narrativa necesaria para revisión por un tutor de TFM.

## Objective

Crear un borrador académico autocontenido que explique el problema, fundamentos,
metodología, arquitectura, implementación, evaluación, resultados, limitaciones
y conclusiones del Agentic Engineering Harness de AICON.

## Scope

- Memoria principal en Markdown con marcadores institucionales explícitos.
- Resumen y abstract, introducción, marco teórico, metodología, desarrollo,
  evaluación, discusión, conclusiones y trabajo futuro.
- Bibliografía verificable y citada desde el texto.
- Índice de figuras, tablas y anexos basado en evidencia versionada.
- Guía de adaptación a la plantilla universitaria.

## Out of scope

- Inventar universidad, programa, tutor, autor o requisitos de formato.
- Entregar una versión PDF/DOCX sin plantilla institucional aprobada.
- Modificar aplicación, base de datos, dependencias o infraestructura.
- Afirmar preparación productiva o resultados no respaldados por evidencia.

## Functional requirements

- FR-1: La memoria debe poder leerse de principio a fin como un TFM coherente.
- FR-2: Cada resultado cuantitativo debe apuntar a evidencia reproducible.
- FR-3: Las referencias académicas deben tener identificador o URL verificable.
- FR-4: Los datos institucionales desconocidos deben aparecer como marcadores.
- FR-5: Los anexos deben dirigir al lector a SPEC, planes, trazas, ADR y CI.

## Non-functional requirements

- NFR-1: No se incluirán secretos, datos personales ni logs sin sanitizar.
- NFR-2: La redacción distinguirá hechos observados, interpretación y limitaciones.
- NFR-3: Se evitará duplicar documentación técnica que ya tenga fuente canónica.
- NFR-4: El documento permanecerá legible en GitHub y exportable posteriormente.

## Acceptance criteria

- AC-1: Existe una memoria maestra con todos los capítulos académicos definidos.
- AC-2: El texto incluye citas y una bibliografía consistente.
- AC-3: Métricas y resultados coinciden con la evidencia vigente del repositorio.
- AC-4: Una checklist enumera los únicos datos requeridos al propietario/autor.
- AC-5: `npm run verify` pasa sin cambios al runtime.

## Architectural constraints

- La documentación vive bajo `docs/tfm/` y referencia fuentes canónicas.
- No se modifica `src/`, `supabase/`, variables de entorno ni workflows.
- Markdown y Mermaid son suficientes; no se añade ninguna dependencia.

## Testing strategy

- Unit: no aplica; cambio documental.
- Integration/database: `npm run verify` asegura que no haya regresiones.
- End-to-end/manual: revisión de enlaces, estructura, cifras y marcadores.
- Security: búsqueda de secretos y datos personales mediante el harness existente.

## Authority and approvals

- Task level: CONTROLLED.
- Required approver and decision: alcance aprobado por Jesús en la conversación;
  merge posterior requiere aprobación humana independiente.

## Open questions

- Universidad, programa, autor, tutor, convocatoria y estilo bibliográfico final.
- Plantilla institucional y límites de extensión.
