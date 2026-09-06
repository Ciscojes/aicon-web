begin;

create table public.appointment_access_links (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete restrict,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{32}$'),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid not null references public.user_profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create unique index appointment_access_links_active_idx
on public.appointment_access_links (appointment_id)
where used_at is null;

create table public.appointment_change_requests (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete restrict,
  access_link_id uuid not null references public.appointment_access_links(id) on delete restrict,
  kind text not null default 'reschedule' check (kind = 'reschedule'),
  requested_starts_at timestamptz not null,
  message text check (message is null or char_length(message) between 1 and 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  resolved_by uuid references public.user_profiles(id) on delete restrict,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (status = 'pending' and resolved_by is null and resolved_at is null)
    or (status in ('approved', 'rejected') and resolved_by is not null and resolved_at is not null)
  ),
  unique (access_link_id)
);

create index appointment_change_requests_pending_idx
on public.appointment_change_requests (status, created_at)
where status = 'pending';

alter table public.appointment_access_links enable row level security;
alter table public.appointment_change_requests enable row level security;

create policy "administrators and advisors read relevant appointment change requests"
on public.appointment_change_requests for select to authenticated using (
  (select public.current_app_role()) = 'administrator'
  or exists (
    select 1 from public.appointments appointment
    where appointment.id = appointment_change_requests.appointment_id
      and appointment.advisor_id = (
        select id from public.user_profiles
        where auth_user_id = (select auth.uid()) and active
      )
  )
);

grant select on public.appointment_change_requests to authenticated;

create function public.issue_appointment_access_link(p_appointment_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid;
  v_actor_role text;
  v_advisor_id uuid;
  v_starts_at timestamptz;
  v_status text;
  v_token text;
begin
  select id, role into v_actor_id, v_actor_role
  from public.user_profiles
  where auth_user_id = (select auth.uid())
    and active and role in ('administrator', 'advisor');
  if v_actor_id is null then raise exception 'crm_access_required' using errcode = '42501'; end if;

  select advisor_id, starts_at, status into v_advisor_id, v_starts_at, v_status
  from public.appointments where id = p_appointment_id for update;
  if not found then raise exception 'appointment_not_found' using errcode = 'P0002'; end if;
  if v_actor_role <> 'administrator' and v_advisor_id <> v_actor_id then
    raise exception 'assigned_appointment_required' using errcode = '42501';
  end if;
  if v_status <> 'scheduled' or v_starts_at <= now() then
    raise exception 'future_scheduled_appointment_required' using errcode = '22023';
  end if;

  update public.appointment_access_links set used_at = now()
  where appointment_id = p_appointment_id and used_at is null;
  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into public.appointment_access_links (
    appointment_id, token_hash, expires_at, created_by
  ) values (
    p_appointment_id, md5(v_token), v_starts_at, v_actor_id
  );
  return v_token;
end;
$$;

create function public.get_public_appointment_access(p_token text)
returns table (
  appointment_id uuid,
  contact_name text,
  condominium_name text,
  unit_code text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text,
  expires_at timestamptz
) language sql stable security definer set search_path = '' as $$
  select appointment.id, contact.name, condominium.name, unit.code,
    appointment.starts_at, appointment.ends_at, appointment.status, access_link.expires_at
  from public.appointment_access_links access_link
  join public.appointments appointment on appointment.id = access_link.appointment_id
  join public.opportunities opportunity on opportunity.id = appointment.opportunity_id
  join public.contacts contact on contact.id = opportunity.contact_id
  join public.house_units unit on unit.id = appointment.unit_id
  join public.condominiums condominium on condominium.id = unit.condominium_id
  where p_token ~ '^[0-9a-f]{64}$'
    and access_link.token_hash = md5(p_token)
    and access_link.used_at is null
    and access_link.expires_at > now()
    and appointment.status = 'scheduled'
    and appointment.starts_at > now()
  limit 1;
$$;

create function public.get_public_appointment_reschedule_slots(p_token text, p_date date)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql stable security definer set search_path = '' as $$
  with access as (
    select appointment.id, appointment.unit_id, appointment.advisor_id,
      appointment.starts_at as current_starts_at,
      extract(epoch from (appointment.ends_at - appointment.starts_at))::integer as duration_seconds
    from public.appointment_access_links access_link
    join public.appointments appointment on appointment.id = access_link.appointment_id
    where p_token ~ '^[0-9a-f]{64}$'
      and access_link.token_hash = md5(p_token)
      and access_link.used_at is null and access_link.expires_at > now()
      and appointment.status = 'scheduled' and appointment.starts_at > now()
  ), candidate_slots as (
    select access.id, access.unit_id, access.advisor_id, access.current_starts_at,
      slot.starts_at,
      slot.starts_at + make_interval(secs => access.duration_seconds) as ends_at
    from access
    join public.advisor_schedules schedule on schedule.advisor_id = access.advisor_id
      and schedule.active and schedule.weekday = extract(dow from p_date)::integer
    cross join lateral generate_series(
      (p_date + schedule.starts_at_local) at time zone 'America/Costa_Rica',
      ((p_date + schedule.ends_at_local) at time zone 'America/Costa_Rica')
        - make_interval(secs => access.duration_seconds),
      make_interval(secs => access.duration_seconds)
    ) as slot(starts_at)
  )
  select distinct candidate.starts_at, candidate.ends_at
  from candidate_slots candidate
  join public.house_units unit on unit.id = candidate.unit_id
  join public.condominiums condominium on condominium.id = unit.condominium_id
  where p_date >= (now() at time zone 'America/Costa_Rica')::date
    and candidate.starts_at > now()
    and candidate.starts_at <> candidate.current_starts_at
    and unit.availability_status = 'available' and unit.archived_at is null
    and condominium.archived_at is null
    and not exists (
      select 1 from public.availability_blocks block
      where block.advisor_id = candidate.advisor_id and block.cancelled_at is null
        and block.starts_at < candidate.ends_at and block.ends_at > candidate.starts_at
    )
    and not exists (
      select 1 from public.appointments other
      where other.id <> candidate.id and other.advisor_id = candidate.advisor_id
        and other.status = 'scheduled'
        and other.starts_at < candidate.ends_at and other.ends_at > candidate.starts_at
    )
  order by candidate.starts_at;
$$;

create function public.cancel_appointment_with_access_link(
  p_token text,
  p_reason text default null
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_link_id uuid;
  v_appointment_id uuid;
  v_opportunity_id uuid;
  v_advisor_id uuid;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
begin
  if p_token !~ '^[0-9a-f]{64}$' or char_length(coalesce(v_reason, '')) > 500 then
    raise exception 'invalid_appointment_access' using errcode = '22023';
  end if;
  select access_link.id, appointment.id, appointment.opportunity_id,
    appointment.advisor_id, appointment.starts_at, appointment.ends_at
  into v_link_id, v_appointment_id, v_opportunity_id, v_advisor_id, v_starts_at, v_ends_at
  from public.appointment_access_links access_link
  join public.appointments appointment on appointment.id = access_link.appointment_id
  where access_link.token_hash = md5(p_token)
    and access_link.used_at is null and access_link.expires_at > now()
    and appointment.status = 'scheduled' and appointment.starts_at > now()
  for update of access_link, appointment;
  if not found then raise exception 'invalid_or_expired_appointment_access' using errcode = '22023'; end if;

  update public.appointment_access_links set used_at = now() where id = v_link_id;
  update public.appointments
  set status = 'cancelled', cancellation_reason = v_reason
  where id = v_appointment_id;
  update public.opportunities
  set next_action_at = null, next_action_description = null
  where id = v_opportunity_id
    and next_action_at = v_starts_at
    and next_action_description = 'Realizar visita programada a la propiedad.';
  insert into public.appointment_history (
    appointment_id, action,
    previous_starts_at, previous_ends_at, previous_status, previous_advisor_id,
    new_starts_at, new_ends_at, new_status, new_advisor_id, cancellation_reason
  ) values (
    v_appointment_id, 'status_changed',
    v_starts_at, v_ends_at, 'scheduled', v_advisor_id,
    v_starts_at, v_ends_at, 'cancelled', v_advisor_id, v_reason
  );
  insert into public.activities (opportunity_id, type, content)
  values (
    v_opportunity_id, 'visit',
    'Visita cancelada por el cliente mediante enlace seguro' ||
      case when v_reason is not null then ': ' || v_reason else '' end || '.'
  );
end;
$$;

create function public.request_appointment_reschedule_with_access_link(
  p_token text,
  p_requested_starts_at timestamptz,
  p_message text default null
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_link_id uuid;
  v_appointment_id uuid;
  v_opportunity_id uuid;
  v_current_starts_at timestamptz;
  v_message text := nullif(trim(coalesce(p_message, '')), '');
  v_request_id uuid;
begin
  if p_token !~ '^[0-9a-f]{64}$' or char_length(coalesce(v_message, '')) > 500
    or p_requested_starts_at <= now() then
    raise exception 'invalid_reschedule_request' using errcode = '22023';
  end if;
  select access_link.id, appointment.id, appointment.opportunity_id,
    appointment.starts_at
  into v_link_id, v_appointment_id, v_opportunity_id, v_current_starts_at
  from public.appointment_access_links access_link
  join public.appointments appointment on appointment.id = access_link.appointment_id
  where access_link.token_hash = md5(p_token)
    and access_link.used_at is null and access_link.expires_at > now()
    and appointment.status = 'scheduled' and appointment.starts_at > now()
  for update of access_link, appointment;
  if not found then raise exception 'invalid_or_expired_appointment_access' using errcode = '22023'; end if;
  if p_requested_starts_at = v_current_starts_at or not exists (
    select 1 from public.get_public_appointment_reschedule_slots(
      p_token, (p_requested_starts_at at time zone 'America/Costa_Rica')::date
    ) slot where slot.starts_at = p_requested_starts_at
  ) then raise exception 'reschedule_slot_unavailable' using errcode = '23P01'; end if;

  insert into public.appointment_change_requests (
    appointment_id, access_link_id, requested_starts_at, message
  ) values (
    v_appointment_id, v_link_id, p_requested_starts_at, v_message
  ) returning id into v_request_id;
  update public.appointment_access_links set used_at = now() where id = v_link_id;
  insert into public.activities (opportunity_id, type, content)
  values (
    v_opportunity_id, 'visit',
    'El cliente solicitó reprogramar la visita para ' ||
      to_char(p_requested_starts_at at time zone 'America/Costa_Rica', 'YYYY-MM-DD HH24:MI') ||
      case when v_message is not null then ': ' || v_message else '' end || '.'
  );
  return v_request_id;
end;
$$;

create function public.resolve_appointment_change_request(
  p_request_id uuid,
  p_decision text
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid;
  v_actor_role text;
  v_appointment_id uuid;
  v_advisor_id uuid;
  v_opportunity_id uuid;
  v_requested_starts_at timestamptz;
begin
  if p_decision not in ('approved', 'rejected') then
    raise exception 'invalid_change_request_decision' using errcode = '22023';
  end if;
  select id, role into v_actor_id, v_actor_role
  from public.user_profiles
  where auth_user_id = (select auth.uid())
    and active and role in ('administrator', 'advisor');
  if v_actor_id is null then raise exception 'crm_access_required' using errcode = '42501'; end if;

  select request.appointment_id, appointment.advisor_id, appointment.opportunity_id,
    request.requested_starts_at
  into v_appointment_id, v_advisor_id, v_opportunity_id, v_requested_starts_at
  from public.appointment_change_requests request
  join public.appointments appointment on appointment.id = request.appointment_id
  where request.id = p_request_id and request.status = 'pending'
  for update of request, appointment;
  if not found then raise exception 'pending_change_request_required' using errcode = '22023'; end if;
  if v_actor_role <> 'administrator' and v_advisor_id <> v_actor_id then
    raise exception 'assigned_appointment_required' using errcode = '42501';
  end if;

  if p_decision = 'approved' then
    perform public.reschedule_appointment(v_appointment_id, v_requested_starts_at);
  else
    insert into public.activities (opportunity_id, actor_user_id, type, content)
    values (v_opportunity_id, v_actor_id, 'visit', 'Solicitud de reprogramación rechazada.');
  end if;
  update public.appointment_change_requests
  set status = p_decision, resolved_by = v_actor_id, resolved_at = now()
  where id = p_request_id;
end;
$$;

create function public.invalidate_appointment_access_links()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.starts_at is distinct from new.starts_at or old.status is distinct from new.status then
    update public.appointment_access_links set used_at = now()
    where appointment_id = new.id and used_at is null;
  end if;
  return new;
end;
$$;

create trigger appointments_invalidate_access_links
after update of starts_at, status on public.appointments
for each row execute function public.invalidate_appointment_access_links();

revoke all on function public.issue_appointment_access_link(uuid) from public;
revoke all on function public.get_public_appointment_access(text) from public;
revoke all on function public.get_public_appointment_reschedule_slots(text, date) from public;
revoke all on function public.cancel_appointment_with_access_link(text, text) from public;
revoke all on function public.request_appointment_reschedule_with_access_link(text, timestamptz, text) from public;
revoke all on function public.resolve_appointment_change_request(uuid, text) from public;
revoke all on function public.invalidate_appointment_access_links() from public;

grant execute on function public.issue_appointment_access_link(uuid) to authenticated;
grant execute on function public.get_public_appointment_access(text) to anon, authenticated;
grant execute on function public.get_public_appointment_reschedule_slots(text, date) to anon, authenticated;
grant execute on function public.cancel_appointment_with_access_link(text, text) to anon, authenticated;
grant execute on function public.request_appointment_reschedule_with_access_link(text, timestamptz, text) to anon, authenticated;
grant execute on function public.resolve_appointment_change_request(uuid, text) to authenticated;

commit;
