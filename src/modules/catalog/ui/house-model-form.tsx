"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createHouseModel,
  type CreateHouseModelState,
} from "@/app/panel/catalogo/modelos/actions";

import { FormFeedback } from "./form-feedback";
import { HouseModelFields } from "./house-model-fields";

export function HouseModelForm() {
  const [state, formAction, pending] = useActionState<CreateHouseModelState, FormData>(
    createHouseModel,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form action={formAction} className="catalog-form" ref={formRef}>
      <HouseModelFields
        errors={state.errors}
        idPrefix="new-house-model"
        values={state.values}
      />
      <FormFeedback message={state.message} success={state.success} />
      <div className="field-wide">
        <button className="button button-primary" disabled={pending} type="submit">
          {pending ? "Guardando…" : "Crear modelo"}
        </button>
      </div>
    </form>
  );
}
