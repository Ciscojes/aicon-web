import type {
  CondominiumDraft,
  CondominiumDraftFieldErrors,
} from "../application/validate-condominium-draft";

type CondominiumFieldsProps = Readonly<{
  descriptionRows?: number;
  errors?: CondominiumDraftFieldErrors;
  idPrefix: string;
  slugOptional?: boolean;
  values?: Partial<CondominiumDraft>;
}>;

export function CondominiumFields({
  descriptionRows = 5,
  errors,
  idPrefix,
  slugOptional = false,
  values,
}: CondominiumFieldsProps) {
  return (
    <>
      <div className="field">
        <label htmlFor={`${idPrefix}-name`}>Nombre</label>
        <input
          defaultValue={values?.name}
          id={`${idPrefix}-name`}
          maxLength={160}
          name="name"
          required
        />
        {errors?.name ? <p className="field-error">{errors.name[0]}</p> : null}
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-slug`}>URL pública</label>
        <input
          aria-describedby={slugOptional ? `${idPrefix}-slug-help` : undefined}
          defaultValue={values?.slug}
          id={`${idPrefix}-slug`}
          maxLength={160}
          name="slug"
          placeholder={slugOptional ? "Se genera desde el nombre" : undefined}
          required={!slugOptional}
        />
        {slugOptional ? (
          <p className="field-help" id={`${idPrefix}-slug-help`}>
            Déjala vacía para generarla automáticamente.
          </p>
        ) : null}
        {errors?.slug ? <p className="field-error">{errors.slug[0]}</p> : null}
      </div>

      <div className="field field-wide">
        <label htmlFor={`${idPrefix}-address`}>Dirección</label>
        <input
          defaultValue={values?.address}
          id={`${idPrefix}-address`}
          maxLength={500}
          name="address"
        />
        {errors?.address ? (
          <p className="field-error">{errors.address[0]}</p>
        ) : null}
      </div>

      <div className="field field-wide">
        <label htmlFor={`${idPrefix}-description`}>Descripción</label>
        <textarea
          defaultValue={values?.description}
          id={`${idPrefix}-description`}
          maxLength={5000}
          name="description"
          rows={descriptionRows}
        />
        {errors?.description ? (
          <p className="field-error">{errors.description[0]}</p>
        ) : null}
      </div>
    </>
  );
}
