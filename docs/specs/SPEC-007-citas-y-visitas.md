# SPEC-007 — Citas y visitas

## Estado

Aprobada como base provisional; pendiente de validación con el dueño.

## Objetivo

Permitir que una persona interesada reserve una visita a una casa en un horario disponible y que Aicon administre la cita, el asesor y los recordatorios asociados.

## Alcance

- Calendario público de disponibilidad después del registro o la solicitud de cotización.
- Configuración administrativa de días, horas y duración de las visitas.
- Bloqueo de períodos no disponibles por parte de los asesores.
- Confirmaciones y recordatorios por correo electrónico y WhatsApp.
- Reprogramación, cancelación y registro del resultado de la visita.
- Integración con el CRM básico.

## Fuera de alcance inicial

- Visitas virtuales por videollamada.
- Cobro por reservar una visita.
- Sincronización con calendarios externos, hasta validar si es necesaria.
- Rutas automáticas para asesores que visiten varias propiedades.

## Usuarios

- Comprador o interesado.
- Asesor.
- Administrador o dueño.

## Flujo principal

1. El interesado selecciona `Agendar visita` directamente o llega a la agenda después de solicitar una cotización.
2. El sistema solicita o reutiliza sus datos de registro.
3. El interesado consulta las fechas y horas disponibles.
4. Selecciona un horario y confirma sus datos.
5. Acepta recibir comunicaciones relacionadas con la cita.
6. El sistema reserva el horario y crea la cita en el CRM.
7. El cliente y el asesor reciben la confirmación por correo electrónico y WhatsApp.
8. El sistema envía recordatorios 24 horas y 2 horas antes.
9. Después de la visita, el asesor registra el resultado.

## Requisitos funcionales

- Mostrar solamente horarios disponibles para la casa y el asesor correspondiente.
- Usar inicialmente una duración de 60 minutos por visita.
- Permitir al administrador definir días, horas y duración de las visitas.
- Permitir a cada asesor bloquear períodos en los que no estará disponible.
- Evitar reservas superpuestas o incompatibles.
- Relacionar cada cita con el cliente, la casa, el condominio y el asesor.
- Enviar confirmaciones y recordatorios por correo electrónico y WhatsApp.
- Permitir que un usuario autorizado reprograme o cancele una cita.
- Permitir al cliente cancelar o solicitar reprogramación mediante un enlace seguro.
- Permitir al asesor registrar la cita como realizada, cancelada o no asistida.
- Conservar un historial básico de cambios de fecha, estado y responsable.

### Gestión interna de una cita

- El administrador podrá reprogramar, cancelar y registrar el resultado de cualquier
  cita; un asesor solamente podrá hacerlo en las citas que tenga asignadas.
- Solamente una cita `Programada` podrá reprogramarse o pasar a `Realizada`,
  `Cancelada` o `No asistió`. Los estados finales no se sobrescribirán desde el panel.
- La reprogramación conservará el asesor y la duración de la cita, exigirá una fecha
  futura y volverá a validar su horario recurrente, bloqueos y otras citas antes de
  confirmar el cambio.
- La cancelación admitirá un motivo breve opcional y liberará inmediatamente el
  período para una nueva reserva compatible.
- Cada creación, reprogramación y cambio de estado conservará en un historial
  inmutable el usuario, la fecha del cambio y los valores anteriores y nuevos.
- El historial de la cita será visible en la agenda para los mismos usuarios que
  tienen permiso de consultar la cita.

## Estados de una cita

`Programada → Realizada | Cancelada | No asistió`

Una cita reprogramada conservará el historial de su horario anterior y volverá al estado `Programada`.

## Reglas del negocio

- Los valores iniciales serán 60 minutos de duración y recordatorios 24 horas y 2 horas antes.
- El administrador podrá modificar la duración, los horarios y la anticipación de los recordatorios.
- Una cita confirmada cambiará la oportunidad relacionada a `Visita programada`.
- El horario se liberará cuando una cita sea cancelada.
- Los estados finales dejarán de bloquear disponibilidad; una cita reprogramada
  bloqueará solamente su horario nuevo.
- El sistema volverá a comprobar la disponibilidad antes de confirmar la reserva.
- El cliente deberá proporcionar nombre, teléfono con código de país y correo electrónico para agendar.
- Los avisos requerirán autorización expresa del cliente.
- WhatsApp deberá utilizar una integración empresarial oficial aprobada.
- Si un canal autorizado falla, el sistema intentará el otro y registrará el resultado.
- La primera versión no publicará horarios hasta que un administrador configure
  explícitamente la disponibilidad recurrente de al menos un asesor.
- Al reservar se priorizará el asesor ya asignado a la oportunidad si continúa
  disponible; de lo contrario se elegirá un asesor activo disponible y quedará
  asignado a la oportunidad.

## Casos alternativos y errores

- Si otro cliente reserva el horario primero, se informará que ya no está disponible y se mostrarán alternativas.
- Si no existen horarios, se ofrecerá contactar a un asesor.
- Si falla el envío de un aviso, la cita seguirá confirmada y el fallo quedará visible para el personal autorizado.
- Si el cliente solicita reprogramación, el horario actual no cambiará hasta que se confirme uno nuevo.
- Si una casa deja de estar disponible, las citas futuras deberán revisarse y los responsables recibirán una alerta interna.

## Criterios de aceptación

- Un interesado registrado puede reservar una visita sin volver a escribir sus datos conocidos.
- El sistema nunca confirma dos citas incompatibles para el mismo horario.
- Una cita confirmada aparece en el CRM vinculada a la propiedad y al asesor.
- La etapa comercial cambia a `Visita programada` al confirmar.
- El cliente y el asesor reciben confirmaciones por los canales autorizados.
- Se programan recordatorios 24 horas y 2 horas antes de la visita.
- Cancelar una cita libera nuevamente el horario.
- Reprogramar conserva un registro del cambio.
- El asesor puede registrar el resultado de la visita.
- Un usuario sin permisos no puede consultar ni modificar citas ajenas.

## Preguntas pendientes

- Confirmar con el dueño los días y horas normales de visita.
- Confirmar si cada casa tendrá un asesor fijo o se asignará según disponibilidad.
- Confirmar el proveedor, número empresarial, plantillas y presupuesto de WhatsApp.
- Confirmar el servicio de correo electrónico y la dirección remitente.
- Definir si se sincronizará con Google Calendar, Outlook u otro calendario externo.
- Definir cuánto tiempo antes puede reservarse, reprogramarse o cancelarse una cita.

## Historial de cambios

- 2026-08-28: creación de la especificación inicial con duración de 60 minutos y recordatorios 24 y 2 horas antes.
- 2026-08-28: se confirmó que el cliente puede agendar directamente o después de cotizar.
- 2026-09-03: se definió la asignación provisional por disponibilidad y se evitó
  asumir días u horas de atención sin configuración administrativa.
- 2026-09-03: se definieron las transiciones, permisos e historial auditable para la
  reprogramación, cancelación y resultado de las citas.
