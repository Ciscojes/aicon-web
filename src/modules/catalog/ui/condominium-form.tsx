"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createCondominiumDraft,
  type CreateCondominiumState,
} from "@/app/panel/catalogo/condominios/actions";

import { CondominiumFields } from "./condominium-fields";

const initialState: CreateCondominiumState = {};

export function CondominiumForm() {
  const [state, formAction, pending] = useActionState(
    createCondominiumDraft,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form action={formAction} className="catalog-form" ref={formRef}>
      <CondominiumFields
        errors={state.errors}
        idPrefix="condominium"
        slugOptional
        values={state.values}
      />

      {state.message && state.success ? (
        <output className="form-success">{state.message}</output>
      ) : null}
      {state.message && !state.success ? (
        <p className="form-message" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="field-wide">
        <button className="button button-primary" disabled={pending} type="submit">
          {pending ? "Guardando…" : "Guardar borrador"}
        </button>
      </div>
    </form>
  );
}
