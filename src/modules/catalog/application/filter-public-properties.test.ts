import { describe, expect, it } from "vitest";

import type { PublicProperty } from "../domain/public-property";
import { filterPublicProperties, readPublicPropertyFilters } from "./filter-public-properties";

const property = (overrides: Partial<PublicProperty> = {}): PublicProperty => ({
  availabilityStatus: "available",
  bathrooms: 2.5,
  bedrooms: 3,
  code: "A-01",
  condominium: { address: "Costa Rica", coverImage: null, description: "", id: "1", images: [], name: "Vista", slug: "vista" },
  constructionAreaM2: 145,
  description: "Casa moderna",
  features: [],
  id: "1",
  images: [],
  landAreaM2: 180,
  modelName: "Modelo Sol",
  parkingSpaces: 2,
  priceUsd: 185000,
  ...overrides,
});

describe("filtros del catálogo público", () => {
  it("inicia mostrando solamente casas disponibles", () => {
    const filters = readPublicPropertyFilters({});
    expect(filters.availability).toBe("available");
    expect(filterPublicProperties([property(), property({ id: "2", availabilityStatus: "sold" })], filters)).toHaveLength(1);
  });

  it("filtra por condominio, precio y características mínimas", () => {
    const filters = readPublicPropertyFilters({ condominio: "vista", precioMaximo: "190000", habitaciones: "3", banos: "2" });
    expect(filterPublicProperties([property(), property({ id: "2", priceUsd: 220000 })], filters)).toHaveLength(1);
  });

  it("ignora números inválidos y permite ver todos los estados", () => {
    const filters = readPublicPropertyFilters({ estado: "all", precioMinimo: "no-valido" });
    expect(filters.minPrice).toBeUndefined();
    expect(filterPublicProperties([property({ availabilityStatus: "reserved" })], filters)).toHaveLength(1);
  });
});
