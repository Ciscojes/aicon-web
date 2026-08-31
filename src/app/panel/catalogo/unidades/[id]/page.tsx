import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { archiveHouseUnit, changeHouseUnitPublication } from "./actions";
import { isCatalogEntityId, requireCatalogManager } from "@/app/panel/catalogo/authorization";
import { getHouseUnit, listHouseUnitOptions } from "@/modules/catalog/infrastructure/house-unit-repository";
import { listCatalogMedia } from "@/modules/catalog/infrastructure/catalog-media-repository";
import { CatalogMediaManager } from "@/modules/catalog/ui/catalog-media-manager";
import { HouseUnitEditForm } from "@/modules/catalog/ui/house-unit-edit-form";

export const metadata: Metadata = { title: "Editar unidad | Panel Aicon" };
const publicationLabels = { draft: "Borrador", hidden: "Oculta", published: "Publicada" } as const;

export default async function EditHouseUnitPage({ params, searchParams }: Readonly<{ params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; notice?: string }> }>) {
  await requireCatalogManager();
  const { id } = await params;
  if (!isCatalogEntityId(id)) notFound();
  const [unit, options, messages, media] = await Promise.all([getHouseUnit(id), listHouseUnitOptions(), searchParams, listCatalogMedia("unit", id)]);
  if (!unit) notFound();
  const models = unit.modelId && !options.models.some((model) => model.id === unit.modelId && model.condominiumId === unit.condominiumId)
    ? [...options.models, { condominiumId: unit.condominiumId, id: unit.modelId, name: `${unit.modelName ?? "Modelo anterior"} · no disponible para nuevas unidades` }]
    : options.models;
  const publishAction = changeHouseUnitPublication.bind(null, id, "published");
  const hideAction = changeHouseUnitPublication.bind(null, id, "hidden");
  const archiveAction = archiveHouseUnit.bind(null, id);
  return (
    <main className="panel-content catalog-page">
      <Link className="text-link back-link" href="/panel/catalogo/unidades">← Volver a unidades</Link>
      <div className="page-heading editor-heading">
        <div><p className="eyebrow">Editar unidad</p><h1>{unit.code}</h1><p className="lede">{unit.condominiumName} · {unit.modelName ?? "Diseño único"}</p></div>
        <span className={`status-pill status-${unit.publicationStatus}`}>{publicationLabels[unit.publicationStatus]}</span>
      </div>
      {messages.error ? <p className="form-message page-notice" role="alert">{messages.error}</p> : null}
      {messages.notice ? <output className="form-success page-notice">{messages.notice}</output> : null}
      <div className="editor-layout">
        <section aria-labelledby="edit-unit-title" className="catalog-form-panel">
          <h2 id="edit-unit-title">Información de la casa</h2>
          <p className="muted">Los valores específicos reemplazan los heredados del modelo.</p>
          <HouseUnitEditForm condominiums={options.condominiums} models={models} unit={unit} />
        </section>
        <aside className="lifecycle-panel">
          <p className="eyebrow">Publicación</p>
          <h2>{publicationLabels[unit.publicationStatus]}</h2>
          <p className="muted">Solo aparecerá en el catálogo cuando la unidad y su condominio estén publicados.</p>
          <form action={unit.publicationStatus === "published" ? hideAction : publishAction}>
            <label className="confirmation-field"><input name="confirmStatus" required type="checkbox" value="yes" /><span>Confirmo el cambio de publicación.</span></label>
            <button className="button button-secondary button-full" type="submit">{unit.publicationStatus === "published" ? "Ocultar unidad" : "Publicar unidad"}</button>
          </form>
          <div className="danger-zone">
            <h3>Archivar</h3><p>La casa saldrá del inventario activo sin perder su información.</p>
            <form action={archiveAction}>
              <label className="confirmation-field"><input name="confirmArchive" required type="checkbox" value="yes" /><span>Confirmo que deseo archivarla.</span></label>
              <button className="button button-danger button-full" type="submit">Archivar unidad</button>
            </form>
          </div>
        </aside>
      </div>
      <CatalogMediaManager entityId={id} entityType="unit" media={media} />
    </main>
  );
}
