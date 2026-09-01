import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  archiveCondominium,
  hideCondominium,
  publishCondominium,
} from "./actions";
import {
  isCatalogEntityId,
  requireCatalogManager,
} from "@/app/panel/catalogo/authorization";
import { getCondominium } from "@/modules/catalog/infrastructure/condominium-repository";
import { listCatalogMedia } from "@/modules/catalog/infrastructure/catalog-media-repository";
import { CatalogMediaManager } from "@/modules/catalog/ui/catalog-media-manager";
import { CondominiumEditForm } from "@/modules/catalog/ui/condominium-edit-form";

export const metadata: Metadata = {
  title: "Editar condominio | Panel Aicon",
};

const statusLabels = {
  draft: "Borrador",
  hidden: "Oculto",
  published: "Publicado",
} as const;

export default async function EditCondominiumPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}>) {
  await requireCatalogManager();

  const { id } = await params;
  if (!isCatalogEntityId(id)) notFound();

  const [condominium, media] = await Promise.all([
    getCondominium(id),
    listCatalogMedia("condominium", id),
  ]);
  if (!condominium) notFound();

  const messages = await searchParams;
  const publishAction = publishCondominium.bind(null, id);
  const hideAction = hideCondominium.bind(null, id);
  const archiveAction = archiveCondominium.bind(null, id);

  return (
    <main className="panel-content catalog-page">
      <Link className="text-link back-link" href="/panel/catalogo/condominios">
        ← Volver a condominios
      </Link>

      <div className="page-heading editor-heading">
        <div>
          <p className="eyebrow">Editar proyecto</p>
          <h1>{condominium.name}</h1>
          <p className="lede">Completa la información antes de publicarla.</p>
          <Link className="text-link" href={`/panel/catalogo/condominios/${id}/previsualizacion`}>
            Previsualizar página →
          </Link>
        </div>
        <span className={`status-pill status-${condominium.publicationStatus}`}>
          {statusLabels[condominium.publicationStatus]}
        </span>
      </div>

      {messages.notice ? (
        <output className="form-success page-notice">
          {messages.notice}
        </output>
      ) : null}
      {messages.error ? (
        <p className="form-message page-notice" role="alert">
          {messages.error}
        </p>
      ) : null}

      <div className="editor-layout">
        <section aria-labelledby="edit-content-title" className="catalog-form-panel">
          <h2 id="edit-content-title">Información pública</h2>
          <p className="muted">
            Nombre, descripción y dirección son obligatorios para publicar.
          </p>
          <CondominiumEditForm condominium={condominium} />
        </section>

        <aside className="lifecycle-panel">
          <p className="eyebrow">Visibilidad</p>
          <h2>Estado del proyecto</h2>
          <p className="muted">
            Publicar lo marca como visible para el catálogo; ocultar conserva el
            contenido sin mostrarlo.
          </p>

          {condominium.publicationStatus === "published" ? (
            <form action={hideAction}>
              <button className="button button-secondary button-full" type="submit">
                Ocultar condominio
              </button>
            </form>
          ) : (
            <form action={publishAction}>
              <button className="button button-primary button-full" type="submit">
                {condominium.publicationStatus === "hidden"
                  ? "Volver a publicar"
                  : "Publicar condominio"}
              </button>
            </form>
          )}

          <div className="danger-zone">
            <h3>Archivar</h3>
            <p>
              Retira el proyecto del panel activo sin eliminar su información.
            </p>
            <form action={archiveAction}>
              <label className="confirmation-field">
                <input name="confirmArchive" required type="checkbox" value="yes" />
                <span>Confirmo que deseo archivarlo.</span>
              </label>
              <button className="button button-danger button-full" type="submit">
                Archivar condominio
              </button>
            </form>
          </div>
        </aside>
      </div>
      <CatalogMediaManager entityId={id} entityType="condominium" media={media} />
    </main>
  );
}
