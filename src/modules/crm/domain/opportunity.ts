export type OpportunitySummary = {
  condominiumName: string | null;
  contactEmail: string | null;
  contactName: string;
  contactPhone: string;
  createdAt: string;
  id: string;
  interestKind: "condominium" | "general" | "unit";
  stage: "contacted" | "discarded" | "negotiation" | "new" | "quote" | "sold" | "visit_scheduled";
  unitCode: string | null;
};
