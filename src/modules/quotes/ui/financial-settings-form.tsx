"use client";

import { useActionState } from "react";

import { saveFinancialSettings, type FinancialSettingsState } from "@/app/panel/configuracion/financiamiento/actions";
import type { FinancialSettings } from "../domain/financial-settings";

function ErrorText({ errors }: Readonly<{ errors?: string[] }>) {
  return errors?.[0] ? <span className="field-error">{errors[0]}</span> : null;
}

export function FinancialSettingsForm({ settings }: Readonly<{ settings: FinancialSettings | null }>) {
  const [state, formAction, pending] = useActionState<FinancialSettingsState, FormData>(saveFinancialSettings, {});
  const values = state.values ?? {
    annualRatePct: settings?.annualRatePct.toString() ?? "",
    downPaymentOptionsPct: settings?.downPaymentOptionsPct.join(", ") ?? "",
    enabled: settings?.enabled ?? false,
    minimumDownPaymentPct: settings?.minimumDownPaymentPct.toString() ?? "",
    termYears: settings?.termYears.join(", ") ?? "",
  };

  return (
    <form action={formAction} className="catalog-form financial-settings-form">
      <label><span>Tasa anual estimativa (%)</span><input defaultValue={values.annualRatePct} inputMode="decimal" min="0" name="annualRatePct" required step="0.0001" type="number" /></label>
      <ErrorText errors={state.errors?.annualRatePct} />
      <label><span>Prima mínima (%)</span><input defaultValue={values.minimumDownPaymentPct} inputMode="decimal" min="0" name="minimumDownPaymentPct" required step="0.01" type="number" /></label>
      <ErrorText errors={state.errors?.minimumDownPaymentPct} />
      <label className="field-wide"><span>Opciones de prima (%)</span><input defaultValue={values.downPaymentOptionsPct} name="downPaymentOptionsPct" placeholder="10, 15, 20" required /><small>Separadas por comas e incluyendo la prima mínima.</small></label>
      <ErrorText errors={state.errors?.downPaymentOptionsPct} />
      <label className="field-wide"><span>Plazos en años</span><input defaultValue={values.termYears} name="termYears" placeholder="10, 15, 20, 25, 30" required /><small>Entre 1 y 50 años, separados por comas.</small></label>
      <ErrorText errors={state.errors?.termYears} />
      <label className="confirmation-field field-wide"><input defaultChecked={values.enabled} name="enabled" type="checkbox" value="yes" /><span>Activar esta versión para el simulador público.</span></label>
      {state.message ? state.success ? <output className="form-success field-wide">{state.message}</output> : <p className="form-message field-wide" role="alert">{state.message}</p> : null}
      <div className="field-wide"><button className="button button-primary" disabled={pending} type="submit">{pending ? "Guardando…" : "Guardar nueva versión"}</button></div>
    </form>
  );
}
