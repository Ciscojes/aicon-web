import { z } from "zod";

import type { PublicInquiryDraft } from "../domain/public-inquiry";

const schema = z.object({
  consent: z.literal(true, { error: "Autoriza a Aicon a responder tu consulta." }),
  email: z.string().trim().max(320, "El correo no puede superar 320 caracteres.").refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Escribe un correo válido o deja el campo vacío.",
  ),
  message: z.string().trim().max(5_000, "El mensaje no puede superar 5000 caracteres."),
  name: z.string().trim().min(2, "Escribe tu nombre.").max(160, "El nombre no puede superar 160 caracteres."),
  phone: z.string().trim().max(40, "El teléfono no puede superar 40 caracteres."),
  website: z.string().max(0),
});

export type PublicInquiryFieldErrors = Partial<Record<keyof PublicInquiryDraft, string[]>>;
export type PublicInquiryValidation =
  | { data: Omit<PublicInquiryDraft, "website">; success: true }
  | { errors: PublicInquiryFieldErrors; success: false };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function readPublicInquiryFormData(formData: FormData): PublicInquiryDraft {
  return {
    consent: formData.get("consent") === "yes",
    email: text(formData, "email"),
    message: text(formData, "message"),
    name: text(formData, "name"),
    phone: text(formData, "phone"),
    website: text(formData, "website"),
  };
}

export function normalizeInternationalPhone(value: string): string {
  return value.trim().replace(/[\s().-]/g, "");
}

export function validatePublicInquiry(input: PublicInquiryDraft): PublicInquiryValidation {
  const result = schema.safeParse(input);
  if (!result.success) return { errors: result.error.flatten().fieldErrors, success: false };

  const phone = normalizeInternationalPhone(result.data.phone);
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    return {
      errors: { phone: ["Incluye el código de país, por ejemplo +50688887777."] },
      success: false,
    };
  }

  return {
    data: {
      consent: result.data.consent,
      email: result.data.email,
      message: result.data.message,
      name: result.data.name,
      phone,
    },
    success: true,
  };
}
