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
- Generación y validación de la URL pública.
- Autorización para administradores y editores tanto en la página como en la
  Server Action.
- Mensajes de validación, estado vacío y diseño adaptable.
- Pruebas de las reglas de URL y validación del borrador.

Siguiente sección vertical:

- Administración de unidades basadas en modelos o de diseño único.
- Después: medios y catálogo público.

## Verificación

`npm run check` valida lint, tipos, pruebas y migraciones. `npm run build`
comprueba la compilación de producción. La interacción completa con datos exige
un proyecto Supabase configurado o Supabase local activo.
