# Architecture Decision Records

This directory records the significant architecture and design decisions for
**Manga English Lab**. Each record is a short, self-contained Markdown file that
captures *what* was decided, *why*, and *what we traded away*.

## What is an ADR?

An **Architecture Decision Record (ADR)** is a lightweight document describing a
single decision that shapes the system: the context that forced the decision,
the options considered, the option chosen, and the consequences of choosing it.
ADRs are **immutable history** — once a decision is Accepted we do not silently
rewrite it. If reality changes, we write a *new* ADR that supersedes the old one.

The value is honesty and traceability: a reader (a future maintainer, a
reviewer, or an interviewer) can see not only the current design but the
reasoning and the rejected alternatives behind it.

## When to write one

Write an ADR when a decision is **material** — it is expensive to reverse, it
constrains other work, or it would surprise a competent engineer who was not in
the room. Examples: the persistence model, embedding vs referencing, the API
paradigm, the state-management approach, the deployment topology.

Do **not** write an ADR for routine, easily-reversible choices (a variable name,
a small helper's internal shape). Prefer a code comment or a PR description
there.

> **Rule for implementation:** any **material change to the data model or the
> architecture** discovered *during implementation* MUST be recorded as a **new
> ADR** here. Planning docs under [`../architecture/`](../architecture/) point to
> these ADRs as the authoritative decision record; they are not amended in place
> to hide a reversal.

## Numbering scheme

Files are named `NNNN-title.md`, where `NNNN` is a zero-padded, monotonically
increasing integer assigned in the order decisions are proposed (e.g.
`0004-embedded-scenario-document.md`). Numbers are **never reused**; a superseded
ADR keeps its number and gains a `Superseded by NNNN` note.

## Statuses

- **Proposed** — drafted and under consideration; not yet ratified.
- **Accepted** — ratified; the decision is in force.
- **Superseded** — replaced by a later ADR (which is referenced by number). The
  original text is retained for history.

All ADRs in this initial planning set are **Proposed**: they represent the
intended design captured before implementation begins.

## Template

New records copy [`adr-template.md`](./adr-template.md), which defines the
standard sections used across every ADR in this directory.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](./0001-repository-structure.md) | Repository structure | Proposed |
| [0002](./0002-javascript-vs-typescript.md) | JavaScript vs TypeScript | Proposed |
| [0003](./0003-rest-vs-graphql.md) | REST vs GraphQL | Proposed |
| [0004](./0004-embedded-scenario-document.md) | Embedded Scenario document | Proposed |
| [0005](./0005-character-association-strategy.md) | Character association strategy | Proposed |
| [0006](./0006-subdocument-id-strategy.md) | Subdocument `_id` strategy | Proposed |
| [0007](./0007-semantic-key-naming.md) | Semantic key naming | Proposed |
| [0008](./0008-variation-panel-line-hierarchy.md) | Variation / panel / line hierarchy | Proposed |
| [0009](./0009-dialogue-playback-ordering.md) | Dialogue playback ordering | Proposed |
| [0010](./0010-reusable-comic-template.md) | Reusable comic template | Proposed |
| [0011](./0011-percentage-bubble-placement.md) | Percentage bubble placement | Proposed |
| [0012](./0012-mobile-single-panel.md) | Mobile single-panel layout | Proposed |
| [0013](./0013-frontend-state-management.md) | Frontend state management | Proposed |
| [0014](./0014-dialogue-audio-orchestration.md) | Dialogue audio orchestration | Proposed |
| [0015](./0015-static-media-strategy.md) | Static media strategy | Proposed |
| [0016](./0016-seed-data-strategy.md) | Seed data strategy | Proposed |
| [0017](./0017-free-tier-deployment.md) | Free-tier deployment | Proposed |

## Related documentation

- [`../architecture/`](../architecture/) — the architecture deliverables these
  decisions realize (data model, playback, layout, deployment).
- [`../product/`](../product/) — product requirements and MVP scope that frame
  the decisions.
