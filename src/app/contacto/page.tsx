import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { getPublicCondominium, getPublicProperty } from "@/modules/catalog/infrastructure/public-catalog-repository";
import { PublicSiteFooter } from "@/modules/catalog/ui/public-site-footer";
import { PublicSiteHeader } from "@/modules/catalog/ui/public-site-header";
import type { PublicInquiryContext } from "@/modules/crm/domain/public-inquiry";
import { PublicInquiryForm } from "@/modules/crm/ui/public-inquiry-form";
import { getPublicCompanyProfile, whatsappHref } from "@/modules/company/infrastructure/public-company-profile";

export const metadata: Metadata = { title: "Hablar con un asesor | Aicon" };

async function resolveContext(query: Record<string, string | string[] | undefined>): Promise<PublicInquiryContext> {
  const unitId = typeof query.unidad === "string" ? query.unidad : null;
  const condominiumSlug = typeof query.condominio === "string" ? query.condominio : null;
  if (unitId && condominiumSlug) notFound();

  if (unitId) {
    if (!z.uuid().safeParse(unitId).success) notFound();
    const property = await getPublicProperty(unitId);
    if (!property) notFound();
    return {
      condominiumId: null,
      interestKind: "unit",
      label: `${property.condominium.name} · Unidad ${property.code}`,
      unitId: property.id,
    };
  }

  if (condominiumSlug) {
    const detail = await getPublicCondominium(condominiumSlug);
    if (!detail) notFound();
    return {
      condominiumId: detail.condominium.id,
      interestKind: "condominium",
      label: detail.condominium.name,
      unitId: null,
    };
  }

  return { condominiumId: null, interestKind: "general", label: "Información general de Aicon", unitId: null };
}

export default async function ContactPage({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const context = await resolveContext(await searchParams);
  const company = getPublicCompanyProfile();

  return (
    <div className="public-shell public-inner-shell">
      <PublicSiteHeader />
      <main className="contact-page">
        <section className="contact-intro"><p className="eyebrow">Hablar con un asesor</p><h1>Cuéntanos qué información necesitas.</h1><p>El formulario está habilitado. Tu interés quedará asociado automáticamente para que el equipo de Aicon pueda responderte con contexto.</p><div className="contact-promise"><strong>Respuesta personal</strong><span>Precio, disponibilidad y condiciones se confirmarán directamente contigo.</span></div>{company.phone || company.email || company.whatsapp ? <address className="contact-channels"><strong>Canales verificados</strong>{company.phone ? <a href={`tel:${company.phone}`}>{company.phone}</a> : null}{company.email ? <a href={`mailto:${company.email}`}>{company.email}</a> : null}{company.whatsapp ? <a href={whatsappHref(company.whatsapp, context.label)} rel="noreferrer" target="_blank">Abrir WhatsApp</a> : null}</address> : <p className="contact-channel-note">Teléfono, WhatsApp y correo directo se mostrarán cuando el propietario confirme los datos empresariales.</p>}</section>
        <section aria-label="Formulario para hablar con un asesor" className="contact-form-panel"><PublicInquiryForm context={context} /></section>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
