import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";

import { requireCrmAccess } from "./authorization";
import type { OpportunityFilters, OpportunitySummary } from "@/modules/crm/domain/opportunity";
import {
  listActiveAdvisors,
  listCrmCondominiums,
  listOpportunities,
} from "@/modules/crm/infrastructure/opportunity-repository";

export const metadata: Metadata = { title: "CRM | Panel Aicon" };

const stages = {
  new: "Nuevo",
  contacted: "Contactado",
  visit_scheduled: "Visita programada",
  quote: "Cotización",
  negotiation: "Negociación",
  sold: "Vendido",
  discarded: "Descartado",
} as const;
const stageSchema = z.enum(Object.keys(stages) as [keyof typeof stages, ...(keyof typeof stages)[]]);
const statusSchema = z.enum(["all", "open", "closed"]);
const dateSchema = z.iso.date();
const uuidSchema = z.uuid();
const date = new Intl.DateTimeFormat("es-CR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Costa_Rica" });
const usd = new Intl.NumberFormat("es-CR", { currency: "USD", maximumFractionDigits: 2, style: "currency" });

function valid<T>(value: string | undefined, schema: z.ZodType<T>): T | undefined {
  const result = schema.safeParse(value);
  return result.success ? result.data : undefined;
}

export default async function CrmPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  await requireCrmAccess();
  const query = await searchParams;
  const value = (name: string) => typeof query[name] === "string" ? query[name] : undefined;
  const filters: OpportunityFilters = {
    advisorId: valid(value("advisor"), uuidSchema),
    condominiumId: valid(value("condominium"), uuidSchema),
    dateFrom: valid(value("from"), dateSchema),
    dateTo: valid(value("to"), dateSchema),
    stage: valid(value("stage"), stageSchema),
    status: valid(value("status"), statusSchema) ?? "open",
  };
  const [opportunities, advisors, condominiums] = await Promise.all([
    listOpportunities(filters),
    listActiveAdvisors(),
    listCrmCondominiums(),
  ]);
  const opportunitiesByStage = new Map<OpportunitySummary["stage"], OpportunitySummary[]>(
    Object.keys(stages).map((stage) => [stage as OpportunitySummary["stage"], []]),
  );
  for (const opportunity of opportunities) opportunitiesByStage.get(opportunity.stage)?.push(opportunity);
  const visibleStages = filters.stage ? [filters.stage] : Object.keys(stages) as OpportunitySummary["stage"][];

  return (
    <main className="panel-content crm-page">
      <div className="page-heading"><div><p className="eyebrow">CRM</p><h1>Embudo comercial</h1><p className="lede">Consulta, filtra y gestiona las oportunidades de Aicon.</p></div><span className="count-badge">{opportunities.length} resultados</span></div>

      <form className="crm-filters" method="get">
        <label><span>Estado</span><select defaultValue={filters.status} name="status"><option value="open">Abiertas</option><option value="closed">Cerradas</option><option value="all">Todas</option></select></label>
        <label><span>Etapa</span><select defaultValue={filters.stage ?? ""} name="stage"><option value="">Todas</option>{Object.entries(stages).map(([stage, label]) => <option key={stage} value={stage}>{label}</option>)}</select></label>
        <label><span>Asesor</span><select defaultValue={filters.advisorId ?? ""} name="advisor"><option value="">Todos</option>{advisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.name}</option>)}</select></label>
        <label><span>Condominio</span><select defaultValue={filters.condominiumId ?? ""} name="condominium"><option value="">Todos</option>{condominiums.map((condominium) => <option key={condominium.id} value={condominium.id}>{condominium.name}</option>)}</select></label>
        <label><span>Desde</span><input defaultValue={filters.dateFrom ?? ""} name="from" type="date" /></label>
        <label><span>Hasta</span><input defaultValue={filters.dateTo ?? ""} name="to" type="date" /></label>
        <div className="crm-filter-actions"><button className="button button-primary" type="submit">Aplicar filtros</button><Link className="text-link" href="/panel/crm">Limpiar</Link></div>
      </form>

      {opportunities.length === 0 ? (
        <div className="empty-state"><p>No hay oportunidades con estos filtros.</p><span>Prueba otro estado, etapa o rango de fechas.</span></div>
      ) : (
        <section aria-label="Embudo de oportunidades" className="crm-board">
          {visibleStages.map((stage) => (
            <section className="crm-stage-column" key={stage}>
              <header><h2>{stages[stage]}</h2><span>{opportunitiesByStage.get(stage)?.length ?? 0}</span></header>
              <div className="crm-stage-list">
                {opportunitiesByStage.get(stage)?.map((opportunity) => (
                  <article className="crm-card" key={opportunity.id}>
                    <div><h3>{opportunity.contactName}</h3><p>{opportunity.condominiumName ? `${opportunity.condominiumName}${opportunity.unitCode ? ` · Unidad ${opportunity.unitCode}` : ""}` : "Información general"}</p><span className="crm-owner">{opportunity.advisorName ?? "Sin asesor"}</span></div>
                    <div className="crm-contact"><a href={`tel:${opportunity.contactPhone}`}>{opportunity.contactPhone}</a>{opportunity.latestQuote ? <span className="crm-quote">Cuota {usd.format(opportunity.latestQuote.monthlyPaymentUsd)} · {opportunity.latestQuote.termMonths / 12} años</span> : null}</div>
                    <div className="crm-card-actions"><time dateTime={opportunity.createdAt}>{date.format(new Date(opportunity.createdAt))}</time><Link className="text-link" href={`/panel/crm/${opportunity.id}`}>Ver detalle →</Link></div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>
      )}
    </main>
  );
}
