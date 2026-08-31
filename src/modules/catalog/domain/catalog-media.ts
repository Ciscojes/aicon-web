export const catalogMediaEntityTypes = ["condominium", "model", "unit"] as const;
export type CatalogMediaEntityType = (typeof catalogMediaEntityTypes)[number];

export type CatalogMediaAsset = {
  altText: string;
  displayOrder: number;
  id: string;
  isCover: boolean;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  url: string;
};

export const catalogMediaRules = {
  acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  maxCountPerEntity: 20,
  maxSizeBytes: 20 * 1024 * 1024,
} as const;

export function isCatalogMediaEntityType(value: unknown): value is CatalogMediaEntityType {
  return typeof value === "string" && catalogMediaEntityTypes.includes(value as CatalogMediaEntityType);
}
