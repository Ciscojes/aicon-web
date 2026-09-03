import { describe, expect, it } from "vitest";

import { calculateFinancingEstimate, isFinancialSettings } from "./financial-settings";

describe("calculateFinancingEstimate", () => {
  it("calcula prima, monto financiado y cuota nivelada", () => {
    expect(calculateFinancingEstimate({ annualRatePct: 8, downPaymentPct: 20, priceUsd: 200_000, termYears: 20 })).toEqual({
      downPaymentUsd: 40_000,
      financedAmountUsd: 160_000,
      monthlyPaymentUsd: 1_338.30,
      termMonths: 240,
    });
  });

  it("divide el principal cuando la tasa es cero", () => {
    expect(calculateFinancingEstimate({ annualRatePct: 0, downPaymentPct: 10, priceUsd: 120_000, termYears: 10 }).monthlyPaymentUsd).toBe(900);
  });
});

describe("isFinancialSettings", () => {
  it("rechaza estructuras incompletas", () => {
    expect(isFinancialSettings({ enabled: true })).toBe(false);
  });
});
