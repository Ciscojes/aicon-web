import { createClient } from "@/infrastructure/supabase/server";

import type { OpportunitySummary } from "../domain/opportunity";

type OpportunityRow = {
  condominium_id: string | null;
  contact_id: string;
  created_at: string;
  id: string;
  interest_kind: OpportunitySummary["interestKind"];
  stage: OpportunitySummary["stage"];
  unit_id: string | null;
};

export async function listOpenOpportunities(): Promise<OpportunitySummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select("id, contact_id, unit_id, condominium_id, interest_kind, stage, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (error) throw new Error("No fue posible cargar las oportunidades.");

  const rows = (data ?? []) as OpportunityRow[];
  if (rows.length === 0) return [];
  const contactIds = [...new Set(rows.map((row) => row.contact_id))];
  const unitIds = [...new Set(rows.flatMap((row) => row.unit_id ? [row.unit_id] : []))];

  const [{ data: contacts, error: contactError }, unitResult] = await Promise.all([
    supabase.from("contacts").select("id, name, phone, email").in("id", contactIds),
    unitIds.length > 0
      ? supabase.from("house_units").select("id, code, condominium_id").in("id", unitIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (contactError || unitResult.error) throw new Error("No fue posible cargar el detalle de las oportunidades.");

  const units = unitResult.data ?? [];
  const condominiumIds = [...new Set([
    ...rows.flatMap((row) => row.condominium_id ? [row.condominium_id] : []),
    ...units.map((unit) => unit.condominium_id),
  ])];
  const condominiumResult = condominiumIds.length > 0
    ? await supabase.from("condominiums").select("id, name").in("id", condominiumIds)
    : { data: [], error: null };
  if (condominiumResult.error) throw new Error("No fue posible cargar los intereses de las oportunidades.");

  const contactMap = new Map((contacts ?? []).map((contact) => [contact.id, contact]));
  const unitMap = new Map(units.map((unit) => [unit.id, unit]));
  const condominiumMap = new Map((condominiumResult.data ?? []).map((condominium) => [condominium.id, condominium.name]));

  return rows.flatMap((row) => {
    const contact = contactMap.get(row.contact_id);
    if (!contact) return [];
    const unit = row.unit_id ? unitMap.get(row.unit_id) : null;
    const condominiumId = row.condominium_id ?? unit?.condominium_id ?? null;
    return [{
      condominiumName: condominiumId ? condominiumMap.get(condominiumId) ?? null : null,
      contactEmail: contact.email,
      contactName: contact.name,
      contactPhone: contact.phone,
      createdAt: row.created_at,
      id: row.id,
      interestKind: row.interest_kind,
      stage: row.stage,
      unitCode: unit?.code ?? null,
    }];
  });
}
