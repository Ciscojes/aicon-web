import { createClient } from "@/infrastructure/supabase/server";

import type { HouseUnitDraft } from "../application/validate-house-unit";
import type {
  HouseUnitDetails,
  HouseUnitSummary,
  UnitAvailabilityStatus,
  UnitCondominiumOption,
  UnitModelOption,
  UnitPublicationStatus,
} from "../domain/house-unit";

type UnitRow = {
  availability_status: UnitAvailabilityStatus;
  bathrooms_override: number | string | null;
  bedrooms_override: number | null;
  code: string;
  condominium_id: string;
  construction_area_m2_override: number | string | null;
  description_override: string | null;
  features_override: unknown;
  id: string;
  land_area_m2_override: number | string | null;
  model_id: string | null;
  parking_spaces_override: number | null;
  price_usd: number | string;
  publication_status: UnitPublicationStatus;
  published_at: string | null;
};

type MutationResult = { errorCode?: string; success: boolean };
const numberOrNull = (value: number | string | null) => value === null ? null : Number(value);

async function catalogNames() {
  const supabase = await createClient();
  const [{ data: condominiums, error: condominiumError }, { data: models, error: modelError }] = await Promise.all([
    supabase.from("condominiums").select("id, name").is("archived_at", null),
    supabase.from("house_models").select("id, name"),
  ]);
  if (condominiumError || modelError) throw new Error("No fue posible cargar las referencias del catálogo.");
  return {
    condominiums: new Map((condominiums ?? []).map((item) => [item.id, item.name])),
    models: new Map((models ?? []).map((item) => [item.id, item.name])),
  };
}

export async function listHouseUnits(): Promise<HouseUnitSummary[]> {
  const supabase = await createClient();
  const [{ data, error }, names] = await Promise.all([
    supabase.from("house_units").select("id, condominium_id, model_id, code, price_usd, availability_status, publication_status").is("archived_at", null).order("created_at", { ascending: false }),
    catalogNames(),
  ]);
  if (error) throw new Error("No fue posible cargar las unidades.");
  return ((data ?? []) as UnitRow[]).map((row) => ({
    availabilityStatus: row.availability_status,
    code: row.code,
    condominiumName: names.condominiums.get(row.condominium_id) ?? "Condominio no disponible",
    id: row.id,
    modelName: row.model_id ? names.models.get(row.model_id) ?? "Modelo no disponible" : null,
    priceUsd: Number(row.price_usd),
    publicationStatus: row.publication_status,
  }));
}

export async function getHouseUnit(id: string): Promise<HouseUnitDetails | null> {
  const supabase = await createClient();
  const [{ data, error }, names] = await Promise.all([
    supabase.from("house_units").select("id, condominium_id, model_id, code, price_usd, availability_status, publication_status, description_override, bedrooms_override, bathrooms_override, parking_spaces_override, construction_area_m2_override, land_area_m2_override, features_override, published_at").eq("id", id).is("archived_at", null).maybeSingle(),
    catalogNames(),
  ]);
  if (error) throw new Error("No fue posible cargar la unidad.");
  if (!data) return null;
  const row = data as UnitRow;
  return {
    availabilityStatus: row.availability_status,
    bathroomsOverride: numberOrNull(row.bathrooms_override),
    bedroomsOverride: row.bedrooms_override,
    code: row.code,
    condominiumId: row.condominium_id,
    condominiumName: names.condominiums.get(row.condominium_id) ?? "Condominio no disponible",
    constructionAreaM2Override: numberOrNull(row.construction_area_m2_override),
    descriptionOverride: row.description_override ?? "",
    featuresOverride: Array.isArray(row.features_override) ? row.features_override.filter((item): item is string => typeof item === "string") : [],
    id: row.id,
    landAreaM2Override: numberOrNull(row.land_area_m2_override),
    modelId: row.model_id,
    modelName: row.model_id ? names.models.get(row.model_id) ?? "Modelo no disponible" : null,
    parkingSpacesOverride: row.parking_spaces_override,
    priceUsd: Number(row.price_usd),
    publicationStatus: row.publication_status,
    publishedAt: row.published_at,
  };
}

export async function listHouseUnitOptions(): Promise<{ condominiums: UnitCondominiumOption[]; models: UnitModelOption[] }> {
  const supabase = await createClient();
  const [{ data: condominiums, error: condominiumError }, { data: houseModels, error: modelError }, { data: assignments, error: assignmentError }] = await Promise.all([
    supabase.from("condominiums").select("id, name, publication_status").is("archived_at", null).order("name"),
    supabase.from("house_models").select("id, name").is("archived_at", null).order("name"),
    supabase.from("condominium_models").select("condominium_id, model_id").eq("active", true),
  ]);
  if (condominiumError || modelError || assignmentError) throw new Error("No fue posible cargar los condominios y modelos.");
  const condominiumIds = new Set((condominiums ?? []).map((item) => item.id));
  const modelNames = new Map((houseModels ?? []).map((item) => [item.id, item.name]));
  return {
    condominiums: (condominiums ?? []).map((item) => ({ id: item.id, name: item.name, publicationStatus: item.publication_status })),
    models: (assignments ?? []).flatMap((item) => {
      const name = modelNames.get(item.model_id);
      return name && condominiumIds.has(item.condominium_id) ? [{ condominiumId: item.condominium_id, id: item.model_id, name }] : [];
    }),
  };
}

function draftRow(draft: HouseUnitDraft) {
  return {
    availability_status: draft.availabilityStatus,
    bathrooms_override: draft.bathroomsOverride,
    bedrooms_override: draft.bedroomsOverride,
    code: draft.code,
    condominium_id: draft.condominiumId,
    construction_area_m2_override: draft.constructionAreaM2Override,
    description_override: draft.descriptionOverride || null,
    features_override: draft.featuresOverride.length > 0 ? draft.featuresOverride : null,
    land_area_m2_override: draft.landAreaM2Override,
    model_id: draft.modelId,
    parking_spaces_override: draft.parkingSpacesOverride,
    price_usd: draft.priceUsd,
  };
}

async function assignmentIsActive(draft: HouseUnitDraft, unitId?: string) {
  if (!draft.modelId) return true;
  const supabase = await createClient();
  if (unitId) {
    const { data: current } = await supabase.from("house_units").select("condominium_id, model_id").eq("id", unitId).is("archived_at", null).maybeSingle();
    if (current?.condominium_id === draft.condominiumId && current.model_id === draft.modelId) return true;
  }
  const { data, error } = await supabase.from("condominium_models").select("active").eq("condominium_id", draft.condominiumId).eq("model_id", draft.modelId).eq("active", true).maybeSingle();
  return !error && Boolean(data);
}

export async function insertHouseUnit(draft: HouseUnitDraft): Promise<MutationResult & { id?: string }> {
  if (!(await assignmentIsActive(draft))) return { errorCode: "inactive_model_assignment", success: false };
  const supabase = await createClient();
  const { data, error } = await supabase.from("house_units").insert({ ...draftRow(draft), publication_status: "draft" }).select("id").single();
  if (!error) return { id: data.id, success: true };
  console.error(JSON.stringify({ code: error.code, event: "house_unit_insert_failed", level: "error" }));
  return { errorCode: error.code, success: false };
}

export async function updateHouseUnit(id: string, draft: HouseUnitDraft): Promise<MutationResult> {
  if (!(await assignmentIsActive(draft, id))) return { errorCode: "inactive_model_assignment", success: false };
  const supabase = await createClient();
  const { error } = await supabase.from("house_units").update(draftRow(draft)).eq("id", id).is("archived_at", null);
  if (!error) return { success: true };
  console.error(JSON.stringify({ code: error.code, event: "house_unit_update_failed", level: "error" }));
  return { errorCode: error.code, success: false };
}

async function updateState(id: string, values: Record<string, unknown>, event: string): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("house_units").update(values).eq("id", id).is("archived_at", null);
  if (!error) return { success: true };
  console.error(JSON.stringify({ code: error.code, event, level: "error" }));
  return { errorCode: error.code, success: false };
}

export function setHouseUnitPublicationStatus(id: string, status: "hidden" | "published") {
  return updateState(id, { publication_status: status, ...(status === "published" ? { published_at: new Date().toISOString() } : {}) }, "house_unit_status_failed");
}

export function archiveHouseUnit(id: string) {
  return updateState(id, { archived_at: new Date().toISOString(), publication_status: "hidden" }, "house_unit_archive_failed");
}
