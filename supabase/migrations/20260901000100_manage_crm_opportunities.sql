begin;

create policy "CRM users read active internal profiles"
on public.user_profiles for select to authenticated
using (
  active
  and (select public.current_app_role()) in ('administrator', 'advisor')
);

create function public.add_opportunity_note(
  p_opportunity_id uuid,
  p_content text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_activity_id uuid;
  v_content text := trim(coalesce(p_content, ''));
begin
  select id into v_actor_id
  from public.user_profiles
  where auth_user_id = (select auth.uid())
    and active
    and role in ('administrator', 'advisor');
  if v_actor_id is null then
    raise exception 'crm_access_required' using errcode = '42501';
  end if;
  if char_length(v_content) not between 1 and 5000 then
    raise exception 'invalid_note' using errcode = '22023';
  end if;
  if not exists (select 1 from public.opportunities where id = p_opportunity_id) then
    raise exception 'opportunity_not_found' using errcode = 'P0002';
  end if;

  insert into public.activities (opportunity_id, actor_user_id, type, content)
  values (p_opportunity_id, v_actor_id, 'note', v_content)
  returning id into v_activity_id;
  return v_activity_id;
end;
$$;

create function public.change_opportunity_stage(
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

  select stage into v_previous_stage
  from public.opportunities
  where id = p_opportunity_id
  for update;
  if v_previous_stage is null then
    raise exception 'opportunity_not_found' using errcode = 'P0002';
  end if;
  if v_previous_stage = p_stage then return; end if;

  update public.opportunities
  set stage = p_stage,
      status = case when p_stage in ('sold', 'discarded') then 'closed' else 'open' end,
      closed_at = case when p_stage in ('sold', 'discarded') then now() else null end
  where id = p_opportunity_id;

  insert into public.activities (opportunity_id, actor_user_id, type, content)
  values (
    p_opportunity_id,
    v_actor_id,
    'stage_change',
    'Etapa cambiada de ' || v_previous_stage || ' a ' || p_stage || '.'
  );
end;
$$;

revoke all on function public.add_opportunity_note(uuid, text) from public;
revoke all on function public.change_opportunity_stage(uuid, text) from public;
grant execute on function public.add_opportunity_note(uuid, text) to authenticated;
grant execute on function public.change_opportunity_stage(uuid, text) to authenticated;

commit;
