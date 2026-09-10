# AEH-002 — Implementation plan

## Status

Completed and verified; ready for human review.

## Objective

Implement a tested, dependency-free agent verification runner with sanitized
attempt evidence and a hard three-attempt limit.

## Approved scope

The scope is defined by `.agent/specs/AEH-002-agentic-verification-runner.md`.

## Affected files

- `scripts/agentic-harness.mjs`: CLI entry point.
- `scripts/lib/agentic-harness.mjs`: testable orchestration primitives.
- `scripts/lib/agentic-harness.test.mjs`: focused unit tests.
- `package.json`: expose `agent:verify`.
- `vitest.config.mts`: include harness tests.
- `AGENTS.md` and `.agent/README.md`: executable usage and stacked-PR rule.
- `docs/agentic-engineering/*`: runner and repair-loop documentation.
- `.agent/runs/AEH-002/*`: sanitized verification evidence.

## Affected components

- Development tooling and engineering governance only.
- No route, module, database object or production runtime component.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Evidence leaks command output | Secret or personal-data exposure | Inherit stdio and store metadata only |
| Runner duplicates quality logic | Divergent gates | Invoke `npm run verify` directly |
| Infinite retry cycle | Wasted work or unsafe repeated actions | Require explicit attempt 1–3 and reject higher values |
| Report overwrite | Loss of audit history | Refuse existing attempt paths |
| Stacked PR obscures review | Incorrect merge order | Target PR #10 branch and document dependency |

## Tests required

- Unit tests for parsing, validation, gate selection and report shape.
- Real `npm run agent:verify -- --task AEH-002 --attempt 1`.
- `npm audit --audit-level=high` through the runner.
- Final `npm run verify` and diff review.

## Migrations

None.

## Implementation steps

1. Add pure, testable harness functions.
2. Add the CLI and npm command.
3. Add unit tests to the existing Vitest execution.
4. Run the real attempt and inspect sanitized evidence.
5. Update governance and academic documentation.
6. Create trace, commits and a stacked Pull Request.

## Security review

- No environment values or command output in generated evidence.
- Validate task identifiers and resolve report paths under `.agent/runs` only.
- Use `spawnSync` without a shell for gates.
- Refuse overwrite and execution from `main`.

## Rollback or recovery

Close the stacked PR or revert its commits. No application state, dependency,
database or production environment is modified.

## Approval

- Approved by: owner.
- Context: continuation authorized after PR #10 was prepared.
