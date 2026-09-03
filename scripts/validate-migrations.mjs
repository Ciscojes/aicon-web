import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { PGlite } from "@electric-sql/pglite";

const migrationsDirectory = new URL("../supabase/migrations/", import.meta.url);

const bootstrapSql = `
  create role anon;
  create role authenticated;

  create schema auth;
  create function auth.uid()
  returns uuid
  language sql
  stable
  as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  $$;
  create table auth.users (
    id uuid primary key,
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb
  );

  create schema storage;
  create table storage.buckets (
    id text primary key,
    name text not null,
    public boolean not null default false,
    file_size_limit bigint,
    allowed_mime_types text[]
  );
  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text not null references storage.buckets(id)
  );
`;

async function loadMigrations() {
  const filenames = (await readdir(migrationsDirectory))
    .filter((filename) => filename.endsWith(".sql"))
    .sort();

  return Promise.all(
    filenames.map(async (filename) => ({
      filename,
      sql: await readFile(join(migrationsDirectory.pathname, filename), "utf8"),
    })),
  );
}

async function validateFreshDatabase(migrations) {
  const database = new PGlite();

  try {
    await database.exec(bootstrapSql);

    for (const migration of migrations) {
      try {
        await database.exec(migration.sql);
      } catch (error) {
        throw new Error(`Falló ${migration.filename}`, { cause: error });
      }
    }

    const [{ table_count: tableCount }] = (await database.query(`
      select count(*)::integer as table_count
      from information_schema.tables
      where table_schema = 'public'
        and table_type = 'BASE TABLE'
    `)).rows;
    const [{ rls_count: rlsCount }] = (await database.query(`
      select count(*)::integer as rls_count
      from pg_class
      join pg_namespace on pg_namespace.oid = pg_class.relnamespace
      where pg_namespace.nspname = 'public'
        and pg_class.relkind = 'r'
        and pg_class.relrowsecurity
    `)).rows;
    const [{ policy_count: policyCount }] = (await database.query(`
      select count(*)::integer as policy_count
      from pg_policies
      where schemaname in ('public', 'storage')
    `)).rows;

    if (tableCount !== 14 || rlsCount !== 14 || policyCount < 31) {
      throw new Error(
        `Esquema incompleto: ${tableCount} tablas, ${rlsCount} con RLS, ${policyCount} políticas.`,
      );
    }

    const authUserId = "11111111-1111-4111-8111-111111111111";
    await database.query(
      `insert into auth.users (id, email, raw_user_meta_data)
       values ($1, $2, $3::jsonb)`,
      [authUserId, "admin@example.com", JSON.stringify({ name: "Administración" })],
    );
    const [profile] = (await database.query(
      `select role::text, active, name
       from public.user_profiles
       where auth_user_id = $1`,
      [authUserId],
    )).rows;

    if (
      profile?.role !== "advisor" ||
      profile?.active !== false ||
      profile?.name !== "Administración"
    ) {
      throw new Error("El trigger de perfiles no produjo un perfil seguro e inactivo.");
    }

    const [bucket] = (await database.query(
      `select public, file_size_limit
       from storage.buckets
       where id = 'property-media'`,
    )).rows;
    if (!bucket?.public || Number(bucket.file_size_limit) !== 20_971_520) {
      throw new Error("El bucket property-media no quedó configurado.");
    }

    const condominiumId = "22222222-2222-4222-8222-222222222222";
    const modelId = "33333333-3333-4333-8333-333333333333";
    await database.query(
      `insert into public.condominiums (id, slug, name)
       values ($1, 'condominio-prueba', 'Condominio Prueba')`,
      [condominiumId],
    );
    await database.query(
      `insert into public.house_models (id, name)
       values ($1, 'Modelo Prueba')`,
      [modelId],
    );
    await database.query(
      `select public.sync_condominium_model_assignments($1, array[$2]::uuid[])`,
      [modelId, condominiumId],
    );

    const [activeAssignment] = (await database.query(
      `select active
       from public.condominium_models
       where model_id = $1 and condominium_id = $2`,
      [modelId, condominiumId],
    )).rows;
    if (!activeAssignment?.active) {
      throw new Error("La asignación transaccional de modelos no quedó activa.");
    }

    let draftCondominiumRejected = false;
    try {
      await database.query(
        `insert into public.house_units
          (condominium_id, model_id, code, price_usd, publication_status, published_at)
         values ($1, $2, 'A-01', 185000, 'published', now())`,
        [condominiumId, modelId],
      );
    } catch {
      draftCondominiumRejected = true;
    }
    if (!draftCondominiumRejected) {
      throw new Error("Una unidad publicada fue aceptada dentro de un condominio borrador.");
    }

    await database.query(
      `update public.condominiums
       set publication_status = 'published', published_at = now()
       where id = $1`,
      [condominiumId],
    );
    await database.query(
      `insert into public.house_units
        (condominium_id, model_id, code, price_usd, publication_status, published_at)
       values ($1, $2, 'A-01', 185000, 'published', now())`,
      [condominiumId, modelId],
    );

    await database.query(`select public.archive_house_model($1)`, [modelId]);
    const [archivedModel] = (await database.query(
      `select house_models.archived_at, condominium_models.active
       from public.house_models
       join public.condominium_models
         on condominium_models.model_id = house_models.id
       where house_models.id = $1`,
      [modelId],
    )).rows;
    if (!archivedModel?.archived_at || archivedModel.active) {
      throw new Error("Archivar un modelo no desactivó correctamente sus asignaciones.");
    }

    await database.query(
      `update public.house_units
       set availability_status = 'reserved', model_id = $2
       where condominium_id = $1 and code = 'A-01'`,
      [condominiumId, modelId],
    );

    const [unit] = (await database.query(
      `select id from public.house_units where condominium_id = $1 and code = 'A-01'`,
      [condominiumId],
    )).rows;
    await database.query(
      `select public.submit_public_inquiry(
        'Persona Prueba', '+50688887777', 'persona@example.com',
        'Deseo más información.', 'unit', $1, null
      )`,
      [unit.id],
    );
    const [inquiry] = (await database.query(`
      select
        (select count(*)::integer from public.contacts) as contacts,
        (select count(*)::integer from public.opportunities where unit_id = $1) as opportunities,
        (select count(*)::integer from public.activities where type = 'inquiry') as activities
    `, [unit.id])).rows;
    if (inquiry.contacts !== 1 || inquiry.opportunities !== 1 || inquiry.activities !== 1) {
      throw new Error("La consulta pública no creó el contacto, oportunidad y actividad esperados.");
    }

    let repeatedInquiryRejected = false;
    try {
      await database.query(
        `select public.submit_public_inquiry(
          'Persona Prueba', '+50688887777', null, null, 'unit', $1, null
        )`,
        [unit.id],
      );
    } catch {
      repeatedInquiryRejected = true;
    }
    if (!repeatedInquiryRejected) {
      throw new Error("El límite de consultas repetidas no rechazó un envío inmediato.");
    }

    await database.query(
      `update public.user_profiles set active = true, role = 'administrator' where auth_user_id = $1`,
      [authUserId],
    );
    const [administrator] = (await database.query(
      `select id from public.user_profiles where auth_user_id = $1`,
      [authUserId],
    )).rows;
    await database.query(
      `select set_config('request.jwt.claim.sub', $1, false)`,
      [authUserId],
    );
    const [opportunity] = (await database.query(
      `select id from public.opportunities where unit_id = $1`,
      [unit.id],
    )).rows;
    await database.query(
      `select public.add_opportunity_note($1, 'Seguimiento inicial de prueba.')`,
      [opportunity.id],
    );
    await database.query(
      `select public.change_opportunity_stage($1, 'contacted')`,
      [opportunity.id],
    );
    const [managedOpportunity] = (await database.query(
      `select
        opportunities.stage,
        opportunities.status,
        count(activities.id) filter (
          where activities.type in ('note', 'stage_change')
        )::integer as management_activities
       from public.opportunities
       left join public.activities
         on activities.opportunity_id = opportunities.id
       where opportunities.id = $1
       group by opportunities.id`,
      [opportunity.id],
    )).rows;
    if (managedOpportunity.stage !== "contacted"
      || managedOpportunity.status !== "open"
      || managedOpportunity.management_activities !== 2) {
      throw new Error("La gestión de oportunidades no conservó la nota y el cambio de etapa.");
    }

    await database.query(
      `insert into public.app_settings (category, value, updated_by)
       values ('financing', $1::jsonb, $2)`,
      [JSON.stringify({
        annualRatePct: 8,
        downPaymentOptionsPct: [10, 20],
        enabled: true,
        minimumDownPaymentPct: 10,
        termYears: [10, 20],
      }), administrator.id],
    );
    const [activeSettings] = (await database.query(
      `select public.get_active_financial_settings() as value`,
    )).rows;
    if (activeSettings.value?.annualRatePct !== 8 || activeSettings.value?.enabled !== true) {
      throw new Error("La configuración financiera activa no pudo recuperarse.");
    }

    await database.query(
      `update public.house_units set availability_status = 'available' where id = $1`,
      [unit.id],
    );

    await database.query(
      `select public.submit_quote_request(
        'Cotizante Prueba', '+50687776666', 'cotizante@example.com', $1, 10, 20
      )`,
      [unit.id],
    );
    const [quote] = (await database.query(
      `select price_snapshot_usd, down_payment_usd, financed_amount_usd,
        annual_rate, term_months, estimated_monthly_payment_usd
       from public.quotes where unit_id = $1`,
      [unit.id],
    )).rows;
    if (Number(quote.price_snapshot_usd) !== 185000
      || Number(quote.down_payment_usd) !== 18500
      || Number(quote.financed_amount_usd) !== 166500
      || Number(quote.annual_rate) !== 8
      || quote.term_months !== 240
      || Number(quote.estimated_monthly_payment_usd) <= 0) {
      throw new Error("La cotización no conservó fotografías financieras válidas.");
    }

    let repeatedQuoteRejected = false;
    try {
      await database.query(
        `select public.submit_quote_request(
          'Cotizante Prueba', '+50687776666', null, $1, 10, 20
        )`,
        [unit.id],
      );
    } catch {
      repeatedQuoteRejected = true;
    }
    if (!repeatedQuoteRejected) {
      throw new Error("El límite de cotizaciones repetidas no rechazó un envío inmediato.");
    }

    return { policyCount, rlsCount, tableCount };
  } finally {
    await database.close();
  }
}

const migrations = await loadMigrations();
if (migrations.length === 0) throw new Error("No se encontraron migraciones SQL.");

const firstReset = await validateFreshDatabase(migrations);
await validateFreshDatabase(migrations);

console.log(
  `Migraciones válidas en dos bases limpias: ${firstReset.tableCount} tablas, ` +
    `${firstReset.rlsCount} con RLS y ${firstReset.policyCount} políticas.`,
);
