import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const TASK_FILE = /^([A-Z][A-Z0-9]{1,9}-\d{3,6})-.+\.md$/u;
const TASK_DIRECTORY = /^[A-Z][A-Z0-9]{1,9}-\d{3,6}$/u;
const ATTEMPT_FILE = /^verification-attempt-(\d+)\.json$/u;

function compareText(left, right) {
  return left.localeCompare(right);
}

function taskIdsFromFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .flatMap((entry) => entry.name.match(TASK_FILE)?.[1] ?? [])
    .sort(compareText);
}

function runDirectories(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && TASK_DIRECTORY.test(entry.name))
    .map((entry) => entry.name)
    .sort(compareText);
}

function readAttempts(directory, taskId) {
  const taskDirectory = join(directory, taskId);
  return readdirSync(taskDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && ATTEMPT_FILE.test(entry.name))
    .map((entry) => {
      const attempt = Number(entry.name.match(ATTEMPT_FILE)[1]);
      let report;
      try {
        report = JSON.parse(readFileSync(join(taskDirectory, entry.name), "utf8"));
      } catch {
        throw new Error(`Invalid JSON evidence for ${taskId} attempt ${attempt}.`);
      }
      if (report.taskId !== taskId || report.attempt !== attempt || !Array.isArray(report.gates)) {
        throw new Error(`Inconsistent evidence for ${taskId} attempt ${attempt}.`);
      }
      return {
        attempt,
        durationMs: report.gates.reduce((total, gate) => total + (Number(gate.durationMs) || 0), 0),
        gateCount: report.gates.length,
        status: report.status,
      };
    })
    .sort((left, right) => left.attempt - right.attempt);
}

export function collectAgentMetrics(root, generatedAt = new Date().toISOString()) {
  const agentDirectory = join(root, ".agent");
  const plans = taskIdsFromFiles(join(agentDirectory, "plans"));
  const specs = taskIdsFromFiles(join(agentDirectory, "specs"));
  const runsDirectory = join(agentDirectory, "runs");
  const runs = runDirectories(runsDirectory);
  const taskIds = [...new Set([...plans, ...specs, ...runs])].sort(compareText);

  const tasks = taskIds.map((taskId) => {
    const attempts = runs.includes(taskId) ? readAttempts(runsDirectory, taskId) : [];
    return {
      taskId,
      hasPlan: plans.includes(taskId),
      hasSpec: specs.includes(taskId),
      hasSummary: existsSync(join(runsDirectory, taskId, "summary.md")),
      firstAttemptStatus: attempts[0]?.status ?? null,
      attempts,
    };
  });
  const attempts = tasks.flatMap((task) => task.attempts);
  const machineVerified = tasks.filter((task) => task.attempts.length > 0);
  const firstAttemptPassed = machineVerified.filter((task) => task.firstAttemptStatus === "passed").length;

  return {
    schemaVersion: 1,
    generatedAt,
    methodology: {
      source: ".agent plans, specs, summaries and verification-attempt JSON files",
      excludes: "free-text repair interpretation, prompts, command output and environment values",
    },
    totals: {
      tasks: tasks.length,
      specs: tasks.filter((task) => task.hasSpec).length,
      plans: tasks.filter((task) => task.hasPlan).length,
      traces: tasks.filter((task) => task.hasSummary).length,
      machineVerifiedTasks: machineVerified.length,
      attempts: attempts.length,
      passedAttempts: attempts.filter((attempt) => attempt.status === "passed").length,
      failedAttempts: attempts.filter((attempt) => attempt.status === "failed").length,
      firstAttemptPassRatePercent: machineVerified.length === 0
        ? null
        : Math.round((firstAttemptPassed / machineVerified.length) * 10000) / 100,
      totalGateDurationMs: attempts.reduce((total, attempt) => total + attempt.durationMs, 0),
    },
    tasks,
  };
}

export function writeMetrics(path, metrics) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(metrics, null, 2)}\n`, "utf8");
}
