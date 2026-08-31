"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCatalogManagerForId } from "@/app/panel/catalogo/authorization";
import { type HouseUnitFieldErrors, type HouseUnitFormValues, readHouseUnitFormData, validateHouseUnit } from "@/modules/catalog/application/validate-house-unit";
import { archiveHouseUnit as archiveRecord, setHouseUnitPublicationStatus, updateHouseUnit as updateRecord } from "@/modules/catalog/infrastructure/house-unit-repository";

export type UpdateHouseUnitState = { errors?: HouseUnitFieldErrors; message?: string; success?: boolean; values?: HouseUnitFormValues };
const basePath = "/panel/catalogo/unidades";
function refresh(id: string) { revalidatePath(basePath); revalidatePath(`${basePath}/${id}`); }

export async function updateHouseUnit(id: string, _state: UpdateHouseUnitState, formData: FormData): Promise<UpdateHouseUnitState> {
  await requireCatalogManagerForId(id, basePath);
  const values = readHouseUnitFormData(formData);
  const validation = validateHouseUnit(values);
  if (!validation.success) return { errors: validation.errors, values };
  const result = await updateRecord(id, validation.data);
  if (!result.success) {
    const message = result.errorCode === "23505" ? "Ese código ya existe dentro del condominio." : result.errorCode === "inactive_model_assignment" ? "El modelo seleccionado ya no está habilitado para ese condominio." : "No fue posible guardar los cambios.";
    return { message, values };
  }
  refresh(id);
  return { message: "La unidad se actualizó correctamente.", success: true };
}

export async function changeHouseUnitPublication(id: string, status: "hidden" | "published", formData: FormData) {
  await requireCatalogManagerForId(id, basePath);
  if (formData.get("confirmStatus") !== "yes") redirect(`${basePath}/${id}?error=Confirma+el+cambio+de+publicación.`);
  const result = await setHouseUnitPublicationStatus(id, status);
  if (!result.success) {
    const error = status === "published" && result.errorCode === "23514" ? "Publica primero el condominio y verifica que el modelo siga habilitado." : "No fue posible cambiar la publicación.";
    redirect(`${basePath}/${id}?error=${encodeURIComponent(error)}`);
  }
  refresh(id);
  redirect(`${basePath}/${id}?notice=${status === "published" ? "Unidad+publicada." : "Unidad+ocultada."}`);
}

export async function archiveHouseUnit(id: string, formData: FormData) {
  await requireCatalogManagerForId(id, basePath);
  if (formData.get("confirmArchive") !== "yes") redirect(`${basePath}/${id}?error=Confirma+el+archivado.`);
  const result = await archiveRecord(id);
  if (!result.success) redirect(`${basePath}/${id}?error=No+fue+posible+archivar+la+unidad.`);
  refresh(id);
  redirect(`${basePath}?notice=Unidad+archivada.`);
}
