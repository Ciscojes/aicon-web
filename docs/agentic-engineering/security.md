# Seguridad y human-in-the-loop

## Modelo de autoridad

| Nivel | Acción típica | Control |
|---|---|---|
| SAFE | Leer, planificar, ejecutar gates y auditorías de solo lectura | Puede continuar |
| CONTROLLED | Código, pruebas, documentación, configuración no destructiva y migraciones forward-only | Requiere alcance aprobado y plan |
| REQUIRE APPROVAL | Datos, políticas críticas, secretos, producción, despliegues y merge | Confirmación humana inmediata |

La autorización para una tarea no se extiende a acciones materialmente
distintas. Por ejemplo, aprobar una migración no autoriza borrar datos ni
desplegar en producción.

## Controles mínimos de seguridad

### Secretos y entorno

- Versionar solo nombres y valores ficticios en `.env.example`.
- No leer ni mostrar valores salvo mediante mecanismos protegidos del entorno.
- No incluir secretos en terminales, trazas, URLs, commits o PR.

### Entrada y salida

- Validar entradas no confiables con Zod y restricciones de base de datos.
- No mostrar mensajes internos del proveedor al usuario.
- Evitar datos personales innecesarios en logs y evidencia del harness.

### Autenticación y autorización

- Validar sesión y rol en el servidor.
- Mantener RLS como defensa independiente.
- Probar permisos negativos, no solo caminos autorizados.
- Tratar cada RPC pública como superficie de ataque versionada.

### Dependencias y cadena de suministro

- Usar `npm ci` en CI.
- Revisar vulnerabilidades de severidad alta o crítica.
- Justificar dependencias nuevas y minimizar permisos del workflow.
- Fijar una estrategia de actualización antes del lanzamiento.

### Gates automatizados actuales

- `npm run agent:artifacts` valida estructura, vínculos y campos permitidos en evidencia.
- `npm run security` revisa referencias de entorno, patrones de credenciales de
  alta confianza y dependencias vulnerables.
- El escáner limita extensiones, tamaño y directorios; informa regla y ruta, no
  el valor coincidente.
- GitHub Actions sube un reporte JSON sanitizado con retención de 14 días.
- Estos controles reducen riesgo, pero no constituyen una certificación ni un
  análisis exhaustivo de secretos o vulnerabilidades.

## OWASP aplicable

| Riesgo | Control actual o requerido |
|---|---|
| Broken Access Control | Autorización de servidor, RLS y pruebas negativas |
| Cryptographic Failures | Proveedores gestionados; secretos fuera del repositorio |
| Injection | Zod, consultas parametrizadas y restricciones SQL |
| Insecure Design | SPEC, threat review proporcional y aprobación humana |
| Security Misconfiguration | Headers, entornos separados y gates reproducibles |
| Vulnerable Components | Auditoría de dependencias y actualización controlada |
| Authentication Failures | Supabase Auth, registro deshabilitado y perfiles inactivos por defecto |
| Integrity Failures | `npm ci`, revisión de PR y CI requerido |
| Logging Failures | Logs JSON sanitizados; trazas sin datos sensibles |
| SSRF | No aceptar destinos externos arbitrarios sin allowlist y validación |

Esta tabla es una guía de revisión, no una certificación automática.

## Acciones que nunca se reparan automáticamente

- Eliminación o restauración de datos.
- Cambios de RLS que amplían acceso.
- Rotación o modificación de secretos.
- Publicación, despliegue o cambio de dominio.
- Envío de correo, WhatsApp u otro efecto externo.
- Reintento de una escritura cuyo resultado es desconocido.

## Evidencia segura

Registrar nombres de variables, comandos y resultados resumidos. Antes de
guardar evidencia, eliminar credenciales, cookies, enlaces temporales, datos
personales, cabeceras de autorización y contenido de formularios.
