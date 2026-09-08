import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicCondominium } from "@/modules/catalog/infrastructure/public-catalog-repository";
import { PublicCondominiumDetail } from "@/modules/catalog/ui/public-condominium-detail";
import { PublicSiteFooter } from "@/modules/catalog/ui/public-site-footer";
import { PublicSiteHeader } from "@/modules/catalog/ui/public-site-header";

export const metadata: Metadata = { title: "Condominio | Aicon" };

export default async function PublicCondominiumPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const detail = await getPublicCondominium(slug);
  if (!detail) notFound();

  return (
    <div className="public-shell public-inner-shell">
      <PublicSiteHeader />
      <PublicCondominiumDetail {...detail} />
      <PublicSiteFooter />
    </div>
  );
}
