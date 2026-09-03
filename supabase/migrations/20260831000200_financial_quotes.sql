begin;

create function public.is_valid_financial_settings(candidate jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  annual_rate numeric;
  minimum_down_payment numeric;
begin
  if jsonb_typeof(candidate) <> 'object'
    or jsonb_typeof(candidate -> 'enabled') <> 'boolean'
    or jsonb_typeof(candidate -> 'annualRatePct') <> 'number'
    or jsonb_typeof(candidate -> 'minimumDownPaymentPct') <> 'number'
    or jsonb_typeof(candidate -> 'downPaymentOptionsPct') <> 'array'
    or jsonb_typeof(candidate -> 'termYears') <> 'array' then
    return false;
  end if;

  annual_rate := (candidate ->> 'annualRatePct')::numeric;
  minimum_down_payment := (candidate ->> 'minimumDownPaymentPct')::numeric;
  if annual_rate < 0 or annual_rate > 100
    or minimum_down_payment < 0 or minimum_down_payment > 100
    or jsonb_array_length(candidate -> 'downPaymentOptionsPct') not between 1 and 10
    or jsonb_array_length(candidate -> 'termYears') not between 1 and 10 then
    return false;
  end if;

  if exists (
    select 1 from jsonb_array_elements_text(candidate -> 'downPaymentOptionsPct') option
    where option::numeric < minimum_down_payment or option::numeric > 100
  ) or exists (
    select 1 from jsonb_array_elements_text(candidate -> 'termYears') term
    where term::numeric <> trunc(term::numeric) or term::numeric not between 1 and 50
  ) then
    return false;
  end if;

  return true;
exception when others then
  return false;
end;
$$;

revoke all on function public.is_valid_financial_settings(jsonb) from public;

create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('financing')),
  value jsonb not null,
  effective_from timestamptz not null default now(),
  updated_by uuid not null references public.user_profiles(id) on delete restrict,
  updated_at timestamptz not null default now(),
  constraint valid_app_setting_value check (
    category <> 'financing' or public.is_valid_financial_settings(value)
  )
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete restrict,
  unit_id uuid not null references public.house_units(id) on delete restrict,
  kind text not null check (kind in ('formal_request')),
  price_snapshot_usd numeric(14, 2) not null check (price_snapshot_usd >= 0),
  down_payment_usd numeric(14, 2) not null check (down_payment_usd >= 0),
  financed_amount_usd numeric(14, 2) not null check (financed_amount_usd >= 0),
  annual_rate numeric(7, 4) not null check (annual_rate >= 0),
  term_months integer not null check (term_months > 0),
  estimated_monthly_payment_usd numeric(14, 2) not null check (estimated_monthly_payment_usd >= 0),
  disclaimer_version text not null,
  created_at timestamptz not null default now()
);

create index app_settings_category_effective_idx on public.app_settings (category, effective_from desc);
create index quotes_opportunity_idx on public.quotes (opportunity_id, created_at desc);
create index quotes_unit_idx on public.quotes (unit_id, created_at desc);

alter table public.app_settings enable row level security;
alter table public.quotes enable row level security;

create policy "administrators read financial settings"
on public.app_settings for select to authenticated
using ((select public.current_app_role()) = 'administrator');

create policy "administrators create financial settings"
on public.app_settings for insert to authenticated
with check (
  (select public.current_app_role()) = 'administrator'
  and updated_by in (
    select id from public.user_profiles
    where auth_user_id = (select auth.uid()) and active
  )
);

create policy "administrators and advisors read quotes"
on public.quotes for select to authenticated
using ((select public.current_app_role()) in ('administrator', 'advisor'));

create function public.get_active_financial_settings()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case when coalesce((value ->> 'enabled')::boolean, false) then value else null end
  from public.app_settings
  where category = 'financing' and effective_from <= now()
  order by effective_from desc, updated_at desc
  limit 1;
$$;

revoke all on function public.get_active_financial_settings() from public;
grant execute on function public.get_active_financial_settings() to anon, authenticated;

create function public.submit_quote_request(
  p_name text,
  p_phone text,
  p_email text,
  p_unit_id uuid,
  p_down_payment_pct numeric,
  p_term_years integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_settings jsonb;
  v_price numeric(14, 2);
  v_rate_pct numeric;
  v_monthly_rate numeric;
  v_term_months integer;
  v_down_payment numeric(14, 2);
  v_financed numeric(14, 2);
  v_payment numeric(14, 2);
  v_contact_id uuid;
  v_opportunity_id uuid;
  v_quote_id uuid;
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_name text := trim(coalesce(p_name, ''));
  v_phone text := trim(coalesce(p_phone, ''));
begin
  if char_length(v_name) not between 2 and 160
    or v_phone !~ '^\+[1-9][0-9]{7,14}$'
    or (v_email is not null and (char_length(v_email) > 320 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')) then
    raise exception 'invalid_quote_contact' using errcode = '22023';
  end if;

  select value into v_settings
  from public.app_settings
  where category = 'financing' and effective_from <= now()
  order by effective_from desc, updated_at desc
  limit 1;

  if v_settings is null or not coalesce((v_settings ->> 'enabled')::boolean, false) then
    raise exception 'financing_not_configured' using errcode = '22023';
  end if;

  if p_down_payment_pct < (v_settings ->> 'minimumDownPaymentPct')::numeric
    or not exists (
      select 1 from jsonb_array_elements_text(v_settings -> 'downPaymentOptionsPct') option
      where option::numeric = p_down_payment_pct
    ) or not exists (
      select 1 from jsonb_array_elements_text(v_settings -> 'termYears') term
      where term::integer = p_term_years
    ) then
    raise exception 'invalid_financing_option' using errcode = '22023';
  end if;

  select u.price_usd into v_price
  from public.house_units u
  join public.condominiums c on c.id = u.condominium_id
  where u.id = p_unit_id
    and u.publication_status = 'published' and u.archived_at is null
    and u.availability_status = 'available'
    and c.publication_status = 'published' and c.archived_at is null;
  if v_price is null then
    raise exception 'unit_not_available_for_quote' using errcode = '22023';
  end if;

  v_rate_pct := (v_settings ->> 'annualRatePct')::numeric;
  v_term_months := p_term_years * 12;
  v_down_payment := round(v_price * p_down_payment_pct / 100, 2);
  v_financed := v_price - v_down_payment;
  v_monthly_rate := v_rate_pct / 1200;
  v_payment := case
    when v_monthly_rate = 0 then round(v_financed / v_term_months, 2)
    else round(
      v_financed * v_monthly_rate * power(1 + v_monthly_rate, v_term_months)
      / (power(1 + v_monthly_rate, v_term_months) - 1),
      2
    )
  end;

  select id into v_contact_id from public.contacts where normalized_phone = v_phone;
  if v_contact_id is not null then
    select id into v_opportunity_id
    from public.opportunities
    where contact_id = v_contact_id and unit_id = p_unit_id and status = 'open'
    order by created_at desc limit 1;

    if v_opportunity_id is not null and exists (
      select 1 from public.activities
      where opportunity_id = v_opportunity_id and type = 'quote'
        and created_at >= now() - interval '5 minutes'
    ) then
      raise exception 'quote_rate_limited' using errcode = 'P0001';
    end if;

    update public.contacts
    set name = v_name, phone = v_phone, email = coalesce(v_email, email),
        email_consent = email_consent or v_email is not null,
        whatsapp_consent = true
    where id = v_contact_id;
  else
    insert into public.contacts (
      name, phone, normalized_phone, email, source, email_consent, whatsapp_consent
    ) values (
      v_name, v_phone, v_phone, v_email, 'quote_request', v_email is not null, true
    ) returning id into v_contact_id;
  end if;

  if v_opportunity_id is null then
    insert into public.opportunities (
      contact_id, unit_id, interest_kind, stage, status, source
    ) values (
      v_contact_id, p_unit_id, 'unit', 'new', 'open', 'quote_request'
    ) returning id into v_opportunity_id;
  end if;

  insert into public.quotes (
    opportunity_id, unit_id, kind, price_snapshot_usd, down_payment_usd,
    financed_amount_usd, annual_rate, term_months,
    estimated_monthly_payment_usd, disclaimer_version
  ) values (
    v_opportunity_id, p_unit_id, 'formal_request', v_price, v_down_payment,
    v_financed, v_rate_pct, v_term_months, v_payment, '2026-08-31-v1'
  ) returning id into v_quote_id;

  insert into public.activities (opportunity_id, type, content)
  values (v_opportunity_id, 'quote', 'Solicitud formal de cotización recibida.');

  return v_quote_id;
end;
$$;

revoke all on function public.submit_quote_request(text, text, text, uuid, numeric, integer) from public;
grant execute on function public.submit_quote_request(text, text, text, uuid, numeric, integer) to anon, authenticated;

grant select, insert on public.app_settings to authenticated;
grant select on public.quotes to authenticated;

commit;
