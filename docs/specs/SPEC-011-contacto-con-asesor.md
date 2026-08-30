# SPEC-011 — Contacto con un asesor

## Estado

Aprobada como base provisional; pendiente de validar datos empresariales.

## Objetivo

Permitir que un comprador hable rápidamente con Aicon por WhatsApp o envíe un formulario cuando prefiera no salir de la página.

## Canales

### WhatsApp directo

- Será la opción principal de contacto rápido.
- Abrirá una conversación con el número empresarial configurado por Aicon.
- Propondrá un mensaje inicial con la casa o el condominio consultado cuando exista ese contexto.
- El usuario revisará y enviará el mensaje desde WhatsApp; la web no lo enviará automáticamente.
- No se incluirán datos sensibles en el enlace.

### Formulario web

- Será la alternativa para quien no use WhatsApp o prefiera dejar sus datos.
- Solicitará nombre y teléfono como campos obligatorios.
- Permitirá correo electrónico y mensaje como campos opcionales.
- Asociará automáticamente la casa o el condominio desde donde se abrió.
- Creará o actualizará al interesado en el CRM con etapa `Nuevo`.
- Mostrará una confirmación después del envío.

## Ubicaciones

- Portada.
- Detalle de condominio.
- Detalle de casa.
- Resultado sin horarios disponibles.
- Pie de página y página de contacto.

## Reglas del negocio

- El número de WhatsApp y los datos de contacto serán configurables desde el panel administrativo.
- El mensaje inicial nunca afirmará disponibilidad, precio o condiciones no confirmadas.
- El formulario solicitará autorización para que Aicon responda por los canales indicados.
- Se aplicarán validación, protección contra envíos automatizados y límites razonables de frecuencia.
- Un clic en WhatsApp podrá registrarse como evento estadístico, pero no como cliente confirmado en el CRM.
- Una conversación iniciada únicamente por WhatsApp podrá registrarse manualmente o mediante una integración oficial posterior.

## Mensaje inicial provisional

> Hola, me interesa recibir información sobre [casa o condominio].

## Criterios de aceptación

- El botón abre una conversación con el número empresarial correcto.
- El mensaje propuesto identifica la propiedad cuando corresponde.
- El usuario puede elegir el formulario sin tener WhatsApp.
- Un formulario válido crea o actualiza el cliente en el CRM.
- La propiedad de origen queda asociada a la oportunidad.
- Los errores del formulario conservan los datos introducidos y explican cómo corregirlos.
- Ningún mensaje de WhatsApp se envía sin una acción expresa del usuario.

## Preguntas pendientes

- Confirmar el número empresarial de WhatsApp.
- Confirmar horarios de atención y mensaje fuera de horario.
- Definir quién recibe y distribuye las consultas nuevas.
- Confirmar texto de consentimiento y aviso de privacidad.

## Historial de cambios

- 2026-08-28: creación de la especificación con WhatsApp directo y formulario alternativo.
