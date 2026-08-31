"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireCatalogManager } from "./authorization";
import { validateMediaUpload } from "@/modules/catalog/application/validate-media-upload";
import { isCatalogMediaEntityType, type CatalogMediaEntityType } from "@/modules/catalog/domain/catalog-media";
import { moveCatalogMedia, removeCatalogMedia, setCatalogMediaCover, uploadCatalogMedia } from "@/modules/catalog/infrastructure/catalog-media-repository";

const idSchema = z.uuid();
const basePaths: Record<CatalogMediaEntityType, string> = {
  condominium: "/panel/catalogo/condominios",
  model: "/panel/catalogo/modelos",
  unit: "/panel/catalogo/unidades",
};

function editorPath(entityType: CatalogMediaEntityType, entityId: string) {
  return `${basePaths[entityType]}/${entityId}`;
}

async function authorize(entityType: string, entityId: string, mediaId?: string) {
  const profile = await requireCatalogManager();
  if (!isCatalogMediaEntityType(entityType) || !idSchema.safeParse(entityId).success || (mediaId && !idSchema.safeParse(mediaId).success)) redirect("/panel");
  return { entityType, profile };
}

function refresh(entityType: CatalogMediaEntityType, entityId: string) {
  revalidatePath(editorPath(entityType, entityId));
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/casas/[id]", "page");
}

export async function uploadMedia(entityType: string, entityId: string, formData: FormData) {
  const { entityType: safeType, profile } = await authorize(entityType, entityId);
  const entry = formData.get("photo");
  const validation = validateMediaUpload(entry instanceof File ? entry : null, formData.get("altText"));
  const path = editorPath(safeType, entityId);
  if (!validation.success) redirect(`${path}?error=${encodeURIComponent(validation.message)}#fotografias`);
  const result = await uploadCatalogMedia({ altText: validation.altText, entityId, entityType: safeType, file: validation.file, uploadedBy: profile.id });
  if (!result.success) {
    const message = result.errorCode === "media_limit_reached" ? "Se alcanzó el máximo de 20 fotografías." : "No fue posible subir la fotografía.";
    redirect(`${path}?error=${encodeURIComponent(message)}#fotografias`);
  }
  refresh(safeType, entityId);
  redirect(`${path}?notice=${encodeURIComponent("Fotografía agregada.")}#fotografias`);
}

export async function chooseMediaCover(entityType: string, entityId: string, mediaId: string) {
  const { entityType: safeType } = await authorize(entityType, entityId, mediaId);
  const path = editorPath(safeType, entityId);
  const result = await setCatalogMediaCover(safeType, entityId, mediaId);
  if (!result.success) redirect(`${path}?error=${encodeURIComponent("No fue posible cambiar la portada.")}#fotografias`);
  refresh(safeType, entityId);
  redirect(`${path}?notice=${encodeURIComponent("Portada actualizada.")}#fotografias`);
}

export async function reorderMedia(entityType: string, entityId: string, mediaId: string, direction: "down" | "up") {
  const { entityType: safeType } = await authorize(entityType, entityId, mediaId);
  if (direction !== "up" && direction !== "down") redirect(editorPath(safeType, entityId));
  const path = editorPath(safeType, entityId);
  const result = await moveCatalogMedia(safeType, entityId, mediaId, direction);
  if (!result.success) redirect(`${path}?error=${encodeURIComponent("No fue posible cambiar el orden.")}#fotografias`);
  refresh(safeType, entityId);
  redirect(`${path}#fotografias`);
}

export async function deleteMedia(entityType: string, entityId: string, mediaId: string, formData: FormData) {
  const { entityType: safeType } = await authorize(entityType, entityId, mediaId);
  const path = editorPath(safeType, entityId);
  if (formData.get("confirmDelete") !== "yes") redirect(`${path}?error=${encodeURIComponent("Confirma que deseas retirar la fotografía.")}#fotografias`);
  const result = await removeCatalogMedia(safeType, entityId, mediaId);
  if (!result.success) redirect(`${path}?error=${encodeURIComponent("No fue posible retirar la fotografía.")}#fotografias`);
  refresh(safeType, entityId);
  redirect(`${path}?notice=${encodeURIComponent("Fotografía retirada.")}#fotografias`);
}
