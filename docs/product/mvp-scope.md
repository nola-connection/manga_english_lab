# MVP Scope — Manga English Lab

Defines what the first shippable version includes, what it explicitly excludes,
and what is intentionally deferred but designed for. See
[product requirements](./product-requirements.md) for the full requirement set.

> **Label key:** _Confirmed requirement_ · _Recommended decision_ ·
> _Deferred decision_ · _Non-goal_.

## 1. In Scope (MVP)

- **Confirmed requirement:** 3 scenarios × 3 complete ordered variations
  (ordering-at-a-restaurant, buying-museum-tickets, asking-for-directions).
- **Confirmed requirement:** Comic playback of a complete conversation:
  play / pause / restart, per-line audio on bubble click, resume from a selected
  bubble, active-line highlight. See
  [playback state](../architecture/playback-state.md).
- **Confirmed requirement:** **Read** and **Listen** learning modes. See
  [learning modes](./learning-modes.md).
- **Confirmed requirement:** Per-character `textVisible` / `audioEnabled`
  controls foundation (independent per character; muted lines wait real audio
  duration). This foundation is required now even though Practice mode ships
  right after MVP.
- **Confirmed requirement:** Glossary of key vocabulary per scenario.
- **Confirmed requirement:** Responsive layout — desktop-primary, mobile
  functional with single-panel navigation and auto-advance.
- **Confirmed requirement:** Accessibility (keyboard operation, focus
  management, active-line indication). See
  [accessibility](../architecture/accessibility.md).
- **Recommended decision:** Seed data loads the content; no admin UI. Media
  referenced by URL/path only (no binaries in Mongo).
- **Confirmed requirement:** Background/environmental audio per scenario on a
  separate looping channel, with a **mixer** (dialogue-vs-environment balance and
  on/off) as a **toggleable dropdown in the settings**. Dialogue stays dominant by
  default, and background audio is never required to understand the conversation.
  See [audio](../architecture/audio-strategy.md).
- **Recommended decision:** A **service worker** caches static assets (comic
  images, dialogue and environmental audio, app shell) so revisited scenarios load
  quickly and tolerate flaky connections. See
  [audio](../architecture/audio-strategy.md#caching).

## 2. Out of Scope / Explicit Non-Goals

The following are **non-goals** for MVP (and mostly for the project as a
portfolio piece):

- User or teacher accounts, authentication, session management.
- Payments or subscriptions.
- AI / TTS audio generation.
- Pronunciation assessment and scoring.
- Speech recognition.
- Admin dashboard, CMS, or content-authoring UI.
- Native mobile apps.
- Gamification (points, streaks, badges).
- Multiple proficiency tracks / adaptive levels.
- Generic dialogue branching engine.
- Analytics / behavioral tracking.

Dialogue audio is **model pronunciation only** — no recognition, no assessment,
no TTS. (Background/environmental audio is a separate ambience channel, in scope
for MVP — see §1.)

## 3. Deferred but Designed For

- **Deferred decision — Practice mode polish:** The per-character controls
  foundation fully supports Practice now; Practice-specific UX (character picker,
  performance framing) ships immediately after MVP on the same foundation.
- **Deferred decision — persisted mixer preferences:** Background/environmental
  audio ships in MVP (see §1); remembering the learner's mixer settings across
  sessions (local storage) is a follow-up isolated in the adapter/settings layer.
  See [audio](../architecture/audio-strategy.md).
- **Deferred decision — richer glossary fields:** MVP glossary is minimal
  (term + meaning); part-of-speech, examples, and per-line linking are future
  enhancements.
- **Open question:** Additional scenarios/variations beyond the initial 3×3.

## 4. Definition of Done for MVP

- [ ] All 3 scenarios seeded, each with exactly 3 complete ordered variations.
- [ ] Each panel renders one finished illustration with data-driven bubble
      placement; reading order equals playback order.
- [ ] Complete-conversation playback works: play, pause, restart.
- [ ] Clicking a bubble plays that line; playback can resume from that line as
      the new global position; active line is highlighted.
- [ ] Per-character `textVisible` and `audioEnabled` work independently.
- [ ] Muted lines (`audioEnabled=false`) wait the real audio-file duration
      before advancing (never skipped).
- [ ] Read and Listen modes select the correct per-character defaults.
- [ ] Background/environmental audio plays per scenario; the settings mixer
      toggles it and adjusts the dialogue-vs-environment balance, with dialogue
      dominant by default.
- [ ] A service worker caches static assets (images, audio, app shell) so
      revisited scenarios load quickly.
- [ ] Glossary is viewable per scenario.
- [ ] Responsive: desktop multi-panel and mobile single-panel with auto-advance.
- [ ] All controls keyboard-operable; active line announced/indicated per
      [accessibility](../architecture/accessibility.md).
- [ ] REST API serves published scenarios by slug with ordered dialogue.
- [ ] Test strategy satisfied for critical behaviors, including one end-to-end
      learner journey. See [test strategy](../testing/test-strategy.md).

## 5. Milestones

MVP work maps to milestones **M1..M14** (see the planning docs). Testing types
map to **M12** and later; the single Playwright e2e journey is the final gate
before the MVP is considered done.
