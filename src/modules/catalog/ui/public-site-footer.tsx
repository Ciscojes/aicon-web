import Image from "next/image";
import Link from "next/link";

export function PublicSiteFooter({ appointmentHref }: Readonly<{ appointmentHref?: string }>) {
  return (
    <footer className="public-footer" id="pie-de-pagina">
      <div><Image alt="Aicon Edificadora" className="public-footer-logo" height={64} src="/brand/aicon-logo-inverse.svg" width={260} /><p>Espacios residenciales pensados para la vida que quieres construir.</p></div>
      <nav aria-label="Navegación del pie"><Link href="/catalogo">Catálogo</Link><Link href="/contacto">Contacto</Link><Link href="/iniciar-sesion">Acceso interno</Link></nav>
      <p className="public-disclaimer">Precios y disponibilidad sujetos a confirmación directa con Aicon Edificadora.</p>
      {appointmentHref ? <Link className="mobile-appointment-cta" href={appointmentHref}>Agendar visita</Link> : null}
    </footer>
  );
}
