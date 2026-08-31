import { describe, expect, it } from "vitest";

import { validateHouseModel, type HouseModelFormValues } from "./validate-house-model";

const validModel: HouseModelFormValues = {
  bathrooms: "2.5",
  bedrooms: "3",
  constructionAreaM2: "145.75",
  description: "Modelo familiar.",
  features: "Cocina integrada\nTerraza\nCocina integrada",
  landAreaM2: "210",
  name: "Modelo Horizonte",
  parkingSpaces: "2",
};

describe("validateHouseModel", () => {
  it("convierte números opcionales y elimina características duplicadas", () => {
    expect(validateHouseModel(validModel)).toEqual({
      data: {
        bathrooms: 2.5,
        bedrooms: 3,
        constructionAreaM2: 145.75,
        description: "Modelo familiar.",
        features: ["Cocina integrada", "Terraza"],
        landAreaM2: 210,
        name: "Modelo Horizonte",
        parkingSpaces: 2,
      },
      success: true,
    });
  });

  it("conserva como nulos los valores opcionales vacíos", () => {
    const result = validateHouseModel({
      ...validModel,
      bathrooms: "",
      bedrooms: "",
      constructionAreaM2: "",
      landAreaM2: "",
      parkingSpaces: "",
    });

    expect(result).toMatchObject({
      data: { bathrooms: null, bedrooms: null, constructionAreaM2: null },
      success: true,
    });
  });

  it("rechaza cantidades y áreas inválidas", () => {
    const result = validateHouseModel({
      ...validModel,
      bedrooms: "3.5",
      constructionAreaM2: "0",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.bedrooms).toBeDefined();
      expect(result.errors.constructionAreaM2).toBeDefined();
    }
  });
});
