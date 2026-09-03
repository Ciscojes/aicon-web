# Estado de implementación

Actualizado: 2026-09-02.

## Entrega 0 — Fundamentos técnicos

Completada. Incluye aplicación Next.js, autenticación con Supabase, perfiles y
roles internos, protección del panel, migración inicial, RLS, pruebas y flujo de
calidad en GitHub Actions.

## Entrega 1 — Catálogo

Completada.

Implementado:

- Listado administrativo de condominios no archivados.
- Creación de condominios como borrador.
- Edición de nombre, URL, dirección y descripción.
- Publicación con validación de contenido mínimo.
- Ocultamiento reversible de proyectos publicados.
- Archivado confirmado sin eliminación física.
- Creación, edición y archivado de modelos reutilizables.
- Características, áreas, habitaciones, baños y estacionamientos por modelo.
- Asignación de un modelo a varios condominios.
- Creación y edición de unidades basadas en modelos o de diseño único.
- Precio USD, disponibilidad y valores específicos que prevalecen sobre el modelo.
- Publicación, ocultamiento y archivado de unidades sin eliminación física.
- Protección en aplicación y PostgreSQL para impedir publicar una unidad si su
  condominio no está publicado o su modelo dejó de estar habilitado.
- Portada pública conectada al inventario publicado.
- Catálogo público con filtros por condominio, precio, habitaciones, baños y
  disponibilidad.
- Detalle público de cada casa con precio, estado, características y valores
  específicos que prevalecen sobre el modelo.
- Detalle público de cada condominio mediante su URL, con descripción, dirección,
  galería ordenada, inventario publicado y estado vacío sin contenido ficticio.
- Previsualización administrativa protegida del contenido guardado de un
  condominio antes de publicarlo.
- Carga, orden, portada y retiro confirmado de hasta 20 fotografías por
  condominio, modelo o unidad mediante Supabase Storage.
- Herencia visual pública: la unidad prioriza sus fotografías, después las del
  modelo y finalmente las del condominio.
- Diseño público adaptable a celulares, con ilustraciones conceptuales
  identificadas como tales mientras se obtienen fotografías reales.
- Generación y validación de la URL pública.
- Autorización para administradores y editores tanto en la página como en la
  Server Action.
- Mensajes de validación, estado vacío y diseño adaptable.
- Pruebas de las reglas de URL y validación del borrador.

## Entrega 2 — Cotizaciones y contacto

En progreso.

Implementado:

- Formulario público de contacto general o asociado a una casa o condominio,
  con validación, consentimiento, campo señuelo y límite de repetición.
- Registro privado de contactos, oportunidades y actividades de consulta con
  deduplicación inicial por teléfono normalizado.
- Bandeja CRM inicial de oportunidades abiertas, disponible solamente para
  administradores y asesores activos.
- Configuración financiera versionada y restringida a administradores, sin
  valores inventados ni configuración activa por defecto.
- Simulador dentro del detalle de casas disponibles con prima, plazo, tasa,
  monto por financiar, cuota nivelada y aviso bancario obligatorio.
- Solicitud formal que repite el cálculo en PostgreSQL y conserva fotografías
  históricas de precio, prima, tasa, plazo y cuota.
- Validación en PostgreSQL para impedir cotizaciones de casas no disponibles o
  con opciones financieras desactualizadas.
- Resumen de la cotización más reciente dentro de la bandeja CRM.
- Base segura para agregar notas y cambiar etapas de oportunidades, conservando
  cada acción en el historial.
- Detalle protegido de oportunidades con contacto, consentimientos, interés,
  cotizaciones, historial, notas y cambio explícito de etapa.
- Harness ligero para diagnosticar e iniciar el entorno local en Windows o WSL
  y ejecutar el contrato completo de verificación.

Siguiente sección vertical:

- Embudo, filtros y asignación de asesores en el CRM.
- WhatsApp directo cuando se confirme el número empresarial.

## Verificación

`npm run check` valida lint, tipos, pruebas y migraciones. `npm run build`
comprueba la compilación de producción. La interacción completa con datos exige
un proyecto Supabase configurado o Supabase local activo.
