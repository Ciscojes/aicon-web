import { describe, expect, it, vi } from "vitest";

import { validatePublicAppointment } from "./validate-public-appointment";

describe("reserva pública de visitas", () => {
  const valid = {
    communicationsConsent: true,
    email: "cliente@example.com",
    name: "Cliente Aicon",
    phone: "+506 8888-7777",
    startsAt: "2026-09-10T15:00:00.000Z",
    website: "",
  };

  it("normaliza un formulario válido", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-03T12:00:00.000Z"));
    const result = validatePublicAppointment(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe("+50688887777");
    vi.useRealTimers();
  });

  it("requiere correo, consentimiento y horario futuro", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-11T12:00:00.000Z"));
    const result = validatePublicAppointment({ ...valid, communicationsConsent: false, email: "", startsAt: "2026-09-10T15:00:00.000Z" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.communicationsConsent).toBeDefined();
      expect(result.errors.email).toBeDefined();
    }
    vi.useRealTimers();
  });

  it("rechaza teléfonos sin código internacional", () => {
    const result = validatePublicAppointment({ ...valid, phone: "88887777" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.phone).toBeDefined();
  });
});
