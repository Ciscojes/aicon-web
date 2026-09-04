begin;

alter table public.opportunities
add column next_action_description text
check (
  next_action_description is null
  or char_length(next_action_description) between 1 and 500
);

alter table public.opportunities
add constraint opportunities_next_action_complete check (
  (next_action_at is null and next_action_description is null)
  or (next_action_at is not null and next_action_description is not null)
);

alter table public.opportunities
add constraint closed_opportunities_have_no_next_action check (
  status = 'open'
  or (next_action_at is null and next_action_description is null)
);

create index opportunities_next_action_idx
on public.opportunities (next_action_at)
where status = 'open' and next_action_at is not null;

alter table public.activities drop constraint if exists activities_type_check;
alter table public.activities add constraint activities_type_check
check (type in ('inquiry', 'note', 'call', 'email', 'whatsapp', 'stage_change', 'assignment', 'follow_up', 'quote', 'visit'));

create function public.set_opportunity_next_action(
  p_opportunity_id uuid,
  p_next_action_at timestamptz,
  p_description text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_description text := nullif(trim(coalesce(p_description, '')), '');
  v_previous_at timestamptz;
  v_previous_description text;
  v_status text;
begin
  select id into v_actor_id
  from public.user_profiles
  where auth_user_id = (select auth.uid())
    and active
    and role in ('administrator', 'advisor');
  if v_actor_id is null then
    raise exception 'crm_access_required' using errcode = '42501';
  end if;

  select status, next_action_at, next_action_description
  into v_status, v_previous_at, v_previous_description
  from public.opportunities
  where id = p_opportunity_id
  for update;
  if not found then
    raise exception 'opportunity_not_found' using errcode = 'P0002';
  end if;

  if p_next_action_at is not null then
    if v_status <> 'open' then
      raise exception 'open_opportunity_required' using errcode = '22023';
    end if;
    if p_next_action_at <= now() then
      raise exception 'future_next_action_required' using errcode = '22023';
    end if;
    if char_length(coalesce(v_description, '')) not between 1 and 500 then
      raise exception 'invalid_next_action_description' using errcode = '22023';
    end if;
  elsif v_description is not null then
    raise exception 'next_action_date_required' using errcode = '22023';
  end if;

  if v_previous_at is not distinct from p_next_action_at
    and v_previous_description is not distinct from v_description then
    return;
  end if;

  update public.opportunities
  set next_action_at = p_next_action_at,
      next_action_description = v_description
  where id = p_opportunity_id;

  insert into public.activities (opportunity_id, actor_user_id, type, content)
  values (
    p_opportunity_id,
    v_actor_id,
    'follow_up',
    case
      when p_next_action_at is null then
        'Próxima acción retirada: ' || coalesce(v_previous_description, 'seguimiento pendiente') || '.'
      when v_previous_at is null then
        'Próxima acción programada para ' ||
          to_char(p_next_action_at at time zone 'America/Costa_Rica', 'YYYY-MM-DD HH24:MI') ||
          ': ' || v_description || '.'
      else
        'Próxima acción reprogramada para ' ||
          to_char(p_next_action_at at time zone 'America/Costa_Rica', 'YYYY-MM-DD HH24:MI') ||
          ': ' || v_description || '.'
    end
  );
end;
$$;

create or replace function public.change_opportunity_stage(
  p_opportunity_id uuid,
  p_stage text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_previous_stage text;
  v_previous_next_action text;
begin
  select id into v_actor_id
  from public.user_profiles
  where auth_user_id = (select auth.uid())
    and active
    and role in ('administrator', 'advisor');
  if v_actor_id is null then
    raise exception 'crm_access_required' using errcode = '42501';
  end if;
  if p_stage not in ('new', 'contacted', 'visit_scheduled', 'quote', 'negotiation', 'sold', 'discarded') then
    raise exception 'invalid_opportunity_stage' using errcode = '22023';
  end if;

  select stage, next_action_description
  into v_previous_stage, v_previous_next_action
  from public.opportunities
  where id = p_opportunity_id
  for update;
  if not found then
    raise exception 'opportunity_not_found' using errcode = 'P0002';
  end if;
  if v_previous_stage = p_stage then return; end if;

  update public.opportunities
  set stage = p_stage,
      status = case when p_stage in ('sold', 'discarded') then 'closed' else 'open' end,
      closed_at = case when p_stage in ('sold', 'discarded') then now() else null end,
      next_action_at = case when p_stage in ('sold', 'discarded') then null else next_action_at end,
      next_action_description = case when p_stage in ('sold', 'discarded') then null else next_action_description end
  where id = p_opportunity_id;

  insert into public.activities (opportunity_id, actor_user_id, type, content)
  values (
    p_opportunity_id,
    v_actor_id,
    'stage_change',
    'Etapa cambiada de ' || v_previous_stage || ' a ' || p_stage || '.'
  );

  if p_stage in ('sold', 'discarded') and v_previous_next_action is not null then
    insert into public.activities (opportunity_id, actor_user_id, type, content)
    values (
      p_opportunity_id,
      v_actor_id,
      'follow_up',
      'Próxima acción retirada al cerrar la oportunidad: ' || v_previous_next_action || '.'
    );
  end if;
end;
$$;

revoke all on function public.set_opportunity_next_action(uuid, timestamptz, text) from public;
grant execute on function public.set_opportunity_next_action(uuid, timestamptz, text) to authenticated;

commit;
