import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";

const MAX_FILE_SIZE = 1024 * 1024;
const TEXT_EXTENSIONS = new Set([
  ".css", ".example", ".html", ".js", ".json", ".jsx", ".md", ".mjs", ".sql", ".ts", ".tsx", ".txt", ".yml", ".yaml",
]);
const IGNORED_DIRECTORIES = new Set([
  ".git", ".next", "build", "coverage", "node_modules", "out",
]);
const SECRET_PATTERNS = [
  { name: "private-key", pattern: /-----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----/u },
  { name: "github-token", pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/u },
  { name: "aws-access-key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/u },
  { name: "jwt", pattern: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u },
  { name: "credentialed-database-url", pattern: /\b(?:mongodb(?:\+srv)?|mysql|postgres(?:ql)?):\/\/[^:\s/@]+:[^@\s/]+@/u },
];

function ignored(relativePath, name) {
  if (IGNORED_DIRECTORIES.has(name)) return true;
  return relativePath === ".agent/ci" || relativePath.startsWith(".agent/ci/")
    || relativePath === "supabase/.temp" || relativePath.startsWith("supabase/.temp/")
    || relativePath === "supabase/.branches" || relativePath.startsWith("supabase/.branches/");
}

export function eligibleRepositoryFiles(root, directory = root) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const repositoryPath = relative(root, path).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if (!ignored(repositoryPath, entry.name)) files.push(...eligibleRepositoryFiles(root, path));
      continue;
    }
    if (!entry.isFile() || statSync(path).size > MAX_FILE_SIZE) continue;
    if (entry.name === ".env.example" || TEXT_EXTENSIONS.has(extname(entry.name))) files.push(path);
  }
  return files;
}

export function scanTextForSecrets(path, content) {
  return SECRET_PATTERNS
    .filter(({ pattern }) => pattern.test(content))
    .map(({ name }) => ({ check: "repository-secrets", path, rule: name }));
}

export function scanRepositorySecrets(root, files = eligibleRepositoryFiles(root)) {
  const findings = files.flatMap((path) => scanTextForSecrets(
    relative(root, path).replaceAll("\\", "/"),
    readFileSync(path, "utf8"),
  ));
  return { filesScanned: files.length, findings, status: findings.length === 0 ? "passed" : "failed" };
}

export function parseEnvironmentExample(content) {
  return new Map(content.split(/\r?\n/u).flatMap((line) => {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/u);
    return match ? [[match[1], match[2]]] : [];
  }));
}

export function environmentReferences(files) {
  const names = new Set();
  const dotPattern = /process\.env\.([A-Z][A-Z0-9_]*)/gu;
  const bracketPattern = /process\.env\[['"]([A-Z][A-Z0-9_]*)['"]\]/gu;
  for (const path of files) {
    const content = readFileSync(path, "utf8");
    for (const pattern of [dotPattern, bracketPattern]) {
      for (const match of content.matchAll(pattern)) names.add(match[1]);
    }
  }
  return names;
}

export function validateEnvironmentContract(root, files = eligibleRepositoryFiles(root)) {
  const examplePath = join(root, ".env.example");
  if (!existsSync(examplePath)) {
    return { findings: [{ check: "environment-contract", path: ".env.example", rule: "missing-example" }], status: "failed" };
  }

  const declared = parseEnvironmentExample(readFileSync(examplePath, "utf8"));
  const referenced = environmentReferences(files.filter((path) => /\.(?:js|jsx|mjs|ts|tsx)$/u.test(path)));
  const projectReferences = [...referenced].filter((name) => name.startsWith("AICON_") || name.startsWith("NEXT_PUBLIC_"));
  const findings = projectReferences
    .filter((name) => !declared.has(name))
    .map((name) => ({ check: "environment-contract", path: ".env.example", rule: `missing-variable:${name}` }));

  for (const name of declared.keys()) {
    if (name.startsWith("NEXT_PUBLIC_") && /(?:PASSWORD|PRIVATE|SECRET|SERVICE_ROLE|TOKEN)/u.test(name)) {
      findings.push({ check: "environment-contract", path: ".env.example", rule: `unsafe-public-name:${name}` });
    }
  }

  return { findings, status: findings.length === 0 ? "passed" : "failed" };
}

export function createSecurityReport({ artifactResult, auditResult, branch, finishedAt, head, secretResult, startedAt, environmentResult }) {
  const checks = [
    { findings: artifactResult.findings.length, name: "agent-artifacts", status: artifactResult.status },
    { findings: secretResult.findings.length, name: "repository-secrets", scannedFiles: secretResult.filesScanned, status: secretResult.status },
    { findings: environmentResult.findings.length, name: "environment-contract", status: environmentResult.status },
    { exitCode: auditResult.exitCode, name: "dependency-audit", status: auditResult.exitCode === 0 ? "passed" : "failed" },
  ];
  return {
    schemaVersion: 1,
    status: checks.every((check) => check.status === "passed") ? "passed" : "failed",
    startedAt,
    finishedAt,
    repository: { branch, head },
    checks,
  };
}

export function writeSecurityReport(path, report) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8" });
}
