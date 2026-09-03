import { existsSync, readFileSync } from "node:fs";
import { release } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const wsl = Boolean(process.env.WSL_DISTRO_NAME) || release().toLowerCase().includes("microsoft");
const npmCli = process.env.npm_execpath;
const supabaseCli = resolve(root, "node_modules", "supabase", "dist", "supabase.js");
const requiredEnvironment = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];

function execute(command, args) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: false,
  });
}

function report(level, label, detail) {
  console.log(`[${level}] ${label}: ${detail}`);
}

function environmentNames() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) return new Map();

  return new Map(
    readFileSync(path, "utf8")
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
}

let failed = false;
const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor === 22) report("ok", "Node.js", process.versions.node);
else {
  failed = true;
  report("error", "Node.js", `se requiere la versión 22; actual: ${process.versions.node}`);
}

const npm = npmCli ? execute(process.execPath, [npmCli, "--version"]) : { status: 1 };
const npmVersion = npm.status === 0 ? npm.stdout.trim() : "no disponible";
if (npm.status === 0 && Number(npmVersion.split(".")[0]) >= 10) report("ok", "npm", npmVersion);
else {
  failed = true;
  report("error", "npm", "se requiere npm 10 o posterior");
}

if (existsSync(supabaseCli)) report("ok", "Supabase CLI", "instalado en el proyecto");
else {
  failed = true;
  report("error", "Supabase CLI", "ejecuta npm install para instalar las dependencias");
}

const environment = environmentNames();
const missingEnvironment = requiredEnvironment.filter((name) => {
  const value = environment.get(name);
  return !value || value.includes("your-");
});
if (missingEnvironment.length === 0) report("ok", ".env.local", "variables públicas configuradas");
else {
  failed = true;
  report("error", ".env.local", `faltan variables: ${missingEnvironment.join(", ")}`);
}

const docker = execute("docker", ["info", "--format", "{{.ServerVersion}}"]);
if (docker.status === 0) report("ok", "Docker", `motor ${docker.stdout.trim()} accesible`);
else {
  failed = true;
  const guidance = wsl
    ? "Docker no está disponible en WSL; inicia Docker Desktop y habilita Settings > Resources > WSL Integration"
    : "inicia Docker Desktop o el servicio de Docker";
  report("error", "Docker", guidance);
}

if (docker.status === 0 && existsSync(supabaseCli)) {
  const supabase = execute(process.execPath, [supabaseCli, "status"]);
  if (supabase.status === 0) report("ok", "Supabase local", "servicios activos");
  else report("warn", "Supabase local", "servicios detenidos; dev:full los iniciará");
}

if (failed) {
  console.error("\nEl entorno todavía no está listo. Corrige los elementos marcados como error.");
  process.exitCode = 1;
} else {
  console.log("\nEl entorno está listo para desarrollar Aicon.");
}
