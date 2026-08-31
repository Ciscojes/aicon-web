import Link from "next/link";

import { listPublicCondominiums, listPublicProperties } from "@/modules/catalog/infrastructure/public-catalog-repository";
import { PublicPropertyCard } from "@/modules/catalog/ui/public-property-card";
import { PublicSiteFooter } from "@/modules/catalog/ui/public-site-footer";
import { PublicSiteHeader } from "@/modules/catalog/ui/public-site-header";

export default async function Home() {
  const [properties, condominiums] = await Promise.all([listPublicProperties(), listPublicCondominiums()]);
  const available = properties.filter((property) => property.availabilityStatus === "available");
  return (
    <div className="public-shell">
      <PublicSiteHeader />
      <main>
        <section className="public-hero">
          <div className="public-hero-copy"><p className="eyebrow">Aicon Edificadora</p><h1>Construimos espacios para vivir tu futuro.</h1><p>Explora proyectos residenciales y encuentra una casa que se adapte a la vida que quieres construir.</p><div className="public-hero-actions"><Link className="button button-primary" href="/catalogo">Explorar casas</Link><Link className="button button-secondary" href="#condominios">Ver condominios</Link></div><div className="hero-trust"><span><strong>{available.length}</strong> casas disponibles</span><span><strong>{condominiums.length}</strong> proyectos publicados</span></div></div>
          <div className="public-hero-art" aria-label="Composición arquitectónica ilustrativa"><span className="illustration-label">Imagen conceptual</span><div className="hero-building"><span /><span /><span /></div><div className="hero-art-card"><span>Diseño</span><strong>Espacios pensados para vivir mejor</strong></div></div>
        </section>

        <section className="public-search-band" aria-labelledby="quick-search-title"><div><p className="eyebrow">Encuentra tu casa</p><h2 id="quick-search-title">Empieza por el proyecto que te interesa.</h2></div><form action="/catalogo" method="get"><label htmlFor="home-condominium">Condominio</label><select id="home-condominium" name="condominio"><option value="">Todos los condominios</option>{condominiums.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select><button className="button button-primary" type="submit">Buscar casas</button></form></section>

        <section className="public-section" id="condominios"><div className="public-section-heading"><div><p className="eyebrow">Nuestros proyectos</p><h2>Condominios para una nueva etapa.</h2></div><Link className="text-link" href="/catalogo">Ver todo el catálogo →</Link></div><div className="condominium-grid">{condominiums.map((item, index) => <article className="condominium-card" key={item.id}><span className="condominium-number">0{index + 1}</span><p>{item.address || "Ubicación por confirmar"}</p><h3>{item.name}</h3><p>{item.description || "Conoce las casas disponibles en este proyecto."}</p><Link href={`/catalogo?condominio=${item.slug}`}>Explorar proyecto →</Link></article>)}</div></section>

        <section className="public-section property-section"><div className="public-section-heading"><div><p className="eyebrow">Inventario actual</p><h2>Casas disponibles.</h2></div><span className="section-note">Precios en dólares estadounidenses</span></div>{available.length === 0 ? <div className="public-empty"><h3>Estamos preparando nuevas opciones.</h3><p>Vuelve pronto para conocer el inventario disponible.</p></div> : <div className="property-grid">{available.slice(0, 3).map((property) => <PublicPropertyCard key={property.id} property={property} />)}</div>}</section>

        <section className="public-values"><div><p className="eyebrow">Construir con propósito</p><h2>Una base sólida para cada hogar.</h2></div><div className="value-grid"><article><span>01</span><h3>Diseño funcional</h3><p>Espacios pensados alrededor de la vida diaria y sus nuevas etapas.</p></article><article><span>02</span><h3>Información clara</h3><p>Precio, disponibilidad y características reunidos antes de tomar una decisión.</p></article><article><span>03</span><h3>Acompañamiento</h3><p>Un recorrido ordenado desde la exploración hasta el contacto comercial.</p></article></div></section>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
