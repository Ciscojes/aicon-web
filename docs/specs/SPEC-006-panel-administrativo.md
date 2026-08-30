# SPEC-006 — Panel administrativo autogestionable

## Estado

Aprobada como alcance del MVP; detalles en revisión.

## Objetivo

Permitir que el dueño administre el catálogo y la información comercial después del despliegue sin depender de un programador.

## Roles propuestos

- **Administrador o dueño:** controla catálogo, usuarios, configuración y CRM.
- **Asesor:** administra clientes, actividades y oportunidades asignadas.
- **Editor, opcional:** administra propiedades y fotografías sin acceso a usuarios ni configuración sensible.

## Requisitos funcionales

- Crear, editar, ocultar y archivar condominios.
- Crear y editar modelos reutilizables.
- Crear unidades basadas en modelos o de diseño único.
- Definir precio, características, estado y contenido público.
- Subir, ordenar y retirar fotografías.
- Guardar contenido como borrador.
- Previsualizar antes de publicar.
- Publicar u ocultar sin borrar el registro.
- Destacar condominios o casas en la portada.
- Configurar tasa, prima mínima, plazos y datos de contacto.
- Configurar días, horarios y duración de las visitas.
- Consultar, reprogramar y cancelar citas según los permisos del usuario.
- Permitir que los asesores bloqueen períodos en los que no estarán disponibles.
- Acceder al CRM según los permisos del usuario.

## Flujo principal de publicación

`Crear casa → completar datos → subir fotografías → previsualizar → publicar`

## Protección contra errores

- Archivar será preferible a eliminar definitivamente.
- Las casas vendidas conservarán su historial.
- Los campos obligatorios se validarán antes de publicar.
- Las operaciones delicadas requerirán confirmación.
- Las imágenes tendrán formatos y tamaños permitidos.
- Los cambios importantes registrarán usuario y fecha.

## Criterios de aceptación

- Un administrador no técnico puede publicar una casa sin modificar código.
- El contenido guardado como borrador no aparece públicamente.
- Los cambios publicados se reflejan en el catálogo.
- Una casa archivada deja de aparecer sin perder su información.
- Los permisos impiden que un asesor o editor acceda a funciones restringidas.
- La configuración financiera modifica futuras simulaciones sin alterar registros históricos.

## Bocetos relacionados

- [SPEC-012 — Bocetos del panel y CRM](SPEC-012-bocetos-panel-crm.md)

## Preguntas pendientes

- Confirmar si el rol Editor es necesario para el MVP.
- Definir el tamaño y cantidad máxima de fotografías.
- Definir si se requiere aprobación del dueño antes de publicar cambios de un editor.
- Determinar qué configuraciones e indicadores aparecerán en el tablero principal.

## Historial de cambios

- 2026-08-28: creación de la especificación inicial.
- 2026-08-28: se añadió la configuración y gestión administrativa de citas.
