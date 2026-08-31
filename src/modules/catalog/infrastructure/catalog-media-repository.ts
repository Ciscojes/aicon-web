import { createClient } from "@/infrastructure/supabase/server";

import { catalogMediaRules, type CatalogMediaAsset, type CatalogMediaEntityType } from "../domain/catalog-media";

const bucket = "property-media";
const relationships = {
  condominium: { entityColumn: "condominium_id", table: "condominium_media" },
  model: { entityColumn: "model_id", table: "model_media" },
  unit: { entityColumn: "unit_id", table: "unit_media" },
} as const;

type MediaRelationRow = {
  display_order: number;
  is_cover: boolean;
  media_assets: {
    alt_text: string;
    id: string;
    mime_type: string;
    size_bytes: number | string;
    storage_path: string;
  };
};

type MutationResult = { errorCode?: string; success: boolean };

function publicUrl(supabase: Awaited<ReturnType<typeof createClient>>, storagePath: string) {
  return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

export async function listCatalogMedia(entityType: CatalogMediaEntityType, entityId: string): Promise<CatalogMediaAsset[]> {
  const supabase = await createClient();
  const relationship = relationships[entityType];
  const { data, error } = await supabase
    .from(relationship.table)
    .select("display_order, is_cover, media_assets!inner(id, storage_path, alt_text, mime_type, size_bytes)")
    .eq(relationship.entityColumn, entityId)
    .order("display_order");
  if (error) throw new Error("No fue posible cargar las fotografías.");
  return ((data ?? []) as unknown as MediaRelationRow[]).map((row) => ({
    altText: row.media_assets.alt_text,
    displayOrder: row.display_order,
    id: row.media_assets.id,
    isCover: row.is_cover,
    mimeType: row.media_assets.mime_type,
    sizeBytes: Number(row.media_assets.size_bytes),
    storagePath: row.media_assets.storage_path,
    url: publicUrl(supabase, row.media_assets.storage_path),
  }));
}

const extensions: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadCatalogMedia(input: {
  altText: string;
  entityId: string;
  entityType: CatalogMediaEntityType;
  file: File;
  uploadedBy: string;
}): Promise<MutationResult> {
  const supabase = await createClient();
  const relationship = relationships[input.entityType];
  const current = await listCatalogMedia(input.entityType, input.entityId);
  if (current.length >= catalogMediaRules.maxCountPerEntity) return { errorCode: "media_limit_reached", success: false };
  const storagePath = `${input.entityType}/${input.entityId}/${crypto.randomUUID()}.${extensions[input.file.type]}`;
  const { error: storageError } = await supabase.storage.from(bucket).upload(storagePath, input.file, {
    cacheControl: "31536000",
    contentType: input.file.type,
    upsert: false,
  });
  if (storageError) return { errorCode: storageError.message, success: false };

  const { data: asset, error: assetError } = await supabase.from("media_assets").insert({
    alt_text: input.altText,
    mime_type: input.file.type,
    size_bytes: input.file.size,
    storage_path: storagePath,
    uploaded_by: input.uploadedBy,
  }).select("id").single();
  if (assetError || !asset) {
    await supabase.storage.from(bucket).remove([storagePath]);
    return { errorCode: assetError?.code, success: false };
  }

  const { error: relationError } = await supabase.from(relationship.table).insert({
    [relationship.entityColumn]: input.entityId,
    display_order: current.length,
    is_cover: current.length === 0,
    media_id: asset.id,
  });
  if (relationError) {
    await supabase.from("media_assets").delete().eq("id", asset.id);
    await supabase.storage.from(bucket).remove([storagePath]);
    return { errorCode: relationError.code, success: false };
  }
  return { success: true };
}

export async function setCatalogMediaCover(entityType: CatalogMediaEntityType, entityId: string, mediaId: string): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_catalog_media_cover", {
    p_entity_id: entityId,
    p_entity_type: entityType,
    p_media_id: mediaId,
  });
  return error ? { errorCode: error.code, success: false } : { success: true };
}

export async function moveCatalogMedia(entityType: CatalogMediaEntityType, entityId: string, mediaId: string, direction: "down" | "up"): Promise<MutationResult> {
  const supabase = await createClient();
  const relationship = relationships[entityType];
  const media = await listCatalogMedia(entityType, entityId);
  const index = media.findIndex((item) => item.id === mediaId);
  const otherIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || otherIndex < 0 || otherIndex >= media.length) return { errorCode: "invalid_media_order", success: false };
  const current = media[index];
  const other = media[otherIndex];
  const first = await supabase.from(relationship.table).update({ display_order: other.displayOrder }).eq(relationship.entityColumn, entityId).eq("media_id", current.id);
  if (first.error) return { errorCode: first.error.code, success: false };
  const second = await supabase.from(relationship.table).update({ display_order: current.displayOrder }).eq(relationship.entityColumn, entityId).eq("media_id", other.id);
  return second.error ? { errorCode: second.error.code, success: false } : { success: true };
}

export async function removeCatalogMedia(entityType: CatalogMediaEntityType, entityId: string, mediaId: string): Promise<MutationResult> {
  const supabase = await createClient();
  const relationship = relationships[entityType];
  const media = await listCatalogMedia(entityType, entityId);
  const target = media.find((item) => item.id === mediaId);
  if (!target) return { errorCode: "media_not_found", success: false };
  const { error: relationError } = await supabase.from(relationship.table).delete().eq(relationship.entityColumn, entityId).eq("media_id", mediaId);
  if (relationError) return { errorCode: relationError.code, success: false };
  const { error: assetError } = await supabase.from("media_assets").delete().eq("id", mediaId);
  if (assetError) return { errorCode: assetError.code, success: false };
  await supabase.storage.from(bucket).remove([target.storagePath]);
  if (target.isCover && media.length > 1) {
    const replacement = media.find((item) => item.id !== mediaId);
    if (replacement) await setCatalogMediaCover(entityType, entityId, replacement.id);
  }
  return { success: true };
}
