export type VisitSlot = { endsAt: string; startsAt: string };

export type AppointmentSummary = {
  advisorName: string;
  condominiumName: string;
  contactEmail: string | null;
  contactName: string;
  contactPhone: string;
  endsAt: string;
  id: string;
  opportunityId: string;
  startsAt: string;
  status: "cancelled" | "completed" | "no_show" | "scheduled";
  unitCode: string;
  history: AppointmentHistoryEntry[];
};

export const appointmentStatusLabels = {
  cancelled: "Cancelada",
  completed: "Realizada",
  no_show: "No asistió",
  scheduled: "Programada",
} as const;

export type AppointmentStatus = keyof typeof appointmentStatusLabels;

export type AppointmentHistoryEntry = {
  action: "created" | "rescheduled" | "status_changed";
  actorName: string | null;
  cancellationReason: string | null;
  id: string;
  newEndsAt: string | null;
  newStartsAt: string | null;
  newStatus: AppointmentStatus | null;
  occurredAt: string;
  previousEndsAt: string | null;
  previousStartsAt: string | null;
  previousStatus: AppointmentStatus | null;
};

export function canManageAppointment(
  role: "administrator" | "advisor" | "editor",
  profileId: string,
  advisorId: string,
): boolean {
  return role === "administrator" || (role === "advisor" && profileId === advisorId);
}

export function canTransitionAppointment(
  current: AppointmentStatus,
  next: AppointmentStatus,
): boolean {
  return current === "scheduled" && ["cancelled", "completed", "no_show"].includes(next);
}

export type AdvisorSchedule = {
  active: boolean;
  advisorId: string;
  advisorName: string;
  endsAtLocal: string;
  id: string;
  startsAtLocal: string;
  weekday: number;
};

export type AvailabilityBlock = {
  advisorId: string;
  advisorName: string;
  endsAt: string;
  id: string;
  reason: string;
  startsAt: string;
};

export type PublicAppointmentDraft = {
  communicationsConsent: boolean;
  email: string;
  name: string;
  phone: string;
  startsAt: string;
  website: string;
};
