begin;

create or replace function public.reschedule_appointment(
  p_appointment_id uuid,
  p_starts_at timestamptz
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid;
  v_actor_role text;
  v_advisor_id uuid;
  v_opportunity_id uuid;
  v_unit_id uuid;
  v_previous_starts_at timestamptz;
  v_previous_ends_at timestamptz;
  v_previous_status text;
  v_ends_at timestamptz;
begin
  select id, role into v_actor_id, v_actor_role
  from public.user_profiles
  where auth_user_id = (select auth.uid())
    and active and role in ('administrator', 'advisor');
  if v_actor_id is null then
    raise exception 'crm_access_required' using errcode = '42501';
  end if;

  select advisor_id, opportunity_id, unit_id, starts_at, ends_at, status
  into v_advisor_id, v_opportunity_id, v_unit_id, v_previous_starts_at, v_previous_ends_at, v_previous_status
  from public.appointments where id = p_appointment_id for update;
  if not found then raise exception 'appointment_not_found' using errcode = 'P0002'; end if;
  if v_actor_role <> 'administrator' and v_advisor_id <> v_actor_id then
    raise exception 'assigned_appointment_required' using errcode = '42501';
  end if;
  if v_previous_status <> 'scheduled' then
    raise exception 'scheduled_appointment_required' using errcode = '22023';
  end if;
  if p_starts_at <= now() or p_starts_at = v_previous_starts_at then
    raise exception 'future_distinct_appointment_required' using errcode = '22023';
  end if;

  v_ends_at := p_starts_at + (v_previous_ends_at - v_previous_starts_at);
  if not exists (
    select 1 from public.house_units unit
    join public.condominiums condominium on condominium.id = unit.condominium_id
    where unit.id = v_unit_id and unit.availability_status = 'available'
      and unit.archived_at is null and condominium.archived_at is null
  ) then raise exception 'appointment_unit_unavailable' using errcode = '22023'; end if;
  perform 1 from public.user_profiles
  where id = v_advisor_id and active and role = 'advisor' for update;
  if not found then raise exception 'active_advisor_required' using errcode = '22023'; end if;
  if not exists (
    select 1 from public.advisor_schedules schedule
    where schedule.advisor_id = v_advisor_id and schedule.active
      and schedule.weekday = extract(dow from p_starts_at at time zone 'America/Costa_Rica')::integer
      and schedule.starts_at_local <= (p_starts_at at time zone 'America/Costa_Rica')::time
      and schedule.ends_at_local >= (v_ends_at at time zone 'America/Costa_Rica')::time
  ) then raise exception 'appointment_outside_advisor_schedule' using errcode = '22023'; end if;
  if exists (
    select 1 from public.availability_blocks block
    where block.advisor_id = v_advisor_id and block.cancelled_at is null
      and block.starts_at < v_ends_at and block.ends_at > p_starts_at
  ) or exists (
    select 1 from public.appointments appointment
    where appointment.id <> p_appointment_id and appointment.advisor_id = v_advisor_id
      and appointment.status = 'scheduled'
      and appointment.starts_at < v_ends_at and appointment.ends_at > p_starts_at
  ) then raise exception 'appointment_slot_unavailable' using errcode = '23P01'; end if;

  update public.appointments set starts_at = p_starts_at, ends_at = v_ends_at
  where id = p_appointment_id;
  update public.opportunities
  set next_action_at = p_starts_at
  where id = v_opportunity_id
    and next_action_at = v_previous_starts_at
    and next_action_description = 'Realizar visita programada a la propiedad.';
  insert into public.appointment_history (
    appointment_id, actor_user_id, action,
    previous_starts_at, previous_ends_at, previous_status, previous_advisor_id,
    new_starts_at, new_ends_at, new_status, new_advisor_id
  ) values (
    p_appointment_id, v_actor_id, 'rescheduled',
    v_previous_starts_at, v_previous_ends_at, v_previous_status, v_advisor_id,
    p_starts_at, v_ends_at, v_previous_status, v_advisor_id
  );
  insert into public.activities (opportunity_id, actor_user_id, type, content)
  values (
    v_opportunity_id, v_actor_id, 'visit',
    'Visita reprogramada de ' ||
    to_char(v_previous_starts_at at time zone 'America/Costa_Rica', 'YYYY-MM-DD HH24:MI') ||
    ' a ' || to_char(p_starts_at at time zone 'America/Costa_Rica', 'YYYY-MM-DD HH24:MI') || '.'
  );
end;
$$;

commit;
