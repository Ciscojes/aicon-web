import Image from "next/image";
import Link from "next/link";

export function PublicSiteHeader() {
  return (
    <header className="public-header">
      <Link className="public-brand" href="/">
        <Image alt="Aicon Edificadora" className="public-brand-logo" height={64} priority src="/brand/aicon-logo.svg" width={260} />
      </Link>
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
