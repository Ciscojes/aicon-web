import type { PublicCondominium } from "../domain/public-property";
import { formatPublicDisplayText } from "./public-display-text";

export function PublicHeroSearch({ condominiums }: Readonly<{ condominiums: PublicCondominium[] }>) {
  return (
    <section aria-label="Buscar viviendas" className="public-hero-search">
      <form action="/catalogo" method="get">
        <div className="hero-search-field">
          <label htmlFor="hero-condominium">Condominio</label>
          <select id="hero-condominium" name="condominio">
            <option value="">Todos</option>
            {condominiums.map((item) => <option key={item.id} value={item.slug}>{formatPublicDisplayText(item.name)}</option>)}
          </select>
        </div>
        <div className="hero-search-field">
          <label htmlFor="hero-budget">Presupuesto máximo</label>
          <input id="hero-budget" inputMode="numeric" min="0" name="precioMaximo" placeholder="Sin límite" type="number" />
        </div>
        <div className="hero-search-field">
          <label htmlFor="hero-bedrooms">Habitaciones</label>
          <select id="hero-bedrooms" name="habitaciones">
            <option value="">Todas</option>
            <option value="1">1 o más</option>
            <option value="2">2 o más</option>
            <option value="3">3 o más</option>
            <option value="4">4 o más</option>
          </select>
        </div>
        <button className="button button-primary" type="submit">Buscar casas</button>
      </form>
    </section>
  );
}
