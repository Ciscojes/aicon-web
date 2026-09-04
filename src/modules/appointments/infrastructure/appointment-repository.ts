import { createClient } from "@/infrastructure/supabase/server";
import type { InternalProfile } from "@/modules/users/domain/role";
import type { AdvisorSchedule, AppointmentHistoryEntry, AppointmentSummary, AvailabilityBlock } from "../domain/appointment";

export async function getVisitDurationMinutes(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_visit_duration_minutes");
  if (error) throw new Error("No fue posible cargar la duración de las visitas.");
  return Number(data);
}

export async function saveVisitDurationMinutes(durationMinutes: number, updatedBy: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("app_settings").insert({
    category: "appointments",
    updated_by: updatedBy,
    value: { durationMinutes },
  });
  return !error;
}

export async function listAppointments(): Promise<AppointmentSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("appointments")
    .select("id, opportunity_id, unit_id, advisor_id, starts_at, ends_at, status")
    .order("starts_at", { ascending: false }).limit(100);
  if (error) throw new Error("No fue posible cargar las visitas.");
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const [opportunities, units, advisors, history] = await Promise.all([
    supabase.from("opportunities").select("id, contact_id").in("id", rows.map((row) => row.opportunity_id)),
    supabase.from("house_units").select("id, code, condominium_id").in("id", rows.map((row) => row.unit_id)),
    supabase.from("user_profiles").select("id, name").in("id", rows.map((row) => row.advisor_id)),
    supabase.from("appointment_history")
      .select("id, appointment_id, actor_user_id, action, previous_starts_at, previous_ends_at, previous_status, new_starts_at, new_ends_at, new_status, cancellation_reason, occurred_at")
      .in("appointment_id", rows.map((row) => row.id)).order("occurred_at", { ascending: false }),
  ]);
  if (opportunities.error || units.error || advisors.error || history.error) throw new Error("No fue posible cargar el detalle de las visitas.");
  const contactIds = (opportunities.data ?? []).map((row) => row.contact_id);
  const condominiumIds = (units.data ?? []).map((row) => row.condominium_id);
  const actorIds = [...new Set((history.data ?? []).flatMap((entry) => entry.actor_user_id ? [entry.actor_user_id] : []))];
  const [contacts, condominiums, actors] = await Promise.all([
    supabase.from("contacts").select("id, name, phone, email").in("id", contactIds),
    supabase.from("condominiums").select("id, name").in("id", condominiumIds),
    actorIds.length > 0
      ? supabase.from("user_profiles").select("id, name").in("id", actorIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (contacts.error || condominiums.error || actors.error) throw new Error("No fue posible cargar los contactos de las visitas.");

  const opportunityMap = new Map((opportunities.data ?? []).map((row) => [row.id, row]));
  const unitMap = new Map((units.data ?? []).map((row) => [row.id, row]));
  const advisorMap = new Map((advisors.data ?? []).map((row) => [row.id, row.name]));
  const contactMap = new Map((contacts.data ?? []).map((row) => [row.id, row]));
  const condominiumMap = new Map((condominiums.data ?? []).map((row) => [row.id, row.name]));
  const actorMap = new Map((actors.data ?? []).map((row) => [row.id, row.name]));
  const historyMap = new Map<string, AppointmentHistoryEntry[]>();
  for (const entry of history.data ?? []) {
    const appointmentHistory = historyMap.get(entry.appointment_id) ?? [];
    appointmentHistory.push({
      action: entry.action,
      actorName: entry.actor_user_id ? actorMap.get(entry.actor_user_id) ?? "Usuario interno" : null,
      cancellationReason: entry.cancellation_reason,
      id: entry.id,
      newEndsAt: entry.new_ends_at,
      newStartsAt: entry.new_starts_at,
      newStatus: entry.new_status,
      occurredAt: entry.occurred_at,
      previousEndsAt: entry.previous_ends_at,
      previousStartsAt: entry.previous_starts_at,
      previousStatus: entry.previous_status,
    });
    historyMap.set(entry.appointment_id, appointmentHistory);
  }
  return rows.flatMap((row) => {
    const opportunity = opportunityMap.get(row.opportunity_id);
    const unit = unitMap.get(row.unit_id);
    const contact = opportunity ? contactMap.get(opportunity.contact_id) : null;
    if (!unit || !contact) return [];
    return [{
      advisorName: advisorMap.get(row.advisor_id) ?? "Asesor",
      condominiumName: condominiumMap.get(unit.condominium_id) ?? "Condominio",
      contactEmail: contact.email,
      contactName: contact.name,
      contactPhone: contact.phone,
      endsAt: row.ends_at,
      id: row.id,
      history: historyMap.get(row.id) ?? [],
      opportunityId: row.opportunity_id,
      startsAt: row.starts_at,
      status: row.status,
      unitCode: unit.code,
    }];
  });
}

export async function rescheduleManagedAppointment(id: string, startsAt: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reschedule_appointment", {
    p_appointment_id: id,
    p_starts_at: startsAt,
  });
  if (error) console.error(JSON.stringify({ code: error.code, event: "appointment_reschedule_failed", level: "error" }));
  return !error;
}

export async function setManagedAppointmentStatus(
  id: string,
  status: "cancelled" | "completed" | "no_show",
  cancellationReason: string | null,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_appointment_status", {
    p_appointment_id: id,
    p_cancellation_reason: cancellationReason,
    p_status: status,
  });
  if (error) console.error(JSON.stringify({ code: error.code, event: "appointment_status_failed", level: "error" }));
  return !error;
}

export async function listAdvisorSchedules(): Promise<AdvisorSchedule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("advisor_schedules")
    .select("id, advisor_id, weekday, starts_at_local, ends_at_local, active")
    .order("weekday").order("starts_at_local");
  if (error) throw new Error("No fue posible cargar los horarios de asesores.");
  const rows = data ?? [];
  if (rows.length === 0) return [];
  const profiles = await supabase.from("user_profiles").select("id, name").in("id", rows.map((row) => row.advisor_id));
  if (profiles.error) throw new Error("No fue posible cargar los asesores de los horarios.");
  const names = new Map((profiles.data ?? []).map((profile) => [profile.id, profile.name]));
  return rows.map((row) => ({
    active: row.active,
    advisorId: row.advisor_id,
    advisorName: names.get(row.advisor_id) ?? "Asesor",
    endsAtLocal: row.ends_at_local,
    id: row.id,
    startsAtLocal: row.starts_at_local,
    weekday: row.weekday,
  }));
}

export async function listFutureAvailabilityBlocks(): Promise<AvailabilityBlock[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("availability_blocks")
    .select("id, advisor_id, starts_at, ends_at, reason")
    .is("cancelled_at", null).gte("ends_at", new Date().toISOString()).order("starts_at").limit(100);
  if (error) throw new Error("No fue posible cargar los bloqueos de disponibilidad.");
  const rows = data ?? [];
  if (rows.length === 0) return [];
  const profiles = await supabase.from("user_profiles").select("id, name").in("id", rows.map((row) => row.advisor_id));
  if (profiles.error) throw new Error("No fue posible cargar los asesores de los bloqueos.");
  const names = new Map((profiles.data ?? []).map((profile) => [profile.id, profile.name]));
  return rows.map((row) => ({
    advisorId: row.advisor_id,
    advisorName: names.get(row.advisor_id) ?? "Asesor",
    endsAt: row.ends_at,
    id: row.id,
    reason: row.reason,
    startsAt: row.starts_at,
  }));
}

export async function saveAdvisorSchedule(advisorId: string, weekday: number, startsAt: string, endsAt: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_advisor_schedule", {
    p_advisor_id: advisorId, p_ends_at_local: endsAt, p_starts_at_local: startsAt, p_weekday: weekday,
  });
  return !error;
}

export async function setAdvisorScheduleActive(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_advisor_schedule_active", { p_active: active, p_schedule_id: id });
  return !error;
}

export async function createAvailabilityBlock(advisorId: string, startsAt: string, endsAt: string, reason: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_availability_block", {
    p_advisor_id: advisorId, p_ends_at: endsAt, p_reason: reason, p_starts_at: startsAt,
  });
  return !error;
}

export async function cancelAvailabilityBlock(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_availability_block", { p_block_id: id });
  return !error;
}

export function availableAdvisorId(profile: InternalProfile, requested: FormDataEntryValue | null) {
  return profile.role === "advisor" ? profile.id : typeof requested === "string" ? requested : "";
}
