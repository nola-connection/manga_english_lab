# 0018 — Variation layout template

## Status

Proposed

## Context

Every scenario renders as a comic through **reusable, data-driven template
components** ([0010](./0010-reusable-comic-template.md)), and a **variation** is
one complete, ordered conversation composed of panels
([0008](./0008-variation-panel-line-hierarchy.md)). A variation is **not** fixed
to a single screen: its panels may span **multiple comic pages** via
within-scenario pagination. To render it the frontend must know, before any image
loads, **how many panels to expect** and their **dimensions/arrangement** — so it
can reserve aspect-ratio boxes, lay out the grid, and page the panels across
screens without layout shift (see
[`../architecture/comic-layout-system.md`](../architecture/comic-layout-system.md)).

Nothing in the model captured this today: panel arrangement was implicit in
`panels.length`, leaving the template to guess the grid and giving seed authoring
no way to declare intent or catch mismatched content. We need a field, and must
decide **where** it lives and **how** it is typed.

## Options considered

- **Named template enum on the variation** *(chosen)* — `variation.layoutTemplate`
  is a required string from a small closed catalog (`single`, `two-up`,
  `grid-2x2`, `grid-2x3`). Each name implies a fixed panel count and cell layout,
  enabling a panel-count validator. Trade-off: adding a template is a deliberate
  schema (enum) change.
- **Free-form template string on the variation** — same placement, no enum. More
  extensible, but loses the panel-count validation and lets typos through.
- **Per-panel layout field** — each panel names its own cell/template. Fits
  bespoke one-off panels, but does not capture the overall variation-level
  arrangement and spreads one variation-level concern across many subdocuments.
- **Infer arrangement from `panels.length`** — no field at all. Zero authoring
  cost, but the template must guess (e.g. is 4 a 2×2 grid or a 1×4 strip?) and
  authors cannot express or validate intent.

## Decision

Add a **required `layoutTemplate` string** to `VariationSchema`, constrained by an
**enum** of named templates (`single`, `two-up`, `grid-2x2`, `grid-2x3`). A
document-level validator asserts each variation's `panels.length` equals the panel
count its template declares. The count-per-template map is the single source of
truth shared by seed validation and the layout template.

## Rationale

A variation owns its whole ordered panel set, so the arrangement is a
**per-variation** concern — this is the natural home for the field, not the
panel. One template governs the variation's grid; when the panels exceed one
screen the renderer **pages that same arrangement across multiple comic pages**
(within-scenario pagination), so the field stays at the variation level even
though a variation may render as several pages. Naming templates (vs. a bare
count or a free string) makes author intent explicit, keeps a bare count from
being ambiguous (4 → 2×2, not 1×4), and — because the catalog is closed — lets a
validator reject content whose panel count does not fit its template *before* it
reaches the renderer, matching the project's "validate the whole tree in one
document" posture ([0004](./0004-embedded-scenario-document.md)). It also fits
the semantic-string convention already used for `key`/`speakerKey`
([0007](./0007-semantic-key-naming.md)) rather than inventing IDs.

## Positive consequences

- The frontend knows panel count and arrangement up front — reserve boxes, build
  the grid, and page long variations with no layout shift.
- Malformed content (panel count ≠ template) is caught at validation, not render.
- Author intent is explicit and self-documenting in seed data.
- The template catalog stays centralized and consistent across all scenarios.

## Negative consequences

- Adding a new arrangement requires an enum change **and** a matching cell
  definition in the template — a small, deliberate, ADR-recorded step.
- Content cannot express arrangements outside the catalog without extending it.

## Risks

- **A scenario needs an arrangement the catalog lacks.** Mitigated by keeping the
  catalog small but growable; a new value is a generic template extension, not a
  per-scenario fork (consistent with [0010](./0010-reusable-comic-template.md)).
- **Template map drifts between validator and renderer.** Mitigated by keeping a
  single count-per-template map as the shared source of truth.

## Conditions that would justify revisiting

- Panels need individually distinct cells/sizes within a variation (would
  motivate a per-panel layout field alongside or instead of this one), or a
  single variation needs to switch arrangements from one page to the next (would
  motivate a per-page layout grouping rather than a per-variation field).
- The catalog grows large or churns often enough that a closed enum becomes a
  maintenance burden (would motivate a free-form key plus a template registry).
- Arrangement needs to vary by breakpoint beyond what one template can express.
