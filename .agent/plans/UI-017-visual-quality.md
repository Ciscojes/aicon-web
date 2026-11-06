# UI-017 — Visual quality and security

## Status

In progress

## Objective

Complete PR #17 verification.

## Approved scope

User request dated 2026-11-06, task UI-017.

## Affected files

src/app/globals.css; package.json; package-lock.json; task documents.

## Affected components

Catalog, public details and dashboard CSS; runtime and development dependencies.

## Risks and mitigations

CSS cascade regressions: inspect computed styles at desktop/mobile. Dependency incompatibility: complete verify contract.

## Tests required

npm run verify; npm run agent:verify -- --task UI-017 --attempt 1; responsive checks.

## Migrations

None.

## Implementation steps

1. Inspect PR and failures.
2. Resolve CSS specificity and update vulnerable dependencies to compatible patched releases.
3. Run gates and responsive review.
4. Record evidence and merge only with remote checks passing.

## Security review

Keep authentication, authorization, RLS and auditing unchanged.

## Rollback or recovery

Revert the scoped commit if needed.

## Approval

Explicit task and conditional merge authorization supplied by Jesús on 2026-11-06.
