# 0006 — Subdocument `_id` strategy

## Status

Proposed

## Context

Within the embedded Scenario document ([0004](./0004-embedded-scenario-document.md)),
Mongoose by default assigns an `_id` to every subdocument in an array. That is
sometimes useful (a stable server-generated handle for positional updates,
deep-links, and test assertions) and sometimes noise (meaningless ids on
entities whose identity is already carried by a semantic `key` or by array
position). We need a deliberate, documented policy rather than accepting the
default uniformly.

## Options considered

- **Keep auto `_id` on every subdocument** — uniform and simple, but litters
  lines, characters, and glossary entries with ids that carry no meaning and bloat
  the document.
- **Disable auto `_id` everywhere** (`{ _id: false }`) — leanest documents, but
  removes stable handles from Variation and Panel, which are the natural targets
  of nested updates and deep-links.
- **Selective policy** — keep auto `_id` on **Variation** and **Panel**; disable
  it on **characters**, **dialogue lines**, and **glossary entries**, whose
  identity is a semantic `key` or array position. *(chosen)*

## Decision

**Keep Mongoose's auto `_id` on `Variation` and `Panel` subdocuments**; disable
`_id` on `characters`, `dialogueLines`, and `glossary` entries and identify those
by semantic `key` (characters) or array position + `order` (lines, glossary).

## Rationale

Variation and Panel are the units addressed by positional updates, deep-links,
and tests, so a stable server-generated handle earns its keep there. Dialogue
lines, characters, and glossary entries are always read and edited **in the
context of their parent**, so their identity is better expressed by a meaningful
`key` (see [0007](./0007-semantic-key-naming.md)) or by their position + `order`
(see [0009](./0009-dialogue-playback-ordering.md)). Assigning identity
deliberately avoids both meaningless ids and the loss of useful handles.

## Positive consequences

- Stable, addressable handles exactly where nested updates and links need them.
- Leaner documents free of meaningless ids on leaf entities.
- Identity semantics are explicit and documented rather than accidental.

## Negative consequences

- The identity rule is non-uniform and must be understood by contributors.
- A dialogue line cannot be addressed by its own top-level id — it is reached via
  its panel's `_id` plus the line's `order`/position.

## Risks

- **A future feature needing per-line global references** would be blocked by the
  absence of a line `_id`. Reintroducing it (or a line `key`) is a **material
  change** and warrants a new ADR. Monitored below.
- **Reliance on array position** for line identity is sensitive to reordering,
  mitigated by explicit `order` fields ([0009](./0009-dialogue-playback-ordering.md)).

## Conditions that would justify revisiting

- Nested update patterns require a stable per-line handle (e.g. optimistic UI keyed
  by line id, or concurrent edits to individual lines).
- Lines, characters, or glossary entries must be referenced from outside their
  parent scenario.
- Deep-linking granularity needs to reach an individual line rather than a panel.
