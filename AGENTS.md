<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Aicon agent engineering rules

This file is the source of truth for every coding agent working in this
repository. Agent-specific files must reference it instead of copying its
rules. Product decisions remain in `docs/SPEC.md` and `docs/specs/`; this file
governs how changes are planned, implemented and verified.

## Required reading

Before changing files, read only the material relevant to the task:

1. `docs/CONSTRAINTS.md` and the applicable product SPEC.
2. `docs/ARCHITECTURE.md` for dependency and folder rules.
3. `docs/STATUS.md` to avoid repeating completed work.
4. `.agent/README.md` and the templates required by the task.
5. The installed Next.js guide referenced by the managed block above whenever
   framework behavior is involved.

If documents disagree, stop and request a decision. Do not silently choose the
interpretation that permits the largest change.

## Architecture

Aicon is a modular monolith built with Next.js, TypeScript and Supabase.

- `src/modules/*/domain`: pure business rules; no Next.js, React or Supabase.
- `src/modules/*/application`: use cases and orchestration of domain rules.
- `src/modules/*/infrastructure`: Supabase queries and external adapters.
- `src/modules/*/ui`: module-owned React components.
- `src/app`: routes and Server Actions; validate input, session and permission.
- `src/shared`: genuinely cross-module code only.
- `src/infrastructure`: shared provider configuration and adapters.

Prefer a small change in an existing module over a new abstraction. Do not add
microservices, empty layers, generic repositories or dependencies without a
documented need.

## Mandatory workflow

Every controlled task follows:

`SPEC → PLAN → IMPLEMENT → VERIFY → REPAIR → REVIEW`

1. Confirm an approved specification or write a task specification from the
   template before implementation.
2. Create a plan in `.agent/plans/` before changing application code.
3. Implement the smallest independently verifiable increment.
4. Run the gates required by this file.
5. On failure, diagnose the root cause and apply the smallest repair.
6. Stop after three failed repair attempts and produce a failure report.
7. Record sanitized evidence in `.agent/runs/` and prepare a Pull Request.

Do not present a task as complete before human review when the task is marked
`CONTROLLED` or `REQUIRE APPROVAL`.

## Authority levels

### SAFE

May be performed without additional approval:

- Read repository files and Git history.
- Generate a specification or plan.
- Run lint, typecheck, tests, migration validation, build and read-only audits.
- Inspect local development state without exposing secret values.

### CONTROLLED

Require an approved task scope and a recorded plan:

- Modify application code, tests, documentation or non-destructive config.
- Add a forward-only migration.
- Change dependencies with written justification.
- Create a branch, commits and a draft Pull Request for the approved task.

### REQUIRE APPROVAL

Stop and obtain explicit human approval immediately before:

- Deleting or rewriting data or migration history.
- Weakening authentication, authorization, RLS or security headers.
- Reading, rotating, storing or transmitting secrets.
- Changing production, deployment, DNS, billing or external providers.
- Pushing directly to `main`, force-pushing or merging a Pull Request.
- Enabling branch protection or changing repository access settings.

## Implementation rules

- Keep TypeScript strict and avoid `any` unless the boundary is documented.
- Use Zod for untrusted inputs when appropriate and validate again at critical
  database boundaries.
- Validate authorization on the server; hidden UI is never authorization.
- Preserve accessibility, semantic HTML and keyboard operation.
- Keep user-facing errors useful without exposing provider or database details.
- Do not introduce a dependency when platform or existing project facilities
  solve the problem adequately.
- Do not modify unrelated user changes in a dirty worktree.

## Database and Supabase

- Every schema change uses a new forward-only file in `supabase/migrations/`.
- Never edit an already shared migration to change history.
- Every public table requires an explicit RLS decision and tests proportional
  to its exposure.
- Treat RPC grants to `anon` or `authenticated` as part of the security surface.
- The browser may use only the public/publishable Supabase key.
- Destructive reset commands may run only against a confirmed disposable local
  database and require approval when existing data could be lost.

## Secrets and sensitive data

- Never commit `.env.local`, private keys, tokens, passwords or service-role
  credentials.
- Never print secret values in plans, traces, logs, issues or Pull Requests.
- Record variable names and validation outcomes, never their values.
- Do not copy personal form content into engineering traces.
- Sanitize command output before storing it as evidence.

## Verification gates

The primary contract is:

```bash
npm run verify
```

It must pass lint, TypeScript, unit tests, repeatable migration validation and
the production build. Run `npm run db:lint` when a reachable local Supabase
database is part of the change. Run `npm run test:coverage` for changes to
domain or application logic and record the result. Security-relevant changes
also require a dependency audit and focused permission tests.

No failed gate may be waived silently. A blocked environmental gate is recorded
as blocked, with evidence and a human-verifiable next step.

## Repair loop

Use at most three repair attempts per failing gate. Each attempt records:

- failing command and concise error;
- root-cause hypothesis;
- minimal correction;
- verification result.

Do not broaden the task merely to make a gate pass. After the third failed
attempt, stop and report the remaining failure, evidence and recommended next
step. Never loop on destructive operations or external side effects.

## Git and Pull Requests

- Start from a clean, up-to-date `main` and create a task branch.
- Never push directly to `main`.
- Make small, descriptive commits without mandatory Conventional Commit
  prefixes.
- Do not rewrite shared history or force-push without explicit approval.
- A Pull Request must link the task SPEC/plan, summarize risks and decisions,
  list verification evidence and complete the repository checklist.
- CI success is necessary but does not replace human approval.

## Traceability

For each controlled task, add a sanitized run summary under `.agent/runs/`
using the supplied template. Link the task identifier across SPEC, plan, branch,
trace and Pull Request. Store summaries and outcomes, not raw transcripts or
unbounded command logs.

## Definition of Done

A controlled task is ready for human review only when:

- its specification and acceptance criteria are satisfied;
- implementation follows the documented architecture;
- relevant tests were added or the absence is justified;
- `npm run verify` passes;
- applicable database and security gates pass;
- documentation and traceability are updated;
- no known critical security issue remains;
- the diff contains only approved scope;
- a Pull Request is ready and merge remains a human decision.

## Prohibited changes

- Inventing business data, credentials or production evidence.
- Disabling tests, lint, TypeScript, RLS or security controls to obtain a pass.
- Hiding a failed or skipped gate.
- Committing generated dependencies, build output, secrets or personal data.
- Destructive database changes without an explicit migration and approval.
- Claiming deployment, backup recovery or external delivery without evidence.
