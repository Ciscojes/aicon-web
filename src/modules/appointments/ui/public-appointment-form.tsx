"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createPublicAppointment, type AppointmentState } from "@/app/agendar-visita/actions";
import type { VisitSlot } from "../domain/appointment";

const initialState: AppointmentState = {};
const dateTime = new Intl.DateTimeFormat("es-CR", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/Costa_Rica",
});

function FieldError({ errors, id }: Readonly<{ errors?: string[]; id: string }>) {
  return errors?.length ? <span className="field-error" id={id}>{errors[0]}</span> : null;
}

export function PublicAppointmentForm({
  context,
  slots,
}: Readonly<{ context: { label: string; unitId: string }; slots: VisitSlot[] }>) {
  const action = createPublicAppointment.bind(null, context);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.success) {
    return (
      <div className="contact-success" role="status">
        <p className="eyebrow">Visita confirmada</p>
        <h2>Te esperamos.</h2>
        <p>{state.message}</p>
        <Link className="button button-secondary" href="/catalogo">Seguir explorando casas</Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="contact-form appointment-form">
      <div className="contact-context"><span>Propiedad</span><strong>{context.label}</strong></div>
      <fieldset aria-describedby={state.errors?.startsAt ? "appointment-slot-error" : undefined} className="appointment-slots">
        <legend>Selecciona un horario</legend>
        {slots.map((slot) => (
          <label key={slot.startsAt}>
            <input defaultChecked={state.values?.startsAt === slot.startsAt} name="startsAt" required type="radio" value={slot.startsAt} />
            <span>{dateTime.format(new Date(slot.startsAt))}</span>
          </label>
        ))}
      </fieldset>
      <FieldError errors={state.errors?.startsAt} id="appointment-slot-error" />
      <label><span>Nombre completo</span><input aria-describedby={state.errors?.name ? "appointment-name-error" : undefined} aria-invalid={state.errors?.name ? true : undefined} autoComplete="name" defaultValue={state.values?.name} name="name" required /></label>
      <FieldError errors={state.errors?.name} id="appointment-name-error" />
      <label><span>Teléfono con código de país</span><input aria-describedby={state.errors?.phone ? "appointment-phone-error" : undefined} aria-invalid={state.errors?.phone ? true : undefined} autoComplete="tel" defaultValue={state.values?.phone} inputMode="tel" name="phone" placeholder="+50688887777" required /></label>
      <FieldError errors={state.errors?.phone} id="appointment-phone-error" />
      <label><span>Correo electrónico</span><input aria-describedby={state.errors?.email ? "appointment-email-error" : undefined} aria-invalid={state.errors?.email ? true : undefined} autoComplete="email" defaultValue={state.values?.email} name="email" required type="email" /></label>
      <FieldError errors={state.errors?.email} id="appointment-email-error" />
      <label aria-hidden="true" className="form-trap"><span>Sitio web</span><input autoComplete="off" name="website" tabIndex={-1} /></label>
      <label className="contact-consent"><input aria-describedby={state.errors?.communicationsConsent ? "appointment-consent-error" : undefined} aria-invalid={state.errors?.communicationsConsent ? true : undefined} name="communicationsConsent" required type="checkbox" value="yes" /><span>Autorizo a Aicon a enviarme comunicaciones relacionadas con esta visita por correo y WhatsApp.</span></label>
      <FieldError errors={state.errors?.communicationsConsent} id="appointment-consent-error" />
      {state.message ? <p className="form-message" role="alert">{state.message}</p> : null}
      <button className="button button-primary" disabled={pending} type="submit">{pending ? "Confirmando…" : "Confirmar visita"}</button>
      <p className="contact-privacy-note">El horario se comprueba nuevamente antes de confirmar para evitar reservas duplicadas.</p>
    </form>
  );
}
