import Link from "next/link";

export function PublicSiteHeader() {
  return (
    <header className="public-header">
      <Link className="wordmark" href="/">AICON</Link>
      <nav aria-label="Navegación pública" className="public-nav">
        <Link href="/#condominios">Condominios</Link>
        <Link href="/catalogo">Casas</Link>
        <Link className="button button-primary public-nav-action" href="/catalogo">Explorar catálogo</Link>
      </nav>
    </header>
  );
}
