# Convenciones de arquitectura

La aplicación es un monolito modular en Next.js. Una funcionalidad vive en
`src/modules/<modulo>` y puede incorporar solamente las capas que necesite:

- `domain`: tipos y reglas puras, sin Next.js ni Supabase.
- `application`: casos de uso que coordinan reglas del dominio.
- `infrastructure`: consultas a Supabase y adaptadores externos.
- `ui`: componentes propios del módulo.

La interfaz y la infraestructura pueden depender de aplicación y dominio. El
dominio no importa código de Next.js, React, Supabase ni proveedores externos.

Los elementos compartidos entre módulos viven en `src/shared`. La configuración
de Supabase y futuros adaptadores transversales viven en `src/infrastructure`.
Las rutas de `src/app` validan la sesión y los permisos en el servidor; ocultar
un control en el navegador nunca sustituye esa validación.

## Módulos previstos

- `catalog`
- `quotes`
- `crm`
- `appointments`
- `notifications`
- `users`
- `settings`

Se crean cuando comienza su entrega. No se mantienen carpetas ni abstracciones
vacías.

## Reglas operativas

- Todo cambio de esquema usa una migración nueva en `supabase/migrations`.
- Las políticas RLS son una segunda defensa obligatoria para datos internos.
- El navegador usa solamente la clave pública de Supabase.
- Nunca se incorpora `service_role` al cliente ni al repositorio.
- Los errores del servidor se registran como JSON sin cabeceras, contraseñas ni
  contenido sensible de formularios.
- Cada caso de uso incorpora pruebas proporcionales al riesgo.
