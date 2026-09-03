import { createClient } from "@/infrastructure/supabase/server";

import type { PanelSummary } from "../domain/panel-summary";

export async function getPanelSummary(includeCrm: boolean): Promise<PanelSummary> {
  const supabase = await createClient();
  const unitCount = (status: "available" | "reserved" | "sold") => supabase
    .from("house_units")
    .select("id", { count: "exact", head: true })
    .is("archived_at", null)
    .eq("availability_status", status);
  const skippedCrm = Promise.resolve({ count: null, error: null });
  const [available, reserved, sold, newOpportunities, unassigned] = await Promise.all([
    unitCount("available"),
    unitCount("reserved"),
    unitCount("sold"),
    includeCrm
      ? supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("status", "open").eq("stage", "new")
      : skippedCrm,
    includeCrm
      ? supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("status", "open").is("advisor_id", null)
      : skippedCrm,
  ]);
  if (available.error || reserved.error || sold.error || newOpportunities.error || unassigned.error) {
    throw new Error("No fue posible cargar el resumen administrativo.");
  }

  return {
    availableUnits: available.count ?? 0,
    newOpportunities: includeCrm ? newOpportunities.count ?? 0 : null,
    reservedUnits: reserved.count ?? 0,
    soldUnits: sold.count ?? 0,
    unassignedOpportunities: includeCrm ? unassigned.count ?? 0 : null,
  };
}
