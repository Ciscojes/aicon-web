"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createPublicInquiry, type PublicInquiryState } from "@/app/contacto/actions";
import type { PublicInquiryContext } from "../domain/public-inquiry";

const initialState: PublicInquiryState = {};

function FieldError({ errors, id }: Readonly<{ errors?: string[]; id: string }>) {
  return errors?.length ? <span className="field-error" id={id}>{errors[0]}</span> : null;
}

export function PublicInquiryForm({ context }: Readonly<{ context: PublicInquiryContext }>) {
  const action = createPublicInquiry.bind(null, context);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.success) {
    return (
      <div className="contact-success" role="status">
        <p className="eyebrow">Consulta registrada</p>
        <h2>Gracias por escribirnos.</h2>
        <p>{state.message}</p>
        <Link className="button button-secondary" href="/catalogo">Seguir explorando casas</Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="contact-form">
      <div className="contact-context"><span>Tu interés</span><strong>{context.label}</strong></div>

      <label><span>Nombre completo</span><input aria-describedby={state.errors?.name ? "inquiry-name-error" : undefined} aria-invalid={state.errors?.name ? true : undefined} autoComplete="name" defaultValue={state.values?.name} name="name" required /></label>
      <FieldError errors={state.errors?.name} id="inquiry-name-error" />

      <label><span>Teléfono con código de país</span><input aria-describedby={state.errors?.phone ? "inquiry-phone-error" : undefined} aria-invalid={state.errors?.phone ? true : undefined} autoComplete="tel" defaultValue={state.values?.phone} inputMode="tel" name="phone" placeholder="+50688887777" required /></label>
      <FieldError errors={state.errors?.phone} id="inquiry-phone-error" />

      <label><span>Correo electrónico <small>Opcional</small></span><input aria-describedby={state.errors?.email ? "inquiry-email-error" : undefined} aria-invalid={state.errors?.email ? true : undefined} autoComplete="email" defaultValue={state.values?.email} name="email" type="email" /></label>
      <FieldError errors={state.errors?.email} id="inquiry-email-error" />

      <label><span>Mensaje <small>Opcional</small></span><textarea aria-describedby={state.errors?.message ? "inquiry-message-error" : undefined} aria-invalid={state.errors?.message ? true : undefined} defaultValue={state.values?.message} maxLength={5000} name="message" rows={5} /></label>
      <FieldError errors={state.errors?.message} id="inquiry-message-error" />

      <label aria-hidden="true" className="form-trap"><span>Sitio web</span><input autoComplete="off" name="website" tabIndex={-1} /></label>

      <label className="contact-consent"><input aria-describedby={state.errors?.consent ? "inquiry-consent-error" : undefined} aria-invalid={state.errors?.consent ? true : undefined} name="consent" required type="checkbox" value="yes" /><span>Autorizo a Aicon a responder esta consulta por llamada o WhatsApp al teléfono indicado y, si lo proporcioné, por correo electrónico.</span></label>
      <FieldError errors={state.errors?.consent} id="inquiry-consent-error" />

      {state.message ? <p className="form-message" role="alert">{state.message}</p> : null}
      <button className="button button-primary" disabled={pending} type="submit">{pending ? "Enviando…" : "Enviar consulta"}</button>
      <p className="contact-privacy-note">Tus datos se utilizarán para atender esta consulta y no aparecen públicamente.</p>
    </form>
  );
}
