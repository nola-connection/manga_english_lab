# 0011 — Percentage bubble placement

## Status

Proposed

## Context

Speech bubbles sit on top of a finished panel illustration and must stay
correctly positioned as the panel scales across viewport sizes (desktop comic
page down to a single mobile panel, see [0012](./0012-mobile-single-panel.md)).
The illustration art is fixed; only the overlay is ours to position. We need a
coordinate system for bubbles that is responsive by construction and simple to
author in seed data ([0016](./0016-seed-data-strategy.md)).

## Options considered

- **Percentage-based placement** relative to the panel box —
  `{ xPercent, yPercent, widthPercent, tailDirection }`, height content-driven.
  Scales with the panel automatically; no per-breakpoint coordinates. *(chosen)*
- **Absolute pixel coordinates** — precise on one size, but break on any scaling
  and require separate coordinates per breakpoint.
- **Breakpoint-specific coordinate sets** — accurate per size, but multiply the
  authoring burden and are tedious to keep consistent.

## Decision

Position bubbles with **percentages relative to the panel**:
`{ xPercent, yPercent, widthPercent, tailDirection }`, **anchored at the bubble
box top-left**, with **height content-driven**. Percentages are **validated to
0–100** and the rendered box is **clamped within the panel**.

## Rationale

Because the art scales as a unit, expressing bubble position and width as
percentages of the panel makes the overlay scale with it automatically — one set
of coordinates works at every size, eliminating breakpoint-specific math.
Top-left anchoring is the simplest mental model for authors and maps directly to
CSS positioning; letting height follow content avoids guessing text metrics.
Validation (0–100) and clamping keep bubbles inside the panel even if seed data
is slightly off. Center-anchoring was considered but top-left is simpler to author
and reason about.

## Positive consequences

- Responsive with a single coordinate set; no per-breakpoint tuning.
- Simple, human-authorable numbers in seed data.
- Validation + clamping keep bubbles on-panel and guard bad input.
- Content-driven height avoids brittle fixed sizing across text lengths.

## Negative consequences

- Very long text in a narrow `widthPercent` can grow tall and crowd the art.
- Percentages give less pixel-perfect control than absolute coordinates.
- Top-left anchoring can feel less intuitive than center for some placements.

## Risks

- **Text overflow / overlap** at extreme sizes or long strings. Mitigated by
  content-driven height, clamping, and authoring guidance; a pixel fallback is
  **deferred**, not adopted.
- **Author error** placing bubbles off-panel. Mitigated by 0–100 validation and
  runtime clamping.

## Conditions that would justify revisiting

- Testing shows percentages are insufficient for legible placement on real art,
  justifying the deferred fallback (e.g. min/max pixel bounds or center-anchor).
- Bubbles need rich, art-aware anchoring (attach to a character's mouth region).
- Authoring at scale demands a visual placement tool rather than raw percentages.
