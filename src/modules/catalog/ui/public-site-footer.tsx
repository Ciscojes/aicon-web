import Image from "next/image";
import Link from "next/link";
import { getPublicCompanyProfile, whatsappHref } from "@/modules/company/infrastructure/public-company-profile";

const usd = new Intl.NumberFormat("es-CR", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function PublicSiteFooter({ appointmentHref, appointmentPrice }: Readonly<{ appointmentHref?: string; appointmentPrice?: number | null }>) {
  const company = getPublicCompanyProfile();
  const contacts = [
    company.phone ? <a href={`tel:${company.phone}`} key="phone">{company.phone}</a> : null,
    company.email ? <a href={`mailto:${company.email}`} key="email">{company.email}</a> : null,
    company.whatsapp ? <a href={whatsappHref(company.whatsapp)} key="whatsapp" rel="noreferrer" target="_blank">WhatsApp</a> : null,
  ].filter(Boolean);
  return (
    <footer className={`public-footer${appointmentHref ? " public-footer-with-appointment" : ""}`} id="pie-de-pagina">
      <div><Image alt="Aicon Edificadora" className="public-footer-logo" height={64} src="/brand/aicon-logo-inverse.svg" width={260} /><p>Espacios residenciales pensados para la vida que quieres construir.</p></div>
      <nav aria-label="Navegación del pie"><Link href="/catalogo">Catálogo</Link><Link href="/contacto">Contacto</Link><Link href="/iniciar-sesion">Acceso interno</Link></nav>
      <p className="public-disclaimer">Precios y disponibilidad sujetos a confirmación directa con Aicon Edificadora.</p>
      {contacts.length > 0 ? <address className="public-footer-contact">{contacts}</address> : null}
      {company.legalName ? <p className="public-footer-legal">{company.legalName}{company.legalRegistration ? ` · ${company.legalRegistration}` : ""}{company.address ? ` · ${company.address}` : ""}</p> : null}
      {appointmentHref ? <div className="mobile-property-bar"><span><small>Precio</small><strong>{appointmentPrice === null || appointmentPrice === undefined ? "Por confirmar" : usd.format(appointmentPrice)}</strong></span><Link href={appointmentHref}>Agendar visita</Link></div> : null}
    </footer>
  );
}
