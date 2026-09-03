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

## Configuración y cálculo del primer incremento

- Solamente un administrador podrá activar o sustituir la configuración financiera.
- Cada cambio creará una versión nueva con tasa anual, prima mínima, opciones de
  prima y plazos permitidos; no se modificarán versiones históricas.
- Mientras no exista una versión activa, la web no mostrará valores provisionales
  ni permitirá solicitar una cotización financiera.
- La cuota estimada utilizará amortización mensual con cuota nivelada:
  `P × r × (1 + r)^n ÷ ((1 + r)^n − 1)`, donde `P` es el monto financiado,
  `r` la tasa mensual y `n` el número de meses.
- Si la tasa configurada es cero, la cuota será `P ÷ n`.
- El navegador mostrará el cálculo de forma inmediata, pero PostgreSQL repetirá el
  cálculo al registrar la solicitud y rechazará primas o plazos no configurados.
- Solo una casa publicada y disponible podrá recibir una nueva solicitud formal.

## Aviso obligatorio

> Esta simulación es informativa. La aprobación, tasa, avalúo y condiciones definitivas dependen de la entidad bancaria.

## Criterios de aceptación

- La calculadora actualiza los resultados cuando cambian prima, plazo o tasa aplicable.
- Los montos se presentan claramente en USD.
- No se permite calcular con valores inválidos.
- La advertencia se muestra junto al resultado.
- Una solicitud válida queda asociada al cliente y a la unidad consultada.
- El asesor puede consultar la información desde el CRM.
- Cada solicitud conserva precio, prima, monto financiado, tasa, plazo, cuota y
  versión del aviso aunque posteriormente cambien la casa o la configuración.
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
- 2026-08-31: se definieron versionado, fórmula, activación administrativa y
  validación íntegra de la primera calculadora.
