import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

import {
  createReport,
  parseArguments,
  readGitState,
  runGates,
  validateExecutionContext,
  verificationGates,
  writeReport,
} from "./lib/agentic-harness.mjs";

const root = resolve(import.meta.dirname, "..");

function usage() {
  console.log(`Usage:
  npm run agent:verify -- --task AEH-002 --attempt 1 [--db-lint]

Options:
  --task       Approved task identifier with a matching plan.
  --attempt    Verification attempt from 1 through 3.
  --db-lint    Include Supabase database lint for SQL-related work.
  --help       Show this help.`);
}

let options;
try {
  options = parseArguments(process.argv.slice(2));
  if (options.help) {
    usage();
    process.exit(0);
  }

  const { branch, head } = readGitState(root);
  const { destination, plan } = validateExecutionContext({
    attempt: options.attempt,
    branch,
    root,
    taskId: options.taskId,
  });
  const npmCommand = process.env.npm_execpath;
  if (!npmCommand) throw new Error("No se encontró npm_execpath; ejecuta el harness mediante npm run.");

  console.log(`[agentic] task=${options.taskId} attempt=${options.attempt}`);
  console.log(`[agentic] plan=${plan.slice(root.length + 1)}`);
  console.log("[agentic] Los comandos muestran su salida en terminal; la evidencia guarda solo metadatos.");

  const startedAt = new Date().toISOString();
  const gates = verificationGates({
    includeDbLint: options.includeDbLint,
    npmCommand: process.execPath,
  }).map((gate) => ({ ...gate, args: [npmCommand, ...gate.args] }));
  const results = runGates(gates, (gate) => {
    console.log(`\n[agentic] Ejecutando: ${gate.displayCommand}`);
    return spawnSync(gate.command, gate.args, {
      cwd: root,
      env: process.env,
      shell: false,
      stdio: "inherit",
    });
  });
  const report = createReport({
    attempt: options.attempt,
    branch,
    finishedAt: new Date().toISOString(),
    gates: results,
    head,
    startedAt,
    taskId: options.taskId,
  });

  writeReport(destination, report);
  console.log(`\n[agentic] Evidencia: ${destination.slice(root.length + 1)}`);
  console.log(`[agentic] Resultado: ${report.status}`);
  console.log(`[agentic] Siguiente acción: ${report.nextAction}`);
  if (report.status !== "passed") process.exitCode = 1;
} catch (error) {
  console.error(`[agentic] ${error instanceof Error ? error.message : String(error)}`);
  usage();
  process.exitCode = 1;
}
