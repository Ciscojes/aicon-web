"use server";

import { revalidatePath } from "next/cache";

import { requireCatalogManager } from "@/app/panel/catalogo/authorization";
import {
  type HouseModelFieldErrors,
  type HouseModelFormValues,
  readHouseModelFormData,
  validateHouseModel,
} from "@/modules/catalog/application/validate-house-model";
import { insertHouseModel } from "@/modules/catalog/infrastructure/house-model-repository";

export type CreateHouseModelState = {
  errors?: HouseModelFieldErrors;
  message?: string;
  success?: boolean;
  values?: HouseModelFormValues;
};

export async function createHouseModel(
  _previousState: CreateHouseModelState,
  formData: FormData,
): Promise<CreateHouseModelState> {
  await requireCatalogManager();
  const values = readHouseModelFormData(formData);
  const validation = validateHouseModel(values);

  if (!validation.success) return { errors: validation.errors, values };

  const result = await insertHouseModel(validation.data);
  if (!result.success) {
    return { message: "No fue posible guardar el modelo.", values };
  }

  revalidatePath("/panel/catalogo/modelos");
  return {
    message: `${validation.data.name} se guardó correctamente.`,
    success: true,
  };
}
