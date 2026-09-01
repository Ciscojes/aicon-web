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

## Previsualización del condominio

- Administradores y editores podrán abrir desde el editor una previsualización del
  contenido guardado, aunque el condominio esté en borrador u oculto.
- La previsualización utilizará la misma presentación principal que la ruta pública
  y mostrará una franja visible que indique que no es la página publicada.
- La previsualización no cambiará el estado de publicación ni hará accesible el
  borrador a visitantes.
- El inventario de la previsualización se limitará a unidades publicadas; los
  borradores de unidades tendrán su propia previsualización en un incremento futuro.

## Protección contra errores

- Archivar será preferible a eliminar definitivamente.
- Las casas vendidas conservarán su historial.
- Los campos obligatorios se validarán antes de publicar.
- Las operaciones delicadas requerirán confirmación.
- Las imágenes tendrán formatos y tamaños permitidos.
- Cada condominio, modelo o unidad admitirá inicialmente hasta 20 fotografías
  JPEG, PNG, WebP o AVIF de un máximo de 20 MB cada una.
- Los cambios importantes registrarán usuario y fecha.

## Criterios de aceptación

- Un administrador no técnico puede publicar una casa sin modificar código.
- El contenido guardado como borrador no aparece públicamente.
- Los cambios publicados se reflejan en el catálogo.
- Una casa archivada deja de aparecer sin perder su información.
- Los permisos impiden que un asesor o editor acceda a funciones restringidas.
- La configuración financiera modifica futuras simulaciones sin alterar registros históricos.
- Un administrador o editor puede revisar el detalle guardado de un condominio antes
  de publicarlo sin exponerlo públicamente.

## Bocetos relacionados

- [SPEC-012 — Bocetos del panel y CRM](SPEC-012-bocetos-panel-crm.md)

## Preguntas pendientes

- Confirmar si el rol Editor es necesario para el MVP.
- Definir si se requiere aprobación del dueño antes de publicar cambios de un editor.
- Determinar qué configuraciones e indicadores aparecerán en el tablero principal.

## Historial de cambios

- 2026-08-28: creación de la especificación inicial.
- 2026-08-28: se añadió la configuración y gestión administrativa de citas.
- 2026-08-30: se fijaron provisionalmente los formatos y límites de fotografías
  para el MVP.
- 2026-08-31: se definió la previsualización protegida de condominios.
