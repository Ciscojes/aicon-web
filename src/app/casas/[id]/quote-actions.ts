"use server";

import { z } from "zod";

import { readPublicInquiryFormData, validatePublicInquiry, type PublicInquiryFieldErrors } from "@/modules/crm/application/validate-public-inquiry";
import { submitQuoteRequest } from "@/modules/quotes/infrastructure/quote-request-repository";

export type QuoteRequestState = {
  errors?: PublicInquiryFieldErrors & { downPaymentPct?: string[]; termYears?: string[] };
  message?: string;
  success?: boolean;
  values?: { email: string; name: string; phone: string };
};

export async function createQuoteRequest(unitId: string, _previous: QuoteRequestState, formData: FormData): Promise<QuoteRequestState> {
  const raw = readPublicInquiryFormData(formData);
  const values = { email: raw.email, name: raw.name, phone: raw.phone };
  if (raw.website) return { message: "Recibimos tu solicitud de cotización.", success: true };
  if (!z.uuid().safeParse(unitId).success) return { message: "No fue posible identificar la casa.", values };

  const contact = validatePublicInquiry(raw);
  const financing = z.object({
    downPaymentPct: z.coerce.number().min(0).max(100),
    termYears: z.coerce.number().int().min(1).max(50),
  }).safeParse({ downPaymentPct: formData.get("downPaymentPct"), termYears: formData.get("termYears") });
  if (!contact.success || !financing.success) {
    return {
      errors: {
        ...(!contact.success ? contact.errors : {}),
        ...(!financing.success ? financing.error.flatten().fieldErrors : {}),
      },
      values,
    };
  }

  const result = await submitQuoteRequest({ ...contact.data, ...financing.data, unitId });
  if (!result.success) {
    const message = result.errorCode === "quote_rate_limited"
      ? "Ya recibimos una cotización reciente para esta casa. Inténtalo de nuevo en unos minutos."
      : result.errorCode === "unit_not_available_for_quote"
        ? "Esta casa ya no está disponible para una nueva cotización."
        : result.errorCode === "financing_not_configured" || result.errorCode === "invalid_financing_option"
          ? "La configuración financiera cambió. Actualiza la página e inténtalo nuevamente."
          : "No fue posible registrar la cotización. Inténtalo nuevamente.";
    return { message, values };
  }

  return { message: "Recibimos tu solicitud. Un asesor podrá revisar la simulación y comunicarse contigo.", success: true };
}
