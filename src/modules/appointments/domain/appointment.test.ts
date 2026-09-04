import { describe, expect, it } from "vitest";

import { canManageAppointment, canTransitionAppointment } from "./appointment";

describe("appointment management", () => {
  it("allows administrators to manage any appointment and advisors only their own", () => {
    expect(canManageAppointment("administrator", "admin", "advisor-a")).toBe(true);
    expect(canManageAppointment("advisor", "advisor-a", "advisor-a")).toBe(true);
    expect(canManageAppointment("advisor", "advisor-b", "advisor-a")).toBe(false);
    expect(canManageAppointment("editor", "editor", "advisor-a")).toBe(false);
  });

  it.each(["cancelled", "completed", "no_show"] as const)(
    "allows a scheduled appointment to become %s",
    (status) => expect(canTransitionAppointment("scheduled", status)).toBe(true),
  );

  it("keeps final appointment states immutable from normal management", () => {
    expect(canTransitionAppointment("completed", "cancelled")).toBe(false);
    expect(canTransitionAppointment("cancelled", "scheduled")).toBe(false);
    expect(canTransitionAppointment("no_show", "completed")).toBe(false);
    expect(canTransitionAppointment("scheduled", "scheduled")).toBe(false);
  });
});
