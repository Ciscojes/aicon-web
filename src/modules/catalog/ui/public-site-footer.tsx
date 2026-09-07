import Link from "next/link";

export function PublicSiteFooter({ appointmentHref }: Readonly<{ appointmentHref?: string }>) {
  return (
    <footer className="public-footer">
      <div><span className="wordmark public-wordmark">AICON</span><p>Espacios residenciales pensados para la vida que quieres construir.</p></div>
      <nav aria-label="Navegación del pie"><Link href="/catalogo">Catálogo</Link><Link href="/contacto">Contacto</Link><Link href="/iniciar-sesion">Acceso interno</Link></nav>
      <p className="public-disclaimer">Precios y disponibilidad sujetos a confirmación directa con Aicon Edificadora.</p>
      {appointmentHref ? <Link className="mobile-appointment-cta" href={appointmentHref}>Agendar visita</Link> : null}
    </footer>
  );
}
