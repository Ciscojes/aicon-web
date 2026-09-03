import type { Metadata } from "next";

import { requireAdministrator } from "../authorization";
import { getLatestFinancialSettings } from "@/modules/quotes/infrastructure/financial-settings-repository";
import { FinancialSettingsForm } from "@/modules/quotes/ui/financial-settings-form";

export const metadata: Metadata = { title: "Financiamiento | Panel Aicon" };

export default async function FinancialSettingsPage() {
  await requireAdministrator();
  const settings = await getLatestFinancialSettings();
  return (
    <main className="panel-content catalog-page">
      <div className="page-heading"><div><p className="eyebrow">Configuración</p><h1>Financiamiento</h1><p className="lede">Define los valores estimativos que utilizarán nuevas simulaciones y cotizaciones.</p></div><span className={`status-pill status-${settings?.enabled ? "published" : "hidden"}`}>{settings?.enabled ? "Simulador activo" : "Simulador inactivo"}</span></div>
      <section className="catalog-form-panel financial-settings-panel"><h2>Nueva versión</h2><p className="muted">Guardar crea una versión nueva. Las cotizaciones anteriores conservarán sus valores históricos.</p><FinancialSettingsForm settings={settings} /></section>
    </main>
  );
}
