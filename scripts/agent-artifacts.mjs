import { resolve } from "node:path";

import { relativeArtifactFindings, validateAgentArtifacts } from "./lib/agent-artifacts.mjs";

const root = resolve(import.meta.dirname, "..");
const result = validateAgentArtifacts(root);

for (const finding of relativeArtifactFindings(root, result.findings)) {
  console.error(`[agent-artifacts] ${finding.kind} ${finding.path}: ${finding.rule}`);
}

console.log(`[agent-artifacts] specs=${result.counts.specs} plans=${result.counts.plans} runs=${result.counts.runs}`);
console.log(`[agent-artifacts] result=${result.status}`);
if (result.status !== "passed") process.exitCode = 1;
