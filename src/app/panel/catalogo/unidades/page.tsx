import type { Metadata } from "next";
import Link from "next/link";

import { requireCatalogManager } from "@/app/panel/catalogo/authorization";
import { listHouseUnitOptions, listHouseUnits } from "@/modules/catalog/infrastructure/house-unit-repository";
import { HouseUnitForm } from "@/modules/catalog/ui/house-unit-form";

export const metadata: Metadata = { title: "Unidades | Panel Aicon" };

const publicationLabels = { draft: "Borrador", hidden: "Oculta", published: "Publicada" } as const;
const availabilityLabels = { available: "Disponible", reserved: "Reservada", sold: "Vendida" } as const;
const usd = new Intl.NumberFormat("es-CR", { currency: "USD", maximumFractionDigits: 2, style: "currency" });

export default async function HouseUnitsPage({ searchParams }: Readonly<{ searchParams: Promise<{ notice?: string }> }>) {
  await requireCatalogManager();
  const [units, options, { notice }] = await Promise.all([listHouseUnits(), listHouseUnitOptions(), searchParams]);
  return (
    <main className="panel-content catalog-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Inventario</p>
          <h1>Unidades y casas</h1>
          <p className="lede">Administra cada casa, su precio, disponibilidad y publicación.</p>
        </div>
        <span className="count-badge">{units.length} {units.length === 1 ? "unidad" : "unidades"}</span>
      </div>
      {notice ? <output className="form-success page-notice">{notice}</output> : null}
      <div className="catalog-layout unit-catalog-layout">
        <section aria-labelledby="units-title" className="catalog-list-panel">
          <h2 id="units-title">Inventario registrado</h2>
          {units.length === 0 ? (
            <div className="empty-state"><p>Aún no hay unidades.</p><span>Crea una basada en un modelo o como diseño único.</span></div>
          ) : (
            <ul className="catalog-list">
              {units.map((unit) => (
                <li key={unit.id}>
                  <div>
                    <h3>{unit.code} · {unit.condominiumName}</h3>
                    <p>{unit.modelName ?? "Diseño único"} · {usd.format(unit.priceUsd)}</p>
                    <span className={`availability-label availability-${unit.availabilityStatus}`}>{availabilityLabels[unit.availabilityStatus]}</span>
                  </div>
                  <div className="catalog-list-actions">
                    <span className={`status-pill status-${unit.publicationStatus}`}>{publicationLabels[unit.publicationStatus]}</span>
                    <Link className="text-link" href={`/panel/catalogo/unidades/${unit.id}`}>Editar</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="new-unit-title" className="catalog-form-panel">
          <p className="eyebrow">Nueva unidad</p>
          <h2 id="new-unit-title">Registrar casa</h2>
          <p className="muted">Se guardará como borrador hasta que decidas publicarla.</p>
          {options.condominiums.length === 0 ? <div className="empty-state compact-empty"><p>Primero crea un condominio.</p></div> : <HouseUnitForm {...options} />}
        </section>
      </div>
    </main>
  );
}
