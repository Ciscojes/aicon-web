import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { collectAgentMetrics } from "./agent-metrics.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "aicon-metrics-"));
  mkdirSync(join(root, ".agent", "plans"), { recursive: true });
  mkdirSync(join(root, ".agent", "specs"), { recursive: true });
  mkdirSync(join(root, ".agent", "runs", "AEH-100"), { recursive: true });
  writeFileSync(join(root, ".agent", "plans", "AEH-100-plan.md"), "# Plan\n");
  writeFileSync(join(root, ".agent", "specs", "AEH-100-spec.md"), "# Spec\n");
  writeFileSync(join(root, ".agent", "runs", "AEH-100", "summary.md"), "# Summary\n");
  return root;
}

function attempt(root, number, status, durationMs) {
  writeFileSync(
    join(root, ".agent", "runs", "AEH-100", `verification-attempt-${number}.json`),
    JSON.stringify({
      taskId: "AEH-100",
      attempt: number,
      status,
      gates: [{ durationMs }],
    }),
  );
}

describe("agent metrics", () => {
  it("aggregates deterministic structured evidence", () => {
    const root = fixture();
    attempt(root, 1, "failed", 120);
    attempt(root, 2, "passed", 80);
    const metrics = collectAgentMetrics(root, "2026-09-10T00:00:00.000Z");

    expect(metrics.totals).toEqual({
      attempts: 2,
      failedAttempts: 1,
      firstAttemptPassRatePercent: 0,
      machineVerifiedTasks: 1,
      passedAttempts: 1,
      plans: 1,
      specs: 1,
      tasks: 1,
      totalGateDurationMs: 200,
      traces: 1,
    });
    expect(metrics.tasks[0].attempts.map(({ status }) => status)).toEqual(["failed", "passed"]);
  });

  it("keeps planned tasks without machine evidence visible", () => {
    const metrics = collectAgentMetrics(fixture(), "2026-09-10T00:00:00.000Z");
    expect(metrics.totals).toMatchObject({ machineVerifiedTasks: 0, firstAttemptPassRatePercent: null });
    expect(metrics.tasks[0]).toMatchObject({ firstAttemptStatus: null, hasPlan: true, hasSpec: true, hasSummary: true });
  });

  it("rejects malformed or inconsistent attempt evidence", () => {
    const root = fixture();
    writeFileSync(join(root, ".agent", "runs", "AEH-100", "verification-attempt-1.json"), "not-json");
    expect(() => collectAgentMetrics(root)).toThrow("Invalid JSON evidence");

    writeFileSync(
      join(root, ".agent", "runs", "AEH-100", "verification-attempt-1.json"),
      JSON.stringify({ taskId: "AEH-999", attempt: 1, gates: [] }),
    );
    expect(() => collectAgentMetrics(root)).toThrow("Inconsistent evidence");
  });
});
