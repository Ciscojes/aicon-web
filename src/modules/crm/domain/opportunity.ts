export type OpportunitySummary = {
  advisorId: string | null;
  advisorName: string | null;
  condominiumName: string | null;
  contactEmail: string | null;
  contactName: string;
  contactPhone: string;
  createdAt: string;
  id: string;
  interestKind: "condominium" | "general" | "unit";
  latestQuote: {
    annualRatePct: number;
    downPaymentUsd: number;
    monthlyPaymentUsd: number;
    termMonths: number;
  } | null;
  nextActionAt: string | null;
  nextActionDescription: string | null;
  status: "closed" | "open";
  stage: "contacted" | "discarded" | "negotiation" | "new" | "quote" | "sold" | "visit_scheduled";
  unitCode: string | null;
};

export type OpportunityActivity = {
  actorName: string | null;
  content: string;
  id: string;
  occurredAt: string;
  type: "assignment" | "call" | "email" | "follow_up" | "inquiry" | "note" | "quote" | "stage_change" | "visit" | "whatsapp";
};

export type CrmAdvisorOption = { id: string; name: string };
export type CrmCondominiumOption = { id: string; name: string };
export type OpportunityFilters = {
  advisorId?: "unassigned" | string;
  condominiumId?: string;
  dateFrom?: string;
  dateTo?: string;
  followUp?: "overdue" | "today" | "upcoming" | "unscheduled";
  stage?: OpportunitySummary["stage"];
  status?: OpportunitySummary["status"] | "all";
};

export type OpportunityQuote = {
  annualRatePct: number;
  createdAt: string;
  downPaymentUsd: number;
  estimatedMonthlyPaymentUsd: number;
  financedAmountUsd: number;
  id: string;
  priceSnapshotUsd: number;
  termMonths: number;
};

export type OpportunityAppointment = {
  advisorName: string;
  endsAt: string;
  id: string;
  startsAt: string;
  status: "cancelled" | "completed" | "no_show" | "scheduled";
};

export type OpportunityDetails = OpportunitySummary & {
  activities: OpportunityActivity[];
  appointments: OpportunityAppointment[];
  advisorName: string | null;
  contactEmailConsent: boolean;
  contactWhatsappConsent: boolean;
  quotes: OpportunityQuote[];
  source: "contact_form" | "manual" | "quote_request";
};
