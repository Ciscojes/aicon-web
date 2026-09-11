import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

import { relativeArtifactFindings, validateAgentArtifacts } from "./lib/agent-artifacts.mjs";
import { readGitState } from "./lib/agentic-harness.mjs";
import {
  createSecurityReport,
  scanRepositorySecrets,
  validateEnvironmentContract,
  writeSecurityReport,
} from "./lib/security-harness.mjs";

const root = resolve(import.meta.dirname, "..");
const reportIndex = process.argv.indexOf("--report");
const reportPath = reportIndex >= 0 ? process.argv[reportIndex + 1] : null;
if (process.argv.some((argument, index) => argument.startsWith("--") && index !== reportIndex)) {
  console.error("Usage: npm run security -- [--report <path>]");
  process.exit(1);
}
if (reportIndex >= 0 && (!reportPath || reportPath.startsWith("--"))) {
  console.error("--report requiere una ruta.");
  process.exit(1);
}

const startedAt = new Date().toISOString();
const artifactResult = validateAgentArtifacts(root);
const secretResult = scanRepositorySecrets(root);
const environmentResult = validateEnvironmentContract(root);

for (const finding of relativeArtifactFindings(root, artifactResult.findings)) {
  console.error(`[security] ${finding.path}: ${finding.rule}`);
}
for (const finding of [...secretResult.findings, ...environmentResult.findings]) {
  console.error(`[security] ${finding.path}: ${finding.rule}`);
}

const npmCommand = process.env.npm_execpath;
if (!npmCommand) throw new Error("Ejecuta el security harness mediante npm run.");
console.log("[security] Ejecutando auditoría de dependencias de severidad alta o crítica.");
const audit = spawnSync(process.execPath, [npmCommand, "audit", "--audit-level=high"], {
  cwd: root,
  env: process.env,
  shell: false,
  stdio: "inherit",
});
const auditResult = { exitCode: Number.isInteger(audit.status) ? audit.status : 1 };
const { branch, head } = readGitState(root);
const report = createSecurityReport({
  artifactResult,
  auditResult,
  branch,
  environmentResult,
  finishedAt: new Date().toISOString(),
  head,
  secretResult,
  startedAt,
});

if (reportPath) {
  const destination = resolve(root, reportPath);
  if (!destination.startsWith(`${resolve(root, ".agent", "ci")}/`)) {
    throw new Error("El reporte debe guardarse dentro de .agent/ci/.");
  }
  writeSecurityReport(destination, report);
  console.log(`[security] Reporte sanitizado: ${reportPath}`);
}

console.log(`[security] files=${secretResult.filesScanned} result=${report.status}`);
if (report.status !== "passed") process.exitCode = 1;
