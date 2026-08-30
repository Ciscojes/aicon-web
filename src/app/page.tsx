import Link from "next/link";

export default function Home() {
  return (
    <main className="home-shell">
      <nav aria-label="Navegación principal" className="site-nav">
        <span className="wordmark">AICON</span>
        <Link className="button button-secondary" href="/iniciar-sesion">
          Panel interno
        </Link>
      </nav>
      <section className="hero">
        <p className="eyebrow">Aicon Edificadora</p>
        <h1>Una base sólida para encontrar tu próximo hogar.</h1>
        <p className="lede">
          El nuevo catálogo de proyectos residenciales está en construcción.
        </p>
        <div className="hero-actions">
          <span className="button button-primary" aria-disabled="true">
            Catálogo próximamente
          </span>
        </div>
      </section>
    </main>
  );
}
