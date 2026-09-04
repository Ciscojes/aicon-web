export type FollowUpState = "closed" | "overdue" | "today" | "upcoming" | "unscheduled";

const costaRicaDate = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Costa_Rica",
  year: "numeric",
});

export function getFollowUpState(
  nextActionAt: string | null,
  opportunityStatus: "closed" | "open",
  now = new Date(),
): FollowUpState {
  if (opportunityStatus === "closed") return "closed";
  if (!nextActionAt) return "unscheduled";

  const nextAction = new Date(nextActionAt);
  if (nextAction.getTime() < now.getTime()) return "overdue";
  if (costaRicaDate.format(nextAction) === costaRicaDate.format(now)) return "today";
  return "upcoming";
}

export function getCostaRicaDayRange(now = new Date()) {
  const parts = costaRicaDate.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  const start = new Date(`${part("year")}-${part("month")}-${part("day")}T00:00:00-06:00`);
  const end = new Date(start.getTime() + 86_400_000);
  return { end: end.toISOString(), start: start.toISOString() };
}

export function toCostaRicaDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "America/Costa_Rica",
    year: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}
