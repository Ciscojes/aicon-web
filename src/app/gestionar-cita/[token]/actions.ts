"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  cancelPublicAppointmentWithToken,
  requestPublicAppointmentReschedule,
} from "@/modules/appointments/infrastructure/public-appointment-repository";

const tokenSchema = z.string().regex(/^[0-9a-f]{64}$/);
const destination = (token: string, kind: "error" | "notice", message: string) =>
  `/gestionar-cita/${token}?${new URLSearchParams({ [kind]: message })}`;

export async function cancelAppointment(formData: FormData) {
  const token = tokenSchema.safeParse(formData.get("token"));
  const reason = z.string().trim().max(500).safeParse(formData.get("reason") ?? "");
  if (!token.success || !reason.success) redirect("/catalogo");
  if (!(await cancelPublicAppointmentWithToken(token.data, reason.data))) {
    redirect(destination(token.data, "error", "El enlace venció, ya fue utilizado o la cita dejó de estar disponible."));
  }
  redirect(destination(token.data, "notice", "La visita fue cancelada y el horario quedó liberado."));
}

export async function requestReschedule(formData: FormData) {
  const token = tokenSchema.safeParse(formData.get("token"));
  const startsAt = z.iso.datetime().safeParse(formData.get("startsAt"));
  const message = z.string().trim().max(500).safeParse(formData.get("message") ?? "");
  if (!token.success || !startsAt.success || !message.success) redirect("/catalogo");
  if (!(await requestPublicAppointmentReschedule(token.data, startsAt.data, message.data))) {
    redirect(destination(token.data, "error", "Ese horario dejó de estar disponible o el enlace ya no es válido."));
  }
  redirect(destination(token.data, "notice", "Recibimos tu solicitud. La cita actual no cambiará hasta que Aicon confirme el nuevo horario."));
}
