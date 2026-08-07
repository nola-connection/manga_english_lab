# Accessibility

Accessibility is **part of the MVP**, not a later add-on. This document defines
accessibility requirements for the comic reader and how they resolve the tension
between visually positioned bubbles and semantic dialogue order. Related:
[comic-layout-system.md](./comic-layout-system.md),
[playback-state.md](./playback-state.md).

## Principles

- **Confirmed requirement:** the app must be usable without hearing audio and
  without a mouse.
- **Recommended decision:** DOM order = data order = playback order is the single
  rule that keeps reading, keyboard, screen-reader, and playback order aligned.

## Keyboard navigation and focus

- All interactive elements (scenario cards, variation selector, play/pause/
  restart, per-character controls, speech bubbles, prev/next) are **semantic
  `<button>`s** (or links for navigation), reachable and operable by keyboard.
- **Visible focus styles** on every interactive element; never remove outlines
  without an equally visible replacement.
- **Logical focus order** follows the DOM, which follows dialogue order.
- **Focus on panel change:** when playback or navigation changes the visible
  panel, move focus predictably (e.g. to the panel container or its first bubble)
  and avoid trapping or losing focus. **Recommended decision:** do not steal
  focus mid-typing; only manage focus in response to user-initiated navigation.

## Names, roles, and semantics

- Every control has an **accessible name** (visible label or `aria-label`), e.g.
  "Play conversation", "Restart", "Hide text for Aki", "Turn off audio for Aki".
- **Confirmed terminology:** text visibility controls are labeled *hide/show
  text*, **never "mute"**; audio controls are separate and labeled as audio.
- Speech bubbles are buttons with names like "Play line: <text or speaker>".

## Screen-reader dialogue order and announcements

- Because bubbles are emitted in **conversational order** in the DOM (absolute
  positioning is purely visual), a screen reader reads dialogue in the correct
  order regardless of on-panel placement.
- **Recommended decision:** announce the active line via a **polite `aria-live`**
  region (e.g. speaker + line text) as the cursor advances, so non-visual users
  track playback. Keep announcements concise to avoid flooding.
- **Assumption:** live-region announcements are throttled to one per line change.

## Images and panels

- **Confirmed requirement:** each panel image needs a **text alternative**.
  Provide descriptive `alt` conveying the scene; if a panel is purely decorative
  relative to text already present, mark it `alt=""` (decorative handling).
- **Recommended decision:** author panel descriptions as content so `alt` is
  meaningful, not auto-generated filenames.

## Hidden text and reveal controls

- **Confirmed requirement:** hiding text preserves bubble shape/position (see
  [comic-layout-system.md](./comic-layout-system.md)).
- **Recommended decision:** when text is visually hidden via `visibility`/
  `opacity`, also apply `aria-hidden="true"` to the hidden text so screen readers
  don't read Listen/Practice content the learner is meant to recall — but the
  **reveal control** itself stays focusable with a clear name and state
  (`aria-pressed`), and revealing restores both visual and screen-reader text.

## Audio-independent use

- **Confirmed requirement:** no user should need to hear audio to navigate or
  understand structure. Text alternatives (bubble text when shown, `alt`,
  live-region announcements, visible active-line highlight) cover this.
- Autoplay is gated on a user gesture (see
  [audio-strategy.md](./audio-strategy.md)); the "press play" affordance is
  keyboard-accessible and clearly labeled.

## Visual design

- **Sufficient contrast** for text, bubble borders, controls, and the active-line
  highlight (target WCAG AA). The highlight must not rely on color alone —
  pair it with an outline/weight change.
- **Reduced motion:** respect `prefers-reduced-motion`; panel transitions and
  any bubble animation degrade to instant or minimal movement.

## Loading and error states

- **Confirmed requirement:** clear, accessible loading and error states from the
  data-fetching layer (see [frontend-architecture.md](./frontend-architecture.md)).
  Errors are announced and actionable (retry), not silent.
- **Recommended decision:** the landing page's **cold-start loading message** (see
  [frontend-architecture.md](./frontend-architecture.md)) lives in an
  `aria-live="polite"` region so screen-reader users hear why the first load may
  take a moment; it announces without stealing or trapping focus.

## Mobile / touch

- **Recommended decision:** touch targets meet a minimum size (~44×44 CSS px) for
  bubbles, controls, and prev/next. Controls remain accessible without obscuring
  the single visible panel.

## Resolving positioning vs. order conflicts

The core tension: bubbles are **absolutely positioned** for visual effect, but
several orderings must agree. Resolution:

| Concern              | Source of truth              |
| -------------------- | ---------------------------- |
| Visual bubble order  | percentage coordinates (visual only) |
| DOM order            | data/dialogue order          |
| Reading order (SR)   | DOM order                    |
| Keyboard focus order | DOM order                    |
| Playback order       | flattened queue = data order |
| Panel changes        | driven by playback cursor    |

Because DOM = data = playback order and visual position is decoupled, all
non-visual orderings are consistent by construction; panel changes during
playback follow the cursor, and focus management (above) keeps keyboard users
oriented.

## Testable a11y checklist

- [ ] Full flow operable by keyboard only (select scenario → variation → play →
      pause → restart → click a bubble → resume).
- [ ] Visible focus on every interactive element.
- [ ] All controls have accessible names; text control never says "mute".
- [ ] Screen reader reads bubbles in conversational order.
- [ ] Active line announced via `aria-live` on advance.
- [ ] Panel images have meaningful `alt`; decorative panels use `alt=""`.
- [ ] Hidden text is `aria-hidden`; reveal control focusable with correct state.
- [ ] App usable with audio off / muted characters (no info lost).
- [ ] Contrast meets AA; active-line highlight not color-only.
- [ ] `prefers-reduced-motion` honored.
- [ ] Loading/error states announced and actionable.
- [ ] Touch targets ≥ ~44px; controls don't obscure the panel on mobile.
- [ ] Focus behaves logically when panels change during playback.

## Open questions

- **Open question:** exact `aria-live` verbosity (speaker only vs. full line).
- **Deferred decision:** captions/transcript export for full conversations.
