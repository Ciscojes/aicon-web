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

    if (tableCount !== 9 || rlsCount !== 9 || policyCount < 20) {
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
