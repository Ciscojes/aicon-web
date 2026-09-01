export type InquiryInterestKind = "condominium" | "general" | "unit";

export type PublicInquiryContext = {
  condominiumId: string | null;
  interestKind: InquiryInterestKind;
  label: string;
  unitId: string | null;
};

export type PublicInquiryDraft = {
  consent: boolean;
  email: string;
  message: string;
  name: string;
  phone: string;
  website: string;
};
