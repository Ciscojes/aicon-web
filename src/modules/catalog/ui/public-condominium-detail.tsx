import Link from "next/link";

import type { PublicCondominiumDetail } from "../domain/public-property";
import { PublicPropertyCard } from "./public-property-card";

type PublicCondominiumDetailProps = PublicCondominiumDetail & {
  backHref?: string;
  backLabel?: string;
};

export function PublicCondominiumDetail({
  backHref = "/catalogo",
  backLabel = "Volver al catálogo",
  condominium,
  properties,
}: Readonly<PublicCondominiumDetailProps>) {
  const hero = condominium.images[0];

  return (
    <main className="property-detail-page condominium-detail-page">
      <Link className="text-link back-link" href={backHref}>← {backLabel}</Link>
      <section className="property-detail-hero condominium-detail-hero">
        <div
          aria-label={hero?.altText ?? "Representación visual ilustrativa del condominio"}
          className={`property-detail-art condominium-detail-art${hero ? " property-photo" : ""}`}
          role="img"
          style={hero ? { backgroundImage: `url("${hero.url}")` } : undefined}
        >
          {!hero ? <><span className="illustration-label">Vista ilustrativa</span><span className="detail-house-outline" aria-hidden="true" /></> : null}
        </div>
        <div className="property-detail-summary">
          <p className="eyebrow">Proyecto residencial</p>
          <h1>{condominium.name}</h1>
          <p className="property-code">{condominium.address || "Ubicación por confirmar"}</p>
          <p>{condominium.description || "La información detallada de este proyecto estará disponible próximamente."}</p>
          <div className="detail-actions">
            <a className="button button-primary" href="#casas">Ver casas del proyecto</a>
            <Link className="button button-secondary" href={`/contacto?condominio=${condominium.slug}`}>Solicitar información</Link>
            <Link className="button button-secondary" href="/catalogo">Comparar todo el catálogo</Link>
          </div>
        </div>
      </section>

      {condominium.images.length > 1 ? (
        <section aria-label={`Galería de ${condominium.name}`} className="public-gallery condominium-gallery">
          {condominium.images.slice(1).map((image) => (
            <div aria-label={image.altText} key={image.url} role="img" style={{ backgroundImage: `url("${image.url}")` }} />
          ))}
        </section>
      ) : null}

      <section className="condominium-inventory" id="casas">
        <div className="public-section-heading">
          <div><p className="eyebrow">Inventario del proyecto</p><h2>Casas en {condominium.name}.</h2></div>
          <span className="section-note">Precios en dólares estadounidenses</span>
        </div>
        {properties.length === 0 ? (
          <div className="public-empty"><h3>Aún no hay casas publicadas.</h3><p>El proyecto está disponible para consulta y su inventario se incorporará próximamente.</p></div>
        ) : (
          <div className="property-grid">{properties.map((property) => <PublicPropertyCard key={property.id} property={property} />)}</div>
        )}
      </section>
    </main>
  );
}
