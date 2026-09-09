import Link from "next/link";

import type { PublicCondominium, PublicProperty } from "../domain/public-property";
import { formatPublicDisplayText } from "./public-display-text";

const usd = new Intl.NumberFormat("es-CR", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function PublicFeaturedProject({ condominium, property, availableCount }: Readonly<{ availableCount: number; condominium: PublicCondominium; property?: PublicProperty }>) {
  const projectName = formatPublicDisplayText(condominium.name);
  const propertyName = property ? property.modelName ?? `Casa ${property.code}` : null;
  const facts = property ? [
    property.bedrooms === null ? null : `${property.bedrooms} hab.`,
    property.bathrooms === null ? null : `${property.bathrooms} baños`,
    property.constructionAreaM2 === null ? null : `${property.constructionAreaM2} m²`,
  ].filter(Boolean) : [];
  const image = property?.images[0] ?? condominium.coverImage;

  return (
    <section aria-labelledby="featured-project-title" className="featured-project-editorial" id="condominios">
      <h2 id="featured-project-title">Conoce {projectName}</h2>
      <div className="featured-project-main">
        <div aria-label={condominium.coverImage?.altText ?? `Vista ilustrativa de ${projectName}`} className={`featured-project-visual${condominium.coverImage ? " property-photo" : ""}`} role="img" style={condominium.coverImage ? { backgroundImage: `url("${condominium.coverImage.url}")` } : undefined} />
        <div className="featured-project-intro">
          <p className="featured-project-location">{condominium.address ? formatPublicDisplayText(condominium.address) : "Ubicación por confirmar"}</p>
          <h3>{projectName}</h3>
          <p>{condominium.description || "Conoce las viviendas publicadas en este proyecto residencial."}</p>
          <span className="featured-availability">{availableCount} {availableCount === 1 ? "casa disponible" : "casas disponibles"}</span>
          <Link className="button button-secondary" href={`/condominios/${condominium.slug}`}>Explorar proyecto <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      {property && propertyName ? <article className="featured-property-row">
        <div aria-label={image?.altText ?? `Vista ilustrativa de ${propertyName}`} className={`featured-property-thumbnail${image ? " property-photo" : ""}`} role="img" style={image ? { backgroundImage: `url("${image.url}")` } : undefined} />
        <h3>{propertyName}</h3>
        <span className={`public-status public-status-${property.availabilityStatus}`}>Disponible</span>
        <p>{facts.length > 0 ? facts.join(" · ") : "Características por confirmar"}</p>
        <strong>{property.priceUsd === null ? "Precio por confirmar" : usd.format(property.priceUsd)}</strong>
        <Link aria-label={`Ver detalles de ${propertyName}`} href={`/casas/${property.id}`}>Ver detalles <span aria-hidden="true">→</span></Link>
      </article> : null}
    </section>
  );
}
