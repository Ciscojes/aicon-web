import { describe, expect, it } from "vitest";

import { canRetryNotification, notificationTemplateLabels } from "./notification";

describe("appointment notifications", () => {
  it("only retries failed deliveries", () => {
    expect(canRetryNotification("failed")).toBe(true);
    expect(canRetryNotification("queued")).toBe(false);
    expect(canRetryNotification("sent")).toBe(false);
    expect(canRetryNotification("cancelled")).toBe(false);
  });

  it("exposes understandable reminder labels", () => {
    expect(notificationTemplateLabels.appointment_reminder_24h).toBe("Recordatorio 24 h");
    expect(notificationTemplateLabels.appointment_reminder_2h).toBe("Recordatorio 2 h");
  });
});
