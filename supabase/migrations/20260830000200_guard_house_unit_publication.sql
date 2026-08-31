begin;

create function public.validate_house_unit_catalog_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.model_id is not null
    and (
      tg_op = 'INSERT'
      or new.model_id is distinct from old.model_id
      or new.condominium_id is distinct from old.condominium_id
    )
    and not exists (
      select 1
      from public.condominium_models
      join public.house_models on house_models.id = condominium_models.model_id
      where condominium_models.condominium_id = new.condominium_id
        and condominium_models.model_id = new.model_id
        and condominium_models.active
        and house_models.archived_at is null
    ) then
    raise exception 'El modelo no está habilitado para este condominio.'
      using errcode = '23514';
  end if;

  if new.publication_status = 'published' and not exists (
    select 1
    from public.condominiums
    where condominiums.id = new.condominium_id
      and condominiums.publication_status = 'published'
      and condominiums.archived_at is null
  ) then
    raise exception 'No se puede publicar una unidad de un condominio no publicado.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger house_units_validate_catalog_state
before insert or update of condominium_id, model_id, publication_status
on public.house_units
for each row execute function public.validate_house_unit_catalog_state();

drop policy "public reads published units" on public.house_units;
create policy "public reads published units"
on public.house_units for select to anon, authenticated
using (
  (
    publication_status = 'published'
    and archived_at is null
    and exists (
      select 1
      from public.condominiums
      where condominiums.id = house_units.condominium_id
        and condominiums.publication_status = 'published'
        and condominiums.archived_at is null
    )
  )
  or (select public.is_active_internal_user())
);

drop policy "public reads models of published units" on public.house_models;
create policy "public reads models of published units"
on public.house_models for select to anon, authenticated
using (
  exists (
    select 1
    from public.house_units
    join public.condominiums on condominiums.id = house_units.condominium_id
    where house_units.model_id = house_models.id
      and house_units.publication_status = 'published'
      and house_units.archived_at is null
      and condominiums.publication_status = 'published'
      and condominiums.archived_at is null
  )
  or (select public.is_active_internal_user())
);

drop policy "public reads active model relationships" on public.condominium_models;
create policy "public reads active model relationships"
on public.condominium_models for select to anon, authenticated
using (
  (
    active
    and exists (
      select 1 from public.condominiums
      where condominiums.id = condominium_models.condominium_id
        and condominiums.publication_status = 'published'
        and condominiums.archived_at is null
    )
  )
  or (select public.is_active_internal_user())
);

commit;
