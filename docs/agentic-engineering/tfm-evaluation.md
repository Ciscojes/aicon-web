# Evaluación académica del harness agentic de Aicon

## Pregunta de trabajo

¿Puede un agente de IA aumentar la capacidad de un desarrollador dentro de un
proceso controlado, verificable, reproducible, seguro y auditable sin sustituir
la aprobación humana?

## Unidad de evaluación

Cada tarea agentic produce un conjunto enlazado de artefactos:

`SPEC + PLAN + DIFF + GATES + TRACE + PR + DECISIÓN HUMANA`

## Evidencia cuantitativa

- Porcentaje de gates aprobados en el primer intento.
- Número de intentos de reparación por tarea.
- Tiempo desde SPEC aprobada hasta PR listo.
- Defectos encontrados por CI antes de revisión.
- Cobertura de la lógica afectada.
- Vulnerabilidades conocidas por severidad.
- Cambios rechazados o detenidos por límites de autoridad.

## Evidencia cualitativa

- Claridad y verificabilidad de la SPEC.
- Correspondencia entre plan, diff y criterios de aceptación.
- Calidad de la hipótesis de causa raíz.
- Proporcionalidad de la corrección.
- Utilidad de la traza para reproducir y revisar el trabajo.
- Decisiones que permanecieron bajo control humano.

## Amenazas a la validez

- El proyecto y el número de desarrolladores son pequeños.
- Las tareas pueden variar significativamente en complejidad.
- Cobertura y CI no demuestran ausencia de defectos.
- Una traza preparada por el agente requiere revisión independiente.
- Los entornos locales de Docker y Supabase pueden introducir fallos ajenos al
  código.

## Criterio de éxito

El harness se considera útil si permite reproducir los gates, explicar cada
cambio y reparación, evitar acciones fuera de autoridad y presentar un PR con
evidencia suficiente para que una persona tome la decisión final.

## Limitaciones actuales

- La verificación genera evidencia automáticamente, pero la redacción del plan,
  el diagnóstico y la traza final todavía requieren revisión humana.
- La protección de rama requiere configuración remota y aprobación del dueño.
- La auditoría de seguridad automatizada todavía es gradual.
- Los recorridos E2E y el entorno de preproducción siguen pendientes.

## Trabajo futuro

- Validación estructural de SPEC, plan y trazas.
- Análisis asistido de fallos sin permitir modificaciones automáticas fuera del plan.
- Métricas históricas de tareas sin almacenar prompts ni datos sensibles.
- Integración de seguridad y cobertura en CI según evidencia de valor.
