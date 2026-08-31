import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { archiveHouseModel } from "./actions";
import {
  isCatalogEntityId,
  requireCatalogManager,
} from "@/app/panel/catalogo/authorization";
import { listCondominiums } from "@/modules/catalog/infrastructure/condominium-repository";
import { getHouseModel } from "@/modules/catalog/infrastructure/house-model-repository";
import { HouseModelEditForm } from "@/modules/catalog/ui/house-model-edit-form";

export const metadata: Metadata = { title: "Editar modelo | Panel Aicon" };

export default async function EditHouseModelPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}>) {
  await requireCatalogManager();
  const { id } = await params;
  if (!isCatalogEntityId(id)) notFound();

  const [model, condominiums] = await Promise.all([
    getHouseModel(id),
    listCondominiums(),
  ]);
  if (!model) notFound();

  const { error } = await searchParams;
  const archiveAction = archiveHouseModel.bind(null, id);

  return (
    <main className="panel-content catalog-page">
      <Link className="text-link back-link" href="/panel/catalogo/modelos">
        ← Volver a modelos
      </Link>

      <div className="page-heading editor-heading">
        <div>
          <p className="eyebrow">Editar modelo</p>
          <h1>{model.name}</h1>
          <p className="lede">
            Los cambios se aplicarán a las unidades que hereden este modelo.
          </p>
        </div>
        <span className="count-badge">
          {model.condominiumCount} {model.condominiumCount === 1 ? "proyecto" : "proyectos"}
        </span>
      </div>

      {error ? (
        <p className="form-message page-notice" role="alert">{error}</p>
      ) : null}

      <div className="editor-layout">
        <section aria-labelledby="edit-model-title" className="catalog-form-panel">
          <h2 id="edit-model-title">Información del modelo</h2>
          <p className="muted">
            Las unidades podrán reemplazar valores específicos cuando sea necesario.
          </p>
          <HouseModelEditForm condominiums={condominiums} model={model} />
        </section>

        <aside className="lifecycle-panel">
          <p className="eyebrow">Administración</p>
          <h2>Modelo reutilizable</h2>
          <p className="muted">
            Archivar evita nuevas asignaciones sin modificar las casas existentes.
          </p>
          <div className="danger-zone">
            <h3>Archivar</h3>
            <p>El modelo saldrá de la lista activa, pero conservará su historial.</p>
            <form action={archiveAction}>
              <label className="confirmation-field">
                <input name="confirmArchive" required type="checkbox" value="yes" />
                <span>Confirmo que deseo archivarlo.</span>
              </label>
              <button className="button button-danger button-full" type="submit">
                Archivar modelo
              </button>
            </form>
          </div>
        </aside>
      </div>
    </main>
  );
}
