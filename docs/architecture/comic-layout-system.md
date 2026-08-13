# Comic Layout System

Architecture for rendering comic pages, panels, and speech bubbles. This is the
comic-layout deliverable. Related: [accessibility.md](./accessibility.md),
[ADR 0010 — Reusable Comic Template](../decisions/0010-reusable-comic-template.md),
[ADR 0011 — Percentage Bubble Placement](../decisions/0011-percentage-bubble-placement.md),
[ADR 0012 — Mobile Single-Panel](../decisions/0012-mobile-single-panel.md),
[ADR 0018 — Variation Layout Template](../decisions/0018-variation-layout-template.md).

## Design approach: reusable templates, not hard-coded pages

- **Recommended decision:** panels render through reusable **templates** that
  control border, aspect ratio, dimensions, spacing, responsive behavior, bubble
  styling, active-line highlighting, and navigation. A page is data (a list of
  panels) composed by a template, never a bespoke hand-laid component.
- **Confirmed requirement:** each panel is **one finished illustration image**.
  There is no runtime composition of background + character layers.
- Bubbles are the only dynamic overlay; they are positioned with **data-driven
  percentages** so the same image scales cleanly across viewports.

## Named layout templates

- **Recommended decision:** each variation declares which template renders it via
  `variation.layoutTemplate` (see [data-model.md](./data-model.md)). The value is
  a **named template** from a small closed catalog, so the frontend knows up front
  **how many panels to expect** and their **dimensions/arrangement** before any
  image loads.
- **Template catalog (MVP):**

  | `layoutTemplate` | Panels | Arrangement |
  |---|---|---|
  | `single`   | 1 | one full-width panel |
  | `two-up`   | 2 | two panels side by side (stacked on mobile) |
  | `grid-2x2` | 4 | 2×2 grid |
  | `grid-2x3` | 6 | 2 columns × 3 rows |

- **Panel-count agreement:** a variation's `panels.length` **must** equal the
  count its `layoutTemplate` declares; this is enforced by a validator (see
  [data-model.md](./data-model.md)), so malformed content is caught before
  render. The count-per-template map is the shared source of truth between seed
  validation and the template.
- Per-panel **dimensions** (aspect-ratio boxes) and grid gaps are template
  constants, not per-panel data — consistent with the reserved aspect-ratio box
  below. Adding a new template (a new enum value + its cell definition) is a
  deliberate, ADR-recorded change
  ([ADR 0018](../decisions/0018-variation-layout-template.md)).

## Speech-bubble coordinate model

Conceptual shape (illustrative, **not final**):

```json
{ "xPercent": 65, "yPercent": 12, "widthPercent": 28, "tailDirection": "bottom-right" }
```

### What xPercent / yPercent anchor

- **Recommended decision:** `xPercent`/`yPercent` are the **top-left corner** of
  the bubble box, expressed as a percentage of panel width/height. Rationale:
  top-left maps directly to CSS `left`/`top` on an absolutely positioned element,
  makes clamping trivial (`left + width <= 100`), and matches how content authors
  reason about "start the bubble here, let it grow down/right."
- **Alternative considered — center anchor:** anchoring at the bubble center reads
  naturally for "point at the mouth" placement, but it complicates clamping
  (must account for half-width/half-height on both sides) and interacts poorly
  with content-driven height. Rejected for the MVP; revisit only if authoring
  proves top-left unintuitive. **Deferred decision.**

### Width and height

- **Recommended decision:** `widthPercent` is a percentage of **panel width**.
- **Recommended decision:** **height is content-driven** (intrinsic to the text).
  The bubble sets width, then grows in height to fit its content. Storing height
  would fight text length, font metrics, and localization. **Confirmed** that
  text hiding must not change the reserved box (see below).

### Tail direction

- **Recommended decision:** `tailDirection` belongs in stored content. It is a
  **diagonal** semantic hint — one of `"top-left"`, `"top-right"`, `"bottom-left"`,
  `"bottom-right"` — naming the corner the tail points toward, since a bubble
  typically sits diagonally offset from its speaker. The template maps it to a
  tail style.

## Validation, clamping, and overflow

- **Recommended decision:** validate on ingest that `xPercent`, `yPercent`,
  `widthPercent` are numbers in **0–100**; reject/flag out-of-range content.
- **Recommended decision:** at render, **clamp** so a bubble never extends beyond
  the panel: enforce `xPercent + widthPercent <= 100` and apply a `max-width`
  tied to the panel box. A small safe-margin (e.g. keep bubbles within 2–4% of
  edges) is a template constant, not per-bubble data.
- **Text wrapping:** text **wraps within the fixed bubble width** — the bubble
  never widens to fit a long word or line. Words break at normal word boundaries
  (standard soft wrapping); the template does not force character-level breaks in
  the MVP. Because width is fixed, wrapping is fully determined by `widthPercent`,
  the panel size, and font metrics, so the same content wraps consistently at a
  given viewport.
- **Text expansion:** because width is fixed and height is content-driven, longer
  text (more wrapped lines) grows the bubble **downward**. Authors budget vertical
  space via `yPercent`. Extremely long lines are a content problem surfaced by the
  "very long text" test config below, not a layout special case.

## Hidden text preserves shape (no layout shift)

- **Confirmed requirement:** hiding text must **preserve the speech-bubble shape
  and position** — no layout shift.
- **Recommended decision:** hide text with `visibility: hidden` / `opacity: 0`
  (and `aria-hidden` handling per [accessibility.md](./accessibility.md)), never
  by removing the node. The bubble box, tail, and reserved space remain, so the
  panel is visually identical whether text is shown or hidden. This directly
  supports Listen and Practice learning modes.

## Active-line highlighting

- **Confirmed requirement:** the currently playing line/bubble is **visually
  highlighted** so learners can follow along. The template applies an
  active-state style (e.g. border/glow emphasis and dimming of inactive bubbles)
  to the bubble whose line matches the playback cursor.
- **Recommended decision:** the active state is **driven solely by the playback
  cursor** (the active `panel`/`line`), not by hover or DOM position, so exactly
  one bubble is highlighted at a time and it stays in sync with audio. When the
  cursor moves to a bubble in another panel, the layout follows it (see
  [playback-state.md](./playback-state.md) and Panel navigation below).
- The active-state style must meet contrast requirements and respect
  `prefers-reduced-motion` (see [accessibility.md](./accessibility.md)).

## Reading order is independent of visual position

- **Confirmed requirement:** **DOM order = data order = playback order**, fully
  independent of where a bubble sits visually.
- **Recommended decision:** `SpeechBubble` elements are emitted in dialogue order
  in the DOM; absolute positioning (`left`/`top` from percentages) is *purely
  visual* and never reorders the DOM. A bubble visually near the bottom-left can
  still be the first line spoken. This keeps screen-reader and keyboard order
  aligned with conversational order (see
  [playback-state.md](./playback-state.md) and
  [accessibility.md](./accessibility.md)).

## Responsive layout

- **Desktop / large tablet:** the `ComicPage` template lays out **multiple
  panels** in a comic-page grid within a sensible max content width. The active
  panel/bubble is clearly indicated.
- **Small tablet / mobile:** **one panel at a time**, scaled to viewport width
  with aspect ratio preserved (no cropping). Percentage bubbles are preserved
  unchanged. Prev/next navigation is provided, and during complete playback the
  visible panel **auto-advances** to follow the active line. Controls stay
  accessible without obscuring the panel.
- **Recommended decision:** the same panel/bubble template renders in both modes;
  only the container (page grid vs single-panel viewport) differs. This is why no
  breakpoint-specific bubble coordinates are needed.
- **Deferred decision:** breakpoint-specific bubble coordinates are a **fallback**
  used only if testing proves the single percentage system insufficient. Document
  mobile as functional, readable single-panel use — not full desktop parity.
- **Deferred decision — within-scenario pagination:** a variation can hold more
  panels than fit comfortably on one screen. On desktop the `ComicPage` may
  **paginate a variation across multiple comic pages** (prev/next page controls)
  rather than one unbounded scroll; on mobile the single-panel prev/next already
  paginates panel-by-panel. During complete playback, page turns follow the
  playback cursor just like panel transitions. The exact page-size heuristic
  (panels per page) is settled during layout prototyping. A larger
  `layoutTemplate` (e.g. `grid-2x3`) is the primary driver for paging, since its
  panel count is what may exceed one screen. This is distinct from catalog
  pagination of the scenario **list** (see
  [api-contract.md](./api-contract.md#pagination)).

## Panel navigation and playback-driven changes

- Manual prev/next changes the visible panel (mobile) or scrolls/highlights
  (desktop).
- During complete playback, panel transitions are **driven by the playback
  cursor**: when the active line moves to a new panel, the layout follows it.
  Focus behavior on panel change is defined in
  [accessibility.md](./accessibility.md).

## Keyboard and screen-reader behavior for panels/bubbles

The layout is operable without a mouse and comprehensible without sight; the full
specification lives in [accessibility.md](./accessibility.md) and the layout
template implements it as follows:

- **Keyboard:** speech bubbles and prev/next panel controls are semantic
  `<button>`s reachable and operable by keyboard; focus order follows DOM order
  (= playback order). Activating a bubble plays its line. On panel change (manual
  or playback-driven), focus moves predictably to the new panel container or its
  first bubble rather than being lost.
- **Screen reader:** because bubbles are emitted in conversational order in the
  DOM, a screen reader reads dialogue in the correct order regardless of visual
  placement. Each panel image carries descriptive `alt`; each bubble button has
  an accessible name; the active line is announced via a polite `aria-live`
  region on advance. Hidden text applies `aria-hidden="true"` so it is not read
  while the bubble box is preserved — hidden text is never "muted".

## Image loading and layout-shift avoidance

- **Recommended decision:** each `ComicPanel` reserves an **aspect-ratio box**
  (CSS `aspect-ratio`) sized before the image loads, so bubbles can be positioned
  against a stable box and the page does not reflow when images arrive.
- **Recommended decision:** lazy-load off-screen panels on desktop; eager-load
  the active panel on mobile. Provide `alt` text per panel (see accessibility).

## Representative panel configurations to test

- Single line, centered bubble.
- Two lines from two characters in one panel.
- Bubble near each edge and each corner (validates clamping).
- Very long text (validates content-driven height + overflow handling).
- Hidden text (validates shape/position preservation, no layout shift).
- Each diagonal `tailDirection` value (`"top-left"`, `"top-right"`,
  `"bottom-left"`, `"bottom-right"`).
- Each `layoutTemplate` (`single`, `two-up`, `grid-2x2`, `grid-2x3`), including a
  mismatch case where `panels.length` disagrees with the template (must fail
  validation).

## Open questions

- **Open question:** exact safe-margin percentage and tail geometry per direction.
- **Open question:** whether desktop uses a fixed grid or a flow of panel rows —
  to be settled during layout prototyping.
