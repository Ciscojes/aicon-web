import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { validateAgentArtifacts } from "./agent-artifacts.mjs";

const spec = `# AEH-900 — Fixture

## Status
## Problem
## Objective
## Scope
## Out of scope
## Functional requirements
## Non-functional requirements
## Acceptance criteria
## Architectural constraints
## Testing strategy
## Authority and approvals
`;

const plan = `# AEH-900 — Plan

## Status
## Objective
## Approved scope
## Affected files
## Affected components
## Risks and mitigations
## Tests required
## Migrations
## Implementation steps
## Approval
`;

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "aicon-artifacts-"));
  mkdirSync(join(root, ".agent", "specs"), { recursive: true });
  mkdirSync(join(root, ".agent", "plans"), { recursive: true });
  mkdirSync(join(root, ".agent", "runs", "AEH-900"), { recursive: true });
  writeFileSync(join(root, ".agent", "specs", "AEH-900-fixture.md"), spec);
  writeFileSync(join(root, ".agent", "plans", "AEH-900-fixture.md"), plan);
  writeFileSync(join(root, ".agent", "runs", "AEH-900", "summary.md"), "# Summary\n");
  writeFileSync(join(root, ".agent", "runs", "AEH-900", "verification-attempt-1.json"), JSON.stringify({
    schemaVersion: 1,
    taskId: "AEH-900",
    attempt: 1,
    status: "passed",
    startedAt: "2026-09-10T00:00:00.000Z",
    finishedAt: "2026-09-10T00:00:01.000Z",
    repository: { branch: "chore/fixture", head: "abc" },
    gates: [{ command: "npm run verify", durationMs: 1, exitCode: 0, name: "quality", status: "passed" }],
    nextAction: "Review",
  }));
  return root;
}

describe("agent artifact validation", () => {
  it("accepts linked and sanitized artifacts", () => {
    const result = validateAgentArtifacts(fixture());
    expect(result).toMatchObject({ counts: { plans: 1, runs: 1, specs: 1 }, findings: [], status: "passed" });
  });

  it("reports missing headings and task links", () => {
    const root = fixture();
    writeFileSync(join(root, ".agent", "specs", "AEH-901-incomplete.md"), "# Incomplete\n## Status\n");
    const rules = validateAgentArtifacts(root).findings.map((finding) => finding.rule);
    expect(rules).toContain("missing-plan");
    expect(rules).toContain("missing-heading:problem");
  });

  it("rejects unsafe fields in machine evidence", () => {
    const root = fixture();
    const path = join(root, ".agent", "runs", "AEH-900", "verification-attempt-1.json");
    const report = JSON.parse(readFileSync(path, "utf8"));
    report.environment = { TOKEN: "redacted-fixture" };
    report.repository.remoteUrl = "not-allowed";
    report.gates[0].stderr = "not-allowed";
    writeFileSync(path, JSON.stringify(report));
    const rules = validateAgentArtifacts(root).findings.map((finding) => finding.rule);
    expect(rules).toEqual(expect.arrayContaining([
      "unsafe-key:environment",
      "unsafe-repository-key:remoteUrl",
      "unsafe-gate-key:stderr",
    ]));
  });
});
