import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export const MAX_REPAIR_ATTEMPTS = 3;
export const TASK_ID_PATTERN = /^[A-Z][A-Z0-9]{1,9}-\d{3,6}$/u;

export function parseArguments(argv) {
  const options = { attempt: undefined, includeDbLint: false, taskId: undefined };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") return { ...options, help: true };
    if (argument === "--db-lint") {
      options.includeDbLint = true;
      continue;
    }
    if (argument === "--task") {
      options.taskId = argv[index + 1];
      index += 1;
      continue;
    }
    if (argument === "--attempt") {
      options.attempt = Number(argv[index + 1]);
      index += 1;
      continue;
    }
    throw new Error(`Argumento no reconocido: ${argument}`);
  }

  return options;
}

export function findTaskPlan(root, taskId) {
  const plansDirectory = join(root, ".agent", "plans");
  if (!existsSync(plansDirectory)) return null;

  const prefix = `${taskId}-`;
  const filename = readdirSync(plansDirectory)
    .filter((candidate) => candidate.startsWith(prefix) && candidate.endsWith(".md"))
    .sort()[0];

  return filename ? join(plansDirectory, filename) : null;
}

export function reportPath(root, taskId, attempt) {
  return join(root, ".agent", "runs", taskId, `verification-attempt-${attempt}.json`);
}

function gitDirectories(root) {
  const dotGit = join(root, ".git");
  let worktreeDirectory = dotGit;

  if (!statSync(dotGit).isDirectory()) {
    const pointer = readFileSync(dotGit, "utf8").trim().match(/^gitdir:\s*(.+)$/u);
    if (!pointer) throw new Error("No se pudo resolver el directorio Git del worktree.");
    worktreeDirectory = resolve(root, pointer[1]);
  }

  const commonPointer = join(worktreeDirectory, "commondir");
  const commonDirectory = existsSync(commonPointer)
    ? resolve(worktreeDirectory, readFileSync(commonPointer, "utf8").trim())
    : worktreeDirectory;

  return { commonDirectory, worktreeDirectory };
}

function readReference(commonDirectory, reference) {
  const looseReference = join(commonDirectory, ...reference.split("/"));
  if (existsSync(looseReference)) return readFileSync(looseReference, "utf8").trim();

  const packedReferences = join(commonDirectory, "packed-refs");
  if (!existsSync(packedReferences)) return null;
  const match = readFileSync(packedReferences, "utf8")
    .split(/\r?\n/u)
    .find((line) => line.endsWith(` ${reference}`));
  return match?.split(" ")[0] ?? null;
}

export function readGitState(root) {
  const { commonDirectory, worktreeDirectory } = gitDirectories(root);
  const headValue = readFileSync(join(worktreeDirectory, "HEAD"), "utf8").trim();

  if (/^[0-9a-f]{40}$/u.test(headValue)) return { branch: "HEAD", head: headValue };
  if (!headValue.startsWith("ref: ")) throw new Error("El archivo HEAD de Git no es válido.");

  const reference = headValue.slice(5);
  const head = readReference(commonDirectory, reference);
  if (!head || !/^[0-9a-f]{40}$/u.test(head)) {
    throw new Error(`No se pudo resolver la referencia Git ${reference}.`);
  }

  return {
    branch: reference.startsWith("refs/heads/") ? reference.slice("refs/heads/".length) : reference,
    head,
  };
}

export function validateExecutionContext({ attempt, branch, root, taskId }) {
  if (!TASK_ID_PATTERN.test(taskId ?? "")) {
    throw new Error("--task debe usar un identificador como AEH-002.");
  }
  if (!Number.isInteger(attempt) || attempt < 1 || attempt > MAX_REPAIR_ATTEMPTS) {
    throw new Error(`--attempt debe ser un entero entre 1 y ${MAX_REPAIR_ATTEMPTS}.`);
  }
  if (!branch || branch === "HEAD") {
    throw new Error("El harness no se ejecuta sobre un HEAD separado.");
  }
  if (branch === "main") {
    throw new Error("El harness no se ejecuta directamente sobre main; crea una rama de tarea.");
  }

  const plan = findTaskPlan(root, taskId);
  if (!plan) throw new Error(`No existe un plan para ${taskId} en .agent/plans/.`);

  const destination = reportPath(root, taskId, attempt);
  if (existsSync(destination)) {
    throw new Error(`El intento ${attempt} ya tiene evidencia y no puede sobrescribirse.`);
  }

  return { destination, plan };
}

export function verificationGates({ includeDbLint = false, npmCommand }) {
  const gates = [
    {
      args: ["run", "verify"],
      command: npmCommand,
      displayCommand: "npm run verify",
      name: "quality",
    },
  ];

  if (includeDbLint) {
    gates.splice(1, 0, {
      args: ["run", "db:lint"],
      command: npmCommand,
      displayCommand: "npm run db:lint",
      name: "database-lint",
    });
  }

  return gates;
}

export function runGates(gates, execute, now = () => Date.now()) {
  const results = [];

  for (const gate of gates) {
    const startedAt = now();
    const execution = execute(gate);
    const finishedAt = now();
    const exitCode = Number.isInteger(execution.status) ? execution.status : 1;

    results.push({
      command: gate.displayCommand,
      durationMs: Math.max(0, finishedAt - startedAt),
      exitCode,
      name: gate.name,
      status: exitCode === 0 ? "passed" : "failed",
    });

    if (exitCode !== 0) break;
  }

  return results;
}

export function createReport({ attempt, branch, finishedAt, gates, head, startedAt, taskId }) {
  const safeGates = gates.map((gate) => ({
    command: gate.command,
    durationMs: gate.durationMs,
    exitCode: gate.exitCode,
    name: gate.name,
    status: gate.status,
  }));
  const passed = safeGates.length > 0 && safeGates.every((gate) => gate.status === "passed");

  let nextAction = "Prepare the sanitized task trace and human review.";
  if (!passed && attempt >= MAX_REPAIR_ATTEMPTS) {
    nextAction = "Stop. Produce a failure report and request human review.";
  } else if (!passed) {
    nextAction = `Analyze the root cause, apply one minimal repair and run attempt ${attempt + 1}.`;
  }

  return {
    schemaVersion: 1,
    taskId,
    attempt,
    status: passed ? "passed" : "failed",
    startedAt,
    finishedAt,
    repository: { branch, head },
    gates: safeGates,
    nextAction,
  };
}

export function writeReport(path, report) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
}
