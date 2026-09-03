# SPEC-005 — CRM básico

## Estado

En revisión.

## Objetivo

Centralizar los clientes interesados, las casas consultadas y el seguimiento realizado por los asesores.

## Alcance

- Registro automático o manual de clientes potenciales.
- Asociación del cliente con una casa o condominio.
- Asignación de un asesor.
- Notas y actividades de seguimiento.
- Gestión de la etapa comercial.
- Agenda de visitas a las casas.
- Recordatorios de citas programadas.

Los detalles del calendario y sus notificaciones se definen en [SPEC-007 — Citas y visitas](SPEC-007-citas-y-visitas.md).

La distribución inicial de las pantallas internas se define en [SPEC-012 — Bocetos del panel y CRM](SPEC-012-bocetos-panel-crm.md).

## Etapas propuestas

`Nuevo → Contactado → Visita programada → Cotización → Negociación → Vendido o Descartado`

## Requisitos funcionales

- Crear un cliente desde una solicitud pública.
- Crear o actualizar un cliente cuando envía el formulario para hablar con un asesor.
- Solicitar nombre y teléfono como datos obligatorios de contacto.
- Permitir correo electrónico como dato opcional para el registro general.
- Evitar duplicados evidentes por teléfono o correo y advertir al usuario interno.
- Consultar datos de contacto, interés, fuente y fecha de ingreso.
- Asignar o reasignar un asesor.
- Agregar notas y actividades con fecha y responsable.
- Cambiar la etapa de la oportunidad.
- Filtrar clientes por asesor, etapa, condominio, casa y fecha.
- Ofrecer al cliente un calendario para agendar una visita a la casa después de registrarse o solicitar una cotización.
- Mostrar únicamente fechas y horas disponibles para visitas.
- Relacionar la cita con el cliente, la casa y el asesor correspondiente.
- Permitir a un usuario autorizado consultar, reprogramar o cancelar la cita.
- Enviar por correo electrónico y WhatsApp la confirmación y los recordatorios de las citas al cliente y al asesor.

## Reglas del negocio

- Una persona puede interesarse en más de una casa.
- El historial no se eliminará al cerrar una oportunidad.
- Solamente usuarios autorizados podrán consultar datos personales.
- Una solicitud de cotización formal iniciará una oportunidad en estado `Nuevo`.
- Un formulario de contacto iniciará una oportunidad en estado `Nuevo` y conservará la casa o condominio desde donde se envió.
- Agendar una visita cambiará la oportunidad a `Visita programada`.
- El sistema no permitirá dos citas incompatibles en el mismo espacio de disponibilidad.
- El envío de recordatorios dependerá de que exista un canal de contacto válido y autorizado.
- El cliente deberá aceptar expresamente recibir mensajes relacionados con su cita.
- El número de teléfono deberá incluir un código de país válido para los avisos por WhatsApp.
- El correo electrónico se solicitará al programar una visita para enviar la confirmación y servir como canal alternativo.
- Si un canal no está disponible o falla, el sistema intentará utilizar el otro canal autorizado.
- El proveedor y los costos de la integración oficial de WhatsApp deberán aprobarse antes de implementarla.
- El formulario público reutilizará el contacto por teléfono normalizado y evitará
  crear otra oportunidad abierta para el mismo interés cuando ya exista una.
- El mensaje inicial se conservará como actividad de la oportunidad, con fecha y
  origen, sin quedar expuesto en ninguna ruta pública.

## Gestión inicial de oportunidades

- Cada oportunidad tendrá una ruta interna protegida con datos de contacto,
  consentimiento, propiedad de interés, cotizaciones e historial cronológico.
- Administradores y asesores activos podrán agregar notas y cambiar la etapa
  mediante acciones explícitas; editores no podrán leer ni modificar el CRM.
- Hasta que se aprueben reglas de asignación, administradores y asesores activos
  podrán gestionar todas las oportunidades y la interfaz indicará que aún no hay
  responsable asignado.
- La primera asignación será manual: solamente un administrador podrá asignar o
  retirar un asesor activo; la automatización se pospone hasta aprobar sus reglas.
- Asignar, reasignar o retirar un asesor quedará registrado como actividad con
  el administrador responsable y la fecha.
- Cambiar a `Vendido` o `Descartado` cerrará la oportunidad; cambiarla nuevamente
  a una etapa activa la reabrirá sin eliminar su historial.
- Cada nota y cambio de etapa se registrará transaccionalmente con autor y fecha.

## Criterios de aceptación

- Cada formulario público aprobado genera o actualiza correctamente un cliente potencial.
- No se acepta el registro público sin nombre y teléfono válidos.
- El asesor puede identificar la propiedad consultada.
- Los cambios de etapa y las notas conservan autor y fecha.
- Un usuario sin permiso no puede acceder al CRM.
- Los filtros permiten encontrar oportunidades sin recorrer toda la lista.
- Después del registro, el cliente puede elegir una fecha y hora disponible para visitar la casa de interés.
- Una cita confirmada aparece en el CRM vinculada al cliente y a la casa.
- El horario reservado deja de ofrecerse cuando produciría un conflicto.
- El cliente y el asesor reciben por correo electrónico y WhatsApp los recordatorios configurados para la cita.
- El sistema conserva el estado de envío de cada notificación sin almacenar información innecesaria del mensaje.

## Preguntas pendientes

- Confirmar etapas reales del proceso de ventas de Aicon.
- Validar con el dueño el proveedor oficial, presupuesto, número empresarial y plantillas de WhatsApp.
- Definir con cuánta anticipación se enviarán los recordatorios.
- Definir quién configura los días, horarios, duración y disponibilidad de las visitas.
- Definir qué sucede si una casa tiene varios asesores disponibles.
- Definir los reportes necesarios para el MVP.
- Definir reglas exactas para asignar asesores.

## Historial de cambios

- 2026-08-28: creación del borrador inicial.
- 2026-08-28: se establecieron nombre y teléfono obligatorios; se incorporaron agenda de visitas y recordatorios.
- 2026-08-28: se seleccionó provisionalmente el correo electrónico para confirmaciones y recordatorios de visitas.
- 2026-08-28: se añadió WhatsApp como canal de confirmaciones y recordatorios, sujeto a validar proveedor y costos.
- 2026-08-28: se vinculó el formulario de contacto con asesores al CRM.
- 2026-08-31: se definieron deduplicación inicial, privacidad y trazabilidad para
  las consultas del formulario público.
- 2026-09-01: se definieron detalle protegido, notas, etapas y permisos
  provisionales antes de implementar asignación de asesores.
- 2026-09-02: se aprobó la asignación manual por administradores como primera
  versión, conservando la asignación automática como decisión pendiente.
