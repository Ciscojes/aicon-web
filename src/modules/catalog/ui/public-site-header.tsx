import Link from "next/link";

export function PublicSiteHeader() {
  return (
    <header className="public-header">
      <Link aria-label="Aicon Edificadora, inicio" className="public-brand" href="/"><span aria-hidden="true">A</span><strong>AICON</strong><small>Edificadora</small></Link>
      <nav aria-label="Navegación pública" className="public-nav">
        <Link href="/">Inicio</Link>
        <Link href="/#condominios">Condominios</Link>
        <Link href="/catalogo">Casas</Link>
        <Link href="/contacto">Contacto</Link>
        <Link className="button button-primary public-nav-action" href="/catalogo">Ver viviendas</Link>
      </nav>
    </header>
  );
}
