import type { PublicProperty, PublicPropertyFilters } from "../domain/public-property";

export function filterPublicProperties(
  properties: PublicProperty[],
  filters: PublicPropertyFilters,
): PublicProperty[] {
  return properties.filter((property) => {
    if (filters.condominium && property.condominium.slug !== filters.condominium) return false;
    if (filters.availability && filters.availability !== "all" && property.availabilityStatus !== filters.availability) return false;
    if (filters.minPrice !== undefined && property.priceUsd < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && property.priceUsd > filters.maxPrice) return false;
    if (filters.bedrooms !== undefined && (property.bedrooms ?? -1) < filters.bedrooms) return false;
    if (filters.bathrooms !== undefined && (property.bathrooms ?? -1) < filters.bathrooms) return false;
    return true;
  });
}

function queryNumber(value: string | string[] | undefined) {
  const text = Array.isArray(value) ? value[0] : value;
  if (!text || !/^\d+(\.\d{1,2})?$/.test(text)) return undefined;
  const number = Number(text);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

export function readPublicPropertyFilters(query: Record<string, string | string[] | undefined>): PublicPropertyFilters {
  const availability = Array.isArray(query.estado) ? query.estado[0] : query.estado;
  const validAvailability = availability === "available" || availability === "reserved" || availability === "sold" || availability === "all" ? availability : "available";
  const condominium = Array.isArray(query.condominio) ? query.condominio[0] : query.condominio;
  return {
    availability: validAvailability,
    bathrooms: queryNumber(query.banos),
    bedrooms: queryNumber(query.habitaciones),
    condominium: condominium?.slice(0, 160),
    maxPrice: queryNumber(query.precioMaximo),
    minPrice: queryNumber(query.precioMinimo),
  };
}
