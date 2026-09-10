# AEH-002 — Agentic verification runner

## Status

Approved.

## Problem

Aicon documents its verification and repair process, but an agent can still
omit gates, exceed the repair limit or leave no structured execution evidence.

## Objective

Provide a lightweight CLI that reuses the existing quality contract, enforces a
maximum of three verification attempts and writes a sanitized result that can
be linked from a task trace and Pull Request.

## Scope

- Add an `agent:verify` npm command.
- Require a valid task identifier, existing plan, task branch and attempt 1–3.
- Run `npm run verify` and a high-severity dependency audit.
- Optionally run `npm run db:lint` for database work.
- Stop on the first failed gate and return a non-zero exit code.
- Write one immutable JSON summary per attempt without command output or
  environment values.
- Add focused automated tests and documentation.

## Out of scope

- Automatically modify source code or diagnose failures using an AI model.
- Retry commands without an explicit repair between attempts.
- Modify CI, branch protection, production, secrets or database schema.
- Replace `npm run verify` or introduce a new dependency.

## Functional requirements

- FR-1: `--task` accepts only uppercase task identifiers such as `AEH-002`.
- FR-2: `--attempt` accepts only integers from 1 through 3.
- FR-3: execution is rejected on `main`, detached HEAD or without a matching plan.
- FR-4: evidence records gate name, command, status, exit code and duration.
- FR-5: evidence never records stdout, stderr or environment values.
- FR-6: an existing attempt file is never overwritten.
- FR-7: attempt three failure instructs the agent to stop for human review.

## Non-functional requirements

- NFR-1: use only Node.js standard library and existing npm commands.
- NFR-2: remain independent from the Aicon runtime and business modules.
- NFR-3: produce deterministic validation behavior across local and CI-capable environments.
- NFR-4: keep evidence concise and safe to version.

## Acceptance criteria

- AC-1: valid task context runs the gates in documented order.
- AC-2: missing plan, main branch, invalid attempt and duplicate report are rejected.
- AC-3: a failed gate prevents later gates from running.
- AC-4: attempts above three cannot execute.
- AC-5: tests cover argument parsing, context validation and report sanitization.
- AC-6: `npm run verify` passes after integration.

## Architectural constraints

- Keep orchestration under `scripts/`; do not import it from `src/`.
- Reuse `npm run verify` as the primary quality gate.
- Do not capture or persist child-process output.
- Keep merge and external repository changes under human control.

## Testing strategy

- Unit: pure parser, context validation, gates and report structure.
- Integration: execute the real runner for `AEH-002` attempt 1.
- Database: no schema changes; `db:test` remains inside `verify`.
- Security: dependency audit and evidence-content review.

## Authority and approvals

- Task level: CONTROLLED.
- Implementation was authorized by the owner with “sigue”.
- Merge and branch protection remain REQUIRE APPROVAL.

## Open questions

- CI enforcement and artifact upload belong to a later incremental PR.
