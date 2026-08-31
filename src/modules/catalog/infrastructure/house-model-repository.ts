import { createClient } from "@/infrastructure/supabase/server";

import type { HouseModelDraft } from "../application/validate-house-model";
import type { HouseModelDetails, HouseModelSummary } from "../domain/house-model";

type HouseModelRow = {
  bathrooms: number | string | null;
  bedrooms: number | null;
  construction_area_m2: number | string | null;
  description: string;
  features: unknown;
  id: string;
  land_area_m2: number | string | null;
  name: string;
  parking_spaces: number | null;
};

type MutationResult = { errorCode?: string; id?: string; success: boolean };

const toOptionalNumber = (value: number | string | null) =>
  value === null ? null : Number(value);

export async function listHouseModels(): Promise<HouseModelSummary[]> {
  const supabase = await createClient();
  const [{ data, error }, { data: assignments, error: assignmentError }] =
    await Promise.all([
      supabase
        .from("house_models")
        .select(
          "id, name, bedrooms, bathrooms, parking_spaces, construction_area_m2",
        )
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("condominium_models")
        .select("model_id")
        .eq("active", true),
    ]);

  if (error || assignmentError) {
    console.error(
      JSON.stringify({
        code: error?.code ?? assignmentError?.code,
        event: "house_models_list_failed",
        level: "error",
      }),
    );
    throw new Error("No fue posible cargar los modelos.");
  }

  const counts = new Map<string, number>();
  for (const assignment of assignments ?? []) {
    counts.set(assignment.model_id, (counts.get(assignment.model_id) ?? 0) + 1);
  }

  return ((data ?? []) as HouseModelRow[]).map((row) => ({
    bathrooms: toOptionalNumber(row.bathrooms),
    bedrooms: row.bedrooms,
    condominiumCount: counts.get(row.id) ?? 0,
    constructionAreaM2: toOptionalNumber(row.construction_area_m2),
    id: row.id,
    name: row.name,
    parkingSpaces: row.parking_spaces,
  }));
}

export async function getHouseModel(id: string): Promise<HouseModelDetails | null> {
  const supabase = await createClient();
  const [{ data, error }, { data: assignments, error: assignmentError }] =
    await Promise.all([
      supabase
        .from("house_models")
        .select(
          "id, name, description, bedrooms, bathrooms, parking_spaces, construction_area_m2, land_area_m2, features",
        )
        .eq("id", id)
        .is("archived_at", null)
        .maybeSingle(),
      supabase
        .from("condominium_models")
        .select("condominium_id")
        .eq("model_id", id)
        .eq("active", true),
    ]);

  if (error || assignmentError) {
    console.error(
      JSON.stringify({
        code: error?.code ?? assignmentError?.code,
        event: "house_model_get_failed",
        level: "error",
      }),
    );
    throw new Error("No fue posible cargar el modelo.");
  }

  if (!data) return null;
  const row = data as HouseModelRow;
  const features = Array.isArray(row.features)
    ? row.features.filter((item): item is string => typeof item === "string")
    : [];

  return {
    assignedCondominiumIds: (assignments ?? []).map((item) => item.condominium_id),
    bathrooms: toOptionalNumber(row.bathrooms),
    bedrooms: row.bedrooms,
    condominiumCount: assignments?.length ?? 0,
    constructionAreaM2: toOptionalNumber(row.construction_area_m2),
    description: row.description,
    features,
    id: row.id,
    landAreaM2: toOptionalNumber(row.land_area_m2),
    name: row.name,
    parkingSpaces: row.parking_spaces,
  };
}

function draftToRow(draft: HouseModelDraft) {
  return {
    bathrooms: draft.bathrooms,
    bedrooms: draft.bedrooms,
    construction_area_m2: draft.constructionAreaM2,
    description: draft.description,
    features: draft.features,
    land_area_m2: draft.landAreaM2,
    name: draft.name,
    parking_spaces: draft.parkingSpaces,
  };
}

export async function insertHouseModel(
  draft: HouseModelDraft,
): Promise<MutationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("house_models")
    .insert(draftToRow(draft))
    .select("id")
    .single();

  if (!error) return { id: data.id, success: true };
  console.error(
    JSON.stringify({ code: error.code, event: "house_model_insert_failed", level: "error" }),
  );
  return { errorCode: error.code, success: false };
}

export async function updateHouseModel(
  id: string,
  draft: HouseModelDraft,
): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("house_models")
    .update(draftToRow(draft))
    .eq("id", id)
    .is("archived_at", null);

  if (!error) return { success: true };
  console.error(
    JSON.stringify({ code: error.code, event: "house_model_update_failed", level: "error" }),
  );
  return { errorCode: error.code, success: false };
}

export async function syncHouseModelAssignments(
  id: string,
  condominiumIds: string[],
): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("sync_condominium_model_assignments", {
    target_condominium_ids: condominiumIds,
    target_model_id: id,
  });

  if (!error) return { success: true };
  console.error(
    JSON.stringify({ code: error.code, event: "model_assignments_sync_failed", level: "error" }),
  );
  return { errorCode: error.code, success: false };
}

export async function archiveHouseModel(id: string): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("archive_house_model", {
    target_model_id: id,
  });

  if (!error) return { success: true };
  console.error(
    JSON.stringify({ code: error.code, event: "house_model_archive_failed", level: "error" }),
  );
  return { errorCode: error.code, success: false };
}
