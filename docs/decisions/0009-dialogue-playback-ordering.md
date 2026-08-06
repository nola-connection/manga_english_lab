# 0009 — Dialogue playback ordering

## Status

Proposed

## Context

Playback walks a variation in reading order: panel by panel, and within each
panel, line by line ([`../architecture/playback-state.md`](../architecture/playback-state.md)).
Because content lives in nested embedded arrays
([0008](./0008-variation-panel-line-hierarchy.md)), MongoDB and Mongoose already
preserve array order. The question is whether array order alone should be the
authority for sequencing, or whether we also store explicit `order` fields. This
matters for correctness (a mis-ordered conversation is a bug the user hears) and
for testability.

## Options considered

- **Array order only** — rely solely on stored array position for sequencing.
  Minimal fields, but silent to accidental reordering and awkward to assert intent
  in tests.
- **Explicit `order` field only** — sort by an integer on read and ignore array
  position. Robust to reordering, but adds a sort step and lets array order and
  `order` disagree unnoticed.
- **Array order as source of truth *plus* explicit integer `order` fields** on
  panels and lines, with a validator asserting the two agree. Slight redundancy,
  but robust and self-documenting. *(chosen)*

## Decision

Treat **array order as the source of truth** for sequencing, and **additionally
store explicit integer `order` fields** on panels and dialogue lines; a validator
asserts array position and `order` are consistent.

## Rationale

Array order is what the renderer and playback engine naturally consume, so it is
the authority. The explicit `order` field makes sequencing intent visible in seed
data, enables detection of accidental reordering (position vs `order`), gives
deterministic and readable test assertions, and provides a stable sort key if an
array is ever reconstructed from a query. Keeping both — and validating their
agreement — captures the benefits of each without letting them silently diverge.

## Positive consequences

- Renderer/engine consume natural array order with no extra sort in the hot path.
- Accidental reordering in seed data is caught by the consistency validator.
- Tests assert sequencing against explicit integers, not fragile positions.
- A reliable sort key exists if content is ever re-queried out of order.

## Negative consequences

- Redundant information (position and `order`) must be kept in agreement.
- Authors must set `order` correctly in seed data, an extra bookkeeping step.

## Risks

- **Drift between array order and `order`** if the validator is bypassed. Mitigated
  by running the consistency check at document validation and in seed scripts
  ([0016](./0016-seed-data-strategy.md)).
- **Ambiguity if both were treated as authoritative.** Avoided by naming array
  order the single source of truth and `order` a redundant safeguard.

## Conditions that would justify revisiting

- Content must support reordering at runtime where a stable per-line handle and
  `order`-based sorting become the primary mechanism.
- The consistency constraint proves too costly to maintain and one representation
  should become authoritative.
- Playback needs non-linear traversal that pure sequence ordering cannot express.
