# Preparación del lanzamiento

Última revisión interna: 2026-09-07.

## Evidencia disponible

- Las migraciones se aplican dos veces en bases PostgreSQL WASM limpias y prueban
  catálogo, contacto, cotización, CRM, disponibilidad, citas, autoservicio y avisos.
- Las 21 tablas públicas tienen RLS y existen 38 políticas de acceso.
- Una prueba de contrato limita a diez las funciones que un visitante puede ejecutar.
- Las rutas reciben cabeceras contra incrustación, detección MIME y capacidades del
  navegador innecesarias; Next.js no publica `X-Powered-By`.
- Panel, inicio de sesión y autoservicio con token quedan fuera de indexación.
- La ruta de inicio de sesión respondió correctamente en ejecución local y expuso
  las cabeceras y metadatos esperados.
- La migración de endurecimiento se aplicó sobre Supabase local y `supabase db lint`
  terminó sin errores de esquema.
- Las vistas públicas se revisaron en escritorio y a 320 px sin recortes ni
  superposición del acceso móvil a la agenda.
- Lighthouse sobre el build de producción local obtuvo 86 en rendimiento, 100 en
  accesibilidad automatizada, 100 en buenas prácticas y 100 en SEO. La oportunidad
  principal restante corresponde a una fotografía JPG de prueba almacenada en
  Supabase y debe repetirse con el inventario definitivo.
- El panel incluye una guía breve y el repositorio conserva el manual operativo.
- El inventario público oculta precio, distribución y áreas hasta que un editor
  registre una fuente interna y marque la unidad como verificada.
- El formulario de contacto permanece disponible sin presentar teléfono, WhatsApp,
  correo, dirección ni información legal que el propietario no haya confirmado.

## Verificaciones pendientes del entorno completo

- Recorridos públicos y administrativos completos con una sesión interna autorizada.
- Revisión manual completa con teclado y lector de pantalla.
- Medición de rendimiento con fotografías representativas del inventario final.
- Prueba de respaldo y restauración en un proyecto administrado separado.

Estas verificaciones requieren una sesión interna autorizada, contenido representativo
o infraestructura de preproducción. No se consideran aprobadas por el build aislado.

## Decisiones externas que bloquean el lanzamiento

- Alojamiento, dominio y presupuesto operativo.
- Política de respaldos, retención, monitoreo y responsables de incidentes.
- Datos empresariales, aviso de privacidad y textos definitivos.
- Fuente comercial aprobada para Casa 14: precio, habitaciones, baños,
  estacionamientos, construcción, terreno, descripción, amenidades, planos y cuotas.
- Identidad visual y autorización de fotografías finales.
- Proveedores, remitente y plantillas de correo y WhatsApp.
- Reglas comerciales pendientes registradas en las SPEC.

## Criterio para autorizar producción

Todos los pendientes anteriores deben tener responsable y evidencia. El dueño debe
aceptar los recorridos principales en preproducción y la recuperación de una copia
debe probarse antes de abrir el sitio al público.
