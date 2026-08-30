export const condominiumPublicationStatuses = [
  "draft",
  "published",
  "hidden",
] as const;

export type CondominiumPublicationStatus =
  (typeof condominiumPublicationStatuses)[number];

export type CondominiumSummary = {
  address: string;
  createdAt: string;
  id: string;
  name: string;
  publicationStatus: CondominiumPublicationStatus;
  slug: string;
};

export function createCondominiumSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160)
    .replace(/-+$/g, "");
}
