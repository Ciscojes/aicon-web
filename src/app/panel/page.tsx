import type { Metadata } from "next";
import Link from "next/link";

import { getPanelSummary } from "@/modules/dashboard/infrastructure/panel-summary-repository";
import { canAccessCrm } from "@/modules/users/domain/role";
import { getCurrentProfile } from "@/modules/users/infrastructure/get-current-profile";

export const metadata: Metadata = {
  title: "Panel | Aicon",
};

export default async function PanelPage() {
  const profile = await getCurrentProfile();
  const showCrm = profile ? canAccessCrm(profile.role) : false;
  const summary = await getPanelSummary(showCrm);

  return (
    <main className="panel-content dashboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Resumen administrativo</p>
          <h1>Estado de Aicon</h1>
          <p className="lede">Inventario y oportunidades que requieren atención.</p>
        </div>
      </div>

      <section aria-label="Indicadores de inventario" className="dashboard-metrics">
        <Link className="dashboard-metric" href="/panel/catalogo/unidades"><span>Casas disponibles</span><strong>{summary.availableUnits}</strong><small>Revisar inventario →</small></Link>
        <Link className="dashboard-metric" href="/panel/catalogo/unidades"><span>Casas reservadas</span><strong>{summary.reservedUnits}</strong><small>Revisar inventario →</small></Link>
        <Link className="dashboard-metric" href="/panel/catalogo/unidades"><span>Casas vendidas</span><strong>{summary.soldUnits}</strong><small>Revisar inventario →</small></Link>
        {showCrm ? <Link className="dashboard-metric dashboard-metric-accent" href="/panel/crm?status=open&amp;stage=new"><span>Oportunidades nuevas</span><strong>{summary.newOpportunities}</strong><small>Atender consultas →</small></Link> : null}
        {showCrm ? <Link className="dashboard-metric dashboard-metric-warning" href="/panel/crm?status=open&amp;advisor=unassigned"><span>Sin asesor asignado</span><strong>{summary.unassignedOpportunities}</strong><small>Asignar responsables →</small></Link> : null}
        {showCrm ? <Link className="dashboard-metric dashboard-metric-danger" href="/panel/crm?status=open&amp;followUp=overdue"><span>Seguimientos atrasados</span><strong>{summary.overdueFollowUps}</strong><small>Atender ahora →</small></Link> : null}
      </section>

      <section className="dashboard-next">
        <div><p className="eyebrow">Próxima entrega</p><h2>Agenda de visitas</h2><p>Los seguimientos comerciales ya están activos. El próximo bloque añadirá visitas y el estado de sus notificaciones.</p></div>
        {showCrm ? <Link className="button button-secondary" href="/panel/crm">Abrir CRM</Link> : null}
      </section>
    </main>
  );
}
