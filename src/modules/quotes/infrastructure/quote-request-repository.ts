import { createClient } from "@/infrastructure/supabase/server";

export async function submitQuoteRequest(input: {
  downPaymentPct: number;
  email: string;
  name: string;
  phone: string;
  termYears: number;
  unitId: string;
}): Promise<{ errorCode?: string; success: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_quote_request", {
    p_down_payment_pct: input.downPaymentPct,
    p_email: input.email || null,
    p_name: input.name,
    p_phone: input.phone,
    p_term_years: input.termYears,
    p_unit_id: input.unitId,
  });
  if (!error) return { success: true };
  console.error(JSON.stringify({ code: error.code, event: "quote_request_failed", level: "error" }));
  const known = ["quote_rate_limited", "financing_not_configured", "invalid_financing_option", "unit_not_available_for_quote"]
    .find((code) => error.message.includes(code));
  return { errorCode: known ?? error.code, success: false };
}
