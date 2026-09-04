import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { listPublicVisitSlots } from "@/modules/appointments/infrastructure/public-appointment-repository";
import { PublicAppointmentForm } from "@/modules/appointments/ui/public-appointment-form";
import { getPublicProperty } from "@/modules/catalog/infrastructure/public-catalog-repository";
import { PublicSiteFooter } from "@/modules/catalog/ui/public-site-footer";
import { PublicSiteHeader } from "@/modules/catalog/ui/public-site-header";

export const metadata: Metadata = { title: "Agendar visita | Aicon" };

export default async function AppointmentPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const query = await searchParams;
  const unitId = typeof query.unidad === "string" ? query.unidad : "";
  const selectedDate = typeof query.fecha === "string" ? query.fecha : "";
  if (!z.uuid().safeParse(unitId).success) notFound();
  const property = await getPublicProperty(unitId);
  if (!property) notFound();
  const validDate = z.iso.date().safeParse(selectedDate);
  const slots = validDate.success && property.availabilityStatus === "available"
    ? await listPublicVisitSlots(unitId, validDate.data)
    : [];
  const label = `${property.condominium.name} · Unidad ${property.code}`;

  return (
    <div className="public-shell public-inner-shell">
      <PublicSiteHeader />
      <main className="appointment-page">
        <section className="appointment-intro">
          <p className="eyebrow">Agenda tu visita</p>
          <h1>Conoce tu próxima casa.</h1>
          <p>Selecciona una fecha para consultar los horarios configurados por el equipo de Aicon.</p>
          <div className="contact-promise"><strong>{label}</strong><span>Las visitas duran el tiempo configurado por Aicon y se muestran en hora de Costa Rica.</span></div>
          <form className="appointment-date-picker" method="get">
            <input name="unidad" type="hidden" value={unitId} />
            <label><span>Fecha de visita</span><input defaultValue={validDate.success ? validDate.data : ""} name="fecha" required type="date" /></label>
            <button className="button button-secondary" type="submit">Ver horarios</button>
          </form>
        </section>
        <section aria-label="Confirmación de visita" className="contact-form-panel">
          {property.availabilityStatus !== "available" ? (
            <div className="empty-state"><p>Esta casa no admite nuevas visitas.</p><Link className="text-link" href="/catalogo">Ver otras casas →</Link></div>
          ) : validDate.success && slots.length > 0 ? (
            <PublicAppointmentForm context={{ label, unitId }} slots={slots} />
          ) : (
            <div className="empty-state"><p>{validDate.success ? "No hay horarios disponibles para esta fecha." : "Selecciona una fecha para ver horarios."}</p><span>Si no encuentras una opción, puedes hablar con un asesor.</span><Link className="text-link" href={`/contacto?unidad=${unitId}`}>Contactar a Aicon →</Link></div>
          )}
        </section>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
