begin;

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  phone text not null,
  normalized_phone text not null unique check (normalized_phone ~ '^\+[1-9][0-9]{7,14}$'),
  email text check (email is null or char_length(email) <= 320),
  source text not null default 'contact_form' check (source in ('contact_form', 'quote_request', 'manual')),
  email_consent boolean not null default false,
  whatsapp_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete restrict,
  unit_id uuid references public.house_units(id) on delete restrict,
  condominium_id uuid references public.condominiums(id) on delete restrict,
  advisor_id uuid references public.user_profiles(id) on delete restrict,
  interest_kind text not null check (interest_kind in ('general', 'unit', 'condominium')),
  stage text not null default 'new' check (stage in ('new', 'contacted', 'visit_scheduled', 'quote', 'negotiation', 'sold', 'discarded')),
  status text not null default 'open' check (status in ('open', 'closed')),
  source text not null default 'contact_form' check (source in ('contact_form', 'quote_request', 'manual')),
  next_action_at timestamptz,
  closed_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint opportunities_interest_target check (
    (interest_kind = 'general' and unit_id is null and condominium_id is null)
    or (interest_kind = 'unit' and unit_id is not null and condominium_id is null)
    or (interest_kind = 'condominium' and unit_id is null and condominium_id is not null)
  )
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete restrict,
  actor_user_id uuid references public.user_profiles(id) on delete restrict,
  type text not null check (type in ('inquiry', 'note', 'call', 'email', 'whatsapp', 'stage_change', 'quote', 'visit')),
  content text not null check (char_length(content) between 1 and 5000),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index contacts_email_lower_idx on public.contacts (lower(email)) where email is not null and archived_at is null;
create index opportunities_stage_idx on public.opportunities (stage, created_at desc) where status = 'open';
create index opportunities_contact_idx on public.opportunities (contact_id, created_at desc);
create index opportunities_unit_idx on public.opportunities (unit_id) where unit_id is not null;
create index opportunities_condominium_idx on public.opportunities (condominium_id) where condominium_id is not null;
create index activities_opportunity_idx on public.activities (opportunity_id, occurred_at desc);

create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create trigger opportunities_set_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

alter table public.contacts enable row level security;
alter table public.opportunities enable row level security;
alter table public.activities enable row level security;

create policy "administrators and advisors read contacts"
on public.contacts for select to authenticated
using ((select public.current_app_role()) in ('administrator', 'advisor'));

create policy "administrators and advisors read opportunities"
on public.opportunities for select to authenticated
using ((select public.current_app_role()) in ('administrator', 'advisor'));

create policy "administrators and advisors read activities"
on public.activities for select to authenticated
using ((select public.current_app_role()) in ('administrator', 'advisor'));

create function public.submit_public_inquiry(
  p_name text,
  p_phone text,
  p_email text,
  p_message text,
  p_interest_kind text,
  p_unit_id uuid,
  p_condominium_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contact_id uuid;
  v_opportunity_id uuid;
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_message text := nullif(trim(coalesce(p_message, '')), '');
  v_name text := trim(coalesce(p_name, ''));
  v_phone text := trim(coalesce(p_phone, ''));
begin
  if char_length(v_name) not between 2 and 160
    or v_phone !~ '^\+[1-9][0-9]{7,14}$'
    or (v_email is not null and (char_length(v_email) > 320 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'))
    or char_length(coalesce(v_message, '')) > 5000 then
    raise exception 'invalid_inquiry' using errcode = '22023';
  end if;

  if p_interest_kind = 'unit' then
    if p_unit_id is null or p_condominium_id is not null or not exists (
      select 1 from public.house_units u
      join public.condominiums c on c.id = u.condominium_id
      where u.id = p_unit_id
        and u.publication_status = 'published' and u.archived_at is null
        and c.publication_status = 'published' and c.archived_at is null
    ) then
      raise exception 'invalid_inquiry_target' using errcode = '22023';
    end if;
  elsif p_interest_kind = 'condominium' then
    if p_unit_id is not null or p_condominium_id is null or not exists (
      select 1 from public.condominiums c
      where c.id = p_condominium_id
        and c.publication_status = 'published' and c.archived_at is null
    ) then
      raise exception 'invalid_inquiry_target' using errcode = '22023';
    end if;
  elsif p_interest_kind = 'general' then
    if p_unit_id is not null or p_condominium_id is not null then
      raise exception 'invalid_inquiry_target' using errcode = '22023';
    end if;
  else
    raise exception 'invalid_inquiry_target' using errcode = '22023';
  end if;

  select id into v_contact_id
  from public.contacts
  where normalized_phone = v_phone;

  if v_contact_id is not null then
    select id into v_opportunity_id
    from public.opportunities
    where contact_id = v_contact_id
      and status = 'open'
      and interest_kind = p_interest_kind
      and unit_id is not distinct from p_unit_id
      and condominium_id is not distinct from p_condominium_id
    order by created_at desc
    limit 1;

    if v_opportunity_id is not null and exists (
      select 1 from public.activities
      where opportunity_id = v_opportunity_id
        and type = 'inquiry'
        and created_at >= now() - interval '5 minutes'
    ) then
      raise exception 'inquiry_rate_limited' using errcode = 'P0001';
    end if;

    update public.contacts
    set name = v_name,
        phone = v_phone,
        email = coalesce(v_email, email),
        email_consent = email_consent or v_email is not null,
        whatsapp_consent = true
    where id = v_contact_id;
  else
    insert into public.contacts (
      name, phone, normalized_phone, email, source, email_consent, whatsapp_consent
    ) values (
      v_name, v_phone, v_phone, v_email, 'contact_form', v_email is not null, true
    ) returning id into v_contact_id;
  end if;

  if v_opportunity_id is null then
    insert into public.opportunities (
      contact_id, unit_id, condominium_id, interest_kind, stage, status, source
    ) values (
      v_contact_id, p_unit_id, p_condominium_id, p_interest_kind, 'new', 'open', 'contact_form'
    ) returning id into v_opportunity_id;
  end if;

  insert into public.activities (opportunity_id, type, content)
  values (v_opportunity_id, 'inquiry', coalesce(v_message, 'Formulario público recibido.'));

  return v_opportunity_id;
end;
$$;

revoke all on function public.submit_public_inquiry(text, text, text, text, text, uuid, uuid) from public;
grant execute on function public.submit_public_inquiry(text, text, text, text, text, uuid, uuid) to anon, authenticated;

grant select on public.contacts, public.opportunities, public.activities to authenticated;

commit;
