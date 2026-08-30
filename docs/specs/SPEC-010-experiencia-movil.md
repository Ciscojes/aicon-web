# SPEC-010 — Experiencia móvil

## Estado

En revisión.

## Objetivo

Adaptar el recorrido público del comprador a celulares para que explorar, cotizar y agendar resulte cómodo, legible y rápido sin perder funciones importantes.

## Pantallas incluidas

1. Portada móvil.
2. Catálogo móvil.
3. Detalle de casa móvil.
4. Cotización móvil.
5. Registro móvil.
6. Calendario y confirmación móvil.

## Comportamiento general

- La navegación principal se agrupará en un menú compacto.
- El contenido se mostrará principalmente en una sola columna.
- Los botones importantes tendrán un área táctil mínima aproximada de 44 por 44 píxeles.
- No habrá desplazamiento horizontal en la interfaz implementada.
- Los botones fijos no ocultarán el contenido ni los mensajes de validación.
- Los formularios utilizarán teclados adecuados para teléfono, correo y cantidades.
- El foco, las etiquetas y los errores serán accesibles para teclado y tecnologías de asistencia.

## Portada

- La imagen principal ocupará el ancho disponible sin sacrificar la legibilidad del mensaje.
- `Explorar casas` será la acción primaria.
- `Hablar con un asesor` permanecerá visible como acción secundaria.
- La búsqueda se simplificará y podrá abrir los filtros completos.

## Catálogo

- Las casas se mostrarán en una sola columna.
- Un botón `Filtros` abrirá un panel con condominio, precio, habitaciones, baños y estado.
- Se mostrará la cantidad de resultados y los filtros activos.
- Cada tarjeta mostrará foto, precio, condominio, características y disponibilidad.

## Detalle de casa

- La galería será desplazable y mostrará un indicador de posición.
- Precio, estado y características esenciales aparecerán antes de la descripción extensa.
- `Cotizar` y `Agendar` permanecerán accesibles en una barra inferior.
- `Hablar con un asesor` estará disponible sin competir con las dos acciones principales.

## Cotización y registro

- Los campos se presentarán verticalmente.
- El resultado estimado aparecerá después de los datos de cálculo.
- La advertencia bancaria permanecerá junto al resultado.
- Los consentimientos no estarán seleccionados previamente.
- Los datos conocidos se reutilizarán al continuar hacia el calendario.

## Calendario

- Las fechas disponibles se recorrerán sin mostrar una cuadrícula demasiado pequeña.
- Los horarios serán botones táctiles claramente diferenciados.
- Antes de confirmar se mostrará casa, fecha, hora y duración.
- La confirmación indicará los avisos por correo electrónico y WhatsApp.

## Criterios de aceptación

- El contenido se entiende en un ancho de 320 píxeles sin desplazamiento horizontal.
- Los textos pueden ampliarse sin impedir las acciones principales.
- Las acciones táctiles principales tienen tamaño y separación suficientes.
- El usuario puede completar cada formulario sin perder datos al avanzar o retroceder.
- El teclado móvil no oculta el campo activo ni la acción para continuar.
- La barra inferior del detalle no cubre información.
- El panel de filtros puede aplicarse, limpiarse y cerrarse.
- Los estados de carga, vacío y error ofrecen una acción para continuar.

## Artefacto visual

- [Bocetos móviles del recorrido público](../diagrams/bocetos-moviles.html)

## Preguntas pendientes

- Definir si el menú móvil mostrará acceso directo al teléfono de Aicon.
- Confirmar si las fotografías permitirán ampliación a pantalla completa.

## Historial de cambios

- 2026-08-28: creación de la especificación y primer conjunto de bocetos móviles.
- 2026-08-28: se aprobó ofrecer WhatsApp directo y formulario al seleccionar `Hablar con un asesor`.
