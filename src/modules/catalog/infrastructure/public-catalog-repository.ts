import { createClient } from "@/infrastructure/supabase/server";

import type { UnitAvailabilityStatus } from "../domain/house-unit";
import type { PublicCondominium, PublicCondominiumDetail, PublicImage, PublicProperty } from "../domain/public-property";

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

type PublicMediaRow = {
  display_order: number;
  is_cover: boolean;
  media_assets: { alt_text: string; storage_path: string };
};

const bucket = "property-media";
function mediaByEntity(rows: unknown[], entityColumn: string, publicUrl: (path: string) => string) {
  const result = new Map<string, PublicImage[]>();
  for (const raw of rows as Array<PublicMediaRow & Record<string, string>>) {
    const entityId = raw[entityColumn];
    const current = result.get(entityId) ?? [];
    const image = { altText: raw.media_assets.alt_text, url: publicUrl(raw.media_assets.storage_path) };
    if (raw.is_cover) current.unshift(image); else current.push(image);
    result.set(entityId, current);
  }
  return result;
}

const numberOrNull = (value: number | string | null) => value === null ? null : Number(value);
const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export async function listPublicCondominiums(): Promise<PublicCondominium[]> {
  const supabase = await createClient();
  const [{ data, error }, { data: media, error: mediaError }] = await Promise.all([
    supabase.from("condominiums").select("id, slug, name, description, address").eq("publication_status", "published").is("archived_at", null).order("name"),
    supabase.from("condominium_media").select("condominium_id, display_order, is_cover, media_assets!inner(alt_text, storage_path)").order("display_order"),
  ]);
  if (error || mediaError) throw new Error("No fue posible cargar los condominios públicos.");
  const getUrl = (path: string) => supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  const mediaMap = mediaByEntity(media ?? [], "condominium_id", getUrl);
  return (data ?? []).map((item) => {
    const images = mediaMap.get(item.id) ?? [];
    return { ...item, coverImage: images[0] ?? null, images };
  });
}

export async function listPublicProperties(): Promise<PublicProperty[]> {
  const supabase = await createClient();
  const [{ data: units, error: unitError }, { data: condominiums, error: condominiumError }, { data: models, error: modelError }, { data: unitMedia, error: unitMediaError }, { data: modelMedia, error: modelMediaError }, { data: condominiumMedia, error: condominiumMediaError }] = await Promise.all([
    supabase.from("house_units").select("id, condominium_id, model_id, code, price_usd, availability_status, description_override, bedrooms_override, bathrooms_override, parking_spaces_override, construction_area_m2_override, land_area_m2_override, features_override").eq("publication_status", "published").is("archived_at", null).order("price_usd"),
    supabase.from("condominiums").select("id, slug, name, description, address").eq("publication_status", "published").is("archived_at", null),
    supabase.from("house_models").select("id, name, description, bedrooms, bathrooms, parking_spaces, construction_area_m2, land_area_m2, features"),
    supabase.from("unit_media").select("unit_id, display_order, is_cover, media_assets!inner(alt_text, storage_path)").order("display_order"),
    supabase.from("model_media").select("model_id, display_order, is_cover, media_assets!inner(alt_text, storage_path)").order("display_order"),
    supabase.from("condominium_media").select("condominium_id, display_order, is_cover, media_assets!inner(alt_text, storage_path)").order("display_order"),
  ]);
  if (unitError || condominiumError || modelError || unitMediaError || modelMediaError || condominiumMediaError) throw new Error("No fue posible cargar el catálogo público.");
  const getUrl = (path: string) => supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  const unitMediaMap = mediaByEntity(unitMedia ?? [], "unit_id", getUrl);
  const modelMediaMap = mediaByEntity(modelMedia ?? [], "model_id", getUrl);
  const condominiumMediaMap = mediaByEntity(condominiumMedia ?? [], "condominium_id", getUrl);
  const condominiumMap = new Map((condominiums ?? []).map((item) => {
    const images = condominiumMediaMap.get(item.id) ?? [];
    return [item.id, { ...item, coverImage: images[0] ?? null, images } as PublicCondominium];
  }));
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
      images: unitMediaMap.get(unit.id) ?? (unit.model_id ? modelMediaMap.get(unit.model_id) : undefined) ?? condominiumMediaMap.get(unit.condominium_id) ?? [],
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

export async function getPublicCondominium(slug: string): Promise<PublicCondominiumDetail | null> {
  const [condominiums, properties] = await Promise.all([
    listPublicCondominiums(),
    listPublicProperties(),
  ]);
  const condominium = condominiums.find((item) => item.slug === slug);
  if (!condominium) return null;
  return {
    condominium,
    properties: properties.filter((property) => property.condominium.id === condominium.id),
  };
}
