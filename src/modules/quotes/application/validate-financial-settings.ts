import { z } from "zod";

import type { FinancialSettings } from "../domain/financial-settings";

const decimal = z.coerce.number().min(0, "No puede ser negativo.").max(100, "No puede superar 100.");

function numericList(value: string) {
  const parts = value.split(",").map((item) => item.trim());
  const numbers = parts.map(Number);
  return {
    valid: parts.every((item, index) => item !== "" && Number.isFinite(numbers[index])),
    values: [...new Set(numbers.filter((item) => Number.isFinite(item)))].sort((a, b) => a - b),
  };
}

export type FinancialSettingsErrors = Partial<Record<"annualRatePct" | "downPaymentOptionsPct" | "minimumDownPaymentPct" | "termYears", string[]>>;
export type FinancialSettingsValidation = { data: FinancialSettings; success: true } | { errors: FinancialSettingsErrors; success: false };

export function validateFinancialSettings(input: {
  annualRatePct: unknown;
  downPaymentOptionsPct: string;
  enabled: boolean;
  minimumDownPaymentPct: unknown;
  termYears: string;
}): FinancialSettingsValidation {
  const base = z.object({ annualRatePct: decimal, minimumDownPaymentPct: decimal }).safeParse(input);
  const errors: FinancialSettingsErrors = base.success ? {} : base.error.flatten().fieldErrors;
  const downPaymentList = numericList(input.downPaymentOptionsPct);
  const termList = numericList(input.termYears);
  const downPaymentOptionsPct = downPaymentList.values;
  const termYears = termList.values;

  if (!downPaymentList.valid || downPaymentOptionsPct.length === 0 || downPaymentOptionsPct.length > 10 || downPaymentOptionsPct.some((item) => item < 0 || item > 100)) {
    errors.downPaymentOptionsPct = ["Escribe entre 1 y 10 porcentajes válidos separados por comas."];
  }
  if (!termList.valid || termYears.length === 0 || termYears.length > 10 || termYears.some((item) => !Number.isInteger(item) || item < 1 || item > 50)) {
    errors.termYears = ["Escribe entre 1 y 10 plazos enteros de 1 a 50 años."];
  }
  if (!base.success || Object.keys(errors).length > 0) return { errors, success: false };
  if (downPaymentOptionsPct.some((item) => item < base.data.minimumDownPaymentPct) || !downPaymentOptionsPct.includes(base.data.minimumDownPaymentPct)) {
    return { errors: { downPaymentOptionsPct: ["Las opciones deben incluir la prima mínima y ninguna puede ser menor."] }, success: false };
  }

  return { data: { ...base.data, downPaymentOptionsPct, enabled: input.enabled, termYears }, success: true };
}
