# 0012 — Mobile single-panel layout

## Status

Proposed

## Context

On desktop, a variation can be shown as a multi-panel comic page. On phones and
small tablets, a full comic page would shrink panels and bubble text below
legibility. The illustrations are finished, fixed-aspect assets
([0015](./0015-static-media-strategy.md)) with percentage-positioned bubbles
([0011](./0011-percentage-bubble-placement.md)), and we are not commissioning
separate mobile artwork or building a native app. We must decide how the comic
reads on small screens.

## Options considered

- **One panel at a time**, scaled to viewport width with aspect ratio preserved,
  percentage bubbles preserved, prev/next navigation, and auto-advance during
  playback. Legible, reuses the same art and data. *(chosen)*
- **Shrink the full comic page** to fit width — no new UI, but panels and text
  become too small to read.
- **Separate mobile artwork / re-flowed layouts** — best-looking, but requires
  producing new assets per panel and significant extra design work.
- **A native mobile app** — best UX ceiling, but far out of scope for a web
  portfolio MVP.

## Decision

On mobile and small tablets, render **one panel at a time**, scaled to viewport
width with **aspect ratio preserved** and **percentage bubbles preserved**,
providing **prev/next navigation** and **auto-advance during playback**.

## Rationale

Showing a single panel keeps the art and its bubble text at a readable size while
reusing the exact same illustrations, percentage placement, and playback engine
as desktop — no new artwork and no separate coordinate system. Prev/next plus
auto-advance during playback preserve the reading and listening flow. This
delivers a genuinely usable mobile experience within the constraints of a
web-only MVP, rather than an unreadable shrunk page or an expensive bespoke
mobile design.

## Positive consequences

- Panels and bubble text stay legible on small screens.
- Reuses existing art, percentage placement, and the playback engine unchanged.
- Auto-advance keeps playback continuous; prev/next supports manual reading.
- No additional assets or native app required.

## Negative consequences

- The at-a-glance, whole-page comic experience of desktop is lost on mobile
  (an honest limitation, not a full-fidelity port).
- Multi-panel visual composition and cross-panel context are not visible at once.
- Users must navigate between panels to see the full conversation.

## Risks

- **Panel transitions feel disjointed** vs a continuous page. Mitigated by
  auto-advance synced to playback and clear prev/next affordances.
- **Very tall/wide aspect ratios** may leave large empty margins. Mitigated by
  width-based scaling and aspect preservation; acceptable for the MVP.

## Conditions that would justify revisiting

- Product invests in mobile-specific artwork or re-flowed multi-panel layouts.
- Usage data shows single-panel navigation harms comprehension or engagement.
- A native or PWA experience becomes a goal beyond the web MVP.
