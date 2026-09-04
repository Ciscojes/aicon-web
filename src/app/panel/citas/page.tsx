import type { Metadata } from "next";
import Link from "next/link";

import {
  createAdvisorBlock,
  createAdvisorSchedule,
  removeAdvisorBlock,
  rescheduleAppointment,
  toggleAdvisorSchedule,
  updateAppointmentStatus,
  updateVisitDuration,
} from "./actions";
import { requireCrmAccess } from "../crm/authorization";
import {
  getVisitDurationMinutes,
  listAdvisorSchedules,
  listFutureAvailabilityBlocks,
  listAppointments,
} from "@/modules/appointments/infrastructure/appointment-repository";
import { appointmentStatusLabels, type AppointmentHistoryEntry } from "@/modules/appointments/domain/appointment";
import { toCostaRicaDateTimeLocal } from "@/modules/crm/domain/follow-up";
import { listActiveAdvisors } from "@/modules/crm/infrastructure/opportunity-repository";

export const metadata: Metadata = { title: "Citas | Panel Aicon" };
const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const dateTime = new Intl.DateTimeFormat("es-CR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Costa_Rica" });
const historyActionLabels = { created: "Cita creada", rescheduled: "Cita reprogramada", status_changed: "Estado actualizado" } as const;

function historyDescription(entry: AppointmentHistoryEntry) {
  if (entry.action === "rescheduled" && entry.previousStartsAt && entry.newStartsAt) {
    return `${dateTime.format(new Date(entry.previousStartsAt))} → ${dateTime.format(new Date(entry.newStartsAt))}`;
  }
  if (entry.newStatus) return appointmentStatusLabels[entry.newStatus];
  return "Cambio registrado";
}

export default async function AppointmentsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ error?: string; notice?: string }> }>) {
  const profile = await requireCrmAccess();
  const [appointments, schedules, blocks, durationMinutes, advisors, messages] = await Promise.all([
    listAppointments(),
    listAdvisorSchedules(),
    listFutureAvailabilityBlocks(),
    getVisitDurationMinutes(),
    profile.role === "administrator" ? listActiveAdvisors() : Promise.resolve([]),
    searchParams,
  ]);
  const scheduledCount = appointments.filter((appointment) => appointment.status === "scheduled" && new Date(appointment.startsAt) >= new Date()).length;

  return (
    <main className="panel-content appointments-page">
      <div className="page-heading"><div><p className="eyebrow">Agenda</p><h1>Visitas a propiedades</h1><p className="lede">Consulta, reprograma y registra el resultado de las citas, con su historial auditable.</p></div><span className="count-badge">{scheduledCount} próximas</span></div>
      {messages.notice ? <output className="form-success page-notice">{messages.notice}</output> : null}
      {messages.error ? <p className="form-message page-notice" role="alert">{messages.error}</p> : null}

      <section className="appointment-admin-grid">
        <div className="crm-detail-panel">
          <div className="crm-section-heading"><div><p className="eyebrow">Calendario</p><h2>Citas y resultados</h2></div><span>Hora de Costa Rica</span></div>
          {appointments.length === 0 ? <div className="empty-state compact-empty"><p>No hay visitas registradas.</p><span>Las reservas públicas aparecerán aquí.</span></div> : (
            <div className="appointment-list">
              {appointments.map((appointment) => (
                <article key={appointment.id}>
                  <div className="appointment-summary">
                    <div className="appointment-date"><time dateTime={appointment.startsAt}>{dateTime.format(new Date(appointment.startsAt))}</time><span className={`appointment-status appointment-status-${appointment.status}`}>{appointmentStatusLabels[appointment.status]}</span></div>
                    <div><h3>{appointment.contactName}</h3><p>{appointment.condominiumName} · Unidad {appointment.unitCode}</p><span>{appointment.advisorName} · {appointment.contactPhone}{appointment.contactEmail ? ` · ${appointment.contactEmail}` : ""}</span></div>
                    <Link className="text-link" href={`/panel/crm/${appointment.opportunityId}`}>Abrir oportunidad →</Link>
                  </div>
                  {appointment.status === "scheduled" ? <div className="appointment-actions">
                    <details><summary>Reprogramar</summary><form action={rescheduleAppointment} className="appointment-inline-form"><input name="appointmentId" type="hidden" value={appointment.id} /><label><span>Nueva fecha y hora</span><input defaultValue={toCostaRicaDateTimeLocal(appointment.startsAt)} name="startsAt" required type="datetime-local" /></label><button className="button button-secondary" type="submit">Confirmar reprogramación</button></form></details>
                    <details><summary>Cancelar</summary><form action={updateAppointmentStatus} className="appointment-inline-form"><input name="appointmentId" type="hidden" value={appointment.id} /><input name="status" type="hidden" value="cancelled" /><label><span>Motivo opcional</span><textarea maxLength={500} name="cancellationReason" rows={2} /></label><button className="button button-danger" type="submit">Confirmar cancelación</button></form></details>
                    <details><summary>Registrar resultado</summary><div className="appointment-result-actions"><form action={updateAppointmentStatus}><input name="appointmentId" type="hidden" value={appointment.id} /><button className="button button-secondary" name="status" type="submit" value="completed">Marcar realizada</button></form><form action={updateAppointmentStatus}><input name="appointmentId" type="hidden" value={appointment.id} /><button className="button button-secondary" name="status" type="submit" value="no_show">Marcar no asistió</button></form></div></details>
                  </div> : null}
                  <details className="appointment-history"><summary>Historial ({appointment.history.length})</summary><ol>{appointment.history.map((entry) => <li key={entry.id}><div><strong>{historyActionLabels[entry.action]}</strong><span>{historyDescription(entry)}</span>{entry.cancellationReason ? <span>Motivo: {entry.cancellationReason}</span> : null}</div><small>{entry.actorName ?? "Reserva pública"} · {dateTime.format(new Date(entry.occurredAt))}</small></li>)}</ol></details>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="crm-management-panel appointment-settings-panel">
          <p className="eyebrow">Disponibilidad</p><h2>Configuración</h2>
          <p className="muted">Cada visita dura actualmente {durationMinutes} minutos.</p>
          {profile.role === "administrator" ? (
            <>
              <form action={updateVisitDuration} className="crm-management-form"><label><span>Duración de nuevas visitas</span><select defaultValue={durationMinutes} name="durationMinutes"><option value="30">30 minutos</option><option value="45">45 minutos</option><option value="60">60 minutos</option><option value="90">90 minutos</option><option value="120">120 minutos</option></select></label><button className="button button-secondary button-full" type="submit">Guardar duración</button></form>
              {advisors.length > 0 ? <form action={createAdvisorSchedule} className="crm-management-form">
                <label><span>Asesor</span><select name="advisorId" required><option value="">Seleccionar</option>{advisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.name}</option>)}</select></label>
                <label><span>Día</span><select name="weekday" required>{weekdays.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
                <div className="appointment-time-row"><label><span>Desde</span><input name="startsAt" required type="time" /></label><label><span>Hasta</span><input name="endsAt" required type="time" /></label></div>
                <button className="button button-primary button-full" type="submit">Agregar horario</button>
              </form> : <p className="form-message">No hay asesores activos. Activa un perfil de asesor antes de publicar horarios.</p>}
            </>
          ) : null}
          {profile.role === "advisor" || advisors.length > 0 ? <form action={createAdvisorBlock} className="crm-management-form">
            {profile.role === "administrator" ? <label><span>Asesor a bloquear</span><select name="advisorId" required><option value="">Seleccionar</option>{advisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.name}</option>)}</select></label> : null}
            <div className="appointment-time-row"><label><span>Desde</span><input name="startsAt" required type="datetime-local" /></label><label><span>Hasta</span><input name="endsAt" required type="datetime-local" /></label></div>
            <label><span>Motivo</span><textarea maxLength={500} name="reason" required rows={3} /></label>
            <button className="button button-secondary button-full" type="submit">Bloquear período</button>
          </form> : null}
        </aside>
      </section>

      <section className="availability-grid">
        <div className="crm-detail-panel"><div className="crm-section-heading"><div><p className="eyebrow">Semanal</p><h2>Horarios recurrentes</h2></div><span>{schedules.filter((item) => item.active).length} activos</span></div>{schedules.length === 0 ? <div className="empty-state compact-empty"><p>No hay horarios configurados.</p></div> : <div className="availability-list">{schedules.map((schedule) => <article className={!schedule.active ? "availability-inactive" : ""} key={schedule.id}><div><strong>{weekdays[schedule.weekday]} · {schedule.startsAtLocal.slice(0, 5)}–{schedule.endsAtLocal.slice(0, 5)}</strong><span>{schedule.advisorName}</span></div>{profile.role === "administrator" ? <form action={toggleAdvisorSchedule}><input name="scheduleId" type="hidden" value={schedule.id} /><input name="active" type="hidden" value={schedule.active ? "false" : "true"} /><button className="text-link" type="submit">{schedule.active ? "Desactivar" : "Activar"}</button></form> : null}</article>)}</div>}</div>
        <div className="crm-detail-panel"><div className="crm-section-heading"><div><p className="eyebrow">Excepciones</p><h2>Bloqueos futuros</h2></div><span>{blocks.length}</span></div>{blocks.length === 0 ? <div className="empty-state compact-empty"><p>No hay bloqueos activos.</p></div> : <div className="availability-list">{blocks.map((block) => <article key={block.id}><div><strong>{dateTime.format(new Date(block.startsAt))}</strong><span>{block.advisorName} · {block.reason}</span></div><form action={removeAdvisorBlock}><input name="blockId" type="hidden" value={block.id} /><button className="text-link" type="submit">Retirar</button></form></article>)}</div>}</div>
      </section>
    </main>
  );
}
