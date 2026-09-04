"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { createQuoteRequest, type QuoteRequestState } from "@/app/casas/[id]/quote-actions";
import { calculateFinancingEstimate, type FinancialSettings } from "../domain/financial-settings";

const usd = new Intl.NumberFormat("es-CR", { currency: "USD", maximumFractionDigits: 2, style: "currency" });

function ErrorText({ errors }: Readonly<{ errors?: string[] }>) {
  return errors?.[0] ? <span className="field-error">{errors[0]}</span> : null;
}

export function FinancingSimulator({ priceUsd, settings, unitId }: Readonly<{ priceUsd: number; settings: FinancialSettings; unitId: string }>) {
  const [downPaymentPct, setDownPaymentPct] = useState(settings.downPaymentOptionsPct[0]);
  const [termYears, setTermYears] = useState(settings.termYears[0]);
  const action = createQuoteRequest.bind(null, unitId);
  const [state, formAction, pending] = useActionState<QuoteRequestState, FormData>(action, {});
  const estimate = calculateFinancingEstimate({ annualRatePct: settings.annualRatePct, downPaymentPct, priceUsd, termYears });

  if (state.success) {
    return <div className="quote-success" role="status"><p className="eyebrow">Solicitud registrada</p><h2>Tu simulación llegó a Aicon.</h2><p>{state.message}</p><div className="hero-actions"><Link className="button button-primary" href={`/agendar-visita?unidad=${unitId}`}>Agendar una visita</Link><Link className="button button-secondary" href="/catalogo">Seguir explorando</Link></div></div>;
  }

  return (
    <section aria-labelledby="financing-title" className="financing-section" id="cotizar">
      <div className="financing-heading"><div><p className="eyebrow">Simulación financiera</p><h2 id="financing-title">Estima una cuota mensual.</h2></div><p>Tasa anual utilizada: <strong>{settings.annualRatePct}%</strong></p></div>
      <form action={formAction} className="financing-layout">
        <div className="financing-controls">
          <label><span>Prima</span><select name="downPaymentPct" onChange={(event) => setDownPaymentPct(Number(event.target.value))} value={downPaymentPct}>{settings.downPaymentOptionsPct.map((option) => <option key={option} value={option}>{option}% · {usd.format(priceUsd * option / 100)}</option>)}</select></label>
          <label><span>Plazo</span><select name="termYears" onChange={(event) => setTermYears(Number(event.target.value))} value={termYears}>{settings.termYears.map((option) => <option key={option} value={option}>{option} años</option>)}</select></label>
          <div className="estimate-grid"><div><span>Monto por financiar</span><strong>{usd.format(estimate.financedAmountUsd)}</strong></div><div><span>Cuota mensual estimada</span><strong>{usd.format(estimate.monthlyPaymentUsd)}</strong></div></div>
          <p className="financial-disclaimer">Esta simulación es informativa. La aprobación, tasa, avalúo y condiciones definitivas dependen de la entidad bancaria.</p>
        </div>
        <div className="quote-contact-fields">
          <h3>Solicitar cotización formal</h3>
          <label><span>Nombre completo</span><input autoComplete="name" defaultValue={state.values?.name} name="name" required /></label><ErrorText errors={state.errors?.name} />
          <label><span>Teléfono con código de país</span><input autoComplete="tel" defaultValue={state.values?.phone} name="phone" placeholder="+50688887777" required /></label><ErrorText errors={state.errors?.phone} />
          <label><span>Correo electrónico <small>Opcional</small></span><input autoComplete="email" defaultValue={state.values?.email} name="email" type="email" /></label><ErrorText errors={state.errors?.email} />
          <input name="message" type="hidden" value="" />
          <label aria-hidden="true" className="form-trap"><span>Sitio web</span><input autoComplete="off" name="website" tabIndex={-1} /></label>
          <label className="contact-consent"><input name="consent" required type="checkbox" value="yes" /><span>Autorizo a Aicon a responder por llamada o WhatsApp y, si lo proporcioné, por correo.</span></label><ErrorText errors={state.errors?.consent} />
          {state.message ? <p className="form-message" role="alert">{state.message}</p> : null}
          <button className="button button-primary" disabled={pending} type="submit">{pending ? "Enviando…" : "Solicitar cotización"}</button>
        </div>
      </form>
    </section>
  );
}
