"use client";

import { useActionState } from "react";

import {
  type UpdateCondominiumState,
  updateCondominium,
} from "@/app/panel/catalogo/condominios/[id]/actions";
import type { CondominiumDetails } from "@/modules/catalog/domain/condominium";

import { CondominiumFields } from "./condominium-fields";
import { FormFeedback } from "./form-feedback";

export function CondominiumEditForm({
  condominium,
}: Readonly<{
  condominium: CondominiumDetails;
}>) {
  const action = updateCondominium.bind(null, condominium.id);
  const [state, formAction, pending] = useActionState<
    UpdateCondominiumState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="catalog-form">
      <CondominiumFields
        descriptionRows={8}
        errors={state.errors}
        idPrefix="edit-condominium"
        values={state.values ?? condominium}
      />

      <FormFeedback message={state.message} success={state.success} />

      <div className="field-wide">
        <button className="button button-primary" disabled={pending} type="submit">
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
