# 0010 — Reusable comic template

## Status

Proposed

## Context

Every scenario is rendered as a comic: panels with an illustration and one or
more speech bubbles positioned over the art. There are 3 scenarios, each with a
handful of variations (typically 3 in the MVP content), all sharing the same
visual grammar (a panel, bubbles with tails, a speaker). We must decide whether
the UI is built from **reusable,
data-driven components** or hand-authored per scenario. This choice governs how
much code duplication and per-content maintenance the app carries.

## Options considered

- **Data-driven reusable components** — a small set of generic components
  (`ComicPanel`, `SpeechBubble`) that render from scenario data; content controls
  all specifics. One template serves every scenario/variation. *(chosen)*
- **Hard-coded per-scenario pages** — bespoke markup for each scenario. Maximum
  layout freedom per page, but massive duplication and per-content code changes;
  every new scenario is new code.

## Decision

Render comics with **data-driven, reusable template components** — chiefly
`ComicPanel` and `SpeechBubble` — that take scenario/panel/line data as props;
no hard-coded per-scenario pages.

## Rationale

The nine conversations share one visual structure, so a single parameterized
template eliminates duplication and lets **content**, not code, drive specifics.
Adding or editing a scenario becomes a seed-data change, not a UI change, which
keeps the app maintainable and matches the seed-only content strategy
([0016](./0016-seed-data-strategy.md)). Reusable components also localize layout
concerns (bubble placement, panel scaling) so improvements apply everywhere at
once.

## Positive consequences

- One template renders all scenarios/variations; no per-scenario UI code.
- New/edited content is a data change, not a code change.
- Layout logic (placement, scaling, transitions) is centralized and consistent.
- Components are independently testable with mock data.

## Negative consequences

- The data contract between content and components must be well defined and
  stable; content cannot express layouts the template does not support.
- Highly bespoke, one-off panel treatments are harder to accommodate.

## Risks

- **A scenario needs a layout the template cannot express.** Mitigated by keeping
  the data contract expressive (percentage placement, tail direction) and
  extending the template generically rather than forking per scenario.
- **Template becomes a god-component.** Mitigated by splitting responsibilities
  (`ComicPanel` vs `SpeechBubble`) and focused hooks
  ([0013](./0013-frontend-state-management.md)).

## Conditions that would justify revisiting

- Content requires per-scenario layouts or interactions the generic template
  cannot represent.
- The single data contract starts accumulating scenario-specific special cases.
- Distinct comic styles (e.g. different genres) need fundamentally different
  rendering.
