import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";

import {
  getPublicAppointmentAccess,
  listPublicAppointmentRescheduleSlots,
} from "@/modules/appointments/infrastructure/public-appointment-repository";
import { PublicSiteFooter } from "@/modules/catalog/ui/public-site-footer";
import { PublicSiteHeader } from "@/modules/catalog/ui/public-site-header";

import { cancelAppointment, requestReschedule } from "./actions";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Gestionar visita | Aicon",
};

const tokenSchema = z.string().regex(/^[0-9a-f]{64}$/);
const dateTime = new Intl.DateTimeFormat("es-CR", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/Costa_Rica",
});
const time = new Intl.DateTimeFormat("es-CR", { hour: "numeric", minute: "2-digit", timeZone: "America/Costa_Rica" });

export default async function ManageAppointmentPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; fecha?: string; notice?: string }>;
}>) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const validToken = tokenSchema.safeParse(token);
  const appointment = validToken.success ? await getPublicAppointmentAccess(validToken.data) : null;
  const selectedDate = z.iso.date().safeParse(query.fecha);
  const slots = appointment && selectedDate.success
    ? await listPublicAppointmentRescheduleSlots(token, selectedDate.data)
    : [];

  return (
    <div className="public-shell public-inner-shell">
      <PublicSiteHeader />
      <main className="appointment-access-page">
        {!appointment ? <section className="appointment-access-card appointment-access-expired">
          <p className="eyebrow">{query.notice ? "Gestión completada" : "Enlace no disponible"}</p><h1>{query.notice ? "Tu solicitud fue registrada." : "Esta gestión ya no está activa."}</h1>
          <p>{query.notice ? "Por seguridad, este enlace ya no puede volver a utilizarse." : "El enlace pudo vencer, utilizarse anteriormente o quedar invalidado porque la cita cambió."}</p>
          {query.notice ? <output className="form-success">{query.notice}</output> : null}
          {query.error ? <p className="form-message" role="alert">{query.error}</p> : null}
          <Link className="button button-secondary" href="/contacto">Contactar a Aicon</Link>
        </section> : <>
          <section className="appointment-access-intro">
            <p className="eyebrow">Tu visita con Aicon</p><h1>Hola, {appointment.contactName}.</h1>
            <p>Desde este enlace puedes cancelar la visita o solicitar otro horario. Por seguridad, solo puede utilizarse una vez.</p>
            <div className="contact-promise"><strong>{appointment.condominiumName} · Unidad {appointment.unitCode}</strong><span>{dateTime.format(new Date(appointment.startsAt))}</span></div>
            {query.notice ? <output className="form-success">{query.notice}</output> : null}
            {query.error ? <p className="form-message" role="alert">{query.error}</p> : null}
          </section>
          <section className="appointment-access-actions">
            <article className="contact-form-panel"><p className="eyebrow">Cambiar horario</p><h2>Solicita una reprogramación</h2><p>Tu visita actual se conserva hasta que el equipo confirme la nueva fecha.</p>
              <form className="appointment-date-picker" method="get"><label><span>Nueva fecha</span><input defaultValue={selectedDate.success ? selectedDate.data : ""} name="fecha" required type="date" /></label><button className="button button-secondary" type="submit">Ver horarios</button></form>
              {selectedDate.success ? slots.length > 0 ? <form action={requestReschedule} className="appointment-access-form"><input name="token" type="hidden" value={token} /><fieldset className="appointment-slots"><legend>Horarios disponibles</legend>{slots.map((slot) => <label key={slot.startsAt}><input name="startsAt" required type="radio" value={slot.startsAt} /><span>{time.format(new Date(slot.startsAt))}</span></label>)}</fieldset><label><span>Comentario opcional</span><textarea maxLength={500} name="message" rows={3} /></label><button className="button button-primary" type="submit">Solicitar este horario</button></form> : <div className="empty-state compact-empty"><p>No hay horarios disponibles para esa fecha.</p></div> : null}
            </article>
            <article className="contact-form-panel appointment-cancel-panel"><p className="eyebrow">Cancelar visita</p><h2>Libera el horario</h2><p>La cancelación es inmediata y no puede deshacerse desde este enlace.</p><form action={cancelAppointment} className="appointment-access-form"><input name="token" type="hidden" value={token} /><label><span>Motivo opcional</span><textarea maxLength={500} name="reason" rows={3} /></label><button className="button button-danger" type="submit">Cancelar mi visita</button></form></article>
          </section>
        </>}
      </main>
      <PublicSiteFooter />
    </div>
  );
}
