"use server";

import { z } from "zod";

import { readPublicInquiryFormData, validatePublicInquiry, type PublicInquiryFieldErrors } from "@/modules/crm/application/validate-public-inquiry";
import type { PublicInquiryContext } from "@/modules/crm/domain/public-inquiry";
import { submitPublicInquiry } from "@/modules/crm/infrastructure/public-inquiry-repository";

const contextSchema = z.object({
  condominiumId: z.uuid().nullable(),
  interestKind: z.enum(["condominium", "general", "unit"]),
  label: z.string().min(1).max(240),
  unitId: z.uuid().nullable(),
}).refine(
  (context) => (context.interestKind === "unit" && context.unitId !== null && context.condominiumId === null)
    || (context.interestKind === "condominium" && context.unitId === null && context.condominiumId !== null)
    || (context.interestKind === "general" && context.unitId === null && context.condominiumId === null),
);

export type PublicInquiryState = {
  errors?: PublicInquiryFieldErrors;
  message?: string;
  success?: boolean;
  values?: { email: string; message: string; name: string; phone: string };
};

export async function createPublicInquiry(
  context: PublicInquiryContext,
  _previousState: PublicInquiryState,
  formData: FormData,
): Promise<PublicInquiryState> {
  const raw = readPublicInquiryFormData(formData);
  const values = { email: raw.email, message: raw.message, name: raw.name, phone: raw.phone };

  if (raw.website) {
    return { message: "Recibimos tu consulta. Aicon podrá comunicarse contigo.", success: true };
  }

  const validContext = contextSchema.safeParse(context);
  if (!validContext.success) return { message: "No fue posible identificar el interés de la consulta.", values };

  const validation = validatePublicInquiry(raw);
  if (!validation.success) return { errors: validation.errors, values };

  const result = await submitPublicInquiry({ context: validContext.data, ...validation.data });
  if (!result.success) {
    return result.errorCode === "inquiry_rate_limited"
      ? { message: "Ya recibimos una consulta reciente para este interés. Intentémoslo de nuevo en unos minutos.", values }
      : { message: "No fue posible registrar tu consulta. Inténtalo nuevamente.", values };
  }

  return { message: "Recibimos tu consulta. Aicon podrá comunicarse contigo.", success: true };
}
