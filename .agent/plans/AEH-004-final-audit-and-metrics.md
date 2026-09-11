# AEH-004 — Implementation plan

## Status

Approved

## Objective

Close the academic harness increment with reproducible metrics, a final audit
and a concise demonstration package.

## Approved scope

Defined by `.agent/specs/AEH-004-final-audit-and-metrics.md`.

## Affected files

- `scripts/agent-metrics.mjs` and `scripts/lib/agent-metrics.mjs`.
- `scripts/lib/agent-metrics.test.mjs`.
- `package.json`.
- `docs/agentic-engineering/final-audit.md`.
- `docs/agentic-engineering/demo-guide.md`.
- `docs/agentic-engineering/evidence/agentic-metrics.json`.
- `README.md`, `docs/STATUS.md` and AEH-004 trace files.

## Affected components

- Engineering governance and academic documentation only.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Metrics overstate effectiveness | Invalid academic conclusion | State denominator and machine/manual evidence limits |
| Free text leaks into report | Sensitive data exposure | Read structured JSON and artifact existence only |
| Snapshot becomes stale | Misleading presentation | Provide one deterministic regeneration command |
| Audit claims production readiness | Unsafe launch | Separate TFM readiness from production blockers |

## Tests required

- Focused metric aggregation tests.
- `npm run agent:metrics` and snapshot inspection.
- `npm run verify`.
- `npm run agent:verify -- --task AEH-004 --attempt 1`.
- GitHub Actions and SonarCloud.

## Migrations

None.

## Implementation steps

1. Implement pure metrics aggregation and tests.
2. Add the CLI and npm command.
3. Draft the final audit and demonstration guide.
4. Commit implementation and run the agentic verification attempt.
5. Generate the final snapshot including AEH-004 and finalize the trace.
6. Push a Pull Request for human review.

## Security review

- Read only task identifiers, report status, durations and artifact existence.
- Never include report command output, environment values or Git credentials.
- Reuse the security harness as a mandatory gate.

## Rollback or recovery

Close the PR or revert its commits. No application or external state is changed.

## Approval

- Approved by: owner.
- Date/context: 2026-09-10, requested completion despite limited model capacity.
