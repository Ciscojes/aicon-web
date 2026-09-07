# Manual operativo de Aicon

Este documento cubre la operación técnica mínima del MVP. No sustituye la política
de respaldo, retención ni respuesta a incidentes que debe aprobarse antes de producción.

## Comprobación diaria del equipo comercial

1. Revisar el resumen del panel: seguimientos atrasados, visitas próximas, avisos
   fallidos y solicitudes de cambio de cita.
2. Asignar las oportunidades nuevas y programar su próxima acción.
3. Confirmar que las citas del día tengan asesor y continúen programadas.
4. Registrar el resultado de cada visita y revisar cualquier error antes de reintentar.

La ruta protegida `/panel/ayuda` resume estas tareas para usuarios internos.

## Desarrollo y diagnóstico

```bash
npm ci
npm run doctor
npm run db:start
npm run db:apply
npm run dev
```

`doctor` comprueba versiones, variables públicas y conexión con Docker sin imprimir
credenciales. En WSL, Docker Desktop debe estar iniciado y tener habilitada la
integración con la distribución.

## Verificación de una publicación

```bash
npm run verify
npm run db:lint
git status --short --branch
```

`verify` ejecuta lint, tipos, pruebas, migraciones repetibles y build. `db:lint`
requiere Supabase local activo. No se publica si cualquiera de estos comandos falla.

## Recuperación del código y del esquema

El código y las migraciones versionadas permiten reconstruir una instalación limpia:

1. Clonar el repositorio y seleccionar la versión de Node indicada por el proyecto.
2. Ejecutar `npm ci`.
3. Crear `.env.local` a partir de `.env.example` y completar sus referencias mediante
   el mecanismo seguro del entorno.
4. Ejecutar `npm run db:start` y luego `npm run db:reset` solamente en una base local
   desechable.
5. Ejecutar `npm run verify` y comprobar los recorridos críticos antes de continuar.

`db:reset` destruye los datos locales actuales. Nunca debe apuntarse a producción y
Git no sustituye un respaldo de datos.

## Respaldo y recuperación de producción

Antes del lanzamiento se debe elegir el alojamiento administrado y documentar:

- responsable y frecuencia del respaldo;
- retención contratada y ubicación de las copias;
- objetivo de pérdida de datos y tiempo de recuperación aceptables;
- restauración en un proyecto separado de prueba;
- fecha, resultado y responsable de la última prueba de recuperación.

La restauración se considerará probada únicamente después de recuperar una copia en
un entorno no productivo, verificar conteos y relaciones críticas, iniciar sesión y
completar los recorridos de catálogo, CRM y citas. Mientras esos datos no estén
aprobados, este requisito permanece bloqueado y no se simula con información ficticia.

## Respuesta inicial ante incidentes

1. Registrar hora, ruta, acción y mensaje visible sin copiar datos personales,
   contraseñas, cookies ni enlaces temporales.
2. Evitar reintentos repetidos cuando una escritura no confirmó su resultado.
3. Revisar GitHub Actions y los registros estructurados del alojamiento.
4. Verificar desde el panel si la operación ya quedó registrada antes de repetirla.
5. Escalar al responsable definido para producción y conservar la evidencia técnica.

Las rotaciones de claves, restauraciones y cambios de infraestructura se realizan
desde el proveedor autorizado y requieren confirmación del responsable del sistema.
