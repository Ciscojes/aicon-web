"use client";

import { useActionState } from "react";

import { createHouseUnit, type CreateHouseUnitState } from "@/app/panel/catalogo/unidades/actions";
import type { UnitCondominiumOption, UnitModelOption } from "../domain/house-unit";
import { FormFeedback } from "./form-feedback";
import { HouseUnitFields } from "./house-unit-fields";

export function HouseUnitForm({ condominiums, models }: Readonly<{ condominiums: UnitCondominiumOption[]; models: UnitModelOption[] }>) {
  const [state, action, pending] = useActionState<CreateHouseUnitState, FormData>(createHouseUnit, {});
  return (
    <form action={action} className="catalog-form">
      <HouseUnitFields condominiums={condominiums} errors={state.errors} idPrefix="new-unit" models={models} values={state.values} />
      <FormFeedback message={state.message} success={state.success} />
      <div className="field-wide"><button className="button button-primary" disabled={pending} type="submit">{pending ? "Guardando…" : "Crear unidad"}</button></div>
    </form>
  );
}
