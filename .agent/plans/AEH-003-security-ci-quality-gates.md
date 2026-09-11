# AEH-003 — Implementation plan

## Status

Approved

## Objective

Add auditable governance and security checks to the existing local and remote
quality pipeline without new dependencies or runtime changes.

## Approved scope

The scope is defined by `.agent/specs/AEH-003-security-ci-quality-gates.md`.

## Affected files

- `scripts/agent-artifacts.mjs` and `scripts/lib/agent-artifacts.mjs`: artifact validator.
- `scripts/security-harness.mjs` and `scripts/lib/security-harness.mjs`: bounded security checks and report.
- Focused `scripts/lib/*.test.mjs` files: negative and positive verification.
- `package.json`: expose gates and include them in `verify`.
- `.github/workflows/quality.yml`: explicit security step and report upload.
- `.gitignore`: ignore locally generated CI reports.
- Agentic documentation, ADR and `.agent/runs/AEH-003/`: design and evidence.

## Affected components

- Development tooling, CI and engineering governance only.
- No application route, domain module, database object or production environment.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Secret scanner false positives | Valid PR blocked | Use high-confidence patterns and focused tests; document bounded coverage |
| Secret value leaks in failure output | Credential exposure | Report category and path only; never matched text |
| CI duplicates local gates | Drift and wasted time | Keep commands in npm scripts; workflow only orchestrates them |
| Artifact validator breaks history | Existing tasks cannot pass | Validate documented contracts while allowing plans backed by pre-existing approval |
| Report accidentally committed | Repository noise | Write to ignored `.agent/ci/` and upload only from CI |

## Tests required

- Focused Vitest tests for both validator libraries.
- `npm run agent:artifacts`.
- `npm run security` with sanitized report inspection.
- `npm run agent:verify -- --task AEH-003 --attempt 1`.
- GitHub Actions and SonarCloud checks on the Pull Request.

## Migrations

None.

## Implementation steps

1. Implement pure artifact validation and focused tests.
2. Implement bounded repository and environment checks with focused tests.
3. Add sanitized report generation and dependency-audit orchestration.
4. Wire gates into npm scripts and the existing CI workflow.
5. Update security, architecture and academic documentation.
6. Run the agentic verification wrapper and record the trace.
7. Create small commits and a Pull Request for human review.

## Security review

- Never inspect runtime secret values; inspect repository text and variable names only.
- Never persist matched content, command output or environment values.
- Keep workflow permissions at `contents: read`.
- Use only maintained official GitHub actions already present or `actions/upload-artifact`.

## Rollback or recovery

Close the PR or revert its commits. No runtime state, database or external secret
is modified.

## Approval

- Approved by: owner.
- Date/context: 2026-09-09, explicit instruction to implement AEH-003.
