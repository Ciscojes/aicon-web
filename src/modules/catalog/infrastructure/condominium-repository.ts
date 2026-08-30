import { createClient } from "@/infrastructure/supabase/server";

import type { CondominiumDraft } from "../application/validate-condominium-draft";
import type {
  CondominiumPublicationStatus,
  CondominiumSummary,
} from "../domain/condominium";

type CondominiumRow = {
  address: string;
  created_at: string;
  id: string;
  name: string;
  publication_status: CondominiumPublicationStatus;
  slug: string;
};

export async function listCondominiums(): Promise<CondominiumSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("condominiums")
    .select("id, name, slug, address, publication_status, created_at")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      JSON.stringify({
        code: error.code,
        event: "condominiums_list_failed",
        level: "error",
      }),
    );
    throw new Error("No fue posible cargar los condominios.");
  }

  return ((data ?? []) as CondominiumRow[]).map((row) => ({
    address: row.address,
    createdAt: row.created_at,
    id: row.id,
    name: row.name,
    publicationStatus: row.publication_status,
    slug: row.slug,
  }));
}

export async function insertCondominiumDraft(
  draft: CondominiumDraft,
): Promise<{ errorCode?: string; success: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.from("condominiums").insert({
    address: draft.address,
    description: draft.description,
    name: draft.name,
    publication_status: "draft",
    slug: draft.slug,
  });

  if (!error) return { success: true };

  console.error(
    JSON.stringify({
      code: error.code,
      event: "condominium_insert_failed",
      level: "error",
    }),
  );

  return { errorCode: error.code, success: false };
}
