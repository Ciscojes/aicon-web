"use server";

import { revalidatePath } from "next/cache";

import { requireCatalogManager } from "@/app/panel/catalogo/authorization";
import { type HouseUnitFieldErrors, type HouseUnitFormValues, readHouseUnitFormData, validateHouseUnit } from "@/modules/catalog/application/validate-house-unit";
import { insertHouseUnit } from "@/modules/catalog/infrastructure/house-unit-repository";

export type CreateHouseUnitState = { errors?: HouseUnitFieldErrors; message?: string; success?: boolean; values?: HouseUnitFormValues };

export async function createHouseUnit(_state: CreateHouseUnitState, formData: FormData): Promise<CreateHouseUnitState> {
  await requireCatalogManager();
  const values = readHouseUnitFormData(formData);
  const validation = validateHouseUnit(values);
  if (!validation.success) return { errors: validation.errors, values };
  const result = await insertHouseUnit(validation.data);
  if (!result.success) {
    const message = result.errorCode === "23505" ? "Ese código ya existe dentro del condominio." : result.errorCode === "inactive_model_assignment" ? "El modelo seleccionado ya no está habilitado para ese condominio." : "No fue posible guardar la unidad.";
    return { message, values };
  }
  revalidatePath("/panel/catalogo/unidades");
  return { message: `La unidad ${validation.data.code} se guardó como borrador.`, success: true };
}
