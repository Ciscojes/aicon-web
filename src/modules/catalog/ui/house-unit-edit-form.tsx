"use client";

import { useActionState } from "react";

import { type UpdateHouseUnitState, updateHouseUnit } from "@/app/panel/catalogo/unidades/[id]/actions";
import type { HouseUnitDetails, UnitCondominiumOption, UnitModelOption } from "../domain/house-unit";
import { FormFeedback } from "./form-feedback";
import { HouseUnitFields } from "./house-unit-fields";

function detailsValues(unit: HouseUnitDetails) {
  return {
    availabilityStatus: unit.availabilityStatus,
    bathroomsOverride: unit.bathroomsOverride?.toString() ?? "",
    bedroomsOverride: unit.bedroomsOverride?.toString() ?? "",
    code: unit.code,
    condominiumId: unit.condominiumId,
    constructionAreaM2Override: unit.constructionAreaM2Override?.toString() ?? "",
    descriptionOverride: unit.descriptionOverride,
    featuresOverride: unit.featuresOverride.join("\n"),
    landAreaM2Override: unit.landAreaM2Override?.toString() ?? "",
    modelId: unit.modelId ?? "",
    parkingSpacesOverride: unit.parkingSpacesOverride?.toString() ?? "",
    priceUsd: unit.priceUsd.toFixed(2),
  };
}

export function HouseUnitEditForm({ condominiums, models, unit }: Readonly<{ condominiums: UnitCondominiumOption[]; models: UnitModelOption[]; unit: HouseUnitDetails }>) {
  const bound = updateHouseUnit.bind(null, unit.id);
  const [state, action, pending] = useActionState<UpdateHouseUnitState, FormData>(bound, {});
  return (
    <form action={action} className="catalog-form">
      <HouseUnitFields condominiums={condominiums} errors={state.errors} idPrefix="edit-unit" models={models} values={state.values ?? detailsValues(unit)} />
      <FormFeedback message={state.message} success={state.success} />
      <div className="field-wide"><button className="button button-primary" disabled={pending} type="submit">{pending ? "Guardando…" : "Guardar unidad"}</button></div>
    </form>
  );
}
