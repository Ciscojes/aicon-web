import type { CondominiumDetails } from "../domain/condominium";

export type PublicationValidation =
  | { success: true }
  | { errors: string[]; success: false };

export function validateCondominiumPublication(
  condominium: Pick<CondominiumDetails, "address" | "description" | "name" | "slug">,
): PublicationValidation {
  const errors: string[] = [];

  if (condominium.name.trim().length < 2) errors.push("un nombre válido");
  if (!condominium.description.trim()) errors.push("una descripción");
  if (!condominium.address.trim()) errors.push("una dirección");
  if (!condominium.slug.trim()) errors.push("una URL pública");

  return errors.length > 0 ? { errors, success: false } : { success: true };
}
