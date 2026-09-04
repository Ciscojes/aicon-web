import { createClient } from "@/infrastructure/supabase/server";
import type { VisitSlot } from "../domain/appointment";

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
