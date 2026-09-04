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
};

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
