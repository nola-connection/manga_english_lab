# 0008 — Variation / panel / line hierarchy

## Status

Proposed

## Context

A scenario presents the same situation as several complete alternative
conversations (e.g. "polite basics", "asking for a change", "paying the bill").
Each conversation unfolds over illustrated panels, and each panel contains one or
more ordered dialogue lines. We must decide how to structure this within the
embedded Scenario document ([0004](./0004-embedded-scenario-document.md)) and how
many variations a scenario carries in the MVP. A key product fact is that these
are **complete, ordered conversations**, not branches of a decision tree.

## Options considered

- **Nested embedded arrays**
  `Scenario.variations[].panels[].dialogueLines[]`, carrying a **variable number**
  of complete variations per scenario (typically **3** in the MVP content, with a
  **soft upper bound of ~5** to bound document growth) — matches the product and
  is trivial to author and seed. *(chosen)*
- **A generic branching/dialogue-graph engine** (nodes, choices, edges) — far more
  flexible for interactive fiction, but massively over-scoped for three linear
  conversations and much harder to author and validate.
- **Flat line list with variation/panel tags** — fewer nesting levels, but loses
  the natural containment that makes rendering and validation straightforward and
  complicates ordering within panels.

## Decision

Model content as **nested embedded arrays**
`Scenario.variations[].panels[].dialogueLines[]`, with a **variable number of
variations per scenario** — typically **3** in the MVP content and kept under a
**soft upper bound of ~5** to bound document growth (not a fixed count) — each a
**complete, ordered conversation**, not a generic branching engine.

## Rationale

The nesting mirrors the product's mental model one-to-one, so seed data reads
like the content it represents and the renderer walks the tree directly. Keeping
the variation count small — a soft upper bound of ~5, typically 3 in the MVP
content — bounds document growth (supporting the embedding decision) without
enshrining a fixed count; seeding, validation, and tests treat the count as
variable within that bound. A branching engine would add nodes, edges, and
traversal logic to express something that is fundamentally a set of linear
scripts — complexity with no product payoff.

## Positive consequences

- Structure matches the product and the renderer; minimal translation logic.
- Bounded, predictable document size (a small, soft-capped variation count).
- Simple to author, seed, and validate (ordering + speaker integrity per array).
- Complete conversations are easy to reason about and test end to end.

## Negative consequences

- Not suited to interactive/branching dialogue without a redesign.
- The soft upper bound (~5 variations) must be enforced in seeding/validation,
  though the exact count stays flexible.
- Deep nesting makes some positional updates more verbose.

## Risks

- **Product wants branching later**, which this structure does not support.
  Recorded then as a superseding ADR. Monitored below.
- **Variation count exceeding the soft bound (~5).** Mitigated by seed/schema
  validation that enforces the cap while allowing any count up to it.

## Conditions that would justify revisiting

- The product introduces user choices that alter the conversation flow (true
  branching), requiring a graph model.
- The number of variations per scenario needs to grow substantially beyond the
  soft upper bound (~5).
- Panels or lines need to be shared/reused across variations, favoring references.
