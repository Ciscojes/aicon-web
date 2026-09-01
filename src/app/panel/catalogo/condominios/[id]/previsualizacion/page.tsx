import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isCatalogEntityId, requireCatalogManager } from "@/app/panel/catalogo/authorization";
import type { PublicCondominium } from "@/modules/catalog/domain/public-property";
import { listCatalogMedia } from "@/modules/catalog/infrastructure/catalog-media-repository";
import { getCondominium } from "@/modules/catalog/infrastructure/condominium-repository";
import { listPublicProperties } from "@/modules/catalog/infrastructure/public-catalog-repository";
import { PublicCondominiumDetail } from "@/modules/catalog/ui/public-condominium-detail";

export const metadata: Metadata = { title: "Previsualizar condominio | Panel Aicon" };

export default async function CondominiumPreviewPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  await requireCatalogManager();
  const { id } = await params;
  if (!isCatalogEntityId(id)) notFound();

  const [saved, media, allProperties] = await Promise.all([
    getCondominium(id),
    listCatalogMedia("condominium", id),
    listPublicProperties(),
  ]);
  if (!saved) notFound();

  const orderedMedia = [...media].sort((left, right) => Number(right.isCover) - Number(left.isCover));
  const images = orderedMedia.map((item) => ({ altText: item.altText, url: item.url }));
  const condominium: PublicCondominium = {
    address: saved.address,
    coverImage: images[0] ?? null,
    description: saved.description,
    id: saved.id,
    images,
    name: saved.name,
    slug: saved.slug,
  };

  return (
    <main className="panel-content catalog-page preview-page">
      <section aria-label="Estado de la previsualización" className="preview-toolbar">
        <div><strong>Previsualización administrativa</strong><span>Este contenido no se ha hecho público desde esta pantalla.</span></div>
        <Link className="button button-secondary" href={`/panel/catalogo/condominios/${id}`}>Volver al editor</Link>
      </section>
      <div className="preview-surface">
        <PublicCondominiumDetail
          backHref={`/panel/catalogo/condominios/${id}`}
          backLabel="Volver al editor"
          condominium={condominium}
          properties={allProperties.filter((property) => property.condominium.id === id)}
        />
      </div>
    </main>
  );
}
