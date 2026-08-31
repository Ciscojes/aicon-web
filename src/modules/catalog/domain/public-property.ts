import type { UnitAvailabilityStatus } from "./house-unit";

export type PublicCondominium = {
  address: string;
  description: string;
  id: string;
  name: string;
  slug: string;
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
