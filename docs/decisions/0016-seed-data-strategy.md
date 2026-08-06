# 0016 — Seed data strategy

## Status

Proposed

## Context

Manga English Lab has a **small, finite** content set (3 scenarios × 3
variations) and **no admin UI** in the MVP. Content must nonetheless satisfy
strict invariants: every `speakerKey` matches a `characters[].key`
([0005](./0005-character-association-strategy.md)), panels and lines are ordered
consistently ([0009](./0009-dialogue-playback-ordering.md)), and bubble
percentages are within 0–100 ([0011](./0011-percentage-bubble-placement.md)). We
must decide how content gets into the database and how those invariants are
enforced.

## Options considered

- **Seed scripts with validation** — content authored as data and loaded by a
  script that validates speaker-key integrity, ordering, and percentage ranges
  before/at insert. Tight scope, repeatable, testable. *(chosen)*
- **An admin UI / CMS** — friendly editing and non-technical authoring, but a
  large build (auth, forms, validation UI) unjustified for a handful of scenarios.
- **Manual database inserts** — quick once, but error-prone, unrepeatable, and
  bypasses invariant checks.

## Decision

Populate content via **seed scripts that validate** speaker-key integrity,
ordering consistency, and percentage ranges, rather than building an admin UI or
CMS for the MVP.

## Rationale

The content is small and stable, so the cost of a CMS — authentication, editing
UI, server-side validation surfaces — vastly exceeds its value. Seed scripts keep
scope tight while making content **repeatable** (re-seed a fresh database
deterministically) and **safe** (the same invariants enforced by the Mongoose
schema are asserted at seed time, catching authoring errors before they reach the
app). Content-as-data also version-controls the scenarios alongside the code that
renders them.

## Positive consequences

- Minimal scope; no CMS to build or secure.
- Deterministic, repeatable database population.
- Invariants (speaker integrity, ordering, percentages) validated before insert.
- Content is versioned and reviewable in source control.

## Negative consequences

- Editing content requires code/data changes and re-running the seed, not a UI.
- Non-technical contributors cannot author content without developer help.
- Large-scale content entry would be tedious without tooling.

## Risks

- **Authoring errors** in seed data. Mitigated by the validation step mirroring
  schema constraints and by tests over the seed loader.
- **Seed and schema validation drift** apart. Mitigated by reusing the same
  Mongoose validators where possible so both enforce one source of truth.

## Conditions that would justify revisiting

- Content volume grows beyond what hand-authored seed data can manage comfortably.
- Non-technical authors need to create or edit scenarios directly.
- Content must change frequently at runtime, warranting an editing UI/CMS.
