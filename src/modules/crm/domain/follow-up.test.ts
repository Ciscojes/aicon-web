import { describe, expect, it } from "vitest";

import { getCostaRicaDayRange, getFollowUpState, toCostaRicaDateTimeLocal } from "./follow-up";

describe("seguimientos comerciales", () => {
  const now = new Date("2026-09-03T16:00:00.000Z"); // 10:00 en Costa Rica

  it("distingue seguimientos atrasados, de hoy, futuros y sin programar", () => {
    expect(getFollowUpState("2026-09-03T15:59:00.000Z", "open", now)).toBe("overdue");
    expect(getFollowUpState("2026-09-03T20:00:00.000Z", "open", now)).toBe("today");
    expect(getFollowUpState("2026-09-04T16:00:00.000Z", "open", now)).toBe("upcoming");
    expect(getFollowUpState(null, "open", now)).toBe("unscheduled");
  });

  it("no presenta acciones pendientes para oportunidades cerradas", () => {
    expect(getFollowUpState("2026-09-03T15:59:00.000Z", "closed", now)).toBe("closed");
  });

  it("calcula el día completo y el valor de formulario en hora de Costa Rica", () => {
    expect(getCostaRicaDayRange(now)).toEqual({
      end: "2026-09-04T06:00:00.000Z",
      start: "2026-09-03T06:00:00.000Z",
    });
    expect(toCostaRicaDateTimeLocal("2026-09-03T20:30:00.000Z")).toBe("2026-09-03T14:30");
  });
});
