begin;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete restrict,
  contact_id uuid references public.contacts(id) on delete restrict,
  advisor_id uuid references public.user_profiles(id) on delete restrict,
  recipient_kind text not null check (recipient_kind in ('contact', 'advisor')),
  channel text not null check (channel in ('email', 'whatsapp')),
  template text not null check (template in (
    'appointment_confirmation',
    'appointment_rescheduled',
    'appointment_cancelled',
    'appointment_reminder_24h',
    'appointment_reminder_2h'
  )),
  event_key text not null check (char_length(event_key) between 1 and 100),
  scheduled_for timestamptz not null,
  status text not null default 'queued' check (status in ('queued', 'processing', 'sent', 'failed', 'cancelled')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  provider_message_id text,
  sent_at timestamptz,
  last_error text check (last_error is null or char_length(last_error) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (recipient_kind = 'contact' and contact_id is not null and advisor_id is null)
    or (recipient_kind = 'advisor' and contact_id is null and advisor_id is not null)
  ),
  check ((status = 'sent' and sent_at is not null) or status <> 'sent'),
  unique (appointment_id, recipient_kind, channel, template, event_key)
);

create index notifications_queue_idx
on public.notifications (status, scheduled_for)
where status in ('queued', 'failed');

create index notifications_appointment_idx
on public.notifications (appointment_id, scheduled_for, created_at);

create trigger notifications_set_updated_at before update on public.notifications
for each row execute function public.set_updated_at();

alter table public.notifications enable row level security;

create policy "administrators and advisors read relevant notifications"
on public.notifications for select to authenticated using (
  (select public.current_app_role()) = 'administrator'
  or exists (
    select 1 from public.appointments appointment
    where appointment.id = notifications.appointment_id
      and appointment.advisor_id = (
        select id from public.user_profiles
        where auth_user_id = (select auth.uid()) and active
      )
  )
);

grant select on public.notifications to authenticated;

create function public.enqueue_appointment_recipient_notifications(
  p_appointment_id uuid,
  p_contact_id uuid,
  p_advisor_id uuid,
  p_recipient_kind text,
  p_email_enabled boolean,
  p_whatsapp_enabled boolean,
  p_event_template text,
  p_event_key text,
  p_event_time timestamptz,
  p_starts_at timestamptz,
  p_include_reminders boolean
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_email_enabled then
    insert into public.notifications (
      appointment_id, contact_id, advisor_id, recipient_kind, channel, template, event_key, scheduled_for
    ) values (
      p_appointment_id, p_contact_id, p_advisor_id, p_recipient_kind, 'email', p_event_template, p_event_key, p_event_time
    ) on conflict do nothing;
  end if;
  if p_whatsapp_enabled then
    insert into public.notifications (
      appointment_id, contact_id, advisor_id, recipient_kind, channel, template, event_key, scheduled_for
    ) values (
      p_appointment_id, p_contact_id, p_advisor_id, p_recipient_kind, 'whatsapp', p_event_template, p_event_key, p_event_time
    ) on conflict do nothing;
  end if;
  if not p_include_reminders then return; end if;

  if p_starts_at - interval '24 hours' > now() then
    if p_email_enabled then
      insert into public.notifications (
        appointment_id, contact_id, advisor_id, recipient_kind, channel, template, event_key, scheduled_for
      ) values (
        p_appointment_id, p_contact_id, p_advisor_id, p_recipient_kind,
        'email', 'appointment_reminder_24h', p_event_key, p_starts_at - interval '24 hours'
      ) on conflict do nothing;
    end if;
    if p_whatsapp_enabled then
      insert into public.notifications (
        appointment_id, contact_id, advisor_id, recipient_kind, channel, template, event_key, scheduled_for
      ) values (
        p_appointment_id, p_contact_id, p_advisor_id, p_recipient_kind,
        'whatsapp', 'appointment_reminder_24h', p_event_key, p_starts_at - interval '24 hours'
      ) on conflict do nothing;
    end if;
  end if;

  if p_starts_at - interval '2 hours' > now() then
    if p_email_enabled then
      insert into public.notifications (
        appointment_id, contact_id, advisor_id, recipient_kind, channel, template, event_key, scheduled_for
      ) values (
        p_appointment_id, p_contact_id, p_advisor_id, p_recipient_kind,
        'email', 'appointment_reminder_2h', p_event_key, p_starts_at - interval '2 hours'
      ) on conflict do nothing;
    end if;
    if p_whatsapp_enabled then
      insert into public.notifications (
        appointment_id, contact_id, advisor_id, recipient_kind, channel, template, event_key, scheduled_for
      ) values (
        p_appointment_id, p_contact_id, p_advisor_id, p_recipient_kind,
        'whatsapp', 'appointment_reminder_2h', p_event_key, p_starts_at - interval '2 hours'
      ) on conflict do nothing;
    end if;
  end if;
end;
$$;

revoke all on function public.enqueue_appointment_recipient_notifications(uuid, uuid, uuid, text, boolean, boolean, text, text, timestamptz, timestamptz, boolean) from public;

create function public.enqueue_appointment_notifications(
  p_appointment_id uuid,
  p_event_template text,
  p_include_reminders boolean default true
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_contact_id uuid;
  v_advisor_id uuid;
  v_starts_at timestamptz;
  v_contact_email boolean;
  v_contact_whatsapp boolean;
  v_advisor_email boolean;
  v_advisor_whatsapp boolean;
  v_event_key text;
begin
  if p_event_template not in ('appointment_confirmation', 'appointment_rescheduled', 'appointment_cancelled') then
    raise exception 'invalid_notification_template' using errcode = '22023';
  end if;

  select opportunity.contact_id, appointment.advisor_id, appointment.starts_at,
    contact.email_consent and contact.email is not null and trim(contact.email) <> '',
    contact.whatsapp_consent and contact.normalized_phone ~ '^\+[1-9][0-9]{7,14}$',
    advisor.email is not null and trim(advisor.email) <> '',
    advisor.phone is not null and advisor.phone ~ '^\+[1-9][0-9]{7,14}$',
    appointment.updated_at::text
  into v_contact_id, v_advisor_id, v_starts_at,
    v_contact_email, v_contact_whatsapp, v_advisor_email, v_advisor_whatsapp, v_event_key
  from public.appointments appointment
  join public.opportunities opportunity on opportunity.id = appointment.opportunity_id
  join public.contacts contact on contact.id = opportunity.contact_id
  join public.user_profiles advisor on advisor.id = appointment.advisor_id
  where appointment.id = p_appointment_id;

  if not found then
    raise exception 'appointment_not_found' using errcode = 'P0002';
  end if;

  perform public.enqueue_appointment_recipient_notifications(
    p_appointment_id, v_contact_id, null, 'contact',
    v_contact_email, v_contact_whatsapp, p_event_template, v_event_key, now(), v_starts_at, p_include_reminders
  );
  perform public.enqueue_appointment_recipient_notifications(
    p_appointment_id, null, v_advisor_id, 'advisor',
    v_advisor_email, v_advisor_whatsapp, p_event_template, v_event_key, now(), v_starts_at, p_include_reminders
  );
end;
$$;

revoke all on function public.enqueue_appointment_notifications(uuid, text, boolean) from public;

create function public.manage_appointment_notifications()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform public.enqueue_appointment_notifications(new.id, 'appointment_confirmation', true);
    return new;
  end if;

  if old.starts_at is distinct from new.starts_at and new.status = 'scheduled' then
    update public.notifications set status = 'cancelled'
    where appointment_id = new.id and status in ('queued', 'failed');
    perform public.enqueue_appointment_notifications(new.id, 'appointment_rescheduled', true);
  elsif old.status = 'scheduled' and new.status = 'cancelled' then
    update public.notifications set status = 'cancelled'
    where appointment_id = new.id and status in ('queued', 'failed');
    perform public.enqueue_appointment_notifications(new.id, 'appointment_cancelled', false);
  elsif old.status = 'scheduled' and new.status in ('completed', 'no_show') then
    update public.notifications set status = 'cancelled'
    where appointment_id = new.id and status in ('queued', 'failed');
  end if;
  return new;
end;
$$;

revoke all on function public.manage_appointment_notifications() from public;

create trigger appointments_manage_notifications
after insert or update of starts_at, status on public.appointments
for each row execute function public.manage_appointment_notifications();

do $$
declare
  v_appointment_id uuid;
begin
  for v_appointment_id in
    select id from public.appointments
    where status = 'scheduled' and starts_at > now()
  loop
    perform public.enqueue_appointment_notifications(v_appointment_id, 'appointment_confirmation', true);
  end loop;
end;
$$;

create function public.retry_appointment_notification(p_notification_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_actor_id uuid;
  v_actor_role text;
  v_appointment_advisor_id uuid;
begin
  select id, role into v_actor_id, v_actor_role
  from public.user_profiles
  where auth_user_id = (select auth.uid())
    and active and role in ('administrator', 'advisor');
  if v_actor_id is null then
    raise exception 'crm_access_required' using errcode = '42501';
  end if;

  select appointment.advisor_id into v_appointment_advisor_id
  from public.notifications notification
  join public.appointments appointment on appointment.id = notification.appointment_id
  where notification.id = p_notification_id;
  if not found then raise exception 'notification_not_found' using errcode = 'P0002'; end if;
  if v_actor_role <> 'administrator' and v_appointment_advisor_id <> v_actor_id then
    raise exception 'assigned_appointment_required' using errcode = '42501';
  end if;

  update public.notifications
  set status = 'queued', last_error = null
  where id = p_notification_id and status = 'failed';
  if not found then raise exception 'failed_notification_required' using errcode = '22023'; end if;
end;
$$;

revoke all on function public.retry_appointment_notification(uuid) from public;
grant execute on function public.retry_appointment_notification(uuid) to authenticated;

create function public.claim_due_appointment_notifications(p_limit integer default 20)
returns setof public.notifications
language plpgsql security definer set search_path = '' as $$
begin
  if p_limit not between 1 and 100 then
    raise exception 'invalid_notification_batch_size' using errcode = '22023';
  end if;
  return query
  update public.notifications notification
  set status = 'processing', attempt_count = notification.attempt_count + 1
  where notification.id in (
    select candidate.id from public.notifications candidate
    where candidate.status = 'queued' and candidate.scheduled_for <= now()
    order by candidate.scheduled_for, candidate.created_at
    for update skip locked limit p_limit
  )
  returning notification.*;
end;
$$;

create function public.record_appointment_notification_delivery(
  p_notification_id uuid,
  p_succeeded boolean,
  p_provider_message_id text default null,
  p_error text default null
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if char_length(coalesce(p_provider_message_id, '')) > 500 or char_length(coalesce(p_error, '')) > 1000 then
    raise exception 'invalid_notification_delivery_result' using errcode = '22023';
  end if;
  update public.notifications
  set status = case when p_succeeded then 'sent' else 'failed' end,
      provider_message_id = nullif(trim(coalesce(p_provider_message_id, '')), ''),
      sent_at = case when p_succeeded then now() else null end,
      last_error = case when p_succeeded then null else coalesce(nullif(trim(coalesce(p_error, '')), ''), 'Error del proveedor sin detalle.') end
  where id = p_notification_id and status = 'processing';
  if not found then raise exception 'processing_notification_required' using errcode = '22023'; end if;
end;
$$;

revoke all on function public.claim_due_appointment_notifications(integer) from public;
revoke all on function public.record_appointment_notification_delivery(uuid, boolean, text, text) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.claim_due_appointment_notifications(integer) to service_role;
    grant execute on function public.record_appointment_notification_delivery(uuid, boolean, text, text) to service_role;
  end if;
end;
$$;

commit;
