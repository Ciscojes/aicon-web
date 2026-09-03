# SPEC-012 — Bocetos del panel administrativo y CRM

## Estado

Aprobada como base provisional.

## Objetivo

Definir la estructura de las pantallas internas que utilizarán el dueño, los administradores y los asesores para gestionar propiedades, clientes y citas.

## Enfoque inicial

- El panel administrativo se diseñará primero para computadora.
- Las tareas principales tendrán navegación lateral estable.
- Cada usuario verá solamente las secciones permitidas por su rol.
- Los asesores deberán poder consultar clientes y citas desde celular en una adaptación posterior.

## Pantallas del primer conjunto

1. Resumen administrativo.
2. Lista de condominios, modelos y casas.
3. Editor de una casa.
4. Embudo de oportunidades del CRM.
5. Detalle de cliente y oportunidad.
6. Agenda de visitas.

## Navegación propuesta

- Resumen.
- Propiedades.
- CRM.
- Citas.
- Usuarios, solo para administradores autorizados.
- Configuración, según permisos.

## Resumen administrativo

- Indicadores de casas disponibles, reservadas y vendidas.
- Clientes nuevos pendientes de atención.
- Próximas visitas.
- Seguimientos atrasados.
- Consultas sin asesor asignado.
- Avisos que requieren acción, como notificaciones fallidas o contenido incompleto.
- Accesos directos para agregar una casa o revisar clientes nuevos.

## Gestión de propiedades

- Selector de condominio y filtros por estado de publicación y disponibilidad.
- Vista de modelos y unidades relacionadas.
- Acciones para crear, editar, previsualizar, publicar, ocultar y archivar.
- Estados visibles sin tener que abrir cada registro.

## Editor de casa

- Secciones para información general, características, fotografías, disponibilidad y publicación.
- Selección de un modelo existente o registro como diseño único.
- Posibilidad de sobrescribir datos heredados del modelo.
- Guardado como borrador y previsualización antes de publicar.
- Confirmación antes de archivar o retirar una publicación.

## CRM

- Vista por etapas del proceso comercial.
- Filtros por asesor, condominio, casa, fecha y etapa.
- Tarjetas con nombre, propiedad de interés, responsable y próxima actividad.
- Cambio de etapa mediante una acción explícita y accesible; arrastrar será opcional, no obligatorio.

## Detalle del cliente

- Datos de contacto y autorización de comunicaciones.
- Propiedades de interés y origen del contacto.
- Etapa, asesor y próxima acción.
- Historial cronológico de notas, comunicaciones, citas y cambios.
- Acciones para llamar, escribir, agendar, cotizar o cerrar la oportunidad.
- La primera versión priorizará cambio explícito de etapa y notas; agenda,
  asignación y acciones de proveedores se incorporarán en incrementos posteriores.

## Agenda de visitas

- Vista semanal con filtros por asesor, casa y condominio.
- Estados programada, realizada, cancelada y no asistió.
- Bloqueo de períodos no disponibles.
- Reprogramación o cancelación con confirmación.
- Visibilidad del estado de los recordatorios por correo y WhatsApp.

## Criterios de aceptación

- El administrador puede llegar a propiedades, CRM o citas desde cualquier pantalla interna.
- Los indicadores del resumen conducen a la lista filtrada correspondiente.
- Publicar o archivar requiere una acción explícita y confirmación cuando corresponda.
- El editor distingue con claridad datos del modelo y cambios específicos de la unidad.
- El asesor identifica clientes que requieren seguimiento sin abrir todos los registros.
- El detalle del cliente reúne datos, propiedad, historial, próxima acción y citas.
- La agenda evita superposiciones y muestra el estado de cada visita.
- Un usuario no ve controles para los que carece de permiso.

## Artefacto visual

- [Bocetos del panel administrativo y CRM](../diagrams/bocetos-panel-crm.html)

## Preguntas pendientes

- Definir si cambiar etapas mediante arrastrar tarjetas resulta conveniente para los asesores.
- Confirmar si el dueño administrará usuarios directamente.
- Definir qué funciones internas deben estar disponibles desde celular en el MVP.

## Historial de cambios

- 2026-08-28: creación del primer conjunto de bocetos internos.
- 2026-08-28: se aprobaron los indicadores iniciales del resumen administrativo.
- 2026-09-01: se delimitó la primera pantalla funcional de detalle de oportunidad.
