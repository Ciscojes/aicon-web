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

function FieldError({ errors }: Readonly<{ errors?: string[] }>) {
  return errors?.length ? <span className="field-error">{errors[0]}</span> : null;
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
      <fieldset className="appointment-slots">
        <legend>Selecciona un horario</legend>
        {slots.map((slot) => (
          <label key={slot.startsAt}>
            <input defaultChecked={state.values?.startsAt === slot.startsAt} name="startsAt" required type="radio" value={slot.startsAt} />
            <span>{dateTime.format(new Date(slot.startsAt))}</span>
          </label>
        ))}
      </fieldset>
      <FieldError errors={state.errors?.startsAt} />
      <label><span>Nombre completo</span><input autoComplete="name" defaultValue={state.values?.name} name="name" required /></label>
      <FieldError errors={state.errors?.name} />
      <label><span>Teléfono con código de país</span><input autoComplete="tel" defaultValue={state.values?.phone} inputMode="tel" name="phone" placeholder="+50688887777" required /></label>
      <FieldError errors={state.errors?.phone} />
      <label><span>Correo electrónico</span><input autoComplete="email" defaultValue={state.values?.email} name="email" required type="email" /></label>
      <FieldError errors={state.errors?.email} />
      <label aria-hidden="true" className="form-trap"><span>Sitio web</span><input autoComplete="off" name="website" tabIndex={-1} /></label>
      <label className="contact-consent"><input name="communicationsConsent" required type="checkbox" value="yes" /><span>Autorizo a Aicon a enviarme comunicaciones relacionadas con esta visita por correo y WhatsApp.</span></label>
      <FieldError errors={state.errors?.communicationsConsent} />
      {state.message ? <p className="form-message" role="alert">{state.message}</p> : null}
      <button className="button button-primary" disabled={pending} type="submit">{pending ? "Confirmando…" : "Confirmar visita"}</button>
      <p className="contact-privacy-note">El horario se comprueba nuevamente antes de confirmar para evitar reservas duplicadas.</p>
    </form>
  );
}
