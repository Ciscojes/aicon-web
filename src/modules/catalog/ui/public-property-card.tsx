import Link from "next/link";

import type { PublicProperty } from "../domain/public-property";

const usd = new Intl.NumberFormat("es-CR", { currency: "USD", maximumFractionDigits: 0, style: "currency" });
const status = { available: "Disponible", reserved: "Reservada", sold: "Vendida" } as const;

export function PublicPropertyCard({ property }: Readonly<{ property: PublicProperty }>) {
  const facts = [
    property.bedrooms === null ? null : `${property.bedrooms} hab.`,
    property.bathrooms === null ? null : `${property.bathrooms} baños`,
    property.constructionAreaM2 === null ? null : `${property.constructionAreaM2} m²`,
  ].filter(Boolean);
  return (
    <article className="property-card">
      <div aria-label="Representación visual ilustrativa de una vivienda" className="property-visual">
        <span className="illustration-label">Vista ilustrativa</span>
        <span className="house-outline" aria-hidden="true" />
      </div>
      <div className="property-card-body">
        <div className="property-card-topline"><span>{property.condominium.name}</span><span className={`public-status public-status-${property.availabilityStatus}`}>{status[property.availabilityStatus]}</span></div>
        <h3>{property.modelName ?? `Casa ${property.code}`}</h3>
        <p className="property-code">Unidad {property.code}</p>
        <p className="property-price">{usd.format(property.priceUsd)}</p>
        <p className="property-facts">{facts.join(" · ") || "Características por confirmar"}</p>
        <Link className="property-link" href={`/casas/${property.id}`}>Ver detalles <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
