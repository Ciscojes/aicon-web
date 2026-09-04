"use server";

import { z } from "zod";

import {
  readPublicAppointmentFormData,
  validatePublicAppointment,
  type AppointmentFieldErrors,
} from "@/modules/appointments/application/validate-public-appointment";
import { submitPublicVisitAppointment } from "@/modules/appointments/infrastructure/public-appointment-repository";

const contextSchema = z.object({ label: z.string().min(1).max(240), unitId: z.uuid() });

export type AppointmentState = {
  errors?: AppointmentFieldErrors;
  message?: string;
  success?: boolean;
  values?: { email: string; name: string; phone: string; startsAt: string };
};

export async function createPublicAppointment(
  context: { label: string; unitId: string },
  _previousState: AppointmentState,
  formData: FormData,
): Promise<AppointmentState> {
  const raw = readPublicAppointmentFormData(formData);
  const values = { email: raw.email, name: raw.name, phone: raw.phone, startsAt: raw.startsAt };
  if (raw.website) return { message: "La visita quedó registrada.", success: true };

  const validContext = contextSchema.safeParse(context);
  if (!validContext.success) return { message: "No fue posible identificar la propiedad.", values };
  const validation = validatePublicAppointment(raw);
  if (!validation.success) return { errors: validation.errors, values };

  const result = await submitPublicVisitAppointment({ ...validation.data, unitId: validContext.data.unitId });
  if (!result.success) {
    return result.errorCode?.includes("appointment_slot_unavailable")
      ? { message: "Ese horario acaba de dejar de estar disponible. Actualiza la página y elige otro.", values }
      : { message: "No fue posible confirmar la visita. Inténtalo nuevamente.", values };
  }
  return { message: "La visita quedó confirmada y el equipo de Aicon ya puede verla en su agenda.", success: true };
}
