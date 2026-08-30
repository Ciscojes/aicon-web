# Aicon Web

Sitio público, panel administrativo y CRM de Aicon Edificadora. La base técnica
es Next.js 16, TypeScript y Supabase, organizada como un monolito modular.

El avance por entregas se registra en [docs/STATUS.md](docs/STATUS.md).

## Requisitos

- Node.js 22.23.1 (registrado en `.nvmrc` y `.node-version`).
- npm 10 o posterior.
- Docker, solo para ejecutar Supabase localmente.

Con `nvm`, prepara automáticamente la versión correcta:

```bash
nvm install
nvm use
```

## Primer arranque local

```bash
npm install
cp .env.example .env.local
npm run db:start
npm run db:reset
npm run dev
```

`npm run db:start` muestra la URL y la clave pública del Supabase local. Copia
ambas en `.env.local` como `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. La aplicación estará disponible en
<http://localhost:3000> y Supabase Studio normalmente en
<http://localhost:54323>.

Para detener los servicios locales:

```bash
npm run db:stop
```

## Recuperar el proyecto en otra computadora

El repositorio contiene código, migraciones, documentación y pruebas. No
contiene dependencias instaladas, compilaciones, credenciales ni datos locales
de Docker. En una computadora nueva:

```bash
git clone <URL-DEL-REPOSITORIO>
cd aicon-web
nvm install
nvm use
npm ci
cp .env.example .env.local
npm run check
npm run build
```

Después configura las variables de Supabase y, si necesitas la base local,
ejecuta `npm run db:start` y `npm run db:reset`. Los datos de producción deben
respaldarse desde Supabase; Git conserva el esquema mediante las migraciones,
pero nunca sustituye un respaldo de la base de datos.

## Primer administrador

El registro público está deshabilitado. Crea el usuario desde **Authentication →
Users** en Supabase Studio o en el panel del proyecto administrado. La migración
creará automáticamente un perfil inactivo con rol `advisor`.

Después, desde el editor SQL del mismo entorno, habilita expresamente esa cuenta:

```sql
update public.user_profiles
set role = 'administrator', active = true
where email = 'correo-del-administrador@example.com';
```

Ya podrá entrar en `/iniciar-sesion`. No guardes la contraseña ni claves privadas
en el repositorio.

## Verificaciones

```bash
npm run check       # ESLint, TypeScript y pruebas
npm run build       # compilación de producción
npm run db:test     # aplica migraciones dos veces en PostgreSQL WASM limpio
npm run db:lint     # revisión SQL con Supabase local activo
npm run db:reset    # reconstruye la base aplicando migraciones y seed
```

GitHub Actions ejecuta `check` y `build` en cada cambio enviado a `main` y en
cada pull request.

## Entornos

Desarrollo, pruebas y producción deben usar proyectos Supabase separados. Los
archivos `.env*` no se versionan, salvo `.env.example`, que contiene únicamente
nombres y valores ficticios. La migración inicial crea el catálogo, los perfiles
internos, el bucket `property-media`, índices, restricciones y políticas RLS.

Consulta [las convenciones de arquitectura](docs/ARCHITECTURE.md) y el
[plan aprobado](docs/specs/SPEC-015-plan-de-implementacion.md) antes de abrir una
nueva entrega.
