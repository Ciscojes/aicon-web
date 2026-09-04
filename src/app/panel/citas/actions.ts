"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireCrmAccess } from "../crm/authorization";
import { toCostaRicaDateTimeLocal } from "@/modules/crm/domain/follow-up";
import {
  availableAdvisorId,
  cancelAvailabilityBlock,
  createAvailabilityBlock,
  rescheduleManagedAppointment,
  saveAdvisorSchedule,
  saveVisitDurationMinutes,
  setManagedAppointmentStatus,
  setAdvisorScheduleActive,
} from "@/modules/appointments/infrastructure/appointment-repository";

const uuid = z.uuid();
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const localDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
const destination = (kind: "error" | "notice", message: string) => `/panel/citas?${new URLSearchParams({ [kind]: message })}`;
export async function updateVisitDuration(formData: FormData) {
  const profile = await requireCrmAccess();
  if (profile.role !== "administrator") redirect(destination("error", "Solamente un administrador puede cambiar la duración."));
  const duration = z.coerce.number().int().refine((value) => [30, 45, 60, 90, 120].includes(value)).safeParse(formData.get("durationMinutes"));
  if (!duration.success || !(await saveVisitDurationMinutes(duration.data, profile.id))) redirect(destination("error", "No fue posible guardar la duración."));
  revalidatePath("/panel/citas");
  redirect(destination("notice", "Duración actualizada para nuevos horarios."));
}

export async function createAdvisorSchedule(formData: FormData) {
  const profile = await requireCrmAccess();
  if (profile.role !== "administrator") redirect(destination("error", "Solamente un administrador puede configurar horarios."));
  const advisor = uuid.safeParse(formData.get("advisorId"));
  const weekday = z.coerce.number().int().min(0).max(6).safeParse(formData.get("weekday"));
  const startsAt = time.safeParse(formData.get("startsAt"));
  const endsAt = time.safeParse(formData.get("endsAt"));
  if (!advisor.success || !weekday.success || !startsAt.success || !endsAt.success || startsAt.data >= endsAt.data) {
    redirect(destination("error", "Selecciona asesor, día y un rango horario válido."));
  }
  if (!(await saveAdvisorSchedule(advisor.data, weekday.data, startsAt.data, endsAt.data))) redirect(destination("error", "El horario se superpone o no pudo guardarse."));
  revalidatePath("/panel/citas");
  redirect(destination("notice", "Horario recurrente agregado."));
}

export async function toggleAdvisorSchedule(formData: FormData) {
  const profile = await requireCrmAccess();
  if (profile.role !== "administrator") redirect(destination("error", "Solamente un administrador puede cambiar horarios."));
  const id = uuid.safeParse(formData.get("scheduleId"));
  if (!id.success || !(await setAdvisorScheduleActive(id.data, formData.get("active") === "true"))) redirect(destination("error", "No fue posible cambiar el horario."));
  revalidatePath("/panel/citas");
  redirect(destination("notice", "Horario actualizado."));
}

export async function createAdvisorBlock(formData: FormData) {
  const profile = await requireCrmAccess();
  const advisor = uuid.safeParse(availableAdvisorId(profile, formData.get("advisorId")));
  const startsAt = localDateTime.safeParse(formData.get("startsAt"));
  const endsAt = localDateTime.safeParse(formData.get("endsAt"));
  const reason = z.string().trim().min(1).max(500).safeParse(formData.get("reason"));
  if (!advisor.success || !startsAt.success || !endsAt.success || !reason.success) redirect(destination("error", "Completa correctamente el bloqueo de disponibilidad."));
  const start = new Date(`${startsAt.data}:00-06:00`);
  const end = new Date(`${endsAt.data}:00-06:00`);
  if (toCostaRicaDateTimeLocal(start.toISOString()) !== startsAt.data || toCostaRicaDateTimeLocal(end.toISOString()) !== endsAt.data || start >= end || start <= new Date()) {
    redirect(destination("error", "El bloqueo debe utilizar fechas futuras y un rango válido."));
  }
  if (!(await createAvailabilityBlock(advisor.data, start.toISOString(), end.toISOString(), reason.data))) redirect(destination("error", "No fue posible guardar el bloqueo."));
  revalidatePath("/panel/citas");
  redirect(destination("notice", "Bloqueo de disponibilidad agregado."));
}

export async function removeAdvisorBlock(formData: FormData) {
  await requireCrmAccess();
  const id = uuid.safeParse(formData.get("blockId"));
  if (!id.success || !(await cancelAvailabilityBlock(id.data))) redirect(destination("error", "No fue posible retirar el bloqueo."));
  revalidatePath("/panel/citas");
  redirect(destination("notice", "Bloqueo retirado."));
}

export async function rescheduleAppointment(formData: FormData) {
  await requireCrmAccess();
  const id = uuid.safeParse(formData.get("appointmentId"));
  const startsAt = localDateTime.safeParse(formData.get("startsAt"));
  if (!id.success || !startsAt.success) redirect(destination("error", "Selecciona una fecha y hora válidas para reprogramar."));
  const start = new Date(`${startsAt.data}:00-06:00`);
  if (toCostaRicaDateTimeLocal(start.toISOString()) !== startsAt.data || start <= new Date()) {
    redirect(destination("error", "La nueva fecha debe ser futura y usar la hora de Costa Rica."));
  }
  if (!(await rescheduleManagedAppointment(id.data, start.toISOString()))) {
    redirect(destination("error", "No fue posible reprogramar. Revisa el horario, los bloqueos y otras citas del asesor."));
  }
  revalidatePath("/panel/citas");
  redirect(destination("notice", "Cita reprogramada y registrada en el historial."));
}

export async function updateAppointmentStatus(formData: FormData) {
  await requireCrmAccess();
  const id = uuid.safeParse(formData.get("appointmentId"));
  const status = z.enum(["cancelled", "completed", "no_show"]).safeParse(formData.get("status"));
  const reason = z.string().trim().max(500).safeParse(formData.get("cancellationReason") ?? "");
  if (!id.success || !status.success || !reason.success) redirect(destination("error", "No fue posible validar el resultado de la cita."));
  if (!(await setManagedAppointmentStatus(id.data, status.data, reason.data || null))) {
    redirect(destination("error", "No fue posible cambiar la cita. Confirma que siga programada y que tengas permiso."));
  }
  revalidatePath("/panel/citas");
  redirect(destination("notice", status.data === "cancelled" ? "Cita cancelada; el horario quedó liberado." : "Resultado de la visita registrado."));
}
