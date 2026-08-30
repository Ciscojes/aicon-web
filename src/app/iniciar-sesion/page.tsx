import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/modules/users/ui/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | Aicon",
};

type LoginPageProps = {
  searchParams: Promise<{ siguiente?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { siguiente } = await searchParams;

  return (
    <main className="auth-shell">
      <section aria-labelledby="login-title" className="auth-card">
        <Link className="wordmark" href="/">
          AICON
        </Link>
        <p className="eyebrow">Panel interno</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <p className="muted">
          Acceso exclusivo para el equipo autorizado de Aicon Edificadora.
        </p>
        <LoginForm nextPath={siguiente} />
        <Link className="text-link" href="/">
          Volver al sitio público
        </Link>
      </section>
    </main>
  );
}
