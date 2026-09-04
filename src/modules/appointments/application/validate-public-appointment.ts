import { z } from "zod";

import { normalizeInternationalPhone } from "../../crm/application/validate-public-inquiry";
import type { PublicAppointmentDraft } from "../domain/appointment";

const schema = z.object({
  communicationsConsent: z.literal(true, { error: "Autoriza los avisos relacionados con la cita." }),
  email: z.email("Escribe un correo electrónico válido.").max(320),
  name: z.string().trim().min(2, "Escribe tu nombre.").max(160),
  phone: z.string().trim().max(40),
  startsAt: z.iso.datetime({ offset: true }),
  website: z.string().max(0),
});

export type AppointmentFieldErrors = Partial<Record<keyof PublicAppointmentDraft, string[]>>;
export type AppointmentValidation =
  | { data: Omit<PublicAppointmentDraft, "website">; success: true }
  | { errors: AppointmentFieldErrors; success: false };

const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

export function readPublicAppointmentFormData(formData: FormData): PublicAppointmentDraft {
  return {
    communicationsConsent: formData.get("communicationsConsent") === "yes",
    email: text(formData, "email"),
    name: text(formData, "name"),
    phone: text(formData, "phone"),
    startsAt: text(formData, "startsAt"),
    website: text(formData, "website"),
  };
}

export function validatePublicAppointment(input: PublicAppointmentDraft): AppointmentValidation {
  const result = schema.safeParse(input);
  if (!result.success) return { errors: result.error.flatten().fieldErrors, success: false };
  const phone = normalizeInternationalPhone(result.data.phone);
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    return { errors: { phone: ["Incluye el código de país, por ejemplo +50688887777."] }, success: false };
  }
  if (new Date(result.data.startsAt).getTime() <= Date.now()) {
    return { errors: { startsAt: ["Selecciona un horario futuro."] }, success: false };
  }
  return { data: { ...result.data, phone }, success: true };
}
