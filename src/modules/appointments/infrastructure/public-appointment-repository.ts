import { createClient } from "@/infrastructure/supabase/server";
import type { PublicAppointmentAccess, VisitSlot } from "../domain/appointment";

export async function getPublicAppointmentAccess(token: string): Promise<PublicAppointmentAccess | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_appointment_access", { p_token: token });
  if (error || !data?.[0]) return null;
  const appointment = data[0];
  return {
    appointmentId: appointment.appointment_id,
    condominiumName: appointment.condominium_name,
    contactName: appointment.contact_name,
    endsAt: appointment.ends_at,
    expiresAt: appointment.expires_at,
    startsAt: appointment.starts_at,
    status: appointment.status,
    unitCode: appointment.unit_code,
  };
}

export async function listPublicAppointmentRescheduleSlots(token: string, date: string): Promise<VisitSlot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_appointment_reschedule_slots", {
    p_date: date,
    p_token: token,
  });
  if (error) return [];
  return (data ?? []).map((slot: { ends_at: string; starts_at: string }) => ({
    endsAt: slot.ends_at,
    startsAt: slot.starts_at,
  }));
}

export async function cancelPublicAppointmentWithToken(token: string, reason: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_appointment_with_access_link", {
    p_reason: reason || null,
    p_token: token,
  });
  return !error;
}

export async function requestPublicAppointmentReschedule(token: string, startsAt: string, message: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_appointment_reschedule_with_access_link", {
    p_message: message || null,
    p_requested_starts_at: startsAt,
    p_token: token,
  });
  return !error;
}

export async function listPublicVisitSlots(unitId: string, date: string): Promise<VisitSlot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_available_visit_slots", { p_date: date, p_unit_id: unitId });
  if (error) throw new Error("No fue posible cargar los horarios disponibles.");
  return (data ?? []).map((slot: { ends_at: string; starts_at: string }) => ({
    endsAt: slot.ends_at,
    startsAt: slot.starts_at,
  }));
}

export async function submitPublicVisitAppointment(input: {
  communicationsConsent: boolean;
  email: string;
  name: string;
  phone: string;
  startsAt: string;
  unitId: string;
}): Promise<{ appointmentId?: string; errorCode?: string; success: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_visit_appointment", {
    p_communications_consent: input.communicationsConsent,
    p_email: input.email,
    p_name: input.name,
    p_phone: input.phone,
    p_starts_at: input.startsAt,
    p_unit_id: input.unitId,
  });
  if (error) {
    console.error(JSON.stringify({ code: error.code, event: "public_appointment_failed", level: "error" }));
    return { errorCode: error.message, success: false };
  }
  return { appointmentId: data, success: true };
}
