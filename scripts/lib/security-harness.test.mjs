import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  createSecurityReport,
  scanTextForSecrets,
  validateEnvironmentContract,
} from "./security-harness.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "aicon-security-"));
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(join(root, ".env.example"), "NEXT_PUBLIC_SUPABASE_URL=https://example.invalid\nAICON_PUBLIC_EMAIL=\n");
  writeFileSync(join(root, "src", "config.ts"), "process.env.NEXT_PUBLIC_SUPABASE_URL; process.env.AICON_PUBLIC_EMAIL;\n");
  return root;
}

describe("security harness", () => {
  it("detects high-confidence credential classes without returning values", () => {
    const samples = [
      ["private-key", ["-----BEGIN", " PRIVATE KEY-----"].join("")],
      ["github-token", ["ghp", "_", "A".repeat(36)].join("")],
      ["aws-access-key", ["AKIA", "A".repeat(16)].join("")],
      ["jwt", [["eyJ", "A".repeat(12)].join(""), ["eyJ", "B".repeat(12)].join(""), "C".repeat(12)].join(".")],
      ["credentialed-database-url", ["postgresql://user", ":fixture-value", "@db.invalid/app"].join("")],
    ];

    for (const [rule, value] of samples) {
      const findings = scanTextForSecrets("fixture.txt", value);
      expect(findings).toContainEqual({ check: "repository-secrets", path: "fixture.txt", rule });
      expect(JSON.stringify(findings)).not.toContain(value);
    }
  });

  it("accepts declared project environment references", () => {
    expect(validateEnvironmentContract(fixture())).toEqual({ findings: [], status: "passed" });
  });

  it("rejects missing declarations and secret-like public names", () => {
    const root = fixture();
    writeFileSync(join(root, "src", "config.ts"), ["process", ".env.", "AICON_MISSING;\n"].join(""));
    writeFileSync(join(root, ".env.example"), "NEXT_PUBLIC_SERVICE_ROLE_SECRET=placeholder\n");
    const rules = validateEnvironmentContract(root).findings.map((finding) => finding.rule);
    expect(rules).toEqual(expect.arrayContaining([
      "missing-variable:AICON_MISSING",
      "unsafe-public-name:NEXT_PUBLIC_SERVICE_ROLE_SECRET",
    ]));
  });

  it("creates metadata-only security evidence", () => {
    const report = createSecurityReport({
      artifactResult: { findings: [], status: "passed" },
      auditResult: { exitCode: 0, output: "not-allowed" },
      branch: "chore/security",
      environmentResult: { findings: [], status: "passed" },
      finishedAt: "2026-09-10T00:00:01.000Z",
      head: "abc",
      secretResult: { filesScanned: 20, findings: [], matchedValue: "not-allowed", status: "passed" },
      startedAt: "2026-09-10T00:00:00.000Z",
    });
    expect(report.status).toBe("passed");
    expect(JSON.stringify(report)).not.toContain("not-allowed");
  });
});
