import { createClient } from "@/infrastructure/supabase/server";

import type { CondominiumDraft } from "../application/validate-condominium-draft";
import type {
  CondominiumDetails,
  CondominiumPublicationStatus,
  CondominiumSummary,
} from "../domain/condominium";

type CondominiumRow = {
  address: string;
  created_at: string;
  description?: string;
  id: string;
  name: string;
  publication_status: CondominiumPublicationStatus;
  published_at?: string | null;
  slug: string;
};

type CondominiumMutationResult = { errorCode?: string; success: boolean };

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
): Promise<CondominiumMutationResult> {
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

export async function getCondominium(
  id: string,
): Promise<CondominiumDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("condominiums")
    .select(
      "id, name, slug, description, address, publication_status, published_at, created_at",
    )
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    console.error(
      JSON.stringify({
        code: error.code,
        event: "condominium_get_failed",
        level: "error",
      }),
    );
    throw new Error("No fue posible cargar el condominio.");
  }

  if (!data) return null;
  const row = data as CondominiumRow;

  return {
    address: row.address,
    createdAt: row.created_at,
    description: row.description ?? "",
    id: row.id,
    name: row.name,
    publicationStatus: row.publication_status,
    publishedAt: row.published_at ?? null,
    slug: row.slug,
  };
}

async function runCondominiumUpdate(
  id: string,
  values: Record<string, unknown>,
  event: string,
): Promise<CondominiumMutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("condominiums")
    .update(values)
    .eq("id", id)
    .is("archived_at", null);

  if (!error) return { success: true };

  console.error(
    JSON.stringify({ code: error.code, event, level: "error" }),
  );
  return { errorCode: error.code, success: false };
}

export function updateCondominium(
  id: string,
  draft: CondominiumDraft,
): Promise<CondominiumMutationResult> {
  return runCondominiumUpdate(
    id,
    {
      address: draft.address,
      description: draft.description,
      name: draft.name,
      slug: draft.slug,
    },
    "condominium_update_failed",
  );
}

export function setCondominiumPublicationStatus(
  id: string,
  status: "hidden" | "published",
): Promise<CondominiumMutationResult> {
  return runCondominiumUpdate(
    id,
    {
      publication_status: status,
      ...(status === "published" ? { published_at: new Date().toISOString() } : {}),
    },
    "condominium_status_update_failed",
  );
}

export function archiveCondominium(
  id: string,
): Promise<CondominiumMutationResult> {
  return runCondominiumUpdate(
    id,
    {
      archived_at: new Date().toISOString(),
      publication_status: "hidden",
    },
    "condominium_archive_failed",
  );
}
