import { resolve } from "node:path";

import { collectAgentMetrics, writeMetrics } from "./lib/agent-metrics.mjs";

const root = resolve(import.meta.dirname, "..");
const outputIndex = process.argv.indexOf("--output");
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : null;

if (process.argv.slice(2).some((argument, index) => argument.startsWith("--") && index + 2 !== outputIndex)) {
  console.error("Usage: npm run agent:metrics -- [--output <path>]");
  process.exit(1);
}
if (outputIndex >= 0 && (!output || output.startsWith("--"))) {
  console.error("--output requiere una ruta.");
  process.exit(1);
}

const metrics = collectAgentMetrics(root);
if (output) {
  const destination = resolve(root, output);
  const evidenceDirectory = resolve(root, "docs", "agentic-engineering", "evidence");
  if (!destination.startsWith(`${evidenceDirectory}/`)) {
    throw new Error("El reporte debe guardarse dentro de docs/agentic-engineering/evidence/.");
  }
  writeMetrics(destination, metrics);
  console.log(`[agent-metrics] report=${output}`);
} else {
  console.log(JSON.stringify(metrics, null, 2));
}

console.log(`[agent-metrics] tasks=${metrics.totals.tasks} attempts=${metrics.totals.attempts}`);
