import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

const TASK_FILENAME = /^([A-Z][A-Z0-9]{1,9}-\d{3,6})-.+\.md$/u;
const REPORT_FILENAME = /^verification-attempt-(\d+)\.json$/u;
const SAFE_REPORT_KEYS = new Set([
  "attempt",
  "finishedAt",
  "gates",
  "nextAction",
  "repository",
  "schemaVersion",
  "startedAt",
  "status",
  "taskId",
]);
const SAFE_GATE_KEYS = new Set(["command", "durationMs", "exitCode", "name", "status"]);
const SAFE_REPOSITORY_KEYS = new Set(["branch", "head"]);

function markdownHeadings(content) {
  return new Set(
    content
      .split(/\r?\n/u)
      .filter((line) => line.startsWith("## "))
      .map((line) => line.slice(3).trim().toLowerCase()),
  );
}

function missingHeadingGroups(content, groups) {
  const headings = markdownHeadings(content);
  return groups
    .filter((alternatives) => !alternatives.some((heading) => headings.has(heading)))
    .map((alternatives) => alternatives[0]);
}

function markdownFinding(path, kind, missing) {
  return missing.map((heading) => ({ kind, path, rule: `missing-heading:${heading}` }));
}

function readMarkdownFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => ({
      content: readFileSync(join(directory, entry.name), "utf8"),
      name: entry.name,
      path: join(directory, entry.name),
    }));
}

function taskFromFilename(filename) {
  return filename.match(TASK_FILENAME)?.[1] ?? null;
}

function validateEvidence(path, expectedTaskId, expectedAttempt) {
  const findings = [];
  let report;
  try {
    report = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return [{ kind: "evidence", path, rule: "invalid-json" }];
  }

  for (const key of Object.keys(report)) {
    if (!SAFE_REPORT_KEYS.has(key)) findings.push({ kind: "evidence", path, rule: `unsafe-key:${key}` });
  }
  for (const gate of Array.isArray(report.gates) ? report.gates : []) {
    for (const key of Object.keys(gate)) {
      if (!SAFE_GATE_KEYS.has(key)) findings.push({ kind: "evidence", path, rule: `unsafe-gate-key:${key}` });
    }
  }
  for (const key of Object.keys(report.repository ?? {})) {
    if (!SAFE_REPOSITORY_KEYS.has(key)) {
      findings.push({ kind: "evidence", path, rule: `unsafe-repository-key:${key}` });
    }
  }

  if (report.taskId !== expectedTaskId) findings.push({ kind: "evidence", path, rule: "task-id-mismatch" });
  if (report.attempt !== expectedAttempt) findings.push({ kind: "evidence", path, rule: "attempt-mismatch" });
  if (!Array.isArray(report.gates) || report.gates.length === 0) {
    findings.push({ kind: "evidence", path, rule: "missing-gates" });
  }

  return findings;
}

export function validateAgentArtifacts(root) {
  const agentDirectory = join(root, ".agent");
  const specsDirectory = join(agentDirectory, "specs");
  const plansDirectory = join(agentDirectory, "plans");
  const runsDirectory = join(agentDirectory, "runs");
  const findings = [];
  const specs = readMarkdownFiles(specsDirectory);
  const plans = readMarkdownFiles(plansDirectory);
  const planTaskIds = new Set(plans.map((file) => taskFromFilename(file.name)).filter(Boolean));

  const specHeadings = [
    ["status"], ["problem"], ["objective"], ["scope"], ["out of scope"],
    ["functional requirements"], ["non-functional requirements"], ["acceptance criteria"],
    ["architectural constraints"], ["testing strategy"], ["authority and approvals"],
  ];
  const planHeadings = [
    ["status", "estado"], ["objective", "objetivo"], ["approved scope", "alcance"],
    ["affected files", "archivos previstos"], ["affected components", "componentes afectados"],
    ["risks and mitigations", "riesgos"], ["tests required", "pruebas necesarias"],
    ["migrations", "migraciones"], ["implementation steps", "pasos de implementación"],
    ["approval", "aprobaciones"],
  ];

  for (const spec of specs) {
    const taskId = taskFromFilename(spec.name);
    if (!taskId) findings.push({ kind: "spec", path: spec.path, rule: "invalid-task-filename" });
    else if (!planTaskIds.has(taskId)) findings.push({ kind: "spec", path: spec.path, rule: "missing-plan" });
    findings.push(...markdownFinding(spec.path, "spec", missingHeadingGroups(spec.content, specHeadings)));
  }

  for (const plan of plans) {
    const taskId = taskFromFilename(plan.name);
    if (!taskId) findings.push({ kind: "plan", path: plan.path, rule: "invalid-task-filename" });
    findings.push(...markdownFinding(plan.path, "plan", missingHeadingGroups(plan.content, planHeadings)));
  }

  const runDirectories = existsSync(runsDirectory)
    ? readdirSync(runsDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^[A-Z][A-Z0-9]{1,9}-\d{3,6}$/u.test(entry.name))
    : [];
  if (existsSync(runsDirectory)) {
    for (const entry of runDirectories) {
      const taskId = entry.name;
      const taskDirectory = join(runsDirectory, taskId);
      const summaryPath = join(taskDirectory, "summary.md");
      if (!planTaskIds.has(taskId)) findings.push({ kind: "run", path: taskDirectory, rule: "missing-plan" });
      if (!existsSync(summaryPath)) findings.push({ kind: "run", path: taskDirectory, rule: "missing-summary" });

      for (const file of readdirSync(taskDirectory, { withFileTypes: true })) {
        const attempt = file.isFile() ? file.name.match(REPORT_FILENAME)?.[1] : null;
        if (attempt) findings.push(...validateEvidence(join(taskDirectory, file.name), taskId, Number(attempt)));
      }
    }
  }

  return {
    counts: { plans: plans.length, runs: runDirectories.length, specs: specs.length },
    findings,
    status: findings.length === 0 ? "passed" : "failed",
  };
}

export function relativeArtifactFindings(root, findings) {
  return findings.map((finding) => ({ ...finding, path: finding.path.slice(root.length + 1) || basename(finding.path) }));
}
