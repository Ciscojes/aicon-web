create function public.sync_condominium_model_assignments(
  target_model_id uuid,
  target_condominium_ids uuid[]
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.house_models
    where id = target_model_id
      and archived_at is null
  ) then
    raise exception 'El modelo no existe o está archivado.'
      using errcode = 'check_violation';
  end if;

  update public.condominium_models
  set active = false
  where model_id = target_model_id;

  insert into public.condominium_models (condominium_id, model_id, active)
  select distinct selected_condominium_id, target_model_id, true
  from unnest(coalesce(target_condominium_ids, array[]::uuid[]))
    as selected(selected_condominium_id)
  where exists (
    select 1
    from public.condominiums
    where id = selected.selected_condominium_id
      and archived_at is null
  )
  on conflict (condominium_id, model_id)
  do update set active = true;
end;
$$;

revoke all on function public.sync_condominium_model_assignments(uuid, uuid[])
from public;
grant execute on function public.sync_condominium_model_assignments(uuid, uuid[])
to authenticated;

create function public.archive_house_model(target_model_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.house_models
  set archived_at = now()
  where id = target_model_id
    and archived_at is null;

  update public.condominium_models
  set active = false
  where model_id = target_model_id;
end;
$$;

revoke all on function public.archive_house_model(uuid) from public;
grant execute on function public.archive_house_model(uuid) to authenticated;
