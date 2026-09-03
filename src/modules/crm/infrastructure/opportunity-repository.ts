import { createClient } from "@/infrastructure/supabase/server";

import type { OpportunityDetails, OpportunitySummary } from "../domain/opportunity";

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

  const [{ data: contacts, error: contactError }, unitResult, quoteResult] = await Promise.all([
    supabase.from("contacts").select("id, name, phone, email").in("id", contactIds),
    unitIds.length > 0
      ? supabase.from("house_units").select("id, code, condominium_id").in("id", unitIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("quotes").select("opportunity_id, down_payment_usd, annual_rate, term_months, estimated_monthly_payment_usd, created_at").in("opportunity_id", rows.map((row) => row.id)).order("created_at", { ascending: false }),
  ]);
  if (contactError || unitResult.error || quoteResult.error) throw new Error("No fue posible cargar el detalle de las oportunidades.");

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
  const quoteMap = new Map<string, NonNullable<typeof quoteResult.data>[number]>();
  for (const quote of quoteResult.data ?? []) {
    if (!quoteMap.has(quote.opportunity_id)) quoteMap.set(quote.opportunity_id, quote);
  }

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
      latestQuote: quoteMap.has(row.id) ? {
        annualRatePct: Number(quoteMap.get(row.id)?.annual_rate),
        downPaymentUsd: Number(quoteMap.get(row.id)?.down_payment_usd),
        monthlyPaymentUsd: Number(quoteMap.get(row.id)?.estimated_monthly_payment_usd),
        termMonths: Number(quoteMap.get(row.id)?.term_months),
      } : null,
      stage: row.stage,
      unitCode: unit?.code ?? null,
    }];
  });
}

export async function getOpportunity(id: string): Promise<OpportunityDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select("id, contact_id, unit_id, condominium_id, advisor_id, interest_kind, stage, status, source, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("No fue posible cargar la oportunidad.");
  if (!data) return null;

  const [contactResult, activityResult, quoteResult, unitResult] = await Promise.all([
    supabase.from("contacts").select("name, phone, email, email_consent, whatsapp_consent").eq("id", data.contact_id).single(),
    supabase.from("activities").select("id, actor_user_id, type, content, occurred_at").eq("opportunity_id", id).order("occurred_at", { ascending: false }),
    supabase.from("quotes").select("id, price_snapshot_usd, down_payment_usd, financed_amount_usd, annual_rate, term_months, estimated_monthly_payment_usd, created_at").eq("opportunity_id", id).order("created_at", { ascending: false }),
    data.unit_id ? supabase.from("house_units").select("code, condominium_id").eq("id", data.unit_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  if (contactResult.error || activityResult.error || quoteResult.error || unitResult.error) throw new Error("No fue posible cargar el detalle comercial.");

  const condominiumId = data.condominium_id ?? unitResult.data?.condominium_id ?? null;
  const actorIds = [...new Set((activityResult.data ?? []).flatMap((activity) => activity.actor_user_id ? [activity.actor_user_id] : []))];
  const [condominiumResult, profileResult] = await Promise.all([
    condominiumId ? supabase.from("condominiums").select("name").eq("id", condominiumId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    data.advisor_id || actorIds.length > 0
      ? supabase.from("user_profiles").select("id, name").in("id", [...new Set([...actorIds, ...(data.advisor_id ? [data.advisor_id] : [])])])
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (condominiumResult.error || profileResult.error) throw new Error("No fue posible cargar las referencias comerciales.");

  const profileMap = new Map((profileResult.data ?? []).map((profile) => [profile.id, profile.name]));
  const latestQuote = quoteResult.data?.[0];
  return {
    activities: (activityResult.data ?? []).map((activity) => ({
      actorName: activity.actor_user_id ? profileMap.get(activity.actor_user_id) ?? "Usuario interno" : null,
      content: activity.content,
      id: activity.id,
      occurredAt: activity.occurred_at,
      type: activity.type,
    })),
    advisorName: data.advisor_id ? profileMap.get(data.advisor_id) ?? "Asesor" : null,
    condominiumName: condominiumResult.data?.name ?? null,
    contactEmail: contactResult.data.email,
    contactEmailConsent: contactResult.data.email_consent,
    contactName: contactResult.data.name,
    contactPhone: contactResult.data.phone,
    contactWhatsappConsent: contactResult.data.whatsapp_consent,
    createdAt: data.created_at,
    id: data.id,
    interestKind: data.interest_kind,
    latestQuote: latestQuote ? {
      annualRatePct: Number(latestQuote.annual_rate),
      downPaymentUsd: Number(latestQuote.down_payment_usd),
      monthlyPaymentUsd: Number(latestQuote.estimated_monthly_payment_usd),
      termMonths: Number(latestQuote.term_months),
    } : null,
    quotes: (quoteResult.data ?? []).map((quote) => ({
      annualRatePct: Number(quote.annual_rate),
      createdAt: quote.created_at,
      downPaymentUsd: Number(quote.down_payment_usd),
      estimatedMonthlyPaymentUsd: Number(quote.estimated_monthly_payment_usd),
      financedAmountUsd: Number(quote.financed_amount_usd),
      id: quote.id,
      priceSnapshotUsd: Number(quote.price_snapshot_usd),
      termMonths: quote.term_months,
    })),
    source: data.source,
    stage: data.stage,
    status: data.status,
    unitCode: unitResult.data?.code ?? null,
  };
}

export async function addOpportunityNote(id: string, content: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_opportunity_note", { p_content: content, p_opportunity_id: id });
  if (error) console.error(JSON.stringify({ code: error.code, event: "opportunity_note_failed", level: "error" }));
  return !error;
}

export async function changeOpportunityStage(id: string, stage: OpportunitySummary["stage"]): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("change_opportunity_stage", { p_opportunity_id: id, p_stage: stage });
  if (error) console.error(JSON.stringify({ code: error.code, event: "opportunity_stage_failed", level: "error" }));
  return !error;
}
