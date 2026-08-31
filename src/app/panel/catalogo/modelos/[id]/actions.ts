"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  isCatalogEntityId,
  requireCatalogManagerForId,
} from "@/app/panel/catalogo/authorization";
import {
  type HouseModelFieldErrors,
  type HouseModelFormValues,
  readHouseModelFormData,
  validateHouseModel,
} from "@/modules/catalog/application/validate-house-model";
import {
  archiveHouseModel as archiveHouseModelRecord,
  syncHouseModelAssignments,
  updateHouseModel as updateHouseModelRecord,
} from "@/modules/catalog/infrastructure/house-model-repository";

export type UpdateHouseModelState = {
  condominiumIds?: string[];
  errors?: HouseModelFieldErrors;
  message?: string;
  success?: boolean;
  values?: HouseModelFormValues;
};

function revalidateHouseModel(id: string) {
  revalidatePath("/panel/catalogo/modelos");
  revalidatePath(`/panel/catalogo/modelos/${id}`);
}

export async function updateHouseModel(
  id: string,
  _previousState: UpdateHouseModelState,
  formData: FormData,
): Promise<UpdateHouseModelState> {
  await requireCatalogManagerForId(id, "/panel/catalogo/modelos");
  const values = readHouseModelFormData(formData);
  const validation = validateHouseModel(values);

  const condominiumIds = formData
    .getAll("condominiumIds")
    .filter((value): value is string => typeof value === "string");

  if (!validation.success) {
    return { condominiumIds, errors: validation.errors, values };
  }

  if (condominiumIds.some((condominiumId) => !isCatalogEntityId(condominiumId))) {
    return { condominiumIds, message: "Una asignación de condominio no es válida.", values };
  }

  const updateResult = await updateHouseModelRecord(id, validation.data);
  if (!updateResult.success) {
    return { condominiumIds, message: "No fue posible guardar los cambios.", values };
  }

  const assignmentResult = await syncHouseModelAssignments(id, condominiumIds);
  if (!assignmentResult.success) {
    return {
      message:
        "Los datos se guardaron, pero no fue posible actualizar los condominios.",
      condominiumIds,
      values,
    };
  }

  revalidateHouseModel(id);
  return { message: "El modelo y sus asignaciones se actualizaron.", success: true };
}

export async function archiveHouseModel(id: string, formData: FormData) {
  await requireCatalogManagerForId(id, "/panel/catalogo/modelos");

  if (formData.get("confirmArchive") !== "yes") {
    redirect(`/panel/catalogo/modelos/${id}?error=Confirma+el+archivado.`);
  }

  const result = await archiveHouseModelRecord(id);
  if (!result.success) {
    redirect(`/panel/catalogo/modelos/${id}?error=No+fue+posible+archivar+el+modelo.`);
  }

  revalidateHouseModel(id);
  redirect("/panel/catalogo/modelos?notice=Modelo+archivado.");
}
