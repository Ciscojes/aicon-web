import type { Metadata } from "next";

import { requireCrmAccess } from "./authorization";
import { listOpenOpportunities } from "@/modules/crm/infrastructure/opportunity-repository";

export const metadata: Metadata = { title: "CRM | Panel Aicon" };

const stages = {
  contacted: "Contactado",
  discarded: "Descartado",
  negotiation: "Negociación",
  new: "Nuevo",
  quote: "Cotización",
  sold: "Vendido",
  visit_scheduled: "Visita programada",
} as const;
const date = new Intl.DateTimeFormat("es-CR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Costa_Rica" });
const usd = new Intl.NumberFormat("es-CR", { currency: "USD", maximumFractionDigits: 2, style: "currency" });

export default async function CrmPage() {
  await requireCrmAccess();
  const opportunities = await listOpenOpportunities();

  return (
    <main className="panel-content crm-page">
      <div className="page-heading"><div><p className="eyebrow">CRM</p><h1>Consultas nuevas</h1><p className="lede">Intereses recibidos desde el formulario público.</p></div><span className="count-badge">{opportunities.length} abiertas</span></div>
      {opportunities.length === 0 ? (
        <div className="empty-state"><p>Aún no se han recibido consultas mediante el formulario.</p></div>
      ) : (
        <section aria-label="Oportunidades abiertas" className="crm-list">
          {opportunities.map((opportunity) => (
            <article className="crm-card" key={opportunity.id}>
              <div><span className={`status-pill status-${opportunity.stage === "new" ? "draft" : "published"}`}>{stages[opportunity.stage]}</span><h2>{opportunity.contactName}</h2><p>{opportunity.condominiumName ? `${opportunity.condominiumName}${opportunity.unitCode ? ` · Unidad ${opportunity.unitCode}` : ""}` : "Información general"}</p></div>
              <div className="crm-contact"><a href={`tel:${opportunity.contactPhone}`}>{opportunity.contactPhone}</a>{opportunity.contactEmail ? <a href={`mailto:${opportunity.contactEmail}`}>{opportunity.contactEmail}</a> : <span>Sin correo</span>}{opportunity.latestQuote ? <span className="crm-quote">Cuota {usd.format(opportunity.latestQuote.monthlyPaymentUsd)} · {opportunity.latestQuote.termMonths / 12} años · tasa {opportunity.latestQuote.annualRatePct}%</span> : null}</div>
              <time dateTime={opportunity.createdAt}>{date.format(new Date(opportunity.createdAt))}</time>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
