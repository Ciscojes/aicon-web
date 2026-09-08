import "server-only";

import type { PublicCompanyProfile } from "../domain/public-company-profile";

const clean = (value: string | undefined, limit = 240) => {
  const result = value?.trim();
  return result && result.length <= limit ? result : null;
};

const internationalPhone = (value: string | undefined) => {
  const result = clean(value, 24);
  return result && /^\+[1-9]\d{7,14}$/.test(result) ? result : null;
};

const email = (value: string | undefined) => {
  const result = clean(value, 320);
  return result && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result) ? result : null;
};

export function getPublicCompanyProfile(): PublicCompanyProfile {
  return {
    address: clean(process.env.AICON_PUBLIC_ADDRESS),
    email: email(process.env.AICON_PUBLIC_EMAIL),
    legalName: clean(process.env.AICON_PUBLIC_LEGAL_NAME),
    legalRegistration: clean(process.env.AICON_PUBLIC_LEGAL_REGISTRATION, 120),
    phone: internationalPhone(process.env.AICON_PUBLIC_PHONE),
    whatsapp: internationalPhone(process.env.AICON_PUBLIC_WHATSAPP),
  };
}

export function whatsappHref(phone: string, context?: string) {
  const digits = phone.replace(/\D/g, "");
  const message = context ? `Hola, me interesa recibir información sobre ${context}.` : "Hola, me interesa recibir información sobre Aicon Edificadora.";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
