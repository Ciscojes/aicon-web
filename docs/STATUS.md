# Estado de implementación

Actualizado: 2026-08-30.

## Entrega 0 — Fundamentos técnicos

Completada. Incluye aplicación Next.js, autenticación con Supabase, perfiles y
roles internos, protección del panel, migración inicial, RLS, pruebas y flujo de
calidad en GitHub Actions.

## Entrega 1 — Catálogo

En progreso.

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

Siguiente sección vertical:

- Detalle público de cada condominio y previsualización administrativa.
- Después: contacto con asesor y cotización.

## Verificación

`npm run check` valida lint, tipos, pruebas y migraciones. `npm run build`
comprueba la compilación de producción. La interacción completa con datos exige
un proyecto Supabase configurado o Supabase local activo.
