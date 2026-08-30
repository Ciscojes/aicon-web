"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="es">
      <body>
        <main className="auth-shell">
          <section className="auth-card">
            <p className="eyebrow">Error inesperado</p>
            <h1>No pudimos completar la acción.</h1>
            <p className="muted">
              Intenta nuevamente. Si el problema continúa, comunícalo al equipo
              técnico.
            </p>
            <button className="button button-primary" onClick={reset} type="button">
              Intentar de nuevo
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
