import Link from "next/link";

import type { PublicProperty } from "../domain/public-property";
import { formatPublicDisplayText } from "./public-display-text";

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
      <div aria-label={property.images[0]?.altText ?? "Representación visual ilustrativa de una vivienda"} className={`property-visual${property.images[0] ? " property-photo" : ""}`} role="img" style={property.images[0] ? { backgroundImage: `url("${property.images[0].url}")` } : undefined}>
        {!property.images[0] ? <><span className="illustration-label">Vista ilustrativa</span><span className="house-outline" aria-hidden="true" /></> : null}
        <span className={`public-status public-status-${property.availabilityStatus}`}>{status[property.availabilityStatus]}</span>
        {property.images.length > 1 ? <span className="property-image-count" aria-label={`${property.images.length} fotografías`}>◫ {property.images.length}</span> : null}
      </div>
      <div className="property-card-body">
        <div className="property-card-topline"><span>{formatPublicDisplayText(property.condominium.name)}</span><span>Unidad {property.code}</span></div>
        <h3>{property.modelName ?? `Casa ${property.code}`}</h3>
        <p className="property-code">{property.condominium.address ? formatPublicDisplayText(property.condominium.address) : "Ubicación por confirmar"}</p>
        <p className="property-price">{usd.format(property.priceUsd)}</p>
        <p className="property-facts">{facts.length > 0 ? facts.map((fact) => <span key={fact}>{fact}</span>) : "Características por confirmar"}</p>
        <Link className="property-link" href={`/casas/${property.id}`}>Ver detalles <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
