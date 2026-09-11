# AEH-004 — Final audit and reproducible metrics

## Status

Approved

## Problem

Aicon has a working agentic governance layer, verification runner and security
gates, but its evidence is distributed across task artifacts, CI and academic
documents. The TFM needs a reproducible quantitative snapshot and a concise
final audit that distinguishes implemented controls from remaining limitations.

## Objective

Produce a dependency-free metrics command, a versioned evidence snapshot, a
final eight-part repository audit and a demonstration guide suitable for human
review and academic presentation.

## Scope

- Aggregate sanitized `.agent` metadata into reproducible task and attempt metrics.
- Record the metric methodology and its limitations.
- Audit architecture, harness engineering, agentic engineering, security,
  quality, risks, technical debt and recommendations.
- Create a short demonstration script for the TFM defense.
- Update documentation entry points and project status.

## Out of scope

- Application features, migrations, dependencies or production configuration.
- Branch protection, deployment, providers, secrets or destructive actions.
- Automatic interpretation of free-text repair narratives.
- Claims of exhaustive security, correctness or causal attribution.

## Functional requirements

- FR-1: `npm run agent:metrics` calculates task, trace, attempt, gate and duration metrics.
- FR-2: the command can write a deterministic JSON snapshot under the approved evidence directory.
- FR-3: malformed evidence fails with a useful error without exposing file content.
- FR-4: the final audit contains all eight sections requested by the TFM brief.
- FR-5: the demo guide explains how to reproduce SPEC → PLAN → VERIFY → REVIEW.

## Non-functional requirements

- NFR-1: use Node standard-library APIs and existing Vitest only.
- NFR-2: metrics contain identifiers, counts, statuses and durations only.
- NFR-3: generated JSON is stable for the same input, excluding an explicit generation timestamp.
- NFR-4: clearly separate machine evidence from manually reviewed narrative evidence.

## Acceptance criteria

- AC-1: focused tests cover aggregation, missing artifacts and malformed JSON.
- AC-2: the snapshot includes AEH-001 through AEH-004 after verification.
- AC-3: no prompt, environment value, command output, credential or personal data is stored.
- AC-4: `npm run verify` and the AEH-004 agentic attempt pass.
- AC-5: GitHub Actions and SonarCloud approve the Pull Request.
- AC-6: merge remains a separate human decision.

## Architectural constraints

- Keep metrics tooling under `scripts/` and outside the application runtime.
- Read only approved `.agent` metadata and never shell out to infer metrics.
- Keep the snapshot under `docs/agentic-engineering/evidence/`.

## Testing strategy

- Unit: deterministic aggregation and invalid evidence fixtures.
- Integration/database: existing `npm run verify` contract.
- End-to-end/manual: regenerate snapshot and compare it with the final audit.
- Security: inspect report keys and execute the existing security harness.

## Authority and approvals

- Task level: CONTROLLED.
- Approved by: owner through explicit instruction to complete the closing task.
- Merge and branch protection remain REQUIRE APPROVAL.

## Open questions

- Production launch evidence remains outside the academic harness closure.
