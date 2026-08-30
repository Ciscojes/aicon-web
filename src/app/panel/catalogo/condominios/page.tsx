import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { listCondominiums } from "@/modules/catalog/infrastructure/condominium-repository";
import { CondominiumForm } from "@/modules/catalog/ui/condominium-form";
import { canManageCatalog } from "@/modules/users/domain/role";
import { getCurrentProfile } from "@/modules/users/infrastructure/get-current-profile";

export const metadata: Metadata = {
  title: "Condominios | Panel Aicon",
};

const statusLabels = {
  draft: "Borrador",
  hidden: "Oculto",
  published: "Publicado",
} as const;

export default async function CondominiumsPage() {
  const profile = await getCurrentProfile();

  if (!profile || !canManageCatalog(profile.role)) redirect("/panel");

  const condominiums = await listCondominiums();

  return (
    <main className="panel-content catalog-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Condominios</h1>
          <p className="lede">
            Registra cada proyecto como borrador antes de añadir modelos y casas.
          </p>
        </div>
        <span className="count-badge">
          {condominiums.length} {condominiums.length === 1 ? "registro" : "registros"}
        </span>
      </div>

      <div className="catalog-layout">
        <section aria-labelledby="condominiums-title" className="catalog-list-panel">
          <h2 id="condominiums-title">Proyectos registrados</h2>
          {condominiums.length === 0 ? (
            <div className="empty-state">
              <p>Aún no hay condominios.</p>
              <span>El primer registro aparecerá aquí como borrador.</span>
            </div>
          ) : (
            <ul className="catalog-list">
              {condominiums.map((condominium) => (
                <li key={condominium.id}>
                  <div>
                    <h3>{condominium.name}</h3>
                    <p>{condominium.address || "Dirección pendiente"}</p>
                    <code>/{condominium.slug}</code>
                  </div>
                  <span className={`status-pill status-${condominium.publicationStatus}`}>
                    {statusLabels[condominium.publicationStatus]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="new-condominium-title" className="catalog-form-panel">
          <p className="eyebrow">Nuevo proyecto</p>
          <h2 id="new-condominium-title">Crear condominio</h2>
          <p className="muted">
            Guardarlo no lo publica. Podrás completar fotografías y ubicación después.
          </p>
          <CondominiumForm />
        </section>
      </div>
    </main>
  );
}
