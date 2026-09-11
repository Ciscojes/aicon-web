import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  createReport,
  parseArguments,
  readGitState,
  reportPath,
  runGates,
  validateExecutionContext,
  verificationGates,
  writeReport,
} from "./agentic-harness.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "aicon-agentic-"));
  mkdirSync(join(root, ".agent", "plans"), { recursive: true });
  writeFileSync(join(root, ".agent", "plans", "AEH-002-plan.md"), "# Plan\n");
  return root;
}

function gitFixture({ detached = false, packed = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), "aicon-git-"));
  mkdirSync(join(root, ".git", "refs", "heads", "chore"), { recursive: true });
  const head = "1234567890abcdef1234567890abcdef12345678";

  if (detached) {
    writeFileSync(join(root, ".git", "HEAD"), `${head}\n`);
  } else {
    writeFileSync(join(root, ".git", "HEAD"), "ref: refs/heads/chore/task\n");
    if (packed) writeFileSync(join(root, ".git", "packed-refs"), `${head} refs/heads/chore/task\n`);
    else writeFileSync(join(root, ".git", "refs", "heads", "chore", "task"), `${head}\n`);
  }

  return { head, root };
}

describe("agentic harness", () => {
  it("parses a controlled verification request", () => {
    expect(parseArguments(["--task", "AEH-002", "--attempt", "2", "--db-lint"]))
      .toEqual({ attempt: 2, includeDbLint: true, taskId: "AEH-002" });
  });

  it("rejects unknown arguments", () => {
    expect(() => parseArguments(["--unknown"])).toThrow("Argumento no reconocido");
  });

  it("requires a task branch, plan and bounded attempt", () => {
    const root = fixture();
    expect(validateExecutionContext({ attempt: 1, branch: "chore/task", root, taskId: "AEH-002" }))
      .toEqual({
        destination: reportPath(root, "AEH-002", 1),
        plan: join(root, ".agent", "plans", "AEH-002-plan.md"),
      });
    expect(() => validateExecutionContext({ attempt: 1, branch: "main", root, taskId: "AEH-002" }))
      .toThrow("directamente sobre main");
    expect(() => validateExecutionContext({ attempt: 4, branch: "chore/task", root, taskId: "AEH-002" }))
      .toThrow("entre 1 y 3");
    expect(() => validateExecutionContext({ attempt: 1, branch: "chore/task", root, taskId: "BAD" }))
      .toThrow("identificador");
  });

  it("reads loose, packed and detached Git state without executing Git", () => {
    const loose = gitFixture();
    expect(readGitState(loose.root)).toEqual({ branch: "chore/task", head: loose.head });

    const packed = gitFixture({ packed: true });
    expect(readGitState(packed.root)).toEqual({ branch: "chore/task", head: packed.head });

    const detached = gitFixture({ detached: true });
    expect(readGitState(detached.root)).toEqual({ branch: "HEAD", head: detached.head });
  });

  it("refuses to overwrite attempt evidence", () => {
    const root = fixture();
    const destination = reportPath(root, "AEH-002", 1);
    writeReport(destination, { status: "failed" });
    expect(() => validateExecutionContext({ attempt: 1, branch: "chore/task", root, taskId: "AEH-002" }))
      .toThrow("no puede sobrescribirse");
  });

  it("reuses verify, which includes security, and optionally adds database lint", () => {
    expect(verificationGates({ npmCommand: "node" }).map((gate) => gate.displayCommand))
      .toEqual(["npm run verify"]);
    expect(verificationGates({ includeDbLint: true, npmCommand: "node" }).map((gate) => gate.displayCommand))
      .toEqual(["npm run verify", "npm run db:lint"]);
  });

  it("stops after the first failed gate", () => {
    const called = [];
    const gates = [
      { displayCommand: "first", name: "first" },
      { displayCommand: "second", name: "second" },
      { displayCommand: "third", name: "third" },
    ];
    const timestamps = [0, 10, 20, 30];
    const results = runGates(gates, (gate) => {
      called.push(gate.name);
      return { status: gate.name === "second" ? 2 : 0 };
    }, () => timestamps.shift());

    expect(called).toEqual(["first", "second"]);
    expect(results.map((result) => result.status)).toEqual(["passed", "failed"]);
  });

  it("creates sanitized evidence and stops after attempt three", () => {
    const report = createReport({
      attempt: 3,
      branch: "chore/task",
      finishedAt: "2026-09-09T01:01:00.000Z",
      gates: [{
        command: "npm run verify",
        durationMs: 100,
        env: { SECRET: "must-not-appear" },
        exitCode: 1,
        name: "quality",
        status: "failed",
        stderr: "sensitive output",
      }],
      head: "abc123",
      startedAt: "2026-09-09T01:00:00.000Z",
      taskId: "AEH-002",
    });

    expect(report.status).toBe("failed");
    expect(report.nextAction).toContain("Stop");
    expect(JSON.stringify(report)).not.toContain("SECRET");
    expect(JSON.stringify(report)).not.toContain("sensitive output");
  });
});
