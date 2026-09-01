"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createPublicInquiry, type PublicInquiryState } from "@/app/contacto/actions";
import type { PublicInquiryContext } from "../domain/public-inquiry";

const initialState: PublicInquiryState = {};

function FieldError({ errors }: Readonly<{ errors?: string[] }>) {
  return errors?.length ? <span className="field-error">{errors[0]}</span> : null;
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

      <label><span>Nombre completo</span><input autoComplete="name" defaultValue={state.values?.name} name="name" required /></label>
      <FieldError errors={state.errors?.name} />

      <label><span>Teléfono con código de país</span><input autoComplete="tel" defaultValue={state.values?.phone} inputMode="tel" name="phone" placeholder="+50688887777" required /></label>
      <FieldError errors={state.errors?.phone} />

      <label><span>Correo electrónico <small>Opcional</small></span><input autoComplete="email" defaultValue={state.values?.email} name="email" type="email" /></label>
      <FieldError errors={state.errors?.email} />

      <label><span>Mensaje <small>Opcional</small></span><textarea defaultValue={state.values?.message} maxLength={5000} name="message" rows={5} /></label>
      <FieldError errors={state.errors?.message} />

      <label aria-hidden="true" className="form-trap"><span>Sitio web</span><input autoComplete="off" name="website" tabIndex={-1} /></label>

      <label className="contact-consent"><input name="consent" required type="checkbox" value="yes" /><span>Autorizo a Aicon a responder esta consulta por llamada o WhatsApp al teléfono indicado y, si lo proporcioné, por correo electrónico.</span></label>
      <FieldError errors={state.errors?.consent} />

      {state.message ? <p className="form-message" role="alert">{state.message}</p> : null}
      <button className="button button-primary" disabled={pending} type="submit">{pending ? "Enviando…" : "Enviar consulta"}</button>
      <p className="contact-privacy-note">Tus datos se utilizarán para atender esta consulta y no aparecen públicamente.</p>
    </form>
  );
}
