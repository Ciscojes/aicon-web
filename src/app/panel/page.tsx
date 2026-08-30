import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel | Aicon",
};

export default function PanelPage() {
  return (
    <main className="panel-content">
      <p className="eyebrow">Entrega 0</p>
      <h1>Fundamentos listos</h1>
      <p className="lede">
        La autenticación, los perfiles internos y la protección del panel ya
        forman la base sobre la que construiremos el catálogo.
      </p>
      <section aria-label="Estado de módulos" className="status-grid">
        <article className="status-card">
          <span aria-hidden="true">01</span>
          <h2>Catálogo</h2>
          <p>Preparado para la Entrega 1.</p>
        </article>
        <article className="status-card">
          <span aria-hidden="true">02</span>
          <h2>CRM</h2>
          <p>Estructura reservada para próximas entregas.</p>
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
