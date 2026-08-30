# SPEC-008 — Flujo del comprador

## Estado

Aprobada como base provisional.

## Objetivo

Definir el recorrido principal que seguirá una persona desde la portada hasta solicitar una cotización o programar una visita a una casa.

## Flujo principal

El recorrido tendrá dos caminos según la intención del cliente:

- `Portada → Catálogo → Detalle de casa → Agendar visita → Registro → Calendario → Confirmación`
- `Portada → Catálogo → Detalle de casa → Cotización → Registro → Agenda opcional → Confirmación`

1. El visitante entra en la portada.
2. Explora condominios o busca casas utilizando filtros.
3. Selecciona una casa para consultar sus características y disponibilidad.
4. Decide entre agendar directamente una visita o realizar primero una simulación y solicitar una cotización.
5. Proporciona nombre y teléfono; agrega su correo si continuará a la agenda.
6. Si desea una visita, acepta recibir comunicaciones relacionadas con la cita.
7. Elige una fecha y hora disponible.
8. El sistema confirma la solicitud o la cita y la registra en el CRM.
9. Cuando existe una cita, el cliente recibe la confirmación por correo electrónico y WhatsApp.

## Decisiones del visitante

- Desde la portada puede ir al catálogo o contactar directamente a un asesor.
- El contacto con un asesor ofrecerá WhatsApp directo o un formulario web.
- Desde el catálogo puede cambiar filtros o abrir el detalle de una casa.
- En el detalle puede simular financiamiento, solicitar cotización, agendar una visita o contactar a un asesor.
- Si ya está interesado, puede agendar directamente sin solicitar antes una cotización.
- Si todavía necesita evaluar la compra, puede cotizar primero y decidir después si agenda.
- La simulación financiera no será obligatoria para solicitar atención o agendar.
- El cliente podrá finalizar después de solicitar una cotización sin agendar una visita.

## Casos alternativos

- Si una casa no está disponible, se mostrarán alternativas del mismo condominio o características similares.
- Si no existen horarios disponibles, se ofrecerá contactar a un asesor.
- Si el visitante no desea registrarse, podrá seguir explorando, pero no podrá confirmar una visita.
- Si el horario elegido deja de estar disponible, se mostrarán nuevas opciones sin perder los datos del cliente.
- Si falla una notificación, la cita seguirá confirmada y el personal podrá ver el fallo en el CRM.

## Pantallas involucradas

1. Portada.
2. Catálogo de condominios y casas.
3. Detalle de condominio.
4. Detalle de casa.
5. Calculadora y solicitud de cotización.
6. Registro o identificación del interesado.
7. Calendario de visitas.
8. Confirmación de solicitud o cita.
9. Contacto directo con un asesor.

## Criterios de aceptación

- El visitante puede llegar desde la portada hasta una casa en no más de tres decisiones principales.
- Cotizar, agendar y contactar permanecen visibles desde el detalle de la casa.
- La simulación no bloquea los otros caminos.
- Los datos conocidos se reutilizan al pasar de cotización a agenda.
- Una casa no disponible nunca permite confirmar una nueva visita.
- Cuando no hay horarios, existe una salida clara para contactar a un asesor.
- La confirmación identifica la casa, fecha, hora y canales de aviso.

## Artefacto visual

- [Diagrama del flujo público del comprador](../diagrams/flujo-comprador.html)

## Preguntas pendientes

- Confirmar el texto definitivo de cada llamada a la acción.

## Historial de cambios

- 2026-08-28: creación del flujo inicial del comprador.
- 2026-08-28: se aprobaron los caminos de agenda directa y cotización previa según la intención del cliente.
- 2026-08-28: se aprobó que el catálogo abra con todas las casas disponibles y permita filtrar por condominio.
- 2026-08-28: se aprobaron WhatsApp directo y formulario como caminos para contactar a un asesor.
