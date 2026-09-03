import { createClient } from "@/infrastructure/supabase/server";

import { isFinancialSettings, type FinancialSettings } from "../domain/financial-settings";

export async function getActiveFinancialSettings(): Promise<FinancialSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_active_financial_settings");
  if (error) throw new Error("No fue posible cargar la configuración financiera.");
  return isFinancialSettings(data) ? data : null;
}

export async function getLatestFinancialSettings(): Promise<FinancialSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("app_settings").select("value").eq("category", "financing").order("effective_from", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error("No fue posible cargar la configuración financiera.");
  return isFinancialSettings(data?.value) ? data.value : null;
}

export async function insertFinancialSettings(settings: FinancialSettings, updatedBy: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("app_settings").insert({ category: "financing", updated_by: updatedBy, value: settings });
  if (error) console.error(JSON.stringify({ code: error.code, event: "financial_settings_insert_failed", level: "error" }));
  return !error;
}
