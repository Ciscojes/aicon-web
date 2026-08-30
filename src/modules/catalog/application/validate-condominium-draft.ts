import { z } from "zod";

import { createCondominiumSlug } from "../domain/condominium";

const condominiumDraftSchema = z.object({
  address: z
    .string()
    .trim()
    .max(500, "La dirección no puede superar 500 caracteres."),
  description: z
    .string()
    .trim()
    .max(5_000, "La descripción no puede superar 5000 caracteres."),
  name: z
    .string()
    .trim()
    .min(2, "Escribe un nombre de al menos 2 caracteres.")
    .max(160, "El nombre no puede superar 160 caracteres."),
  slug: z.string().trim().max(160, "La URL no puede superar 160 caracteres."),
});

export type CondominiumDraft = {
  address: string;
  description: string;
  name: string;
  slug: string;
};

export type CondominiumDraftFieldErrors = Partial<
  Record<keyof CondominiumDraft, string[]>
>;

export type CondominiumDraftValidation =
  | { data: CondominiumDraft; success: true }
  | { errors: CondominiumDraftFieldErrors; success: false };

export function validateCondominiumDraft(input: {
  address: unknown;
  description: unknown;
  name: unknown;
  slug: unknown;
}): CondominiumDraftValidation {
  const result = condominiumDraftSchema.safeParse(input);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      success: false,
    };
  }

  const slug = createCondominiumSlug(result.data.slug || result.data.name);

  if (!slug) {
    return {
      errors: { slug: ["Escribe una URL que incluya letras o números."] },
      success: false,
    };
  }

  return { data: { ...result.data, slug }, success: true };
}
