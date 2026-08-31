import type { Metadata } from "next";
import Link from "next/link";

import { requireCatalogManager } from "@/app/panel/catalogo/authorization";
import { listHouseModels } from "@/modules/catalog/infrastructure/house-model-repository";
import { HouseModelForm } from "@/modules/catalog/ui/house-model-form";

export const metadata: Metadata = { title: "Modelos de casas | Panel Aicon" };

function modelFacts(model: Awaited<ReturnType<typeof listHouseModels>>[number]) {
  return [
    model.bedrooms === null ? null : `${model.bedrooms} hab.`,
    model.bathrooms === null ? null : `${model.bathrooms} baños`,
    model.constructionAreaM2 === null
      ? null
      : `${model.constructionAreaM2} m² construcción`,
  ].filter(Boolean);
}

export default async function HouseModelsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ notice?: string }> }>) {
  await requireCatalogManager();
  const models = await listHouseModels();
  const { notice } = await searchParams;

  return (
    <main className="panel-content catalog-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Modelos de casas</h1>
          <p className="lede">
            Define características compartidas y reutilízalas en varios condominios.
          </p>
        </div>
        <span className="count-badge">
          {models.length} {models.length === 1 ? "modelo" : "modelos"}
        </span>
      </div>

      {notice ? (
        <output className="form-success page-notice">{notice}</output>
      ) : null}

      <div className="catalog-layout">
        <section aria-labelledby="models-title" className="catalog-list-panel">
          <h2 id="models-title">Modelos registrados</h2>
          {models.length === 0 ? (
            <div className="empty-state">
              <p>Aún no hay modelos.</p>
              <span>Crea el primero y después asígnalo a sus condominios.</span>
            </div>
          ) : (
            <ul className="catalog-list">
              {models.map((model) => (
                <li key={model.id}>
                  <div>
                    <h3>{model.name}</h3>
                    <p>{modelFacts(model).join(" · ") || "Características pendientes"}</p>
                    <span className="model-assignment-count">
                      {model.condominiumCount} {model.condominiumCount === 1 ? "condominio" : "condominios"}
                    </span>
                  </div>
                  <div className="catalog-list-actions">
                    <Link className="text-link" href={`/panel/catalogo/modelos/${model.id}`}>
                      Editar
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="new-model-title" className="catalog-form-panel">
          <p className="eyebrow">Nuevo modelo</p>
          <h2 id="new-model-title">Crear modelo</h2>
          <p className="muted">
            Podrás asignarlo a uno o varios condominios después de guardarlo.
          </p>
          <HouseModelForm />
        </section>
      </div>
    </main>
  );
}
