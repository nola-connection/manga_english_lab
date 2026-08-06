# 0007 — Semantic key naming

## Status

Proposed

## Context

The data model mixes two very different kinds of identifiers: **real database or
external identifiers** (MongoDB `_id`, and any future third-party ids) and
**stable semantic strings** used within embedded documents to name and associate
content (a character's `key`, a variation's `key`, and the line-to-character
`speakerKey`). Conflating the two — for example, inventing sequential integer
ids to imitate a relational database — produces dishonest, confusing names. We
need a naming convention that makes the distinction obvious at a glance.

## Options considered

- **Uniform `id` naming for everything** — familiar, but hides whether a value is
  a real database identifier or a human-authored semantic string, and tempts
  contributors to invent fake sequential ids.
- **Semantic `key` for stable strings; reserve `_id`/`*Id` for real
  identifiers** — names encode intent; no fake ids. Requires discipline and a
  documented rule. *(chosen)*

## Decision

Use **`key`** for stable semantic strings within embedded documents and
**`speakerKey`** for the line→character association. **Reserve `_id` and the
`*Id` suffix for real MongoDB or external identifiers.** Do **not** introduce
sequential integer ids to imitate a relational database.

## Rationale

Honest naming makes the model self-documenting: a reader immediately knows that
`character.key` is an author-chosen, human-meaningful string safe to write in
seed data and reference from `speakerKey`, whereas `_id` is a
server/external-generated identifier. Reserving the `*Id` suffix for real
identifiers prevents the anti-pattern of faking relational-style integer keys in
a document database, which would mislead maintainers and invite brittle
assumptions about ordering or uniqueness semantics.

## Positive consequences

- Names communicate identity semantics without needing to consult docs.
- No misleading fake ids; the model reads honestly to experienced engineers.
- `speakerKey` clearly signals a semantic association, not a database join by id.

## Negative consequences

- Requires ongoing discipline and review to keep the convention consistent.
- Two vocabularies (`key` vs `_id`/`*Id`) must be learned by contributors.

## Risks

- **Convention drift** — someone introduces an `xId` for a semantic string or a
  `key` for a real identifier. Mitigated by this ADR, the data-model docs, and
  code review.
- **Key collisions** within a scenario if `key` values are not unique. Mitigated by
  seed-time validation ([0016](./0016-seed-data-strategy.md)).

## Conditions that would justify revisiting

- Semantic keys must become globally unique or externally referenceable, blurring
  the line with real identifiers.
- Integration with an external system imposes its own id naming that conflicts
  with this convention.
- The team grows and a stricter, tool-enforced naming lint is warranted.
