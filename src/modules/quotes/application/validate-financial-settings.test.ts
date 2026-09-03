import { describe, expect, it } from "vitest";

import { validateFinancialSettings } from "./validate-financial-settings";

const valid = { annualRatePct: "8.5", downPaymentOptionsPct: "10, 15, 20", enabled: true, minimumDownPaymentPct: "10", termYears: "10, 20, 30" };

describe("validateFinancialSettings", () => {
  it("normaliza listas y números", () => {
    expect(validateFinancialSettings(valid)).toEqual({
      data: { annualRatePct: 8.5, downPaymentOptionsPct: [10, 15, 20], enabled: true, minimumDownPaymentPct: 10, termYears: [10, 20, 30] },
      success: true,
    });
  });

  it("exige incluir la prima mínima", () => {
    expect(validateFinancialSettings({ ...valid, downPaymentOptionsPct: "15,20" })).toMatchObject({ success: false });
  });

  it("rechaza plazos fraccionarios o fuera de rango", () => {
    expect(validateFinancialSettings({ ...valid, termYears: "0, 20.5" })).toMatchObject({ errors: { termYears: expect.any(Array) }, success: false });
  });

  it("rechaza elementos no numéricos en vez de ignorarlos", () => {
    expect(validateFinancialSettings({ ...valid, termYears: "10, veinte, 30" })).toMatchObject({ success: false });
  });
});
