# AEH-003 — Security and CI quality gates

## Status

Approved

## Problem

Aicon has reproducible quality commands and an auditable local agent runner,
but CI does not yet validate agent artifacts, environment contracts or a
bounded set of high-confidence secret patterns. It also does not retain a
sanitized security report for academic review.

## Objective

Add dependency-free, testable governance and security checks to the existing
quality pipeline and upload their sanitized result from GitHub Actions.

## Scope

- Validate the structure and linkage of versioned SPEC, PLAN and run evidence.
- Detect a bounded set of high-confidence credential patterns in repository files.
- Validate project-owned environment variable references against `.env.example`.
- Reject secret-like names in variables exposed through `NEXT_PUBLIC_`.
- Run the existing high-severity dependency audit.
- Produce a sanitized JSON report suitable for a CI artifact.
- Integrate the gates into the existing workflow with official GitHub actions.

## Out of scope

- Branch protection, repository access or merge policy changes.
- Production configuration, deployment, secret rotation or secret retrieval.
- Replacing GitHub/SonarCloud or claiming exhaustive secret detection.
- Database schema, RLS, application routes or business behavior.

## Functional requirements

- FR-1: `npm run agent:artifacts` validates required headings, task identifiers
  and safe verification-evidence fields.
- FR-2: `npm run security` scans eligible repository files without printing
  matched secret values.
- FR-3: `npm run security` validates project-owned environment references and
  executes `npm audit --audit-level=high`.
- FR-4: the security command optionally writes a JSON report containing only
  check names, counts, status, timestamps and repository metadata.
- FR-5: CI runs quality, build and security in a clear order and uploads the
  report even when the security gate fails.

## Non-functional requirements

- NFR-1: no new npm dependency or production-runtime import.
- NFR-2: reports never contain file contents, environment values, command
  output, credentials or personal data.
- NFR-3: checks are deterministic on Linux and local development environments.
- NFR-4: scanning is bounded by ignored directories, eligible text extensions
  and a maximum file size.

## Acceptance criteria

- AC-1: valid current agent artifacts pass structural validation.
- AC-2: malformed headings, unsafe evidence keys and missing task links fail
  focused tests.
- AC-3: representative private-key, GitHub-token, AWS-key, JWT and credentialed
  database URL fixtures are detected without returning the matched value.
- AC-4: a missing project environment declaration and a public secret-like
  variable name fail focused tests.
- AC-5: `npm run verify` includes the new governance and security gates and passes.
- AC-6: GitHub Actions publishes a sanitized security report artifact.
- AC-7: application code, database schema and external environments are unchanged.

## Architectural constraints

- Keep orchestration in `scripts/` and pure functions in `scripts/lib/`.
- Reuse existing npm scripts rather than duplicating lint, test, database or build logic.
- Use Node standard-library APIs and the existing Vitest installation.
- CI permissions remain read-only.

## Testing strategy

- Unit: artifact parsing, secret patterns, environment contract and report shape.
- Integration/database: existing `npm run db:test` through `npm run verify`.
- End-to-end/manual: inspect the CI artifact metadata and PR checks.
- Security: `npm audit --audit-level=high` plus focused negative fixtures.

## Authority and approvals

- Task level: CONTROLLED.
- Approved by: owner, through the instruction to continue AEH-003.
- Merge remains REQUIRE APPROVAL.

## Open questions

- Mandatory branch protection remains a separate human-approved repository setting.
- A specialized secret-scanning service may be evaluated later if repository risk grows.
