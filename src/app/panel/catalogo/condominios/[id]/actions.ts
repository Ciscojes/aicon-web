"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCatalogManagerForId } from "@/app/panel/catalogo/authorization";
import {
  type CondominiumDraftFieldErrors,
  readCondominiumDraftFormData,
  validateCondominiumDraft,
} from "@/modules/catalog/application/validate-condominium-draft";
import { validateCondominiumPublication } from "@/modules/catalog/application/validate-condominium-publication";
import {
  archiveCondominium as archiveCondominiumRecord,
  getCondominium,
  setCondominiumPublicationStatus,
  updateCondominium as updateCondominiumRecord,
} from "@/modules/catalog/infrastructure/condominium-repository";

export type UpdateCondominiumState = {
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

function editorUrl(id: string, key: "error" | "notice", message: string) {
  const query = new URLSearchParams({ [key]: message });
  return `/panel/catalogo/condominios/${id}?${query.toString()}`;
}

function revalidateCondominium(id: string) {
  revalidatePath("/panel/catalogo/condominios");
  revalidatePath(`/panel/catalogo/condominios/${id}`);
}

async function changePublicationStatus(
  id: string,
  status: "hidden" | "published",
  messages: { failure: string; success: string },
) {
  const result = await setCondominiumPublicationStatus(id, status);
  if (!result.success) redirect(editorUrl(id, "error", messages.failure));

  revalidateCondominium(id);
  redirect(editorUrl(id, "notice", messages.success));
}

export async function updateCondominium(
  id: string,
  _previousState: UpdateCondominiumState,
  formData: FormData,
): Promise<UpdateCondominiumState> {
  await requireCatalogManagerForId(id);

  const values = readCondominiumDraftFormData(formData);
  const validation = validateCondominiumDraft(values);

  if (!validation.success) return { errors: validation.errors, values };

  const result = await updateCondominiumRecord(id, validation.data);
  if (!result.success) {
    return {
      message:
        result.errorCode === "23505"
          ? "Ya existe un condominio con esa URL. Escribe una diferente."
          : "No fue posible guardar los cambios.",
      values,
    };
  }

  revalidateCondominium(id);
  return { message: "Los cambios se guardaron correctamente.", success: true };
}

export async function publishCondominium(id: string) {
  await requireCatalogManagerForId(id);

  const condominium = await getCondominium(id);
  if (!condominium) redirect("/panel/catalogo/condominios");

  const validation = validateCondominiumPublication(condominium);
  if (!validation.success) {
    redirect(
      editorUrl(
        id,
        "error",
        `Antes de publicar completa: ${validation.errors.join(", ")}.`,
      ),
    );
  }

  await changePublicationStatus(id, "published", {
    failure: "No fue posible publicar el condominio.",
    success: "El condominio quedó publicado.",
  });
}

export async function hideCondominium(id: string) {
  await requireCatalogManagerForId(id);
  await changePublicationStatus(id, "hidden", {
    failure: "No fue posible ocultar el condominio.",
    success: "El condominio quedó oculto.",
  });
}

export async function archiveCondominium(id: string, formData: FormData) {
  await requireCatalogManagerForId(id);

  if (formData.get("confirmArchive") !== "yes") {
    redirect(editorUrl(id, "error", "Confirma el archivado antes de continuar."));
  }

  const result = await archiveCondominiumRecord(id);
  if (!result.success) {
    redirect(editorUrl(id, "error", "No fue posible archivar el condominio."));
  }

  revalidateCondominium(id);
  redirect("/panel/catalogo/condominios?notice=Condominio+archivado.");
}
