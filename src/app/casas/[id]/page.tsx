import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { getPublicProperty } from "@/modules/catalog/infrastructure/public-catalog-repository";
import { PublicSiteFooter } from "@/modules/catalog/ui/public-site-footer";
import { PublicSiteHeader } from "@/modules/catalog/ui/public-site-header";
import { formatPublicDisplayText } from "@/modules/catalog/ui/public-display-text";
import { getActiveFinancialSettings } from "@/modules/quotes/infrastructure/financial-settings-repository";
import { FinancingSimulator } from "@/modules/quotes/ui/financing-simulator";

export const metadata: Metadata = { title: "Detalle de casa | Aicon" };
const usd = new Intl.NumberFormat("es-CR", { currency: "USD", maximumFractionDigits: 0, style: "currency" });
const labels = { available: "Disponible", reserved: "Reservada", sold: "Vendida" } as const;

export default async function PublicPropertyPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [property, financialSettings] = await Promise.all([getPublicProperty(id), getActiveFinancialSettings()]);
  if (!property) notFound();
  const facts = [
    [property.bedrooms, "Habitaciones", "⌂"], [property.bathrooms, "Baños", "◡"], [property.parkingSpaces, "Estacionamientos", "P"], [property.constructionAreaM2, "m² construcción", "□"], [property.landAreaM2, "m² terreno", "◇"],
  ].filter((item) => item[0] !== null);
  const propertyName = property.modelName ?? `Casa ${property.code}`;
  const verified = property.verificationStatus === "verified";
  return (
    <div className="public-shell public-inner-shell">
      <PublicSiteHeader />
      <main className="property-detail-page">
        <Link className="text-link back-link" href="/catalogo">← Volver al catálogo</Link>
        <section className="property-detail-hero"><div aria-label={property.images[0]?.altText ?? "Representación visual ilustrativa de una vivienda"} className={`property-detail-art${property.images[0] ? " property-photo" : ""}`} role="img" style={property.images[0] ? { backgroundImage: `url("${property.images[0].url}")` } : undefined}>{!property.images[0] ? <><span className="illustration-label">Vista ilustrativa</span><span className="detail-house-outline" aria-hidden="true" /></> : null}</div><div className="property-detail-summary"><p className="eyebrow">{formatPublicDisplayText(property.condominium.name)}</p><h1>{propertyName}</h1><p className="property-code">Unidad {property.code} · {property.condominium.address ? formatPublicDisplayText(property.condominium.address) : "Ubicación por confirmar"}</p><div className="detail-price-row"><strong className={property.priceUsd === null ? "pending-value" : undefined}>{property.priceUsd === null ? "Precio por confirmar" : usd.format(property.priceUsd)}</strong><span className={`public-status public-status-${property.availabilityStatus}`}>{labels[property.availabilityStatus]}</span></div><p>{verified && property.description ? property.description : "La descripción comercial completa está por confirmar con Aicon."}</p>{!verified ? <p className="verification-notice" role="note">Los datos comerciales de esta unidad aún no cuentan con una fuente verificada en el sistema.</p> : null}<div className="detail-actions">{property.availabilityStatus === "available" ? <Link className="button button-primary" href={`/agendar-visita?unidad=${property.id}`}>Agendar visita</Link> : null}<Link className="button button-secondary" href={`/contacto?unidad=${property.id}`}>Solicitar información</Link><Link className="text-link" href={`/condominios/${property.condominium.slug}`}>Ver el condominio</Link></div></div></section>
        <section aria-labelledby="gallery-title" className="detail-section"><div className="detail-section-heading"><p className="eyebrow">Galería</p><h2 id="gallery-title">Imágenes de {propertyName}.</h2></div>{property.images.length > 1 ? <div aria-label="Galería de la casa" className="public-gallery">{property.images.slice(1).map((image) => <div aria-label={image.altText} key={image.url} role="img" style={{ backgroundImage: `url("${image.url}")` }} />)}</div> : <div className="pending-information"><strong>Galería en preparación</strong><p>Hay una imagen disponible; las fotografías adicionales se incorporarán cuando estén autorizadas.</p></div>}</section>
        <section className="property-fact-grid" aria-label="Distribución y medidas">{facts.length > 0 ? facts.map(([value, label, icon]) => <div key={label}><span aria-hidden="true" className="property-fact-icon">{icon}</span><strong>{value}</strong><span>{label}</span></div>) : <div className="fact-pending"><strong>Por confirmar</strong><span>Distribución y medidas</span></div>}</section>
        {financialSettings && property.availabilityStatus === "available" && property.priceUsd !== null ? <FinancingSimulator priceUsd={property.priceUsd} settings={financialSettings} unitId={property.id} /> : null}
        <div className="property-detail-content"><section><p className="eyebrow">Características y acabados</p><h2>Lo que ofrece esta casa.</h2>{verified && property.features.length > 0 ? <ul className="feature-list">{property.features.map((feature) => <li key={feature}>{feature}</li>)}</ul> : <div className="pending-information"><strong>Información por confirmar</strong><p>Aicon confirmará distribución, materiales, acabados y amenidades antes de tu decisión.</p></div>}</section><aside id="informacion"><p className="eyebrow">Siguiente paso</p><h2>Consulta esta unidad con Aicon.</h2><p>El formulario está habilitado y conserva automáticamente esta vivienda como tu interés.</p><Link className="button button-light" href={`/contacto?unidad=${property.id}`}>Enviar consulta</Link><p className="public-disclaimer">Precio, disponibilidad y condiciones se confirman directamente antes de cualquier decisión de compra.</p></aside></div>
        <section className="detail-information-grid" aria-label="Información complementaria"><article><span>01</span><h2>Ubicación</h2><p>{property.condominium.address ? formatPublicDisplayText(property.condominium.address) : "Ubicación por confirmar"}</p><small>El mapa se mostrará cuando existan coordenadas verificadas.</small></article><article><span>02</span><h2>Planos</h2><p>Información por confirmar</p><small>Se publicarán únicamente documentos autorizados.</small></article><article><span>03</span><h2>Cuotas y condiciones</h2><p>Información por confirmar</p><small>Aicon confirmará los términos aplicables a esta unidad.</small></article></section>
      </main>
      <PublicSiteFooter appointmentHref={property.availabilityStatus === "available" ? `/agendar-visita?unidad=${property.id}` : undefined} appointmentPrice={property.priceUsd} />
    </div>
  );
}
