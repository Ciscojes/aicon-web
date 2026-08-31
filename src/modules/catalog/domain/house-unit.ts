import type { CondominiumPublicationStatus } from "./condominium";

export const unitAvailabilityStatuses = ["available", "reserved", "sold"] as const;
export const unitPublicationStatuses = ["draft", "published", "hidden"] as const;

export type UnitAvailabilityStatus = (typeof unitAvailabilityStatuses)[number];
export type UnitPublicationStatus = (typeof unitPublicationStatuses)[number];

export type HouseUnitSummary = {
  availabilityStatus: UnitAvailabilityStatus;
  code: string;
  condominiumName: string;
  id: string;
  modelName: string | null;
  priceUsd: number;
  publicationStatus: UnitPublicationStatus;
};

export type HouseUnitDetails = HouseUnitSummary & {
  bathroomsOverride: number | null;
  bedroomsOverride: number | null;
  condominiumId: string;
  constructionAreaM2Override: number | null;
  descriptionOverride: string;
  featuresOverride: string[];
  landAreaM2Override: number | null;
  modelId: string | null;
  parkingSpacesOverride: number | null;
  publishedAt: string | null;
};

export type UnitCondominiumOption = {
  id: string;
  name: string;
  publicationStatus: CondominiumPublicationStatus;
};

export type UnitModelOption = {
  condominiumId: string;
  id: string;
  name: string;
};
