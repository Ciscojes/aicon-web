import { describe, expect, it } from "vitest";

import { createCondominiumSlug } from "./condominium";

describe("createCondominiumSlug", () => {
  it("normaliza espacios, mayúsculas y acentos", () => {
    expect(createCondominiumSlug("  Condominio Río Verde  ")).toBe(
      "condominio-rio-verde",
    );
  });

  it("elimina símbolos y separadores sobrantes", () => {
    expect(createCondominiumSlug("Aicon / Etapa #2")).toBe("aicon-etapa-2");
  });
});
