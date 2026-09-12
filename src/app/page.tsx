import Link from "next/link";

import { listPublicCondominiums, listPublicProperties } from "@/modules/catalog/infrastructure/public-catalog-repository";
import { PublicFeaturedProject } from "@/modules/catalog/ui/public-featured-project";
import { PublicHeroSearch } from "@/modules/catalog/ui/public-hero-search";
import { PublicPropertyCard } from "@/modules/catalog/ui/public-property-card";
import { formatPublicDisplayText } from "@/modules/catalog/ui/public-display-text";
import { PublicSiteFooter } from "@/modules/catalog/ui/public-site-footer";
import { PublicSiteHeader } from "@/modules/catalog/ui/public-site-header";
import { getPublicCompanyProfile, whatsappHref } from "@/modules/company/infrastructure/public-company-profile";

export default async function Home() {
  const [properties, condominiums] = await Promise.all([listPublicProperties(), listPublicCondominiums()]);
  const available = properties.filter((property) => property.availabilityStatus === "available");
  const featuredCondominium = condominiums[0];
  const featuredProperty = featuredCondominium ? available.find((property) => property.condominium.id === featuredCondominium.id) : undefined;
  const remainingAvailable = featuredProperty ? available.filter((property) => property.id !== featuredProperty.id) : available;
  const otherCondominiums = featuredCondominium ? condominiums.filter((item) => item.id !== featuredCondominium.id) : condominiums;
  const company = getPublicCompanyProfile();
  return (
    <div className="public-shell">
      <PublicSiteHeader />
      <main>
        <section className="public-hero">
          <div className="public-hero-copy"><h1>Construimos espacios para vivir tu futuro.</h1><p>Explora proyectos residenciales y encuentra tu próxima casa.</p></div>
          <span className="public-hero-label">Imagen conceptual</span>
        </section>

        <PublicHeroSearch condominiums={condominiums} />

        {featuredCondominium ? <PublicFeaturedProject availableCount={available.filter((property) => property.condominium.id === featuredCondominium.id).length} condominium={featuredCondominium} property={featuredProperty} /> : null}

        {otherCondominiums.length > 0 ? <section className="public-section"><div className="public-section-heading"><div><p className="eyebrow">Más proyectos</p><h2>Condominios para una nueva etapa.</h2></div><Link className="text-link" href="/catalogo">Ver todo el catálogo <span aria-hidden="true">→</span></Link></div><div className="condominium-grid">{otherCondominiums.map((item, index) => <article className={`condominium-card${item.coverImage ? " condominium-card-photo" : ""}`} key={item.id}>{item.coverImage ? <div aria-label={item.coverImage.altText} className="condominium-card-image" role="img" style={{ backgroundImage: `url("${item.coverImage.url}")` }} /> : null}<div className="condominium-card-content"><span className="condominium-number">{String(index + 1).padStart(2, "0")}</span><p className="condominium-location">{item.address ? formatPublicDisplayText(item.address) : "Ubicación por confirmar"}</p><h3>{formatPublicDisplayText(item.name)}</h3><p>{item.description || "Conoce las casas disponibles en este proyecto."}</p><Link href={`/condominios/${item.slug}`}>Explorar proyecto <span aria-hidden="true">→</span></Link></div></article>)}</div></section> : null}

        {available.length === 0 ? <section className="public-section property-section"><div className="public-empty"><h3>Estamos preparando nuevas opciones.</h3><p>Vuelve pronto para conocer el inventario disponible.</p></div></section> : null}
        {remainingAvailable.length > 0 ? <section className="public-section property-section"><div className="public-section-heading"><div><p className="eyebrow">Inventario actual</p><h2>Más casas disponibles.</h2></div><span className="section-note">Los precios pendientes se confirman con Aicon</span></div><div className="property-grid">{remainingAvailable.slice(0, 3).map((property) => <PublicPropertyCard key={property.id} property={property} />)}</div></section> : null}

        <section className="public-values"><div><p className="eyebrow">Construir con propósito</p><h2>Una base sólida para cada hogar.</h2></div><div className="value-grid"><article><span>01</span><h3>Diseño funcional</h3><p>Espacios pensados alrededor de la vida diaria y sus nuevas etapas.</p></article><article><span>02</span><h3>Información clara</h3><p>Precio, disponibilidad y características reunidos antes de tomar una decisión.</p></article><article><span>03</span><h3>Acompañamiento</h3><p>Un recorrido ordenado desde la exploración hasta el contacto comercial.</p></article></div></section>
        <section className="public-process" aria-labelledby="buying-process-title"><div><p className="eyebrow">Tu proceso de compra</p><h2 id="buying-process-title">Decide con información y acompañamiento.</h2><p>Explora el inventario publicado, solicita únicamente la información que necesitas y agenda una visita cuando hayas elegido una vivienda concreta.</p></div><ol><li><span>01</span><div><h3>Explora</h3><p>Compara proyectos y viviendas con datos centralizados.</p></div></li><li><span>02</span><div><h3>Confirma</h3><p>Los datos pendientes se identifican claramente y Aicon los confirma contigo.</p></div></li><li><span>03</span><div><h3>Visita</h3><p>Selecciona una casa y reserva un horario disponible.</p></div></li></ol><div className="institutional-proof"><strong>Aicon Edificadora</strong><p>No publicamos testimonios, certificaciones ni cifras sin respaldo.</p>{company.legalName ? <p>{company.legalName}{company.legalRegistration ? ` · ${company.legalRegistration}` : ""}</p> : null}{company.whatsapp ? <a className="text-link" href={whatsappHref(company.whatsapp)} rel="noreferrer" target="_blank">Conversar por WhatsApp</a> : <Link className="text-link" href="/contacto">Enviar una consulta</Link>}</div></section>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
