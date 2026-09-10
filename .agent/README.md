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
