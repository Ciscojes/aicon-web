"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createCondominiumDraft,
  type CreateCondominiumState,
} from "@/app/panel/catalogo/condominios/actions";

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
      <div className="field">
        <label htmlFor="condominium-name">Nombre</label>
        <input
          defaultValue={state.values?.name}
          id="condominium-name"
          maxLength={160}
          name="name"
          required
        />
        {state.errors?.name ? (
          <p className="field-error">{state.errors.name[0]}</p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="condominium-slug">URL pública</label>
        <input
          aria-describedby="slug-help"
          defaultValue={state.values?.slug}
          id="condominium-slug"
          maxLength={160}
          name="slug"
          placeholder="Se genera desde el nombre"
        />
        <p className="field-help" id="slug-help">
          Déjala vacía para generarla automáticamente.
        </p>
        {state.errors?.slug ? (
          <p className="field-error">{state.errors.slug[0]}</p>
        ) : null}
      </div>

      <div className="field field-wide">
        <label htmlFor="condominium-address">Dirección</label>
        <input
          defaultValue={state.values?.address}
          id="condominium-address"
          maxLength={500}
          name="address"
        />
        {state.errors?.address ? (
          <p className="field-error">{state.errors.address[0]}</p>
        ) : null}
      </div>

      <div className="field field-wide">
        <label htmlFor="condominium-description">Descripción</label>
        <textarea
          defaultValue={state.values?.description}
          id="condominium-description"
          maxLength={5000}
          name="description"
          rows={5}
        />
        {state.errors?.description ? (
          <p className="field-error">{state.errors.description[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className={state.success ? "form-success" : "form-message"}
          role={state.success ? "status" : "alert"}
        >
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
