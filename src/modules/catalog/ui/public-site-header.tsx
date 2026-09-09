import Image from "next/image";
import Link from "next/link";

export function PublicSiteHeader() {
  return (
    <header className="public-header">
      <Link className="public-brand" href="/">
        <Image alt="Aicon Edificadora" className="public-brand-logo" height={64} priority src="/brand/aicon-logo.svg" width={260} />
        <Image alt="" aria-hidden="true" className="public-brand-logo public-brand-logo-inverse" height={64} priority src="/brand/aicon-logo-inverse.svg" width={260} />
      </Link>
      <nav aria-label="Navegación pública" className="public-nav public-desktop-nav">
        <Link href="/#condominios">Condominios</Link>
        <Link href="/catalogo">Casas</Link>
        <Link href="/contacto">Contacto</Link>
        <Link className="button button-primary public-nav-action" href="/catalogo">Explorar casas</Link>
      </nav>
      <details className="public-mobile-menu">
        <summary aria-label="Abrir menú de navegación"><span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" /></summary>
        <nav aria-label="Navegación móvil"><Link href="/">Inicio</Link><Link href="/#condominios">Condominios</Link><Link href="/catalogo">Casas</Link><Link href="/contacto">Contacto</Link></nav>
      </details>
    </header>
  );
}
