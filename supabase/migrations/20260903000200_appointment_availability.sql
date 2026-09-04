begin;

create function public.is_valid_appointment_settings(candidate jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
begin
  return jsonb_typeof(candidate) = 'object'
    and jsonb_typeof(candidate -> 'durationMinutes') = 'number'
    and (candidate ->> 'durationMinutes')::integer in (30, 45, 60, 90, 120);
exception when others then
  return false;
end;
$$;

revoke all on function public.is_valid_appointment_settings(jsonb) from public;

alter table public.app_settings drop constraint app_settings_category_check;
alter table public.app_settings add constraint app_settings_category_check
check (category in ('financing', 'appointments'));
alter table public.app_settings drop constraint valid_app_setting_value;
alter table public.app_settings add constraint valid_app_setting_value check (
  (category = 'financing' and public.is_valid_financial_settings(value))
  or (category = 'appointments' and public.is_valid_appointment_settings(value))
);

create table public.advisor_schedules (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.user_profiles(id) on delete restrict,
  weekday integer not null check (weekday between 0 and 6),
  starts_at_local time not null,
  ends_at_local time not null,
  active boolean not null default true,
  created_by uuid not null references public.user_profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at_local < ends_at_local),
  unique (advisor_id, weekday, starts_at_local, ends_at_local)
);

create table public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.user_profiles(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null check (char_length(reason) between 1 and 500),
  created_by uuid not null references public.user_profiles(id) on delete restrict,
  cancelled_at timestamptz,
  cancelled_by uuid references public.user_profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete restrict,
  unit_id uuid not null references public.house_units(id) on delete restrict,
  advisor_id uuid not null references public.user_profiles(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  cancellation_reason text check (cancellation_reason is null or char_length(cancellation_reason) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create index advisor_schedules_lookup_idx on public.advisor_schedules (weekday, advisor_id) where active;
create index availability_blocks_lookup_idx on public.availability_blocks (advisor_id, starts_at, ends_at) where cancelled_at is null;
create index appointments_advisor_time_idx on public.appointments (advisor_id, starts_at, ends_at) where status = 'scheduled';
create index appointments_opportunity_idx on public.appointments (opportunity_id, starts_at desc);

create trigger advisor_schedules_set_updated_at before update on public.advisor_schedules
for each row execute function public.set_updated_at();
create trigger appointments_set_updated_at before update on public.appointments
for each row execute function public.set_updated_at();

alter table public.advisor_schedules enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.appointments enable row level security;

create policy "administrators and advisors read relevant schedules"
on public.advisor_schedules for select to authenticated using (
  (select public.current_app_role()) = 'administrator'
  or advisor_id = (select id from public.user_profiles where auth_user_id = (select auth.uid()) and active)
);
create policy "administrators and advisors read relevant blocks"
on public.availability_blocks for select to authenticated using (
  (select public.current_app_role()) = 'administrator'
  or advisor_id = (select id from public.user_profiles where auth_user_id = (select auth.uid()) and active)
);
create policy "administrators and advisors read relevant appointments"
on public.appointments for select to authenticated using (
  (select public.current_app_role()) = 'administrator'
  or advisor_id = (select id from public.user_profiles where auth_user_id = (select auth.uid()) and active)
);

grant select on public.advisor_schedules, public.availability_blocks, public.appointments to authenticated;

create function public.get_visit_duration_minutes()
returns integer language sql stable security definer set search_path = '' as $$
  select coalesce((
    select (value ->> 'durationMinutes')::integer from public.app_settings
    where category = 'appointments' and effective_from <= now()
    order by effective_from desc, updated_at desc limit 1
  ), 60);
$$;
revoke all on function public.get_visit_duration_minutes() from public;
grant execute on function public.get_visit_duration_minutes() to anon, authenticated;

create function public.get_available_visit_slots(p_unit_id uuid, p_date date)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql stable security definer set search_path = '' as $$
  with duration as (
    select public.get_visit_duration_minutes() as minutes
  ), eligible_schedules as (
    select schedule.* from public.advisor_schedules schedule
    join public.user_profiles advisor on advisor.id = schedule.advisor_id
    join public.house_units unit on unit.id = p_unit_id
    join public.condominiums condominium on condominium.id = unit.condominium_id
    where p_date >= (now() at time zone 'America/Costa_Rica')::date
      and schedule.active and schedule.weekday = extract(dow from p_date)::integer
      and advisor.active and advisor.role = 'advisor'
      and unit.publication_status = 'published' and unit.archived_at is null
      and unit.availability_status = 'available'
      and condominium.publication_status = 'published' and condominium.archived_at is null
  ), candidate_slots as (
    select schedule.advisor_id, slot.starts_at,
      slot.starts_at + make_interval(mins => duration.minutes) as ends_at
    from eligible_schedules schedule cross join duration
    cross join lateral generate_series(
      (p_date + schedule.starts_at_local) at time zone 'America/Costa_Rica',
      ((p_date + schedule.ends_at_local) at time zone 'America/Costa_Rica') - make_interval(mins => duration.minutes),
      make_interval(mins => duration.minutes)
    ) as slot(starts_at)
  )
  select distinct candidate.starts_at, candidate.ends_at from candidate_slots candidate
  where candidate.starts_at > now()
    and not exists (
      select 1 from public.availability_blocks block
      where block.advisor_id = candidate.advisor_id and block.cancelled_at is null
        and block.starts_at < candidate.ends_at and block.ends_at > candidate.starts_at
    )
    and not exists (
      select 1 from public.appointments appointment
      where appointment.advisor_id = candidate.advisor_id and appointment.status = 'scheduled'
        and appointment.starts_at < candidate.ends_at and appointment.ends_at > candidate.starts_at
    )
  order by candidate.starts_at;
$$;
revoke all on function public.get_available_visit_slots(uuid, date) from public;
grant execute on function public.get_available_visit_slots(uuid, date) to anon, authenticated;

create function public.save_advisor_schedule(
  p_advisor_id uuid, p_weekday integer, p_starts_at_local time, p_ends_at_local time
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_actor_id uuid; v_schedule_id uuid;
begin
  select id into v_actor_id from public.user_profiles
  where auth_user_id = (select auth.uid()) and active and role = 'administrator';
  if v_actor_id is null then raise exception 'administrator_access_required' using errcode = '42501'; end if;
  if p_weekday not between 0 and 6 or p_starts_at_local >= p_ends_at_local then
    raise exception 'invalid_advisor_schedule' using errcode = '22023';
  end if;
  perform 1 from public.user_profiles where id = p_advisor_id and active and role = 'advisor' for update;
  if not found then raise exception 'active_advisor_required' using errcode = '22023'; end if;
  if exists (
    select 1 from public.advisor_schedules where advisor_id = p_advisor_id
      and weekday = p_weekday and active and starts_at_local < p_ends_at_local
      and ends_at_local > p_starts_at_local
  ) then raise exception 'overlapping_advisor_schedule' using errcode = '23P01'; end if;
  insert into public.advisor_schedules (advisor_id, weekday, starts_at_local, ends_at_local, created_by)
  values (p_advisor_id, p_weekday, p_starts_at_local, p_ends_at_local, v_actor_id)
  on conflict (advisor_id, weekday, starts_at_local, ends_at_local) do update set active = true
  returning id into v_schedule_id;
  return v_schedule_id;
end;
$$;

create function public.set_advisor_schedule_active(p_schedule_id uuid, p_active boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.user_profiles
    where auth_user_id = (select auth.uid()) and active and role = 'administrator') then
    raise exception 'administrator_access_required' using errcode = '42501';
  end if;
  update public.advisor_schedules set active = p_active where id = p_schedule_id;
  if not found then raise exception 'schedule_not_found' using errcode = 'P0002'; end if;
end;
$$;

create function public.create_availability_block(
  p_advisor_id uuid, p_starts_at timestamptz, p_ends_at timestamptz, p_reason text
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_actor_id uuid; v_actor_role text; v_block_id uuid; v_reason text := trim(coalesce(p_reason, ''));
begin
  select id, role into v_actor_id, v_actor_role from public.user_profiles
  where auth_user_id = (select auth.uid()) and active and role in ('administrator', 'advisor');
  if v_actor_id is null then raise exception 'crm_access_required' using errcode = '42501'; end if;
  if v_actor_role <> 'administrator' and p_advisor_id <> v_actor_id then
    raise exception 'own_availability_only' using errcode = '42501';
  end if;
  if p_starts_at <= now() or p_starts_at >= p_ends_at or char_length(v_reason) not between 1 and 500 then
    raise exception 'invalid_availability_block' using errcode = '22023';
  end if;
  if not exists (select 1 from public.user_profiles where id = p_advisor_id and active and role = 'advisor') then
    raise exception 'active_advisor_required' using errcode = '22023';
  end if;
  insert into public.availability_blocks (advisor_id, starts_at, ends_at, reason, created_by)
  values (p_advisor_id, p_starts_at, p_ends_at, v_reason, v_actor_id) returning id into v_block_id;
  return v_block_id;
end;
$$;

create function public.cancel_availability_block(p_block_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_actor_id uuid; v_actor_role text; v_advisor_id uuid;
begin
  select id, role into v_actor_id, v_actor_role from public.user_profiles
  where auth_user_id = (select auth.uid()) and active and role in ('administrator', 'advisor');
  if v_actor_id is null then raise exception 'crm_access_required' using errcode = '42501'; end if;
  select advisor_id into v_advisor_id from public.availability_blocks where id = p_block_id for update;
  if not found then raise exception 'availability_block_not_found' using errcode = 'P0002'; end if;
  if v_actor_role <> 'administrator' and v_advisor_id <> v_actor_id then
    raise exception 'own_availability_only' using errcode = '42501';
  end if;
  update public.availability_blocks set cancelled_at = now(), cancelled_by = v_actor_id
  where id = p_block_id and cancelled_at is null;
end;
$$;

revoke all on function public.save_advisor_schedule(uuid, integer, time, time) from public;
revoke all on function public.set_advisor_schedule_active(uuid, boolean) from public;
revoke all on function public.create_availability_block(uuid, timestamptz, timestamptz, text) from public;
revoke all on function public.cancel_availability_block(uuid) from public;
grant execute on function public.save_advisor_schedule(uuid, integer, time, time) to authenticated;
grant execute on function public.set_advisor_schedule_active(uuid, boolean) to authenticated;
grant execute on function public.create_availability_block(uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.cancel_availability_block(uuid) to authenticated;

create function public.submit_visit_appointment(
  p_name text, p_phone text, p_email text, p_unit_id uuid,
  p_starts_at timestamptz, p_communications_consent boolean
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_name text := trim(coalesce(p_name, '')); v_phone text := trim(coalesce(p_phone, ''));
  v_email text := lower(trim(coalesce(p_email, ''))); v_duration integer := public.get_visit_duration_minutes();
  v_ends_at timestamptz; v_contact_id uuid; v_opportunity_id uuid;
  v_preferred_advisor_id uuid; v_advisor_id uuid; v_appointment_id uuid;
begin
  if char_length(v_name) not between 2 and 160 or v_phone !~ '^\+[1-9][0-9]{7,14}$'
    or char_length(v_email) > 320 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or not p_communications_consent then
    raise exception 'invalid_appointment_contact' using errcode = '22023';
  end if;
  if p_starts_at <= now() then raise exception 'future_appointment_required' using errcode = '22023'; end if;
  v_ends_at := p_starts_at + make_interval(mins => v_duration);
  if not exists (
    select 1 from public.get_available_visit_slots(p_unit_id, (p_starts_at at time zone 'America/Costa_Rica')::date) slot
    where slot.starts_at = p_starts_at and slot.ends_at = v_ends_at
  ) then raise exception 'appointment_slot_unavailable' using errcode = '23P01'; end if;

  select id into v_contact_id from public.contacts where normalized_phone = v_phone and archived_at is null for update;
  if v_contact_id is null then
    insert into public.contacts (name, phone, normalized_phone, email, source, email_consent, whatsapp_consent)
    values (v_name, v_phone, v_phone, v_email, 'contact_form', true, true) returning id into v_contact_id;
  else
    update public.contacts set name = v_name, phone = v_phone, email = v_email,
      email_consent = true, whatsapp_consent = true where id = v_contact_id;
  end if;

  select id, advisor_id into v_opportunity_id, v_preferred_advisor_id from public.opportunities
  where contact_id = v_contact_id and unit_id = p_unit_id and status = 'open'
  order by created_at desc limit 1 for update;

  for v_advisor_id in
    select schedule.advisor_id from public.advisor_schedules schedule
    join public.user_profiles advisor on advisor.id = schedule.advisor_id
    where schedule.active and advisor.active and advisor.role = 'advisor'
      and schedule.weekday = extract(dow from p_starts_at at time zone 'America/Costa_Rica')::integer
      and schedule.starts_at_local <= (p_starts_at at time zone 'America/Costa_Rica')::time
      and schedule.ends_at_local >= (v_ends_at at time zone 'America/Costa_Rica')::time
    order by (schedule.advisor_id = v_preferred_advisor_id) desc, schedule.advisor_id
  loop
    perform 1 from public.user_profiles where id = v_advisor_id for update;
    if not exists (select 1 from public.availability_blocks block
      where block.advisor_id = v_advisor_id and block.cancelled_at is null
        and block.starts_at < v_ends_at and block.ends_at > p_starts_at)
      and not exists (select 1 from public.appointments appointment
      where appointment.advisor_id = v_advisor_id and appointment.status = 'scheduled'
        and appointment.starts_at < v_ends_at and appointment.ends_at > p_starts_at) then exit; end if;
    v_advisor_id := null;
  end loop;
  if v_advisor_id is null then raise exception 'appointment_slot_unavailable' using errcode = '23P01'; end if;

  if v_opportunity_id is null then
    insert into public.opportunities (contact_id, unit_id, advisor_id, interest_kind, stage, source,
      next_action_at, next_action_description)
    values (v_contact_id, p_unit_id, v_advisor_id, 'unit', 'visit_scheduled', 'contact_form',
      p_starts_at, 'Realizar visita programada a la propiedad.') returning id into v_opportunity_id;
  else
    update public.opportunities set advisor_id = v_advisor_id, stage = 'visit_scheduled', status = 'open',
      closed_at = null, next_action_at = p_starts_at,
      next_action_description = 'Realizar visita programada a la propiedad.' where id = v_opportunity_id;
  end if;

  insert into public.appointments (opportunity_id, unit_id, advisor_id, starts_at, ends_at)
  values (v_opportunity_id, p_unit_id, v_advisor_id, p_starts_at, v_ends_at) returning id into v_appointment_id;
  insert into public.activities (opportunity_id, type, content) values (
    v_opportunity_id, 'visit', 'Visita programada para ' ||
      to_char(p_starts_at at time zone 'America/Costa_Rica', 'YYYY-MM-DD HH24:MI') || '.'
  );
  return v_appointment_id;
end;
$$;

revoke all on function public.submit_visit_appointment(text, text, text, uuid, timestamptz, boolean) from public;
grant execute on function public.submit_visit_appointment(text, text, text, uuid, timestamptz, boolean) to anon, authenticated;

commit;
