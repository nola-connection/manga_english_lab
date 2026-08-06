# 0004 — Embedded Scenario document

## Status

Proposed

## Context

The core content of Manga English Lab is a **Scenario**, whose hierarchy is
`characters[]` plus `variations[]` (exactly 3) → `panels[]` → dialogue
`lines[]`, with an embedded `glossary[]`. Reads dominate: rendering an exercise
means loading one scenario in full. The content set is small and finite (3
scenarios, 3 variations each, a handful of panels and lines), and there is no
admin UI generating writes. We must choose how to lay this hierarchy out in
MongoDB. Full analysis lives in
[`../architecture/domain-model-options.md`](../architecture/domain-model-options.md).

## Options considered

- **Fully-embedded single Scenario document** — characters, variations, panels,
  lines, and glossary all embedded in one document; a scenario is one
  `findOne({ slug })`. Larger documents and more involved nested updates, but
  read-optimal and self-contained. *(chosen)*
- **Referenced collections** — split variations (and possibly panels) into their
  own collections keyed by `scenarioId`, joined via multiple queries or
  `$lookup`. Easier isolated child updates, but multi-query reads,
  cross-collection integrity checks, and risk of drift.

## Decision

Model each scenario as a **single fully-embedded MongoDB document** containing
its characters, variations → panels → dialogue lines, and glossary.

## Rationale

The content is **bounded and stable**, which is the textbook case for embedding.
Reads are the dominant operation and collapse to a single query returning a
**client-ready** payload that maps directly onto both the REST endpoint
([0003](./0003-rest-vs-graphql.md)) and the comic renderer. Validation and seed
integrity (speaker-key references, ordering, percentage ranges) live in one
schema and one document, eliminating cross-collection drift. Referencing would
add query and integrity complexity to solve scaling problems this dataset does
not have.

## Positive consequences

- One query renders an exercise; the response needs no assembly.
- Whole-tree validation in a single schema; no cross-collection integrity gaps.
- Seed data is one object per scenario, easy to author and review.
- No duplication or parent/child drift.

## Negative consequences

- Documents are relatively large (though well within Mongo's 16 MB limit).
- Nested updates require positional operators / array filters and are more
  involved than updating a standalone child document.
- A single line cannot be addressed by its own top-level id (see
  [0006](./0006-subdocument-id-strategy.md)).

## Risks

- **Unbounded growth** if content per scenario expands far beyond expectations.
  Mitigated by the fixed "exactly 3 variations" rule
  ([0008](./0008-variation-panel-line-hierarchy.md)) and small panel/line counts.
- **Awkward nested writes** if editing granularity increases. Acceptable for a
  seed-only, read-dominant MVP; monitored below.

## Conditions that would justify revisiting

- Content per scenario grows large or unbounded, pushing document size or making
  nested updates painful.
- Cross-scenario reuse of sub-entities (e.g. shared characters) becomes a
  requirement, favoring referenced collections.
- Write frequency or granularity rises such that isolated child updates outweigh
  the single-read benefit — recorded then as a superseding ADR.
