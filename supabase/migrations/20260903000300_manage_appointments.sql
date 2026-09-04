begin;

create table public.appointment_history (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete restrict,
  actor_user_id uuid references public.user_profiles(id) on delete restrict,
  action text not null check (action in ('created', 'rescheduled', 'status_changed')),
  previous_starts_at timestamptz,
  previous_ends_at timestamptz,
  previous_status text check (previous_status is null or previous_status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  previous_advisor_id uuid references public.user_profiles(id) on delete restrict,
  new_starts_at timestamptz,
  new_ends_at timestamptz,
  new_status text check (new_status is null or new_status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  new_advisor_id uuid references public.user_profiles(id) on delete restrict,
  cancellation_reason text check (cancellation_reason is null or char_length(cancellation_reason) between 1 and 500),
  occurred_at timestamptz not null default now()
);

create index appointment_history_appointment_idx
on public.appointment_history (appointment_id, occurred_at desc);

alter table public.appointment_history enable row level security;

create policy "administrators and advisors read relevant appointment history"
on public.appointment_history for select to authenticated using (
  (select public.current_app_role()) = 'administrator'
  or exists (
    select 1 from public.appointments appointment
    where appointment.id = appointment_history.appointment_id
      and appointment.advisor_id = (
        select id from public.user_profiles
        where auth_user_id = (select auth.uid()) and active
      )
  )
);

grant select on public.appointment_history to authenticated;

insert into public.appointment_history (
  appointment_id, action, new_starts_at, new_ends_at, new_status, new_advisor_id, occurred_at
)
select id, 'created', starts_at, ends_at, status, advisor_id, created_at
from public.appointments;

create function public.record_appointment_creation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.appointment_history (
    appointment_id, action, new_starts_at, new_ends_at, new_status, new_advisor_id, occurred_at
  ) values (
    new.id, 'created', new.starts_at, new.ends_at, new.status, new.advisor_id, new.created_at
  );
  return new;
end;
$$;

revoke all on function public.record_appointment_creation() from public;

create trigger appointments_record_creation
after insert on public.appointments
for each row execute function public.record_appointment_creation();

create function public.reschedule_appointment(
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

create function public.set_appointment_status(
  p_appointment_id uuid,
  p_status text,
  p_cancellation_reason text default null
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid;
  v_actor_role text;
  v_advisor_id uuid;
  v_opportunity_id uuid;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_previous_status text;
  v_reason text := nullif(trim(coalesce(p_cancellation_reason, '')), '');
  v_status_label text;
begin
  select id, role into v_actor_id, v_actor_role
  from public.user_profiles
  where auth_user_id = (select auth.uid())
    and active and role in ('administrator', 'advisor');
  if v_actor_id is null then
    raise exception 'crm_access_required' using errcode = '42501';
  end if;
  if p_status not in ('completed', 'cancelled', 'no_show')
    or char_length(coalesce(v_reason, '')) > 500 then
    raise exception 'invalid_appointment_status' using errcode = '22023';
  end if;

  select advisor_id, opportunity_id, starts_at, ends_at, status
  into v_advisor_id, v_opportunity_id, v_starts_at, v_ends_at, v_previous_status
  from public.appointments where id = p_appointment_id for update;
  if not found then raise exception 'appointment_not_found' using errcode = 'P0002'; end if;
  if v_actor_role <> 'administrator' and v_advisor_id <> v_actor_id then
    raise exception 'assigned_appointment_required' using errcode = '42501';
  end if;
  if v_previous_status <> 'scheduled' then
    raise exception 'scheduled_appointment_required' using errcode = '22023';
  end if;

  update public.appointments
  set status = p_status,
      cancellation_reason = case when p_status = 'cancelled' then v_reason else null end
  where id = p_appointment_id;
  update public.opportunities
  set next_action_at = null, next_action_description = null
  where id = v_opportunity_id
    and next_action_at = v_starts_at
    and next_action_description = 'Realizar visita programada a la propiedad.';
  insert into public.appointment_history (
    appointment_id, actor_user_id, action,
    previous_starts_at, previous_ends_at, previous_status, previous_advisor_id,
    new_starts_at, new_ends_at, new_status, new_advisor_id, cancellation_reason
  ) values (
    p_appointment_id, v_actor_id, 'status_changed',
    v_starts_at, v_ends_at, v_previous_status, v_advisor_id,
    v_starts_at, v_ends_at, p_status, v_advisor_id,
    case when p_status = 'cancelled' then v_reason else null end
  );
  v_status_label := case p_status
    when 'completed' then 'realizada'
    when 'cancelled' then 'cancelada'
    else 'no asistida'
  end;
  insert into public.activities (opportunity_id, actor_user_id, type, content)
  values (
    v_opportunity_id, v_actor_id, 'visit',
    'Visita registrada como ' || v_status_label ||
    case when p_status = 'cancelled' and v_reason is not null then ': ' || v_reason else '' end || '.'
  );
end;
$$;

revoke all on function public.reschedule_appointment(uuid, timestamptz) from public;
revoke all on function public.set_appointment_status(uuid, text, text) from public;
grant execute on function public.reschedule_appointment(uuid, timestamptz) to authenticated;
grant execute on function public.set_appointment_status(uuid, text, text) to authenticated;

commit;
