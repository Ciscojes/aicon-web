# Agentic engineering workspace

This directory contains the lightweight, versioned evidence for agent-assisted
engineering in Aicon. It complements the product SPEC files under `docs/`; it
does not replace them or contain application runtime code.

## Lifecycle

1. Start from an approved product SPEC or create a task SPEC from
   `templates/spec-template.md`.
2. Create `.agent/plans/<TASK-ID>-<slug>.md` before implementation.
3. Work on a dedicated branch and run the repository quality gates.
4. Record the sanitized result in `.agent/runs/<TASK-ID>/summary.md`.
5. Open a Pull Request for human review.

Task specifications that are narrower than the product SPEC live in
`.agent/specs/` and use `templates/spec-template.md`.

## Naming

- Task identifiers: `AEH-001`, `CAT-012`, `CRM-004`.
- Plans: `.agent/plans/AEH-001-agent-governance-foundation.md`.
- Runs: `.agent/runs/AEH-001/summary.md`.
- Branches: `chore/AEH-001-agent-governance` or an equivalent descriptive name.

## Evidence rules

Store concise summaries of commands, outcomes, affected files and repair
attempts. Never store raw environment files, secrets, credentials, personal
data, cookies, access links or unbounded logs.

Templates are intentionally Markdown so they remain readable in GitHub and in
an academic review without proprietary tooling.

## Auditable verification

Run the wrapper from a task branch after focused tests:

```bash
npm run agent:verify -- --task AEH-002 --attempt 1
```

Use `--db-lint` for database tasks only after confirming local Supabase is
reachable. The command invokes the existing `verify` contract, audits high and
critical dependency findings, stops at the first failed gate and writes an
immutable JSON result under `.agent/runs/<TASK-ID>/`.

The JSON contains metadata only. Terminal output is deliberately not captured.
After a failure, add the diagnosis and minimal correction to `summary.md` before
using the next attempt number. A fourth attempt is invalid.
