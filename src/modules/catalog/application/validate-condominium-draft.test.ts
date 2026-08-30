import { describe, expect, it } from "vitest";

import { validateCondominiumDraft } from "./validate-condominium-draft";

const validDraft = {
  address: "San José, Costa Rica",
  description: "Proyecto residencial.",
  name: "Condominio Río Verde",
  slug: "",
};

describe("validateCondominiumDraft", () => {
  it("crea la URL desde el nombre cuando se omite", () => {
    expect(validateCondominiumDraft(validDraft)).toEqual({
      data: { ...validDraft, slug: "condominio-rio-verde" },
      success: true,
    });
  });

  it("rechaza nombres demasiado cortos", () => {
    const result = validateCondominiumDraft({ ...validDraft, name: "A" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.name?.[0]).toContain("2 caracteres");
  });

  it("normaliza una URL escrita manualmente", () => {
    const result = validateCondominiumDraft({
      ...validDraft,
      slug: "Residencial Los Árboles",
    });

    expect(result).toMatchObject({
      data: { slug: "residencial-los-arboles" },
      success: true,
    });
  });
});
