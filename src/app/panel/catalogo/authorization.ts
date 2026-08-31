import "server-only";

import { redirect } from "next/navigation";
import { z } from "zod";

import { canManageCatalog } from "@/modules/users/domain/role";
import { getCurrentProfile } from "@/modules/users/infrastructure/get-current-profile";

const entityIdSchema = z.uuid();

export async function requireCatalogManager() {
  const profile = await getCurrentProfile();
  if (!profile || !canManageCatalog(profile.role)) redirect("/panel");
  return profile;
}

export async function requireCatalogManagerForId(
  id: string,
  fallback = "/panel/catalogo/condominios",
) {
  await requireCatalogManager();
  if (!entityIdSchema.safeParse(id).success) redirect(fallback);
}

export function isCatalogEntityId(id: string): boolean {
  return entityIdSchema.safeParse(id).success;
}
