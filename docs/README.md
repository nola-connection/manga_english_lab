# Documentation

This directory is the home for all project documentation for **Manga English
Lab**. It is organized so that product intent, architecture, decisions, testing,
and planning each have a consistent, predictable place.

## Layout

- [`product/`](./product/) — product requirements, MVP scope, user flows, and
  learning modes: *what* we are building and *why*.
- [`architecture/`](./architecture/) — system overview, frontend and backend
  architecture, data model, API contract, comic layout, playback, audio, and
  accessibility: *how* the system is designed.
- [`decisions/`](./decisions/) — Architecture Decision Records (ADRs): the
  material decisions behind the architecture, with the alternatives that were
  rejected. See the [ADR index](./decisions/README.md).
- [`testing/`](./testing/) — the test strategy and testing conventions.
- [`planning/`](./planning/) — the implementation roadmap and the GitHub issue
  plan that sequence the work.

## Architecture Decision Records

Significant decisions are recorded as ADRs under [`decisions/`](./decisions/).
Start with the [ADR index](./decisions/README.md), which lists every record and
its status and explains the numbering convention. New records copy the
[ADR template](./decisions/adr-template.md).

Any material change to the data model or architecture discovered during
implementation is captured as a **new** ADR rather than by rewriting an existing
one, so the decision history stays honest and traceable.

## Conventions

- One topic per file; keep documents focused and cross-link related material
  with relative links so they resolve on GitHub and in local checkouts.
- Prose is wrapped for readability and uses sentence-case headings, matching the
  existing documents in this tree.
