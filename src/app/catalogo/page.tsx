import type { Metadata } from "next";

import { filterPublicProperties, readPublicPropertyFilters } from "@/modules/catalog/application/filter-public-properties";
import { listPublicCondominiums, listPublicProperties } from "@/modules/catalog/infrastructure/public-catalog-repository";
import { PublicCatalogFilters } from "@/modules/catalog/ui/public-catalog-filters";
import { PublicPropertyCard } from "@/modules/catalog/ui/public-property-card";
import { PublicSiteFooter } from "@/modules/catalog/ui/public-site-footer";
import { PublicSiteHeader } from "@/modules/catalog/ui/public-site-header";

export const metadata: Metadata = { title: "Casas disponibles | Aicon" };

export default async function PublicCatalogPage({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const query = await searchParams;
  const [allProperties, condominiums] = await Promise.all([listPublicProperties(), listPublicCondominiums()]);
  const properties = filterPublicProperties(allProperties, readPublicPropertyFilters(query));
  return (
    <div className="public-shell public-inner-shell">
      <PublicSiteHeader />
      <main className="public-page">
        <div className="public-page-heading"><p className="eyebrow">Catálogo residencial</p><h1>Encuentra una casa para tu próxima etapa.</h1><p>Compara precios, espacios y disponibilidad en los proyectos publicados por Aicon.</p></div>
        <section aria-label="Filtros del catálogo" className="filter-panel"><PublicCatalogFilters condominiums={condominiums} query={query} /></section>
        <div className="results-heading"><h2>{properties.length} {properties.length === 1 ? "casa encontrada" : "casas encontradas"}</h2><p>Los datos específicos de cada unidad prevalecen sobre su modelo.</p></div>
        {properties.length === 0 ? <div className="public-empty"><h3>No encontramos casas con esos filtros.</h3><p>Prueba ampliando el rango de precio o mostrando otros estados.</p><a className="button button-secondary" href="/catalogo">Limpiar filtros</a></div> : <div className="property-grid">{properties.map((property) => <PublicPropertyCard key={property.id} property={property} />)}</div>}
      </main>
      <PublicSiteFooter />
    </div>
  );
}
