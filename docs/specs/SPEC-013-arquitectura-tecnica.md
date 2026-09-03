# SPEC-013 — Arquitectura técnica

## Estado

Aprobada como arquitectura base del MVP.

## Decisión propuesta

Construir el MVP como un **monolito modular** con Next.js y TypeScript, utilizando Supabase administrado para PostgreSQL, autenticación y almacenamiento de fotografías.

Un monolito modular significa que la web pública, el panel y la lógica del negocio vivirán en una sola aplicación y repositorio, pero cada área estará separada internamente para evitar dependencias desordenadas.

Se aplicarán principios de **Clean Architecture de forma ligera**, sin imponer capas, interfaces o abstracciones que no aporten valor real al MVP.

## Clean Architecture ligera

Cada módulo separará, cuando sea necesario:

- **Dominio:** reglas y conceptos del negocio, sin depender de Next.js, Supabase ni proveedores externos.
- **Aplicación:** casos de uso como publicar una casa, solicitar una cotización o agendar una visita.
- **Infraestructura:** PostgreSQL, Supabase Storage, correo y WhatsApp.
- **Interfaz:** páginas, formularios, rutas y componentes de Next.js.

La dirección general de dependencias será:

`Interfaz e infraestructura → aplicación → dominio`

No se crearán interfaces para cada archivo ni capas vacías. Las abstracciones se utilizarán principalmente en límites que probablemente cambien, como correo, WhatsApp, almacenamiento y trabajos programados.

## Razones

- El equipo puede desarrollar, probar y desplegar una sola aplicación.
- Evita la complejidad operativa de microservicios antes de necesitarla.
- Permite reutilizar reglas entre la web, el CRM y el panel.
- PostgreSQL representa bien relaciones entre condominios, casas, clientes, cotizaciones y citas.
- Los proveedores de correo y WhatsApp podrán cambiarse sin reescribir el negocio.
- La aplicación puede dividirse en servicios independientes en el futuro si el volumen lo justifica.

## Componentes

### Aplicación Next.js

- Sitio público optimizado para buscadores.
- Panel autenticado para dueño, administradores y asesores.
- Rutas y acciones del servidor para aplicar reglas del negocio.
- Validación de formularios y permisos.
- Módulos internos: catálogo, cotizaciones, CRM, citas, notificaciones, usuarios y configuración.

### Supabase

- PostgreSQL como base de datos relacional.
- Autenticación de usuarios internos.
- Almacenamiento de fotografías y archivos autorizados.
- Políticas de acceso y seguridad por filas como defensa adicional.

### Trabajos programados

- Buscar citas próximas.
- Crear y enviar recordatorios 24 horas y 2 horas antes.
- Reintentar avisos fallidos de forma controlada.
- Registrar cada intento sin bloquear la navegación del usuario.

### Servicios externos

- Proveedor de correo electrónico por definir.
- Integración empresarial oficial de WhatsApp por definir.
- Servicio de mapas por definir solamente si el alcance lo requiere.

### Harness de desarrollo local

- Una capa ligera de comandos npm comprobará versión de Node, dependencias,
  variables públicas, acceso a Docker y estado de Supabase antes del arranque.
- El diagnóstico reconocerá Windows y WSL y mostrará acciones concretas sin
  imprimir valores de variables ni secretos.
- El harness coordinará herramientas existentes; no contendrá reglas del
  negocio ni se convertirá en una dependencia de la aplicación en producción.
- GitHub Actions seguirá siendo la verificación remota y ejecutará el mismo
  contrato local de calidad y compilación.

## Flujo de datos

1. El comprador consulta el sitio público.
2. Next.js obtiene las propiedades publicadas desde PostgreSQL.
3. Una cotización, contacto o cita pasa por validaciones del servidor.
4. El servidor registra o actualiza al cliente y la oportunidad.
5. Las fotografías se almacenan fuera de la base de datos y PostgreSQL conserva sus referencias.
6. Los trabajos programados generan recordatorios.
7. Los adaptadores envían los avisos mediante correo y WhatsApp.

## Seguridad

- La web pública solamente podrá leer contenido publicado.
- El panel exigirá autenticación.
- Los permisos se validarán en el servidor y en la base de datos.
- Un asesor verá únicamente la información permitida por su rol y asignaciones.
- Las claves permanecerán como secretos del entorno, nunca dentro del repositorio.
- Las cargas de imágenes validarán tipo, tamaño y autorización.
- Los formularios públicos tendrán límites de frecuencia y protección contra automatización.
- Las operaciones importantes conservarán usuario, fecha y acción.

## Organización modular propuesta

```text
src/
├── app/                 # Rutas públicas y panel
├── modules/
│   ├── catalog/         # domain, application, infrastructure, ui según necesidad
│   ├── quotes/
│   ├── crm/
│   ├── appointments/
│   ├── notifications/
│   ├── users/
│   └── settings/
├── shared/              # Componentes y utilidades comunes
└── infrastructure/      # Supabase y adaptadores externos
```

Esta estructura es orientativa; se ajustará a las convenciones de la versión de Next.js seleccionada al iniciar el proyecto.

## Despliegue propuesto

- Aplicación Next.js en un alojamiento administrado compatible.
- Supabase administrado para reducir tareas de respaldo, actualizaciones y seguridad operativa.
- Entornos separados para desarrollo y producción.
- Proceso automatizado de pruebas antes de desplegar.
- Copias de seguridad y monitoreo definidos antes del lanzamiento público.

## Alternativas consideradas

### Microservicios

Descartados para el MVP porque aumentarían despliegues, monitoreo, comunicación interna y costos sin una necesidad actual.

### Directus como panel completo

Puede acelerar la administración de datos, pero limita el control sobre la experiencia específica del dueño, el CRM y la agenda. Se conserva como alternativa si el plazo pesa más que la personalización.

### Cal.com para citas

Ofrece agenda y flujos existentes, pero la integración entre cliente, casa, asesor y oportunidad sería más compleja. Para el MVP se propone un módulo de agenda dentro de la misma aplicación.

### Supabase autohospedado

Es posible, pero obliga a asumir seguridad, copias de respaldo, monitoreo, actualizaciones y disponibilidad. No se recomienda inicialmente para un equipo pequeño.

## Criterios de aceptación de la arquitectura

- Una sola aplicación sirve la web pública y el panel autenticado.
- Los módulos no acceden directamente a detalles internos de otros módulos sin contratos definidos.
- El dominio no importa dependencias de Next.js, Supabase ni proveedores externos.
- Todas las escrituras sensibles pasan por validación del servidor.
- Los roles se aplican tanto en la aplicación como en la base de datos.
- Los avisos externos utilizan adaptadores reemplazables.
- Los recordatorios se procesan fuera de la solicitud interactiva del usuario.
- Desarrollo y producción utilizan configuraciones y datos separados.

## Artefacto visual

- [Diagrama de arquitectura](../diagrams/arquitectura-tecnica.html)

## Preguntas pendientes

- Elegir alojamiento para Next.js según presupuesto y operación.
- Elegir proveedores de correo y WhatsApp.
- Definir política de copias de seguridad y retención.
- Confirmar si el mapa será necesario en el MVP.

## Historial de cambios

- 2026-08-28: creación de la propuesta inicial de monolito modular.
- 2026-08-28: arquitectura aprobada; se incorporaron principios ligeros de Clean Architecture.
- 2026-09-02: se incorporó un harness ligero para diagnóstico, arranque y
  verificación reproducible en Windows y WSL.
