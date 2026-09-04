import type { Metadata } from "next";
import Link from "next/link";

import {
  createAdvisorBlock,
  createAdvisorSchedule,
  removeAdvisorBlock,
  toggleAdvisorSchedule,
  updateVisitDuration,
} from "./actions";
import { requireCrmAccess } from "../crm/authorization";
import {
  getVisitDurationMinutes,
  listAdvisorSchedules,
  listFutureAvailabilityBlocks,
  listUpcomingAppointments,
} from "@/modules/appointments/infrastructure/appointment-repository";
import { listActiveAdvisors } from "@/modules/crm/infrastructure/opportunity-repository";

export const metadata: Metadata = { title: "Citas | Panel Aicon" };
const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const dateTime = new Intl.DateTimeFormat("es-CR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Costa_Rica" });

export default async function AppointmentsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ error?: string; notice?: string }> }>) {
  const profile = await requireCrmAccess();
  const [appointments, schedules, blocks, durationMinutes, advisors, messages] = await Promise.all([
    listUpcomingAppointments(),
    listAdvisorSchedules(),
    listFutureAvailabilityBlocks(),
    getVisitDurationMinutes(),
    profile.role === "administrator" ? listActiveAdvisors() : Promise.resolve([]),
    searchParams,
  ]);

  return (
    <main className="panel-content appointments-page">
      <div className="page-heading"><div><p className="eyebrow">Agenda</p><h1>Visitas a propiedades</h1><p className="lede">Consulta próximas citas y administra la disponibilidad que se muestra al público.</p></div><span className="count-badge">{appointments.length} próximas</span></div>
      {messages.notice ? <output className="form-success page-notice">{messages.notice}</output> : null}
      {messages.error ? <p className="form-message page-notice" role="alert">{messages.error}</p> : null}

      <section className="appointment-admin-grid">
        <div className="crm-detail-panel">
          <div className="crm-section-heading"><div><p className="eyebrow">Calendario</p><h2>Próximas visitas</h2></div><span>Hora de Costa Rica</span></div>
          {appointments.length === 0 ? <div className="empty-state compact-empty"><p>No hay visitas programadas.</p><span>Las reservas públicas aparecerán aquí.</span></div> : (
            <div className="appointment-list">
              {appointments.map((appointment) => (
                <article key={appointment.id}>
                  <time dateTime={appointment.startsAt}>{dateTime.format(new Date(appointment.startsAt))}</time>
                  <div><h3>{appointment.contactName}</h3><p>{appointment.condominiumName} · Unidad {appointment.unitCode}</p><span>{appointment.advisorName} · {appointment.contactPhone}{appointment.contactEmail ? ` · ${appointment.contactEmail}` : ""}</span></div>
                  <Link className="text-link" href={`/panel/crm/${appointment.opportunityId}`}>Abrir oportunidad →</Link>
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
