# SPEC-015 — Plan de implementación por entregas

## Estado

Aprobada.

## Objetivo

Ordenar la construcción del MVP en entregas pequeñas, demostrables y verificables, utilizando únicamente el alcance definido en las especificaciones aprobadas.

## Principios de ejecución

- Construir una sección completa de principio a fin antes de abrir demasiados frentes.
- Mantener cada entrega funcional y demostrable.
- Actualizar la especificación antes de incorporar cambios importantes.
- Utilizar migraciones versionadas para modificar la base de datos.
- Separar desarrollo y producción desde el inicio.
- No contratar ni activar proveedores de pago sin autorización.
- Probar permisos, errores y adaptación móvil junto con cada funcionalidad.

## Entrega 0 — Fundamentos técnicos

### Alcance

- Crear la aplicación Next.js con TypeScript.
- Configurar convenciones del monolito modular y Clean Architecture ligera.
- Preparar entornos de desarrollo y pruebas.
- Configurar Supabase para base de datos, autenticación y almacenamiento.
- Crear migraciones iniciales del catálogo y perfiles internos.
- Implementar autenticación y roles básicos.
- Preparar pruebas, validación, registro de errores y automatización de calidad.
- Incorporar estructura visual base accesible y adaptable.

### Especificaciones relacionadas

- SPEC-006 — Panel administrativo.
- SPEC-010 — Experiencia móvil.
- SPEC-013 — Arquitectura técnica.
- SPEC-014 — Modelo de datos.

### Criterios de salida

- La aplicación puede ejecutarse en un entorno nuevo siguiendo instrucciones documentadas.
- Un administrador puede iniciar y cerrar sesión.
- Un visitante no puede acceder al panel.
- Las migraciones pueden aplicarse de forma repetible.
- No existen secretos dentro del repositorio.
- Las verificaciones automáticas básicas se ejecutan correctamente.

## Entrega 1 — Catálogo completo

### Alcance interno

- Administrar condominios.
- Administrar modelos reutilizables.
- Administrar unidades basadas en un modelo o de diseño único.
- Subir y ordenar fotografías provisionales o autorizadas.
- Guardar borradores, previsualizar, publicar, ocultar y archivar.
- Cambiar disponibilidad entre disponible, reservada y vendida.

### Alcance público

- Portada provisional.
- Catálogo con todas las casas disponibles.
- Filtros por condominio, precio y características aprobadas.
- Detalle de condominio.
- Detalle de casa.
- Adaptación para celulares y computadoras.
- Identificación visible de contenido ilustrativo.

### Especificaciones relacionadas

- SPEC-003 — Catálogo.
- SPEC-004 — Portada.
- SPEC-006 — Panel administrativo.
- SPEC-008 — Flujo del comprador.
- SPEC-009 — Bocetos públicos.
- SPEC-010 — Experiencia móvil.
- SPEC-012 — Bocetos del panel y CRM.
- SPEC-014 — Modelo de datos.

### Criterios de salida

- El dueño puede publicar una casa sin modificar código.
- Una casa publicada aparece correctamente en el catálogo.
- Un borrador o registro archivado no aparece públicamente.
- Los cambios específicos de una unidad prevalecen sobre su modelo.
- Los filtros devuelven resultados coherentes.
- Las pantallas principales funcionan desde 320 píxeles de ancho.

## Entrega 2 — Cotizaciones y contacto

### Alcance

- Calculadora financiera estimativa.
- Configuración de prima, tasa y plazos.
- Advertencia bancaria obligatoria.
- Solicitud de cotización formal.
- Contacto directo por WhatsApp.
- Formulario alternativo para hablar con un asesor.
- Registro del contacto y su oportunidad comercial.
- Confirmaciones básicas por correo cuando corresponda.

### Especificaciones relacionadas

- SPEC-002 — Cotizaciones.
- SPEC-005 — CRM básico.
- SPEC-008 — Flujo del comprador.
- SPEC-011 — Contacto con un asesor.
- SPEC-014 — Modelo de datos.

### Criterios de salida

- La calculadora utiliza valores configurables y produce resultados reproducibles.
- El resultado se identifica claramente como estimativo.
- Una solicitud válida crea o actualiza un contacto sin duplicarlo silenciosamente.
- Cada propiedad de interés crea una oportunidad separada.
- El formulario conserva la propiedad desde donde fue abierto.
- WhatsApp nunca envía un mensaje sin acción expresa del usuario.

## Entrega 3 — CRM operativo

### Alcance

- Lista y embudo de oportunidades.
- Asignación de asesores.
- Etapas comerciales.
- Notas y actividades.
- Detalle del cliente y propiedades de interés.
- Filtros por etapa, asesor, condominio, casa y fecha.
- Resumen para el dueño con los indicadores aprobados.
- Registro de auditoría para cambios importantes.

### Especificaciones relacionadas

- SPEC-005 — CRM básico.
- SPEC-006 — Panel administrativo.
- SPEC-012 — Bocetos del panel y CRM.
- SPEC-014 — Modelo de datos.

### Criterios de salida

- Un asesor identifica rápidamente qué clientes requieren seguimiento.
- Los cambios de etapa, notas y asignaciones conservan autor y fecha.
- El dueño ve casas, clientes, seguimientos y visitas que requieren atención.
- Los permisos impiden accesos no autorizados.
- El historial se conserva al cerrar o descartar una oportunidad.

## Entrega 4 — Citas y recordatorios

### Alcance

- Configuración de horarios de visitas.
- Bloqueo de períodos no disponibles.
- Agenda directa o posterior a una cotización.
- Prevención de citas superpuestas.
- Reprogramación y cancelación.
- Confirmaciones y recordatorios 24 horas y 2 horas antes.
- Envío por correo electrónico y WhatsApp mediante proveedores aprobados.
- Registro de intentos, fallos y reintentos.
- Resultado de la visita: realizada, cancelada o no asistió.

### Especificaciones relacionadas

- SPEC-005 — CRM básico.
- SPEC-007 — Citas y visitas.
- SPEC-010 — Experiencia móvil.
- SPEC-014 — Modelo de datos.

### Criterios de salida

- Dos clientes no pueden reservar un horario incompatible.
- Una cita queda vinculada al contacto, oportunidad, casa y asesor.
- Cancelar una cita libera el horario.
- Reprogramar conserva el historial.
- Los recordatorios se generan una sola vez por canal y horario configurado.
- Los fallos de proveedor no eliminan ni invalidan la cita.

## Entrega 5 — Preparación del lanzamiento

### Alcance

- Sustituir o identificar correctamente contenido provisional.
- Revisar identidad, textos y datos empresariales con el dueño.
- Pruebas completas de flujos públicos y administrativos.
- Revisión de seguridad, privacidad y permisos.
- Revisión de accesibilidad y rendimiento.
- Copias de seguridad, monitoreo y procedimiento de recuperación.
- Configuración definitiva de dominio, correo y proveedores autorizados.
- Capacitación básica del dueño y asesores.
- Despliegue de producción y validación posterior.

### Especificaciones relacionadas

- SPEC.md y CONSTRAINTS.md.
- Todas las especificaciones funcionales aprobadas.

### Criterios de salida

- El dueño acepta los flujos principales en un entorno previo a producción.
- No se presentan propiedades, estadísticas ni testimonios ficticios como reales.
- Las rutas críticas superan las pruebas funcionales y de permisos.
- Existe un procedimiento probado de respaldo y recuperación.
- El panel incluye instrucciones mínimas para las tareas frecuentes.
- El sistema de producción se supervisa después del lanzamiento.

## Definición de terminado para cada funcionalidad

Una funcionalidad solamente se considerará terminada cuando:

- Cumpla sus criterios de aceptación.
- Incluya validaciones y estados de error relevantes.
- Respete permisos y privacidad.
- Funcione en los tamaños de pantalla definidos.
- Tenga pruebas proporcionales al riesgo.
- Mantenga migraciones y documentación actualizadas.
- Haya sido demostrada y aceptada para la entrega correspondiente.

## Dependencias y decisiones pendientes

- La Entrega 0 precede a todas las demás.
- La Entrega 1 precede a cotizaciones, CRM y citas porque establece las propiedades.
- La Entrega 2 crea los contactos que utilizará el CRM.
- La Entrega 3 prepara la gestión interna antes de automatizar la agenda completa.
- Los proveedores de correo y WhatsApp deberán aprobarse antes de finalizar la Entrega 4.
- El alojamiento, dominio, política de respaldos y presupuesto deberán resolverse antes de la Entrega 5.

## Fuera de este plan

- Pagos en línea.
- Firma digital.
- Contabilidad.
- Administración de cuotas condominales.
- Aplicación móvil nativa.
- Microservicios.

## Historial de cambios

- 2026-08-28: creación del plan inicial de implementación por entregas.
- 2026-08-28: plan de implementación aprobado.
