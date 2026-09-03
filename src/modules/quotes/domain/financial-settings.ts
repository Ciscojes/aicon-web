export type FinancialSettings = {
  annualRatePct: number;
  downPaymentOptionsPct: number[];
  enabled: boolean;
  minimumDownPaymentPct: number;
  termYears: number[];
};

export type FinancingEstimate = {
  downPaymentUsd: number;
  financedAmountUsd: number;
  monthlyPaymentUsd: number;
  termMonths: number;
};

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateFinancingEstimate(input: {
  annualRatePct: number;
  downPaymentPct: number;
  priceUsd: number;
  termYears: number;
}): FinancingEstimate {
  const downPaymentUsd = money(input.priceUsd * input.downPaymentPct / 100);
  const financedAmountUsd = money(input.priceUsd - downPaymentUsd);
  const termMonths = input.termYears * 12;
  const monthlyRate = input.annualRatePct / 1200;
  const monthlyPaymentUsd = monthlyRate === 0
    ? money(financedAmountUsd / termMonths)
    : money(financedAmountUsd * monthlyRate * (1 + monthlyRate) ** termMonths / ((1 + monthlyRate) ** termMonths - 1));

  return { downPaymentUsd, financedAmountUsd, monthlyPaymentUsd, termMonths };
}

export function isFinancialSettings(value: unknown): value is FinancialSettings {
  if (!value || typeof value !== "object") return false;
  const settings = value as Partial<FinancialSettings>;
  return typeof settings.enabled === "boolean"
    && typeof settings.annualRatePct === "number"
    && typeof settings.minimumDownPaymentPct === "number"
    && Array.isArray(settings.downPaymentOptionsPct)
    && settings.downPaymentOptionsPct.every((item) => typeof item === "number")
    && Array.isArray(settings.termYears)
    && settings.termYears.every((item) => typeof item === "number");
}
