"use server";

import { revalidatePath } from "next/cache";

import {
  type CondominiumDraftFieldErrors,
  validateCondominiumDraft,
} from "@/modules/catalog/application/validate-condominium-draft";
import { insertCondominiumDraft } from "@/modules/catalog/infrastructure/condominium-repository";
import { canManageCatalog } from "@/modules/users/domain/role";
import { getCurrentProfile } from "@/modules/users/infrastructure/get-current-profile";

export type CreateCondominiumState = {
  errors?: CondominiumDraftFieldErrors;
  message?: string;
  success?: boolean;
  values?: {
    address: string;
    description: string;
    name: string;
    slug: string;
  };
};

export async function createCondominiumDraft(
  _previousState: CreateCondominiumState,
  formData: FormData,
): Promise<CreateCondominiumState> {
  const profile = await getCurrentProfile();

  if (!profile || !canManageCatalog(profile.role)) {
    return { message: "No tienes permiso para administrar el catálogo." };
  }

  const values = {
    address: String(formData.get("address") ?? ""),
    description: String(formData.get("description") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
  };
  const validation = validateCondominiumDraft(values);

  if (!validation.success) {
    return { errors: validation.errors, values };
  }

  const result = await insertCondominiumDraft(validation.data);

  if (!result.success) {
    return {
      message:
        result.errorCode === "23505"
          ? "Ya existe un condominio con esa URL. Escribe una diferente."
          : "No fue posible guardar el condominio. Intenta nuevamente.",
      values,
    };
  }

  revalidatePath("/panel/catalogo/condominios");
  return {
    message: `${validation.data.name} se guardó como borrador.`,
    success: true,
  };
}
