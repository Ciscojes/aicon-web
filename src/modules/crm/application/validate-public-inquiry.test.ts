import { describe, expect, it } from "vitest";

import { normalizeInternationalPhone, validatePublicInquiry } from "./validate-public-inquiry";

const valid = {
  consent: true,
  email: "persona@example.com",
  message: "Me interesa conocer más.",
  name: "Persona Interesada",
  phone: "+506 8888-7777",
  website: "",
};

describe("validatePublicInquiry", () => {
  it("normaliza un teléfono internacional legible", () => {
    expect(normalizeInternationalPhone(valid.phone)).toBe("+50688887777");
    expect(validatePublicInquiry(valid)).toMatchObject({ data: { phone: "+50688887777" }, success: true });
  });

  it("exige código de país y consentimiento", () => {
    const phone = validatePublicInquiry({ ...valid, phone: "8888-7777" });
    expect(phone).toMatchObject({ errors: { phone: expect.any(Array) }, success: false });

    const consent = validatePublicInquiry({ ...valid, consent: false });
    expect(consent).toMatchObject({ errors: { consent: expect.any(Array) }, success: false });
  });

  it("acepta correo y mensaje vacíos", () => {
    expect(validatePublicInquiry({ ...valid, email: "", message: "" })).toMatchObject({ success: true });
  });

  it("rechaza el campo señuelo cuando fue completado", () => {
    expect(validatePublicInquiry({ ...valid, website: "bot.example" })).toMatchObject({ success: false });
  });
});
