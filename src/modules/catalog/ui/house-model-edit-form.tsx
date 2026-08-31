"use client";

import { useActionState } from "react";

import {
  type UpdateHouseModelState,
  updateHouseModel,
} from "@/app/panel/catalogo/modelos/[id]/actions";
import type { CondominiumSummary } from "@/modules/catalog/domain/condominium";
import type { HouseModelDetails } from "@/modules/catalog/domain/house-model";

import { FormFeedback } from "./form-feedback";
import { HouseModelFields } from "./house-model-fields";

function modelValues(model: HouseModelDetails) {
  return {
    bathrooms: model.bathrooms?.toString() ?? "",
    bedrooms: model.bedrooms?.toString() ?? "",
    constructionAreaM2: model.constructionAreaM2?.toString() ?? "",
    description: model.description,
    features: model.features.join("\n"),
    landAreaM2: model.landAreaM2?.toString() ?? "",
    name: model.name,
    parkingSpaces: model.parkingSpaces?.toString() ?? "",
  };
}

export function HouseModelEditForm({
  condominiums,
  model,
}: Readonly<{
  condominiums: CondominiumSummary[];
  model: HouseModelDetails;
}>) {
  const action = updateHouseModel.bind(null, model.id);
  const [state, formAction, pending] = useActionState<UpdateHouseModelState, FormData>(
    action,
    {},
  );
  const assigned = new Set(state.condominiumIds ?? model.assignedCondominiumIds);

  return (
    <form action={formAction} className="catalog-form">
      <HouseModelFields
        errors={state.errors}
        idPrefix="edit-house-model"
        values={state.values ?? modelValues(model)}
      />

      <fieldset className="assignment-fieldset field-wide">
        <legend>Condominios que ofrecen este modelo</legend>
        <p className="field-help">
          Puedes reutilizar el mismo modelo en varios proyectos sin duplicarlo.
        </p>
        {condominiums.length === 0 ? (
          <p className="muted">Primero crea un condominio para poder asignarlo.</p>
        ) : (
          <div className="checkbox-grid">
            {condominiums.map((condominium) => (
              <label className="checkbox-card" key={condominium.id}>
                <input
                  defaultChecked={assigned.has(condominium.id)}
                  name="condominiumIds"
                  type="checkbox"
                  value={condominium.id}
                />
                <span>
                  <strong>{condominium.name}</strong>
                  <small>{condominium.address || "Dirección pendiente"}</small>
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <FormFeedback message={state.message} success={state.success} />
      <div className="field-wide">
        <button className="button button-primary" disabled={pending} type="submit">
          {pending ? "Guardando…" : "Guardar modelo"}
        </button>
      </div>
    </form>
  );
}
