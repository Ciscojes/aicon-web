# UI-017 — Visual quality and security

## Status

Approved scope by user on 2026-11-06; implementation in progress.

## Problem

PR #17 fails dependency security and SonarCloud maintainability gates. Decorative elevation remains inconsistent.

## Objective

Validate and integrate the restrained interface without losing behavior.

## Scope

CSS cascade repairs, dependency security updates, responsive review and evidence.

## Out of scope

Database, providers, deployment and new product functions.

## Functional requirements

Preserve catalog links, metric links, status labels and keyboard focus.

## Non-functional requirements

Keep reduced motion effective; remove specificity conflicts; retain every quality gate.

## Acceptance criteria

Verify contract passes; SonarCloud passes; desktop and mobile layouts preserve actions and content.

## Architectural constraints

Existing modular monolith; no schema or permission changes.

## Testing strategy

npm run verify; auditable wrapper; desktop/mobile rendering and keyboard inspection; npm audit.

## Authority and approvals

User explicitly requested repairs and merge after all checks pass. Dependency updates are justified by the failing audit: Next.js critical vulnerability and vulnerable transitive tools.
