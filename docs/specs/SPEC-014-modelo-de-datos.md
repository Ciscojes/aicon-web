# SPEC-014 — Modelo lógico de datos

## Estado

Aprobada como modelo lógico del MVP.

## Objetivo

Definir las entidades, relaciones y reglas de integridad que necesita el MVP antes de crear migraciones o tablas reales en PostgreSQL.

## Principios

- Usar identificadores UUID internos y códigos legibles para las casas.
- Guardar dinero como valores decimales exactos, nunca como números de punto flotante.
- Guardar fechas y horas con zona horaria; mostrarlas inicialmente en `America/Costa_Rica`.
- Archivar en lugar de eliminar registros con historial comercial.
- Conservar fotografías históricas de precio, tasa, prima y plazo en cada cotización.
- Separar a la persona de sus oportunidades: un contacto puede interesarse en varias propiedades.
- Normalizar teléfonos en formato internacional para WhatsApp sin asumir que todos son de Costa Rica.
- Aplicar permisos y políticas por rol en la aplicación y PostgreSQL.

## Catálogo

### `condominiums`

Representa cada proyecto residencial.

Campos principales: `id`, `slug`, `name`, `description`, `address`, `latitude`, `longitude`, `publication_status`, `published_at`, `archived_at`, `created_at`, `updated_at`.

### `house_models`

Define características compartidas por varias casas.

Campos principales: `id`, `name`, `description`, `bedrooms`, `bathrooms`, `parking_spaces`, `construction_area_m2`, `land_area_m2`, `features`, `archived_at`.

### `condominium_models`

Relaciona los modelos con los condominios donde pueden utilizarse.

Campos principales: `condominium_id`, `model_id`, `active`, `created_at`.

Un modelo podrá reutilizarse en varios condominios sin duplicar su definición.

### `house_units`

Representa una casa específica. Puede usar un modelo o ser de diseño único.

Campos principales: `id`, `condominium_id`, `model_id` opcional, `code`, `price_usd`, `availability_status`, `publication_status`, campos opcionales de características específicas, `published_at`, `archived_at`, `created_at`, `updated_at`.

Los valores específicos de la unidad prevalecen sobre los valores heredados del modelo.

### `media_assets` y relaciones de medios

Almacenan metadatos y referencias de las fotografías guardadas en Supabase Storage.

Campos principales: `id`, `storage_path`, `alt_text`, `mime_type`, `size_bytes`, `uploaded_by`, `created_at`.

Las tablas `condominium_media`, `model_media` y `unit_media` relacionarán fotografías, definirán su orden y marcarán la imagen de portada.

## Usuarios y permisos

### `user_profiles`

Amplía el usuario autenticado de Supabase.

Campos principales: `id`, `auth_user_id`, `name`, `email`, `phone`, `role`, `active`, `created_at`, `updated_at`.

Roles iniciales: `administrator`, `advisor` y `editor` opcional.

## CRM y ventas

### `contacts`

Representa a la persona interesada, independientemente de cuántas propiedades consulte.

Campos principales: `id`, `name`, `phone`, `normalized_phone`, `email`, `source`, `email_consent`, `whatsapp_consent`, `created_at`, `updated_at`, `archived_at`.

El teléfono y el correo servirán para detectar posibles duplicados, pero el sistema advertirá antes de fusionar registros.

### `opportunities`

Representa un proceso comercial relacionado con un contacto y una propiedad o condominio.

Campos principales: `id`, `contact_id`, `unit_id` opcional, `condominium_id` opcional, `advisor_id` opcional, `stage`, `status`, `source`, `next_action_at`, `closed_reason`, `created_at`, `updated_at`, `closed_at`.

Un contacto puede tener varias oportunidades. Cada oportunidad tendrá una etapa independiente y representará una sola propiedad o, cuando todavía no se haya escogido una casa, un solo condominio.

Si un cliente se interesa en varias casas, se crearán oportunidades separadas relacionadas con el mismo contacto.

### `quotes`

Conserva cada simulación enviada o cotización formal solicitada.

Campos principales: `id`, `opportunity_id`, `unit_id`, `kind`, `price_snapshot_usd`, `down_payment_usd`, `financed_amount_usd`, `annual_rate`, `term_months`, `estimated_monthly_payment_usd`, `disclaimer_version`, `created_at`.

Los valores son históricos y no cambiarán cuando se edite la casa o la configuración financiera.

### `activities`

Registra notas y acciones del historial comercial.

Campos principales: `id`, `opportunity_id`, `actor_user_id`, `type`, `content`, `occurred_at`, `created_at`.

Tipos iniciales: nota, llamada, correo, WhatsApp, cambio de etapa, asignación,
cotización y visita.
Las consultas públicas podrán registrar una actividad de tipo `inquiry` sin actor
interno para conservar el mensaje y la fecha de ingreso.

## Citas y disponibilidad

### `appointments`

Representa una visita a una propiedad.

Campos principales: `id`, `opportunity_id`, `unit_id`, `advisor_id`, `starts_at`, `ends_at`, `status`, `cancellation_reason`, `created_at`, `updated_at`.

Estados iniciales: `scheduled`, `completed`, `cancelled` y `no_show`.

### `advisor_schedules` y `availability_blocks`

Definen horarios recurrentes y excepciones de disponibilidad.

Campos principales de horario: `advisor_id`, `weekday`, `starts_at_local`, `ends_at_local`, `active`.

Campos principales de bloqueo: `advisor_id`, `starts_at`, `ends_at`, `reason`, `created_by`.

### `notifications`

Actúa como cola e historial de confirmaciones y recordatorios.

Campos principales: `id`, `appointment_id`, `contact_id`, `channel`, `template`, `scheduled_for`, `status`, `attempt_count`, `provider_message_id`, `sent_at`, `last_error`, `created_at`.

Canales iniciales: correo electrónico y WhatsApp.

## Configuración y auditoría

### `app_settings`

Almacena configuración versionada de financiamiento, citas y datos empresariales.

Campos principales: `id`, `category`, `value`, `effective_from`, `updated_by`, `updated_at`.

No sustituye las fotografías históricas guardadas en cotizaciones y citas.
La categoría `financing` guardará en JSON validado la tasa anual, prima mínima,
opciones de prima, plazos y estado activo. Cada guardado insertará una fila nueva.

### `audit_logs`

Registra cambios importantes del panel.

Campos principales: `id`, `actor_user_id`, `entity_type`, `entity_id`, `action`, `changes`, `occurred_at`.

No almacenará secretos ni datos completos innecesarios.

## Relaciones principales

- Un condominio tiene muchas unidades y puede ofrecer muchos modelos.
- Un modelo puede ofrecerse en muchos condominios mediante `condominium_models` y utilizarse en muchas unidades.
- Una unidad puede tener cero o un modelo.
- Un contacto tiene muchas oportunidades.
- Una oportunidad pertenece a un contacto y apunta a una sola unidad o a un solo condominio.
- Un asesor puede gestionar muchas oportunidades y citas.
- Una oportunidad puede tener muchas cotizaciones, actividades y citas.
- Una cita puede producir varias notificaciones programadas.
- Los medios pueden asociarse y ordenarse para condominios, modelos y unidades.

## Restricciones importantes

- `house_units.code` será único dentro de su condominio.
- Si una unidad usa un modelo, ese modelo deberá estar habilitado para su condominio.
- `price_usd` y los montos de una cotización no pueden ser negativos.
- Una oportunidad deberá relacionarse al menos con una unidad, un condominio o un interés general explícito.
- `ends_at` siempre será posterior a `starts_at`.
- No podrán existir citas incompatibles para el mismo asesor en períodos superpuestos.
- Una unidad vendida o archivada no aceptará nuevas citas.
- Publicar una unidad exigirá los campos mínimos definidos por catálogo.
- Las cotizaciones y actividades comerciales no se eliminarán mediante las operaciones normales del panel.

## Índices iniciales

- Slugs y estados de publicación del catálogo.
- Condominio, modelo, precio, habitaciones y disponibilidad de unidades.
- Teléfono normalizado y correo de contactos.
- Etapa, asesor, propiedad y próxima acción de oportunidades.
- Fecha, asesor, propiedad y estado de citas.
- Estado y fecha programada de notificaciones.

## Artefacto visual

- [Diagrama del modelo lógico de datos](../diagrams/modelo-de-datos.html)

## Preguntas pendientes

- Confirmar si se conservarán públicamente las casas vendidas.
- Definir retención de contactos descartados, notificaciones y auditoría.
- Confirmar si el rol Editor formará parte del MVP.

## Historial de cambios

- 2026-08-28: creación de la propuesta inicial del modelo lógico.
- 2026-08-28: modelo aprobado; se habilitó la reutilización de modelos entre condominios y una oportunidad por propiedad.
- 2026-08-31: se añadió la actividad de consulta pública y la reutilización inicial
  de contactos por teléfono normalizado.
- 2026-08-31: se concretó la configuración financiera versionada y su relación con
  las fotografías históricas de cotización.
