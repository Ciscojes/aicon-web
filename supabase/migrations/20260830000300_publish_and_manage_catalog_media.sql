begin;

drop policy if exists "internal users read media metadata" on public.media_assets;
create policy "internal users or visitors read visible media metadata"
on public.media_assets for select to anon, authenticated
using (
  (select public.is_active_internal_user())
  or exists (
    select 1 from public.condominium_media cm
    join public.condominiums c on c.id = cm.condominium_id
    where cm.media_id = media_assets.id
      and c.publication_status = 'published' and c.archived_at is null
  )
  or exists (
    select 1 from public.unit_media um
    join public.house_units u on u.id = um.unit_id
    join public.condominiums c on c.id = u.condominium_id
    where um.media_id = media_assets.id
      and u.publication_status = 'published' and u.archived_at is null
      and c.publication_status = 'published' and c.archived_at is null
  )
  or exists (
    select 1 from public.model_media mm
    join public.house_units u on u.model_id = mm.model_id
    join public.condominiums c on c.id = u.condominium_id
    where mm.media_id = media_assets.id
      and u.publication_status = 'published' and u.archived_at is null
      and c.publication_status = 'published' and c.archived_at is null
  )
);

drop policy if exists "internal users read condominium media" on public.condominium_media;
create policy "internal users or visitors read visible condominium media"
on public.condominium_media for select to anon, authenticated
using (
  (select public.is_active_internal_user())
  or exists (
    select 1 from public.condominiums c
    where c.id = condominium_id
      and c.publication_status = 'published' and c.archived_at is null
  )
);

drop policy if exists "internal users read model media" on public.model_media;
create policy "internal users or visitors read visible model media"
on public.model_media for select to anon, authenticated
using (
  (select public.is_active_internal_user())
  or exists (
    select 1 from public.house_units u
    join public.condominiums c on c.id = u.condominium_id
    where u.model_id = model_id
      and u.publication_status = 'published' and u.archived_at is null
      and c.publication_status = 'published' and c.archived_at is null
  )
);

drop policy if exists "internal users read unit media" on public.unit_media;
create policy "internal users or visitors read visible unit media"
on public.unit_media for select to anon, authenticated
using (
  (select public.is_active_internal_user())
  or exists (
    select 1 from public.house_units u
    join public.condominiums c on c.id = u.condominium_id
    where u.id = unit_id
      and u.publication_status = 'published' and u.archived_at is null
      and c.publication_status = 'published' and c.archived_at is null
  )
);

create or replace function public.set_catalog_media_cover(
  p_entity_type text,
  p_entity_id uuid,
  p_media_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if public.current_app_role() not in ('administrator', 'editor') then
    raise exception 'catalog_manager_required' using errcode = '42501';
  end if;

  if p_entity_type = 'condominium' then
    if not exists (select 1 from public.condominium_media where condominium_id = p_entity_id and media_id = p_media_id) then
      raise exception 'media_relationship_not_found' using errcode = 'P0002';
    end if;
    update public.condominium_media set is_cover = false where condominium_id = p_entity_id and is_cover;
    update public.condominium_media set is_cover = true where condominium_id = p_entity_id and media_id = p_media_id;
  elsif p_entity_type = 'model' then
    if not exists (select 1 from public.model_media where model_id = p_entity_id and media_id = p_media_id) then
      raise exception 'media_relationship_not_found' using errcode = 'P0002';
    end if;
    update public.model_media set is_cover = false where model_id = p_entity_id and is_cover;
    update public.model_media set is_cover = true where model_id = p_entity_id and media_id = p_media_id;
  elsif p_entity_type = 'unit' then
    if not exists (select 1 from public.unit_media where unit_id = p_entity_id and media_id = p_media_id) then
      raise exception 'media_relationship_not_found' using errcode = 'P0002';
    end if;
    update public.unit_media set is_cover = false where unit_id = p_entity_id and is_cover;
    update public.unit_media set is_cover = true where unit_id = p_entity_id and media_id = p_media_id;
  else
    raise exception 'invalid_catalog_entity_type' using errcode = '22023';
  end if;
end;
$$;

grant execute on function public.set_catalog_media_cover(text, uuid, uuid) to authenticated;
grant select on public.media_assets, public.condominium_media, public.model_media, public.unit_media to anon;

commit;
