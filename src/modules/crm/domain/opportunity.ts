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
  status: "closed" | "open";
  stage: "contacted" | "discarded" | "negotiation" | "new" | "quote" | "sold" | "visit_scheduled";
  unitCode: string | null;
};

export type OpportunityActivity = {
  actorName: string | null;
  content: string;
  id: string;
  occurredAt: string;
  type: "assignment" | "call" | "email" | "inquiry" | "note" | "quote" | "stage_change" | "visit" | "whatsapp";
};

export type CrmAdvisorOption = { id: string; name: string };
export type CrmCondominiumOption = { id: string; name: string };
export type OpportunityFilters = {
  advisorId?: string;
  condominiumId?: string;
  dateFrom?: string;
  dateTo?: string;
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

export type OpportunityDetails = OpportunitySummary & {
  activities: OpportunityActivity[];
  advisorName: string | null;
  contactEmailConsent: boolean;
  contactWhatsappConsent: boolean;
  quotes: OpportunityQuote[];
  source: "contact_form" | "manual" | "quote_request";
};
