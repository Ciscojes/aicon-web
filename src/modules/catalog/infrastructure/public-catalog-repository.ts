import { createClient } from "@/infrastructure/supabase/server";

import type { UnitAvailabilityStatus } from "../domain/house-unit";
import type { PublicCondominium, PublicProperty } from "../domain/public-property";

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
};

type ModelRow = {
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

const numberOrNull = (value: number | string | null) => value === null ? null : Number(value);
const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export async function listPublicCondominiums(): Promise<PublicCondominium[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("condominiums").select("id, slug, name, description, address").eq("publication_status", "published").is("archived_at", null).order("name");
  if (error) throw new Error("No fue posible cargar los condominios públicos.");
  return data ?? [];
}

export async function listPublicProperties(): Promise<PublicProperty[]> {
  const supabase = await createClient();
  const [{ data: units, error: unitError }, { data: condominiums, error: condominiumError }, { data: models, error: modelError }] = await Promise.all([
    supabase.from("house_units").select("id, condominium_id, model_id, code, price_usd, availability_status, description_override, bedrooms_override, bathrooms_override, parking_spaces_override, construction_area_m2_override, land_area_m2_override, features_override").eq("publication_status", "published").is("archived_at", null).order("price_usd"),
    supabase.from("condominiums").select("id, slug, name, description, address").eq("publication_status", "published").is("archived_at", null),
    supabase.from("house_models").select("id, name, description, bedrooms, bathrooms, parking_spaces, construction_area_m2, land_area_m2, features"),
  ]);
  if (unitError || condominiumError || modelError) throw new Error("No fue posible cargar el catálogo público.");
  const condominiumMap = new Map((condominiums ?? []).map((item) => [item.id, item as PublicCondominium]));
  const modelMap = new Map(((models ?? []) as ModelRow[]).map((item) => [item.id, item]));
  return ((units ?? []) as UnitRow[]).flatMap((unit) => {
    const condominium = condominiumMap.get(unit.condominium_id);
    if (!condominium) return [];
    const model = unit.model_id ? modelMap.get(unit.model_id) : undefined;
    return [{
      availabilityStatus: unit.availability_status,
      bathrooms: numberOrNull(unit.bathrooms_override) ?? numberOrNull(model?.bathrooms ?? null),
      bedrooms: unit.bedrooms_override ?? model?.bedrooms ?? null,
      code: unit.code,
      condominium,
      constructionAreaM2: numberOrNull(unit.construction_area_m2_override) ?? numberOrNull(model?.construction_area_m2 ?? null),
      description: unit.description_override || model?.description || condominium.description,
      features: unit.features_override === null ? strings(model?.features) : strings(unit.features_override),
      id: unit.id,
      landAreaM2: numberOrNull(unit.land_area_m2_override) ?? numberOrNull(model?.land_area_m2 ?? null),
      modelName: model?.name ?? null,
      parkingSpaces: unit.parking_spaces_override ?? model?.parking_spaces ?? null,
      priceUsd: Number(unit.price_usd),
    }];
  });
}

export async function getPublicProperty(id: string): Promise<PublicProperty | null> {
  const properties = await listPublicProperties();
  return properties.find((property) => property.id === id) ?? null;
}
