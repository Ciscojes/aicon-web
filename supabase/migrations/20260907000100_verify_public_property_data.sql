begin;

alter table public.house_units
  add column verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified')),
  add column verification_note text
    check (verification_note is null or char_length(verification_note) between 5 and 1000),
  add column verified_at timestamptz,
  add column verified_by uuid references public.user_profiles(id) on delete restrict,
  add constraint house_units_verification_integrity check (
    (verification_status = 'pending' and verified_at is null and verified_by is null)
    or
    (verification_status = 'verified' and verified_at is not null and verified_by is not null and verification_note is not null)
  );

create index house_units_public_verification_idx
  on public.house_units (publication_status, verification_status)
  where archived_at is null;

comment on column public.house_units.verification_note is
  'Referencia interna de la fuente usada para verificar precio, distribución y áreas; nunca se publica.';

create function public.require_verified_quote_unit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.house_units
    where id = new.unit_id and verification_status = 'verified'
  ) then
    raise exception 'unit_data_not_verified_for_quote' using errcode = '22023';
  end if;
  return new;
end;
$$;

revoke all on function public.require_verified_quote_unit() from public;

create trigger quotes_require_verified_unit
before insert on public.quotes
for each row execute function public.require_verified_quote_unit();

commit;
