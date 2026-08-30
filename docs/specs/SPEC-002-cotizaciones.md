# SPEC-002 — Cotizaciones

## Estado

Aprobada como hipótesis pendiente de validar con el dueño.

## Objetivo

Permitir al comprador obtener un cálculo financiero aproximado y solicitar una cotización formal a un asesor.

## Alcance

- Calculadora dentro del detalle de una casa.
- Solicitud formal relacionada con la casa consultada.
- Registro automático del interesado en el CRM.

## Requisitos funcionales

- Mostrar el precio de la casa en USD.
- Permitir introducir o seleccionar una prima.
- Permitir seleccionar un plazo.
- Calcular el monto estimado por financiar y una cuota aproximada.
- Mostrar la tasa usada en el cálculo.
- Recopilar los datos necesarios para contactar al interesado.
- Crear un cliente potencial en estado `Nuevo` al enviar la solicitud formal.
- Después del registro, ofrecer al interesado la posibilidad de agendar una visita a la casa mediante el calendario disponible.

## Reglas del negocio

- Fórmula base: `precio − prima = monto estimado por financiar`.
- La tasa, la prima mínima y los plazos serán configurables.
- Los valores provisionales sugeridos son primas de 10 %, 15 % y 20 %, y plazos de 10, 15, 20, 25 y 30 años.
- La simulación no garantiza aprobación ni condiciones bancarias.
- El banco determina la aprobación, el avalúo, la tasa y el monto definitivo.

## Aviso obligatorio

> Esta simulación es informativa. La aprobación, tasa, avalúo y condiciones definitivas dependen de la entidad bancaria.

## Criterios de aceptación

- La calculadora actualiza los resultados cuando cambian prima, plazo o tasa aplicable.
- Los montos se presentan claramente en USD.
- No se permite calcular con valores inválidos.
- La advertencia se muestra junto al resultado.
- Una solicitud válida queda asociada al cliente y a la unidad consultada.
- El asesor puede consultar la información desde el CRM.
- El interesado puede continuar al calendario sin tener que introducir nuevamente su nombre y teléfono.

## Preguntas pendientes

- Confirmar bancos y proceso real de acompañamiento de Aicon.
- Confirmar primas, tasas, plazos y fórmula definitiva.
- El correo será opcional en la solicitud formal, pero se solicitará si el interesado continúa al calendario. Las confirmaciones y recordatorios se enviarán por correo electrónico y WhatsApp con autorización del cliente.

## Historial de cambios

- 2026-08-28: creación de la especificación inicial.
- 2026-08-28: se incorporó el acceso al calendario de visitas después del registro.
- 2026-08-28: se definió provisionalmente el correo electrónico como canal para avisos de las visitas.
- 2026-08-28: se añadió WhatsApp como segundo canal para avisos de las visitas.
