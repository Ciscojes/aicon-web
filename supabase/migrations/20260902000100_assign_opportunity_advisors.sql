begin;

alter table public.activities drop constraint if exists activities_type_check;
alter table public.activities add constraint activities_type_check
check (type in ('inquiry', 'note', 'call', 'email', 'whatsapp', 'stage_change', 'assignment', 'quote', 'visit'));

create function public.assign_opportunity_advisor(
  p_opportunity_id uuid,
  p_advisor_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_advisor_name text;
  v_previous_advisor_id uuid;
begin
  select id into v_actor_id
  from public.user_profiles
  where auth_user_id = (select auth.uid())
    and active
    and role = 'administrator';
  if v_actor_id is null then
    raise exception 'administrator_access_required' using errcode = '42501';
  end if;

  if p_advisor_id is not null then
    select name into v_advisor_name
    from public.user_profiles
    where id = p_advisor_id
      and active
      and role = 'advisor';
    if v_advisor_name is null then
      raise exception 'active_advisor_required' using errcode = '22023';
    end if;
  end if;

  select advisor_id into v_previous_advisor_id
  from public.opportunities
  where id = p_opportunity_id
  for update;
  if not found then
    raise exception 'opportunity_not_found' using errcode = 'P0002';
  end if;
  if v_previous_advisor_id is not distinct from p_advisor_id then return; end if;

  update public.opportunities
  set advisor_id = p_advisor_id
  where id = p_opportunity_id;

  insert into public.activities (opportunity_id, actor_user_id, type, content)
  values (
    p_opportunity_id,
    v_actor_id,
    'assignment',
    case
      when p_advisor_id is null then 'Asignación de asesor retirada.'
      else 'Oportunidad asignada a ' || v_advisor_name || '.'
    end
  );
end;
$$;

revoke all on function public.assign_opportunity_advisor(uuid, uuid) from public;
grant execute on function public.assign_opportunity_advisor(uuid, uuid) to authenticated;

commit;
