import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { getPublicProperty } from "@/modules/catalog/infrastructure/public-catalog-repository";
import { PublicSiteFooter } from "@/modules/catalog/ui/public-site-footer";
import { PublicSiteHeader } from "@/modules/catalog/ui/public-site-header";

export const metadata: Metadata = { title: "Detalle de casa | Aicon" };
const usd = new Intl.NumberFormat("es-CR", { currency: "USD", maximumFractionDigits: 0, style: "currency" });
const labels = { available: "Disponible", reserved: "Reservada", sold: "Vendida" } as const;

export default async function PublicPropertyPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const property = await getPublicProperty(id);
  if (!property) notFound();
  const facts = [
    [property.bedrooms, "Habitaciones"], [property.bathrooms, "Baños"], [property.parkingSpaces, "Estacionamientos"], [property.constructionAreaM2, "m² construcción"], [property.landAreaM2, "m² terreno"],
  ].filter((item) => item[0] !== null);
  return (
    <div className="public-shell public-inner-shell">
      <PublicSiteHeader />
      <main className="property-detail-page">
        <Link className="text-link back-link" href="/catalogo">← Volver al catálogo</Link>
        <section className="property-detail-hero"><div aria-label={property.images[0]?.altText ?? "Representación visual ilustrativa de una vivienda"} className={`property-detail-art${property.images[0] ? " property-photo" : ""}`} role="img" style={property.images[0] ? { backgroundImage: `url("${property.images[0].url}")` } : undefined}>{!property.images[0] ? <><span className="illustration-label">Vista ilustrativa</span><span className="detail-house-outline" aria-hidden="true" /></> : null}</div><div className="property-detail-summary"><p className="eyebrow">{property.condominium.name}</p><h1>{property.modelName ?? `Casa ${property.code}`}</h1><p className="property-code">Unidad {property.code} · {property.condominium.address || "Ubicación por confirmar"}</p><div className="detail-price-row"><strong>{usd.format(property.priceUsd)}</strong><span className={`public-status public-status-${property.availabilityStatus}`}>{labels[property.availabilityStatus]}</span></div><p>{property.description || "Información detallada disponible próximamente."}</p><div className="detail-actions"><a className="button button-primary" href="#informacion">Solicitar información</a><Link className="button button-secondary" href={`/catalogo?condominio=${property.condominium.slug}`}>Ver el condominio</Link></div></div></section>
        {property.images.length > 1 ? <section aria-label="Galería de la casa" className="public-gallery">{property.images.slice(1).map((image) => <div aria-label={image.altText} key={image.url} role="img" style={{ backgroundImage: `url("${image.url}")` }} />)}</section> : null}
        <section className="property-fact-grid" aria-label="Características principales">{facts.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>
        <div className="property-detail-content"><section><p className="eyebrow">Características</p><h2>Lo que ofrece esta casa.</h2>{property.features.length === 0 ? <p className="muted">Las características detalladas están por confirmar.</p> : <ul className="feature-list">{property.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>}</section><aside id="informacion"><p className="eyebrow">Siguiente paso</p><h2>Consulta esta unidad con Aicon.</h2><p>Los canales de contacto comercial se habilitarán cuando el dueño confirme el teléfono, WhatsApp y correo oficiales.</p><p className="public-disclaimer">El precio y la disponibilidad deben confirmarse antes de cualquier decisión de compra.</p></aside></div>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
