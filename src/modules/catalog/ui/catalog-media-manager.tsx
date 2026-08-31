import { chooseMediaCover, deleteMedia, reorderMedia, uploadMedia } from "@/app/panel/catalogo/media-actions";

import type { CatalogMediaAsset, CatalogMediaEntityType } from "../domain/catalog-media";
import { catalogMediaRules } from "../domain/catalog-media";

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function CatalogMediaManager({ entityId, entityType, media }: Readonly<{ entityId: string; entityType: CatalogMediaEntityType; media: CatalogMediaAsset[] }>) {
  const uploadAction = uploadMedia.bind(null, entityType, entityId);
  return (
    <section className="media-manager" id="fotografias" aria-labelledby="media-manager-title">
      <div className="media-manager-heading"><div><p className="eyebrow">Galería</p><h2 id="media-manager-title">Fotografías</h2><p className="muted">La portada será la imagen principal en el catálogo. Puedes cambiar el orden cuando haya varias.</p></div><span className="count-badge">{media.length} {media.length === 1 ? "imagen" : "imágenes"}</span></div>
      <form action={uploadAction} className="media-upload-form">
        <label><span>Fotografía</span><input accept="image/avif,image/jpeg,image/png,image/webp" name="photo" required type="file" /></label>
        <label><span>Descripción accesible</span><input maxLength={240} minLength={2} name="altText" placeholder="Ej. Fachada principal al atardecer" required type="text" /></label>
        <p className="field-help">JPEG, PNG, WebP o AVIF. Máximo 20 MB.</p>
        <button className="button button-primary" disabled={media.length >= catalogMediaRules.maxCountPerEntity} type="submit">{media.length >= catalogMediaRules.maxCountPerEntity ? "Límite alcanzado" : "Subir fotografía"}</button>
      </form>
      {media.length === 0 ? <div className="media-empty"><strong>Aún no hay fotografías.</strong><p>Mientras tanto, la web pública seguirá mostrando la ilustración conceptual.</p></div> : <div className="media-grid">{media.map((item, index) => {
        const coverAction = chooseMediaCover.bind(null, entityType, entityId, item.id);
        const upAction = reorderMedia.bind(null, entityType, entityId, item.id, "up");
        const downAction = reorderMedia.bind(null, entityType, entityId, item.id, "down");
        const removeAction = deleteMedia.bind(null, entityType, entityId, item.id);
        return <article className="media-card" key={item.id}>
          <div aria-label={item.altText} className="media-preview" role="img" style={{ backgroundImage: `url("${item.url}")` }}>{item.isCover ? <span>Portada</span> : null}</div>
          <div className="media-card-body"><strong>{item.altText}</strong><small>{megabytes(item.sizeBytes)} · posición {index + 1}</small><div className="media-card-actions">{!item.isCover ? <form action={coverAction}><button type="submit">Usar como portada</button></form> : null}<form action={upAction}><button disabled={index === 0} title="Mover antes" type="submit">↑</button></form><form action={downAction}><button disabled={index === media.length - 1} title="Mover después" type="submit">↓</button></form></div><form action={removeAction} className="media-remove-form"><label><input name="confirmDelete" required type="checkbox" value="yes" /> Confirmar retiro</label><button type="submit">Retirar</button></form></div>
        </article>;
      })}</div>}
    </section>
  );
}
