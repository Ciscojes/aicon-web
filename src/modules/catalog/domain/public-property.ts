import type { UnitAvailabilityStatus } from "./house-unit";

export type PublicCondominium = {
  address: string;
  coverImage: PublicImage | null;
  description: string;
  id: string;
  images: PublicImage[];
  name: string;
  slug: string;
};

export type PublicCondominiumDetail = {
  condominium: PublicCondominium;
  properties: PublicProperty[];
};

export type PublicImage = {
  altText: string;
  url: string;
};

export type PublicProperty = {
  availabilityStatus: UnitAvailabilityStatus;
  bathrooms: number | null;
  bedrooms: number | null;
  code: string;
  condominium: PublicCondominium;
  constructionAreaM2: number | null;
  description: string;
  features: string[];
  id: string;
  images: PublicImage[];
  landAreaM2: number | null;
  modelName: string | null;
  parkingSpaces: number | null;
  priceUsd: number;
};

export type PublicPropertyFilters = {
  availability?: UnitAvailabilityStatus | "all";
  bathrooms?: number;
  bedrooms?: number;
  condominium?: string;
  maxPrice?: number;
  minPrice?: number;
};
