import type { PublicCondominium } from "../domain/public-property";

export function PublicCatalogFilters({ condominiums, query }: Readonly<{ condominiums: PublicCondominium[]; query: Record<string, string | string[] | undefined> }>) {
  const value = (name: string) => Array.isArray(query[name]) ? query[name]?.[0] : query[name];
  return (
    <form action="/catalogo" className="public-filter-form" method="get">
      <div className="field"><label htmlFor="filter-condominium">Condominio</label><select defaultValue={value("condominio") ?? ""} id="filter-condominium" name="condominio"><option value="">Todos</option>{condominiums.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></div>
      <div className="field"><label htmlFor="filter-status">Estado</label><select defaultValue={value("estado") ?? "available"} id="filter-status" name="estado"><option value="available">Disponibles</option><option value="reserved">Reservadas</option><option value="sold">Vendidas</option><option value="all">Todos</option></select></div>
      <div className="field"><label htmlFor="filter-min">Precio mínimo</label><input defaultValue={value("precioMinimo")} id="filter-min" inputMode="numeric" min="0" name="precioMinimo" placeholder="$0" type="number" /></div>
      <div className="field"><label htmlFor="filter-max">Precio máximo</label><input defaultValue={value("precioMaximo")} id="filter-max" inputMode="numeric" min="0" name="precioMaximo" placeholder="Sin límite" type="number" /></div>
      <div className="field"><label htmlFor="filter-bedrooms">Habitaciones mínimas</label><select defaultValue={value("habitaciones") ?? ""} id="filter-bedrooms" name="habitaciones"><option value="">Cualquiera</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></div>
      <div className="field"><label htmlFor="filter-bathrooms">Baños mínimos</label><select defaultValue={value("banos") ?? ""} id="filter-bathrooms" name="banos"><option value="">Cualquiera</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option></select></div>
      <div className="public-filter-actions"><button className="button button-primary" type="submit">Aplicar filtros</button><a className="button button-secondary" href="/catalogo">Limpiar</a></div>
    </form>
  );
}
