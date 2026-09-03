export type OpportunitySummary = {
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
  stage: "contacted" | "discarded" | "negotiation" | "new" | "quote" | "sold" | "visit_scheduled";
  unitCode: string | null;
};

export type OpportunityActivity = {
  actorName: string | null;
  content: string;
  id: string;
  occurredAt: string;
  type: "call" | "email" | "inquiry" | "note" | "quote" | "stage_change" | "visit" | "whatsapp";
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
  status: "closed" | "open";
};
