"use client";

import Link from "next/link";

export default function CatalogError({ reset }: Readonly<{ reset: () => void }>) {
  return <main className="public-page"><div className="public-empty" role="alert"><h1>No pudimos cargar el catálogo.</h1><p>La información no se perdió. Puedes intentarlo nuevamente o volver a la portada.</p><div className="empty-actions"><button className="button button-primary" onClick={reset} type="button">Intentar de nuevo</button><Link className="button button-secondary" href="/">Volver a la portada</Link></div></div></main>;
}
