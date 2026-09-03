"use server";

import { revalidatePath } from "next/cache";

import { requireAdministrator } from "../authorization";
import { validateFinancialSettings, type FinancialSettingsErrors } from "@/modules/quotes/application/validate-financial-settings";
import { insertFinancialSettings } from "@/modules/quotes/infrastructure/financial-settings-repository";

export type FinancialSettingsState = {
  errors?: FinancialSettingsErrors;
  message?: string;
  success?: boolean;
  values?: { annualRatePct: string; downPaymentOptionsPct: string; enabled: boolean; minimumDownPaymentPct: string; termYears: string };
};

const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

export async function saveFinancialSettings(_previous: FinancialSettingsState, formData: FormData): Promise<FinancialSettingsState> {
  const profile = await requireAdministrator();
  const values = {
    annualRatePct: text(formData, "annualRatePct"),
    downPaymentOptionsPct: text(formData, "downPaymentOptionsPct"),
    enabled: formData.get("enabled") === "yes",
    minimumDownPaymentPct: text(formData, "minimumDownPaymentPct"),
    termYears: text(formData, "termYears"),
  };
  const validation = validateFinancialSettings(values);
  if (!validation.success) return { errors: validation.errors, values };

  if (!(await insertFinancialSettings(validation.data, profile.id))) {
    return { message: "No fue posible guardar la configuración.", values };
  }

  revalidatePath("/panel/configuracion/financiamiento");
  revalidatePath("/casas", "layout");
  return { message: validation.data.enabled ? "Configuración activada para nuevas simulaciones." : "El simulador público quedó deshabilitado.", success: true };
}
