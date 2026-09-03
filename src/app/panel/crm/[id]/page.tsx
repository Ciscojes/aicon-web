import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { createOpportunityNote, updateOpportunityAdvisor, updateOpportunityStage } from "./actions";
import { requireCrmAccess } from "../authorization";
import { getOpportunity, listActiveAdvisors } from "@/modules/crm/infrastructure/opportunity-repository";

export const metadata: Metadata = { title: "Detalle de oportunidad | Panel Aicon" };

const stages = {
  contacted: "Contactado",
  discarded: "Descartado",
  negotiation: "Negociación",
  new: "Nuevo",
  quote: "Cotización",
  sold: "Vendido",
  visit_scheduled: "Visita programada",
} as const;
const activityTypes = {
  assignment: "Asignación",
  call: "Llamada",
  email: "Correo",
  inquiry: "Consulta",
  note: "Nota",
  quote: "Cotización",
  stage_change: "Cambio de etapa",
  visit: "Visita",
  whatsapp: "WhatsApp",
} as const;
const sources = {
  contact_form: "Formulario de contacto",
  manual: "Registro manual",
  quote_request: "Solicitud de cotización",
} as const;
const date = new Intl.DateTimeFormat("es-CR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Costa_Rica",
});
const usd = new Intl.NumberFormat("es-CR", {
  currency: "USD",
  maximumFractionDigits: 2,
  style: "currency",
});

export default async function OpportunityPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}>) {
  const profile = await requireCrmAccess();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const [opportunity, advisors] = await Promise.all([
    getOpportunity(id),
    profile.role === "administrator" ? listActiveAdvisors() : Promise.resolve([]),
  ]);
  if (!opportunity) notFound();

  const messages = await searchParams;
  const noteAction = createOpportunityNote.bind(null, id);
  const stageAction = updateOpportunityStage.bind(null, id);
  const advisorAction = updateOpportunityAdvisor.bind(null, id);
  const interest = opportunity.condominiumName
    ? `${opportunity.condominiumName}${opportunity.unitCode ? ` · Unidad ${opportunity.unitCode}` : ""}`
    : "Interés general";

  return (
    <main className="panel-content catalog-page crm-detail-page">
      <Link className="text-link back-link" href="/panel/crm">← Volver al CRM</Link>

      <div className="page-heading editor-heading">
        <div>
          <p className="eyebrow">Oportunidad comercial</p>
          <h1>{opportunity.contactName}</h1>
          <p className="lede">{interest}</p>
        </div>
        <span className={`status-pill status-${opportunity.status === "open" ? "published" : "hidden"}`}>
          {stages[opportunity.stage]}
        </span>
      </div>

      {messages.notice ? <output className="form-success page-notice">{messages.notice}</output> : null}
      {messages.error ? <p className="form-message page-notice" role="alert">{messages.error}</p> : null}

      <div className="crm-detail-grid">
        <div className="crm-detail-main">
          <section className="crm-detail-panel" aria-labelledby="contact-title">
            <div className="crm-section-heading"><div><p className="eyebrow">Cliente</p><h2 id="contact-title">Datos de contacto</h2></div><span>{sources[opportunity.source]}</span></div>
            <dl className="crm-data-grid">
              <div><dt>Teléfono</dt><dd><a href={`tel:${opportunity.contactPhone}`}>{opportunity.contactPhone}</a></dd></div>
              <div><dt>Correo</dt><dd>{opportunity.contactEmail ? <a href={`mailto:${opportunity.contactEmail}`}>{opportunity.contactEmail}</a> : "No indicado"}</dd></div>
              <div><dt>WhatsApp autorizado</dt><dd>{opportunity.contactWhatsappConsent ? "Sí" : "No"}</dd></div>
              <div><dt>Correo autorizado</dt><dd>{opportunity.contactEmailConsent ? "Sí" : "No"}</dd></div>
              <div><dt>Responsable</dt><dd>{opportunity.advisorName ?? "Sin asignar"}</dd></div>
              <div><dt>Ingreso</dt><dd>{date.format(new Date(opportunity.createdAt))}</dd></div>
            </dl>
          </section>

          <section className="crm-detail-panel" aria-labelledby="history-title">
            <div className="crm-section-heading"><div><p className="eyebrow">Seguimiento</p><h2 id="history-title">Historial</h2></div><span>{opportunity.activities.length} actividades</span></div>
            {opportunity.activities.length === 0 ? <div className="empty-state compact-empty"><p>No hay actividades registradas.</p></div> : (
              <ol className="crm-timeline">
                {opportunity.activities.map((activity) => (
                  <li key={activity.id}>
                    <div><strong>{activityTypes[activity.type]}</strong><time dateTime={activity.occurredAt}>{date.format(new Date(activity.occurredAt))}</time></div>
                    <p>{activity.content}</p>
                    <span>{activity.actorName ?? "Sistema o formulario público"}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {opportunity.quotes.length > 0 ? (
            <section className="crm-detail-panel" aria-labelledby="quotes-title">
              <div className="crm-section-heading"><div><p className="eyebrow">Financiamiento</p><h2 id="quotes-title">Cotizaciones</h2></div><span>{opportunity.quotes.length} registradas</span></div>
              <div className="crm-quotes">
                {opportunity.quotes.map((quote) => (
                  <article key={quote.id}>
                    <div><strong>{usd.format(quote.estimatedMonthlyPaymentUsd)} / mes</strong><time dateTime={quote.createdAt}>{date.format(new Date(quote.createdAt))}</time></div>
                    <p>Precio {usd.format(quote.priceSnapshotUsd)} · Prima {usd.format(quote.downPaymentUsd)} · Financia {usd.format(quote.financedAmountUsd)}</p>
                    <span>{quote.termMonths / 12} años · tasa anual {quote.annualRatePct}%</span>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="crm-management-panel">
          <p className="eyebrow">Gestión</p>
          <h2>Actualizar oportunidad</h2>
          <p className="muted">Los cambios conservan autor y fecha en el historial.</p>

          <form action={stageAction} className="crm-management-form">
            <label><span>Etapa comercial</span><select defaultValue={opportunity.stage} name="stage">{Object.entries(stages).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <button className="button button-secondary button-full" type="submit">Guardar etapa</button>
          </form>

          {profile.role === "administrator" ? (
            <form action={advisorAction} className="crm-management-form">
              <label><span>Asesor responsable</span><select defaultValue={opportunity.advisorId ?? ""} name="advisorId"><option value="">Sin asignar</option>{advisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.name}</option>)}</select></label>
              <button className="button button-secondary button-full" type="submit">Guardar responsable</button>
            </form>
          ) : null}

          <form action={noteAction} className="crm-management-form crm-note-form">
            <label><span>Nueva nota</span><textarea maxLength={5000} name="content" placeholder="Registra el resultado del seguimiento…" required rows={6} /></label>
            <button className="button button-primary button-full" type="submit">Agregar nota</button>
          </form>
        </aside>
      </div>
    </main>
  );
}
