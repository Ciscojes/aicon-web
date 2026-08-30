import { describe, expect, it } from "vitest";

import { validateCondominiumPublication } from "./validate-condominium-publication";

const completeCondominium = {
  address: "San José, Costa Rica",
  description: "Proyecto residencial con acceso controlado.",
  name: "Condominio Río Verde",
  slug: "condominio-rio-verde",
};

describe("validateCondominiumPublication", () => {
  it("permite publicar contenido completo", () => {
    expect(validateCondominiumPublication(completeCondominium)).toEqual({
      success: true,
    });
  });

  it("enumera los datos públicos pendientes", () => {
    expect(
      validateCondominiumPublication({
        ...completeCondominium,
        address: "",
        description: "",
      }),
    ).toEqual({
      errors: ["una descripción", "una dirección"],
      success: false,
    });
  });
});
