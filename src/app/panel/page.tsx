import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel | Aicon",
};

export default function PanelPage() {
  return (
    <main className="panel-content">
      <p className="eyebrow">Estado del MVP</p>
      <h1>Catálogo y consultas</h1>
      <p className="lede">
        El catálogo público y administrativo ya reciben consultas que el equipo
        autorizado puede revisar desde el CRM.
      </p>
      <section aria-label="Estado de módulos" className="status-grid">
        <article className="status-card">
          <span aria-hidden="true">01</span>
          <h2>Catálogo</h2>
          <p>Condominios, modelos, casas y fotografías operativos.</p>
        </article>
        <article className="status-card">
          <span aria-hidden="true">02</span>
          <h2>CRM</h2>
          <p>Bandeja inicial de consultas públicas disponible.</p>
        </article>
        <article className="status-card">
          <span aria-hidden="true">03</span>
          <h2>Citas</h2>
          <p>Estructura reservada para próximas entregas.</p>
        </article>
      </section>
    </main>
  );
}
