import { z } from "zod";

import { unitAvailabilityStatuses } from "../domain/house-unit";

const optionalInteger = (label: string) =>
  z.string().trim().refine(
    (value) => value === "" || /^\d{1,2}$/.test(value),
    `${label} debe ser un número entero entre 0 y 99.`,
  );

const optionalDecimal = (label: string, allowZero = false) =>
  z.string().trim().refine((value) => {
    if (value === "") return true;
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(value)) return false;
    return allowZero ? Number(value) >= 0 : Number(value) > 0;
  }, `${label} debe ser un número ${allowZero ? "no negativo" : "mayor que cero"}.`);

const schema = z.object({
  availabilityStatus: z.enum(unitAvailabilityStatuses),
  bathroomsOverride: optionalDecimal("Los baños", true).refine(
    (value) => value === "" || Number.isInteger(Number(value) * 10),
    "Los baños pueden tener como máximo un decimal.",
  ),
  bedroomsOverride: optionalInteger("Las habitaciones"),
  code: z.string().trim().min(1, "Escribe un código.").max(80, "El código no puede superar 80 caracteres."),
  condominiumId: z.uuid("Selecciona un condominio válido."),
  constructionAreaM2Override: optionalDecimal("El área de construcción"),
  descriptionOverride: z.string().trim().max(5_000, "La descripción no puede superar 5000 caracteres."),
  featuresOverride: z.string().max(8_000, "Las características no pueden superar 8000 caracteres."),
  landAreaM2Override: optionalDecimal("El área de terreno"),
  modelId: z.union([z.literal(""), z.uuid("Selecciona un modelo válido.")]),
  parkingSpacesOverride: optionalInteger("Los estacionamientos"),
  priceUsd: z.string().trim().refine(
    (value) => /^\d{1,12}(\.\d{1,2})?$/.test(value),
    "El precio debe ser un monto no negativo con máximo dos decimales.",
  ),
});

export type HouseUnitFormValues = z.input<typeof schema>;
export type HouseUnitFieldErrors = Partial<Record<keyof HouseUnitFormValues, string[]>>;
export type HouseUnitDraft = {
  availabilityStatus: HouseUnitFormValues["availabilityStatus"];
  bathroomsOverride: number | null;
  bedroomsOverride: number | null;
  code: string;
  condominiumId: string;
  constructionAreaM2Override: number | null;
  descriptionOverride: string;
  featuresOverride: string[];
  landAreaM2Override: number | null;
  modelId: string | null;
  parkingSpacesOverride: number | null;
  priceUsd: string;
};

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function readHouseUnitFormData(formData: FormData): HouseUnitFormValues {
  return {
    availabilityStatus: text(formData, "availabilityStatus") as HouseUnitFormValues["availabilityStatus"],
    bathroomsOverride: text(formData, "bathroomsOverride"),
    bedroomsOverride: text(formData, "bedroomsOverride"),
    code: text(formData, "code"),
    condominiumId: text(formData, "condominiumId"),
    constructionAreaM2Override: text(formData, "constructionAreaM2Override"),
    descriptionOverride: text(formData, "descriptionOverride"),
    featuresOverride: text(formData, "featuresOverride"),
    landAreaM2Override: text(formData, "landAreaM2Override"),
    modelId: text(formData, "modelId"),
    parkingSpacesOverride: text(formData, "parkingSpacesOverride"),
    priceUsd: text(formData, "priceUsd"),
  };
}

const optionalNumber = (value: string) => value === "" ? null : Number(value);

export function validateHouseUnit(input: HouseUnitFormValues) {
  const result = schema.safeParse(input);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as HouseUnitFieldErrors, success: false as const };
  }
  const featuresOverride = [...new Set(result.data.featuresOverride.split("\n").map((item) => item.trim()).filter(Boolean))];
  if (featuresOverride.length > 50 || featuresOverride.some((item) => item.length > 160)) {
    return { errors: { featuresOverride: ["Usa hasta 50 características, con un máximo de 160 caracteres cada una."] }, success: false as const };
  }
  return {
    data: {
      availabilityStatus: result.data.availabilityStatus,
      bathroomsOverride: optionalNumber(result.data.bathroomsOverride),
      bedroomsOverride: optionalNumber(result.data.bedroomsOverride),
      code: result.data.code,
      condominiumId: result.data.condominiumId,
      constructionAreaM2Override: optionalNumber(result.data.constructionAreaM2Override),
      descriptionOverride: result.data.descriptionOverride,
      featuresOverride,
      landAreaM2Override: optionalNumber(result.data.landAreaM2Override),
      modelId: result.data.modelId || null,
      parkingSpacesOverride: optionalNumber(result.data.parkingSpacesOverride),
      priceUsd: result.data.priceUsd,
    } satisfies HouseUnitDraft,
    success: true as const,
  };
}
