export type PublicCompanyProfile = {
  address: string | null;
  email: string | null;
  legalName: string | null;
  legalRegistration: string | null;
  phone: string | null;
  whatsapp: string | null;
};

export function hasVerifiedCompanyDetails(profile: PublicCompanyProfile) {
  return Object.values(profile).some(Boolean);
}
