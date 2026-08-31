import { catalogMediaRules } from "../domain/catalog-media";

export type MediaUploadValidation =
  | { success: true; altText: string; file: File }
  | { success: false; message: string };

export function validateMediaUpload(file: File | null, altTextValue: FormDataEntryValue | null): MediaUploadValidation {
  const altText = typeof altTextValue === "string" ? altTextValue.trim() : "";
  if (!file || file.size === 0) return { success: false, message: "Selecciona una fotografía." };
  if (altText.length < 2 || altText.length > 240) return { success: false, message: "La descripción accesible debe tener entre 2 y 240 caracteres." };
  if (!catalogMediaRules.acceptedMimeTypes.includes(file.type as never)) return { success: false, message: "Usa una imagen JPEG, PNG, WebP o AVIF." };
  if (file.size > catalogMediaRules.maxSizeBytes) return { success: false, message: "La imagen no puede superar 20 MB." };
  return { success: true, altText, file };
}
