import { describe, expect, it } from "vitest";

import { validateMediaUpload } from "./validate-media-upload";

describe("validateMediaUpload", () => {
  it("acepta una fotografía válida con texto alternativo", () => {
    const result = validateMediaUpload(new File(["image"], "casa.webp", { type: "image/webp" }), "Fachada principal");
    expect(result.success).toBe(true);
  });

  it("rechaza formatos que no son fotografías admitidas", () => {
    const result = validateMediaUpload(new File(["pdf"], "plano.pdf", { type: "application/pdf" }), "Plano");
    expect(result).toEqual({ success: false, message: "Usa una imagen JPEG, PNG, WebP o AVIF." });
  });

  it("exige una descripción accesible", () => {
    const result = validateMediaUpload(new File(["image"], "casa.jpg", { type: "image/jpeg" }), "");
    expect(result).toEqual({ success: false, message: "La descripción accesible debe tener entre 2 y 240 caracteres." });
  });
});
