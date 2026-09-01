import { createClient } from "@/infrastructure/supabase/server";

import type { PublicInquiryContext } from "../domain/public-inquiry";

export type PublicInquiryInput = {
  context: PublicInquiryContext;
  email: string;
  message: string;
  name: string;
  phone: string;
};

export async function submitPublicInquiry(input: PublicInquiryInput): Promise<{ errorCode?: string; success: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_public_inquiry", {
    p_condominium_id: input.context.condominiumId,
    p_email: input.email || null,
    p_interest_kind: input.context.interestKind,
    p_message: input.message || null,
    p_name: input.name,
    p_phone: input.phone,
    p_unit_id: input.context.unitId,
  });

  if (!error) return { success: true };
  console.error(JSON.stringify({ code: error.code, event: "public_inquiry_failed", level: "error" }));
  return {
    errorCode: error.message.includes("inquiry_rate_limited") ? "inquiry_rate_limited" : error.code,
    success: false,
  };
}
