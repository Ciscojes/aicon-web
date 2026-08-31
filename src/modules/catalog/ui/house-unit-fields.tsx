"use client";

import { useState } from "react";

import type { HouseUnitFieldErrors, HouseUnitFormValues } from "../application/validate-house-unit";
import type { UnitCondominiumOption, UnitModelOption } from "../domain/house-unit";

type Props = Readonly<{
  condominiums: UnitCondominiumOption[];
  errors?: HouseUnitFieldErrors;
  idPrefix: string;
  models: UnitModelOption[];
  values?: Partial<HouseUnitFormValues>;
}>;

const overrideFields = [
  { key: "bedroomsOverride", label: "Habitaciones", step: "1" },
  { key: "bathroomsOverride", label: "Baños", step: "0.1" },
  { key: "parkingSpacesOverride", label: "Estacionamientos", step: "1" },
  { key: "constructionAreaM2Override", label: "Construcción (m²)", step: "0.01" },
  { key: "landAreaM2Override", label: "Terreno (m²)", step: "0.01" },
] as const;

export function HouseUnitFields({ condominiums, errors, idPrefix, models, values }: Props) {
  const [condominiumId, setCondominiumId] = useState(values?.condominiumId ?? "");
  const availableModels = models.filter((model) => model.condominiumId === condominiumId);

  return (
    <>
      <div className="field">
        <label htmlFor={`${idPrefix}-condominium`}>Condominio</label>
        <select
          defaultValue={values?.condominiumId}
          id={`${idPrefix}-condominium`}
          name="condominiumId"
          onChange={(event) => setCondominiumId(event.target.value)}
          required
        >
          <option value="">Selecciona un condominio</option>
          {condominiums.map((condominium) => (
            <option key={condominium.id} value={condominium.id}>
              {condominium.name}{condominium.publicationStatus !== "published" ? " · no publicado" : ""}
            </option>
          ))}
        </select>
        {errors?.condominiumId ? <p className="field-error">{errors.condominiumId[0]}</p> : null}
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-model`}>Modelo de casa</label>
        <select defaultValue={values?.modelId ?? ""} id={`${idPrefix}-model`} name="modelId">
          <option value="">Diseño único, sin modelo</option>
          {availableModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
        </select>
        <p className="field-help">Solo aparecen modelos habilitados para el condominio.</p>
        {errors?.modelId ? <p className="field-error">{errors.modelId[0]}</p> : null}
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-code`}>Código o número</label>
        <input defaultValue={values?.code} id={`${idPrefix}-code`} maxLength={80} name="code" required />
        {errors?.code ? <p className="field-error">{errors.code[0]}</p> : null}
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-price`}>Precio en USD</label>
        <input defaultValue={values?.priceUsd} id={`${idPrefix}-price`} inputMode="decimal" min="0" name="priceUsd" required step="0.01" type="number" />
        {errors?.priceUsd ? <p className="field-error">{errors.priceUsd[0]}</p> : null}
      </div>

      <div className="field field-wide">
        <label htmlFor={`${idPrefix}-availability`}>Disponibilidad</label>
        <select defaultValue={values?.availabilityStatus ?? "available"} id={`${idPrefix}-availability`} name="availabilityStatus">
          <option value="available">Disponible</option>
          <option value="reserved">Reservada</option>
          <option value="sold">Vendida</option>
        </select>
      </div>

      <fieldset className="assignment-fieldset field-wide">
        <legend>Datos específicos de esta unidad</legend>
        <p className="field-help">Cuando completes un valor, este prevalecerá sobre el modelo seleccionado.</p>
        <div className="numeric-fields unit-override-fields">
          {overrideFields.map((field) => (
            <div className="field" key={field.key}>
              <label htmlFor={`${idPrefix}-${field.key}`}>{field.label}</label>
              <input defaultValue={values?.[field.key]} id={`${idPrefix}-${field.key}`} inputMode="decimal" min="0" name={field.key} step={field.step} type="number" />
              {errors?.[field.key] ? <p className="field-error">{errors[field.key]?.[0]}</p> : null}
            </div>
          ))}
        </div>
      </fieldset>

      <div className="field field-wide">
        <label htmlFor={`${idPrefix}-description`}>Descripción específica</label>
        <textarea defaultValue={values?.descriptionOverride} id={`${idPrefix}-description`} maxLength={5000} name="descriptionOverride" rows={4} />
        {errors?.descriptionOverride ? <p className="field-error">{errors.descriptionOverride[0]}</p> : null}
      </div>

      <div className="field field-wide">
        <label htmlFor={`${idPrefix}-features`}>Características o acabados específicos</label>
        <textarea defaultValue={values?.featuresOverride} id={`${idPrefix}-features`} maxLength={8000} name="featuresOverride" rows={5} />
        <p className="field-help">Escribe una característica por línea.</p>
        {errors?.featuresOverride ? <p className="field-error">{errors.featuresOverride[0]}</p> : null}
      </div>
    </>
  );
}
