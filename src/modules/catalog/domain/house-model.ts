export type HouseModelSummary = {
  bathrooms: number | null;
  bedrooms: number | null;
  condominiumCount: number;
  constructionAreaM2: number | null;
  id: string;
  name: string;
  parkingSpaces: number | null;
};

export type HouseModelDetails = HouseModelSummary & {
  assignedCondominiumIds: string[];
  description: string;
  features: string[];
  landAreaM2: number | null;
};
