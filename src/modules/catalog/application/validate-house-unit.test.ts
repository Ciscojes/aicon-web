import { describe, expect, it } from "vitest";

import { validateHouseUnit, type HouseUnitFormValues } from "./validate-house-unit";

const valid: HouseUnitFormValues = {
  availabilityStatus: "available",
  bathroomsOverride: "2.5",
  bedroomsOverride: "3",
  code: "A-12",
  condominiumId: "22222222-2222-4222-8222-222222222222",
  constructionAreaM2Override: "145.50",
  descriptionOverride: "Vista al parque",
  featuresOverride: "Terraza\nTerraza\nAcabados premium",
  landAreaM2Override: "180",
  modelId: "",
  parkingSpacesOverride: "2",
  priceUsd: "185000.00",
};

describe("validateHouseUnit", () => {
  it("acepta un diseño único y normaliza sus características", () => {
    const result = validateHouseUnit(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.modelId).toBeNull();
      expect(result.data.featuresOverride).toEqual(["Terraza", "Acabados premium"]);
      expect(result.data.priceUsd).toBe("185000.00");
    }
  });

  it("rechaza precio, identificadores y decimales inválidos", () => {
    const result = validateHouseUnit({ ...valid, bathroomsOverride: "2.55", condominiumId: "otro", priceUsd: "1,000" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.bathroomsOverride).toBeDefined();
      expect(result.errors.condominiumId).toBeDefined();
      expect(result.errors.priceUsd).toBeDefined();
    }
  });

  it("acepta un modelo UUID y campos específicos vacíos", () => {
    const result = validateHouseUnit({ ...valid, bathroomsOverride: "", bedroomsOverride: "", modelId: "33333333-3333-4333-8333-333333333333" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.bedroomsOverride).toBeNull();
  });
});
