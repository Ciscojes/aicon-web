# SPEC-003 — Catálogo de condominios, modelos y unidades

## Estado

Aprobada como base provisional.

## Objetivo

Organizar y presentar el inventario de Aicon de forma comprensible para compradores y administradores.

## Estructura

`Aicon → Condominios → Modelos de casa → Unidades`

Una unidad podrá utilizar un modelo compartido o registrarse como diseño único.

## Información del condominio

- Nombre y descripción.
- Ubicación y mapa.
- Fotografías.
- Amenidades y seguridad.
- Casas disponibles.

## Información del modelo

- Nombre.
- Descripción general.
- Habitaciones, baños y estacionamientos.
- Área de construcción y terreno cuando aplique.
- Planos, acabados, características y fotografías generales.

## Información de la unidad

- Código o número.
- Condominio y modelo opcional.
- Precio en USD.
- Estado: disponible, reservada o vendida.
- Ubicación dentro del condominio cuando esté disponible.
- Diferencias de área, acabados, características o precio respecto al modelo.
- Fotografías específicas opcionales.

## Reglas del negocio

- Varias unidades pueden compartir el mismo modelo.
- Una unidad puede ser de diseño único.
- Los datos específicos de una unidad prevalecen sobre los datos heredados del modelo.
- Una casa vendida conservará su registro e historial.
- Solamente las casas publicadas y habilitadas aparecerán en el catálogo público.

## Filtros iniciales

- Condominio.
- Rango de precio.
- Habitaciones.
- Baños.
- Estado de disponibilidad.

## Vista inicial

- El catálogo abrirá mostrando todas las casas disponibles.
- El comprador podrá filtrar las casas por condominio.
- Cada condominio también tendrá una página propia con su información y sus unidades.

## Detalle de condominio

- La ruta pública será `/condominios/{slug}`.
- Mostrará nombre, descripción, dirección, galería y casas publicadas del proyecto.
- La fotografía marcada como portada ocupará la posición principal; las restantes
  conservarán el orden definido en el panel.
- Si todavía no existen fotografías, se mostrará una representación identificada
  expresamente como ilustrativa.
- Un condominio oculto, en borrador o archivado no responderá en la ruta pública.
- Si el proyecto no tiene casas publicadas, la página conservará su información y
  mostrará un estado vacío en lugar de inventario ficticio.

## Criterios de aceptación

- El visitante puede recorrer condominios y ver sus casas.
- El visitante puede filtrar el catálogo con los criterios aprobados.
- Una unidad muestra datos del modelo y sus diferencias específicas correctamente.
- Las casas no publicadas no aparecen en el catálogo público.
- Las casas reservadas o vendidas muestran el estado correcto.
- Cada tarjeta pública de condominio conduce a su página propia.
- La página de un condominio solo enumera casas publicadas que le pertenecen.

## Preguntas pendientes

- Confirmar si se mostrará públicamente inventario vendido.
- Confirmar campos reales y filtros prioritarios con el dueño.
- Confirmar si cada unidad tendrá ubicación visible dentro del condominio.

## Historial de cambios

- 2026-08-28: creación de la especificación inicial.
- 2026-08-28: se definió que el catálogo abrirá con todas las casas disponibles y filtro por condominio.
- 2026-08-31: se definió la ruta y el contenido del detalle público de condominio.
