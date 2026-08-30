"use client";

import { useActionState } from "react";

import {
  type UpdateCondominiumState,
  updateCondominium,
} from "@/app/panel/catalogo/condominios/[id]/actions";
import type { CondominiumDetails } from "@/modules/catalog/domain/condominium";

export function CondominiumEditForm({
  condominium,
}: {
  condominium: CondominiumDetails;
}) {
  const action = updateCondominium.bind(null, condominium.id);
  const [state, formAction, pending] = useActionState<
    UpdateCondominiumState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="catalog-form">
      <div className="field">
        <label htmlFor="edit-condominium-name">Nombre</label>
        <input
          defaultValue={state.values?.name ?? condominium.name}
          id="edit-condominium-name"
          maxLength={160}
          name="name"
          required
        />
        {state.errors?.name ? (
          <p className="field-error">{state.errors.name[0]}</p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="edit-condominium-slug">URL pública</label>
        <input
          defaultValue={state.values?.slug ?? condominium.slug}
          id="edit-condominium-slug"
          maxLength={160}
          name="slug"
          required
        />
        {state.errors?.slug ? (
          <p className="field-error">{state.errors.slug[0]}</p>
        ) : null}
      </div>

      <div className="field field-wide">
        <label htmlFor="edit-condominium-address">Dirección</label>
        <input
          defaultValue={state.values?.address ?? condominium.address}
          id="edit-condominium-address"
          maxLength={500}
          name="address"
        />
        {state.errors?.address ? (
          <p className="field-error">{state.errors.address[0]}</p>
        ) : null}
      </div>

      <div className="field field-wide">
        <label htmlFor="edit-condominium-description">Descripción</label>
        <textarea
          defaultValue={state.values?.description ?? condominium.description}
          id="edit-condominium-description"
          maxLength={5000}
          name="description"
          rows={8}
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
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
