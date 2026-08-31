import { z } from "zod";

const optionalInteger = (label: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{1,2}$/.test(value),
      `${label} debe ser un número entero entre 0 y 99.`,
    );

const optionalDecimal = (label: string, allowZero: boolean) =>
  z
    .string()
    .trim()
    .refine((value) => {
      if (value === "") return true;
      if (!/^\d{1,8}(\.\d{1,2})?$/.test(value)) return false;
      return allowZero ? Number(value) >= 0 : Number(value) > 0;
    }, `${label} debe ser un número ${allowZero ? "no negativo" : "mayor que cero"}.`);

const houseModelSchema = z.object({
  bathrooms: optionalDecimal("Los baños", true).refine(
    (value) => value === "" || Number.isInteger(Number(value) * 10),
    "Los baños pueden tener como máximo un decimal.",
  ),
  bedrooms: optionalInteger("Las habitaciones"),
  constructionAreaM2: optionalDecimal("El área de construcción", false),
  description: z
    .string()
    .trim()
    .max(5_000, "La descripción no puede superar 5000 caracteres."),
  features: z
    .string()
    .max(8_000, "Las características no pueden superar 8000 caracteres."),
  landAreaM2: optionalDecimal("El área de terreno", false),
  name: z
    .string()
    .trim()
    .min(2, "Escribe un nombre de al menos 2 caracteres.")
    .max(160, "El nombre no puede superar 160 caracteres."),
  parkingSpaces: optionalInteger("Los estacionamientos"),
});

export type HouseModelFormValues = {
  bathrooms: string;
  bedrooms: string;
  constructionAreaM2: string;
  description: string;
  features: string;
  landAreaM2: string;
  name: string;
  parkingSpaces: string;
};

export type HouseModelDraft = {
  bathrooms: number | null;
  bedrooms: number | null;
  constructionAreaM2: number | null;
  description: string;
  features: string[];
  landAreaM2: number | null;
  name: string;
  parkingSpaces: number | null;
};

export type HouseModelFieldErrors = Partial<
  Record<keyof HouseModelFormValues, string[]>
>;

export type HouseModelValidation =
  | { data: HouseModelDraft; success: true }
  | { errors: HouseModelFieldErrors; success: false };

function readTextFormValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function readHouseModelFormData(formData: FormData): HouseModelFormValues {
  return {
    bathrooms: readTextFormValue(formData, "bathrooms"),
    bedrooms: readTextFormValue(formData, "bedrooms"),
    constructionAreaM2: readTextFormValue(formData, "constructionAreaM2"),
    description: readTextFormValue(formData, "description"),
    features: readTextFormValue(formData, "features"),
    landAreaM2: readTextFormValue(formData, "landAreaM2"),
    name: readTextFormValue(formData, "name"),
    parkingSpaces: readTextFormValue(formData, "parkingSpaces"),
  };
}

function optionalNumber(value: string): number | null {
  return value === "" ? null : Number(value);
}

export function validateHouseModel(
  input: HouseModelFormValues,
): HouseModelValidation {
  const result = houseModelSchema.safeParse(input);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors, success: false };
  }

  const features = [
    ...new Set(
      result.data.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean),
    ),
  ];

  if (features.length > 50 || features.some((feature) => feature.length > 160)) {
    return {
      errors: {
        features: [
          "Usa hasta 50 características, con un máximo de 160 caracteres cada una.",
        ],
      },
      success: false,
    };
  }

  return {
    data: {
      bathrooms: optionalNumber(result.data.bathrooms),
      bedrooms: optionalNumber(result.data.bedrooms),
      constructionAreaM2: optionalNumber(result.data.constructionAreaM2),
      description: result.data.description,
      features,
      landAreaM2: optionalNumber(result.data.landAreaM2),
      name: result.data.name,
      parkingSpaces: optionalNumber(result.data.parkingSpaces),
    },
    success: true,
  };
}
