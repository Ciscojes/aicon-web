import type {
  HouseModelFieldErrors,
  HouseModelFormValues,
} from "../application/validate-house-model";

type HouseModelFieldsProps = Readonly<{
  errors?: HouseModelFieldErrors;
  idPrefix: string;
  values?: Partial<HouseModelFormValues>;
}>;

const numericFields = [
  { key: "bedrooms", label: "Habitaciones", step: "1" },
  { key: "bathrooms", label: "Baños", step: "0.1" },
  { key: "parkingSpaces", label: "Estacionamientos", step: "1" },
  { key: "constructionAreaM2", label: "Construcción (m²)", step: "0.01" },
  { key: "landAreaM2", label: "Terreno (m²)", step: "0.01" },
] as const;

export function HouseModelFields({
  errors,
  idPrefix,
  values,
}: HouseModelFieldsProps) {
  return (
    <>
      <div className="field field-wide">
        <label htmlFor={`${idPrefix}-name`}>Nombre del modelo</label>
        <input
          defaultValue={values?.name}
          id={`${idPrefix}-name`}
          maxLength={160}
          name="name"
          required
        />
        {errors?.name ? <p className="field-error">{errors.name[0]}</p> : null}
      </div>

      <div className="numeric-fields field-wide">
        {numericFields.map((field) => (
          <div className="field" key={field.key}>
            <label htmlFor={`${idPrefix}-${field.key}`}>{field.label}</label>
            <input
              defaultValue={values?.[field.key]}
              id={`${idPrefix}-${field.key}`}
              inputMode="decimal"
              min="0"
              name={field.key}
              step={field.step}
              type="number"
            />
            {errors?.[field.key] ? (
              <p className="field-error">{errors[field.key]?.[0]}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="field field-wide">
        <label htmlFor={`${idPrefix}-description`}>Descripción general</label>
        <textarea
          defaultValue={values?.description}
          id={`${idPrefix}-description`}
          maxLength={5000}
          name="description"
          rows={5}
        />
        {errors?.description ? (
          <p className="field-error">{errors.description[0]}</p>
        ) : null}
      </div>

      <div className="field field-wide">
        <label htmlFor={`${idPrefix}-features`}>Características y acabados</label>
        <textarea
          aria-describedby={`${idPrefix}-features-help`}
          defaultValue={values?.features}
          id={`${idPrefix}-features`}
          maxLength={8000}
          name="features"
          rows={6}
        />
        <p className="field-help" id={`${idPrefix}-features-help`}>
          Escribe una característica por línea.
        </p>
        {errors?.features ? (
          <p className="field-error">{errors.features[0]}</p>
        ) : null}
      </div>
    </>
  );
}
