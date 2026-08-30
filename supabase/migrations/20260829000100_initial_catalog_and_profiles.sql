begin;

create type public.app_role as enum ('administrator', 'advisor', 'editor');
create type public.publication_status as enum ('draft', 'published', 'hidden');
create type public.availability_status as enum ('available', 'reserved', 'sold');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.condominiums (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug)),
  name text not null check (char_length(name) between 2 and 160),
  description text not null default '',
  address text not null default '',
  latitude numeric(9, 6) check (latitude between -90 and 90),
  longitude numeric(9, 6) check (longitude between -180 and 180),
  publication_status public.publication_status not null default 'draft',
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint condominiums_publication_date check (
    publication_status <> 'published' or published_at is not null
  )
);

create table public.house_models (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  description text not null default '',
  bedrooms smallint check (bedrooms >= 0),
  bathrooms numeric(4, 1) check (bathrooms >= 0),
  parking_spaces smallint check (parking_spaces >= 0),
  construction_area_m2 numeric(10, 2) check (construction_area_m2 > 0),
  land_area_m2 numeric(10, 2) check (land_area_m2 > 0),
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.condominium_models (
  condominium_id uuid not null references public.condominiums(id) on delete restrict,
  model_id uuid not null references public.house_models(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (condominium_id, model_id)
);

create table public.house_units (
  id uuid primary key default gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete restrict,
  model_id uuid references public.house_models(id) on delete restrict,
  code text not null check (char_length(code) between 1 and 80),
  price_usd numeric(14, 2) not null check (price_usd >= 0),
  availability_status public.availability_status not null default 'available',
  publication_status public.publication_status not null default 'draft',
  description_override text,
  bedrooms_override smallint check (bedrooms_override >= 0),
  bathrooms_override numeric(4, 1) check (bathrooms_override >= 0),
  parking_spaces_override smallint check (parking_spaces_override >= 0),
  construction_area_m2_override numeric(10, 2) check (construction_area_m2_override > 0),
  land_area_m2_override numeric(10, 2) check (land_area_m2_override > 0),
  features_override jsonb check (
    features_override is null or jsonb_typeof(features_override) = 'array'
  ),
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (condominium_id, code),
  foreign key (condominium_id, model_id)
    references public.condominium_models(condominium_id, model_id)
    on delete restrict,
  constraint house_units_publication_date check (
    publication_status <> 'published' or published_at is not null
  )
);

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  email text not null,
  phone text,
  role public.app_role not null default 'advisor',
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index user_profiles_email_lower_idx
  on public.user_profiles (lower(email));

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_text text not null check (char_length(alt_text) between 2 and 240),
  mime_type text not null check (mime_type like 'image/%'),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 20971520),
  uploaded_by uuid not null references public.user_profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.condominium_media (
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  display_order integer not null default 0 check (display_order >= 0),
  is_cover boolean not null default false,
  primary key (condominium_id, media_id)
);

create table public.model_media (
  model_id uuid not null references public.house_models(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  display_order integer not null default 0 check (display_order >= 0),
  is_cover boolean not null default false,
  primary key (model_id, media_id)
);

create table public.unit_media (
  unit_id uuid not null references public.house_units(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  display_order integer not null default 0 check (display_order >= 0),
  is_cover boolean not null default false,
  primary key (unit_id, media_id)
);

create unique index condominium_single_cover_idx
  on public.condominium_media (condominium_id) where is_cover;
create unique index model_single_cover_idx
  on public.model_media (model_id) where is_cover;
create unique index unit_single_cover_idx
  on public.unit_media (unit_id) where is_cover;

create index condominiums_publication_idx
  on public.condominiums (publication_status, published_at)
  where archived_at is null;
create index house_units_catalog_idx
  on public.house_units (
    condominium_id,
    availability_status,
    publication_status,
    price_usd
  ) where archived_at is null;
create index house_units_model_idx on public.house_units (model_id);

create trigger condominiums_set_updated_at
before update on public.condominiums
for each row execute function public.set_updated_at();
create trigger house_models_set_updated_at
before update on public.house_models
for each row execute function public.set_updated_at();
create trigger house_units_set_updated_at
before update on public.house_units
for each row execute function public.set_updated_at();
create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (auth_user_id, name, email)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(coalesce(new.email, 'usuario'), '@', 1)
    ),
    coalesce(new.email, new.id::text || '@invalid.local')
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

create trigger auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_auth_user();

create function public.is_active_internal_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_profiles
    where auth_user_id = (select auth.uid())
      and active
  );
$$;

create function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.user_profiles
  where auth_user_id = (select auth.uid())
    and active
  limit 1;
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function public.create_profile_for_auth_user() from public;
revoke all on function public.is_active_internal_user() from public;
revoke all on function public.current_app_role() from public;
grant execute on function public.is_active_internal_user() to authenticated;
grant execute on function public.current_app_role() to authenticated;

alter table public.condominiums enable row level security;
alter table public.house_models enable row level security;
alter table public.condominium_models enable row level security;
alter table public.house_units enable row level security;
alter table public.user_profiles enable row level security;
alter table public.media_assets enable row level security;
alter table public.condominium_media enable row level security;
alter table public.model_media enable row level security;
alter table public.unit_media enable row level security;

create policy "public reads published condominiums"
on public.condominiums for select to anon, authenticated
using (
  (publication_status = 'published' and archived_at is null)
  or (select public.is_active_internal_user())
);

create policy "public reads models of published units"
on public.house_models for select to anon, authenticated
using (
  exists (
    select 1 from public.house_units
    where house_units.model_id = house_models.id
      and house_units.publication_status = 'published'
      and house_units.archived_at is null
  )
  or (select public.is_active_internal_user())
);

create policy "public reads active model relationships"
on public.condominium_models for select to anon, authenticated
using (
  exists (
    select 1 from public.condominiums
    where condominiums.id = condominium_models.condominium_id
      and condominiums.publication_status = 'published'
      and condominiums.archived_at is null
  )
  or (select public.is_active_internal_user())
);

create policy "public reads published units"
on public.house_units for select to anon, authenticated
using (
  (publication_status = 'published' and archived_at is null)
  or (select public.is_active_internal_user())
);

create policy "internal users read media metadata"
on public.media_assets for select to authenticated
using ((select public.is_active_internal_user()));
create policy "internal users read condominium media"
on public.condominium_media for select to authenticated
using ((select public.is_active_internal_user()));
create policy "internal users read model media"
on public.model_media for select to authenticated
using ((select public.is_active_internal_user()));
create policy "internal users read unit media"
on public.unit_media for select to authenticated
using ((select public.is_active_internal_user()));

create policy "users read own profile or administrators read all"
on public.user_profiles for select to authenticated
using (
  auth_user_id = (select auth.uid())
  or (select public.current_app_role()) = 'administrator'
);

create policy "administrators manage profiles"
on public.user_profiles for update to authenticated
using ((select public.current_app_role()) = 'administrator')
with check ((select public.current_app_role()) = 'administrator');

create policy "administrators and editors insert condominiums"
on public.condominiums for insert to authenticated
with check ((select public.current_app_role()) in ('administrator', 'editor'));
create policy "administrators and editors update condominiums"
on public.condominiums for update to authenticated
using ((select public.current_app_role()) in ('administrator', 'editor'))
with check ((select public.current_app_role()) in ('administrator', 'editor'));

create policy "administrators and editors insert models"
on public.house_models for insert to authenticated
with check ((select public.current_app_role()) in ('administrator', 'editor'));
create policy "administrators and editors update models"
on public.house_models for update to authenticated
using ((select public.current_app_role()) in ('administrator', 'editor'))
with check ((select public.current_app_role()) in ('administrator', 'editor'));

create policy "administrators and editors manage model relationships"
on public.condominium_models for all to authenticated
using ((select public.current_app_role()) in ('administrator', 'editor'))
with check ((select public.current_app_role()) in ('administrator', 'editor'));

create policy "administrators and editors insert units"
on public.house_units for insert to authenticated
with check ((select public.current_app_role()) in ('administrator', 'editor'));
create policy "administrators and editors update units"
on public.house_units for update to authenticated
using ((select public.current_app_role()) in ('administrator', 'editor'))
with check ((select public.current_app_role()) in ('administrator', 'editor'));

create policy "administrators and editors manage media"
on public.media_assets for all to authenticated
using ((select public.current_app_role()) in ('administrator', 'editor'))
with check ((select public.current_app_role()) in ('administrator', 'editor'));
create policy "administrators and editors manage condominium media"
on public.condominium_media for all to authenticated
using ((select public.current_app_role()) in ('administrator', 'editor'))
with check ((select public.current_app_role()) in ('administrator', 'editor'));
create policy "administrators and editors manage model media"
on public.model_media for all to authenticated
using ((select public.current_app_role()) in ('administrator', 'editor'))
with check ((select public.current_app_role()) in ('administrator', 'editor'));
create policy "administrators and editors manage unit media"
on public.unit_media for all to authenticated
using ((select public.current_app_role()) in ('administrator', 'editor'))
with check ((select public.current_app_role()) in ('administrator', 'editor'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-media',
  'property-media',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads property media"
on storage.objects for select to anon, authenticated
using (bucket_id = 'property-media');

create policy "catalog managers insert property media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'property-media'
  and (select public.current_app_role()) in ('administrator', 'editor')
);

create policy "catalog managers update property media"
on storage.objects for update to authenticated
using (
  bucket_id = 'property-media'
  and (select public.current_app_role()) in ('administrator', 'editor')
)
with check (
  bucket_id = 'property-media'
  and (select public.current_app_role()) in ('administrator', 'editor')
);

create policy "catalog managers delete property media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'property-media'
  and (select public.current_app_role()) in ('administrator', 'editor')
);

grant select on public.condominiums, public.house_models,
  public.condominium_models, public.house_units to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

commit;
