import Link from "next/link";

export function PublicSiteFooter() {
  return (
    <footer className="public-footer">
      <div><span className="wordmark public-wordmark">AICON</span><p>Construimos espacios para vivir tu futuro.</p></div>
      <nav aria-label="Navegación del pie"><Link href="/catalogo">Catálogo</Link><Link href="/contacto">Contacto</Link><Link href="/iniciar-sesion">Acceso interno</Link></nav>
      <p className="public-disclaimer">Precios y disponibilidad sujetos a confirmación directa con Aicon Edificadora.</p>
    </footer>
  );
}
