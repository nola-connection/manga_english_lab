# Product Requirements — Manga English Lab

Comic-style English-learning web app for **beginner TEFL learners**. Learners
read and listen to short, illustrated real-life conversations presented as comic
panels with speech bubbles and model-pronunciation audio.

> **Label key:** _Confirmed requirement_ · _Recommended decision_ ·
> _Assumption_ · _Deferred decision_ · _Open question_.

## 1. Overview & Goals

- **Confirmed requirement:** Teach everyday spoken English through finished,
  hand-authored comic conversations — not a generic branching engine.
- **Confirmed requirement:** Ship a credible MERN (MongoDB, Mongoose, Express,
  React + Vite, Node) portfolio project using JavaScript ES modules, React
  Router, a REST API, and native React state with custom hooks (no Redux).
- **Recommended decision:** Optimize first for a polished, small content set
  over breadth, so playback and comic UX feel finished.

## 2. Target User

- **Confirmed requirement:** Beginner TEFL learners who benefit from visual
  context, controllable audio, and the ability to hide/reveal text.
- **Assumption:** Learners are self-directed; no teacher account or classroom
  management is part of this product (see [MVP scope](./mvp-scope.md)).

## 3. Confirmed Learner UX Capabilities

Learners can:

1. View the list of scenarios and open one.
2. Pick a variation and view its comic panels.
3. Progress through panels; read speech bubbles.
4. Hide/reveal text (per character; see §5).
5. Play, pause, restart the **complete** conversation.
6. Click a bubble to play that single line.
7. Resume complete playback **from a selected bubble**.
8. See the **active bubble highlighted** during playback.
9. Enable/disable audio per character (see §5).
10. Open a glossary of key vocabulary.

All capabilities are **keyboard-accessible** — see
[accessibility](../architecture/accessibility.md).

## 4. Content Hierarchy

- **Confirmed requirement:** Exactly **3 scenarios**
  (ordering-at-a-restaurant, buying-museum-tickets, asking-for-directions).
- **Confirmed requirement:** Each scenario has **exactly 3** complete, ordered
  dialogue **variations** (no dynamic branching).

```
Scenario
 ├─ characters (key, e.g. "waiter", "customer")
 ├─ variations (exactly 3, ordered)
 │   └─ panels (ordered)
 │       ├─ illustration image (one finished image; no dynamic composition)
 │       └─ dialogue lines (one or more, ordered)
 │           └─ line = speech bubble + one audio file (speakerKey)
 └─ glossary (key vocabulary)
```

- **Confirmed requirement:** A **panel** is one finished illustration image plus
  one or more ordered lines.
- **Confirmed requirement:** A **line** is one speech bubble + one audio file.
- **Terminology:** `key` is a stable semantic string inside embedded docs
  (character key, line `speakerKey`); reserve `_id`/`*Id` for real
  MongoDB/external identifiers.
- **Confirmed requirement:** Bubble placement is data-driven percentages
  (`xPercent`, `yPercent`, `widthPercent`, optional `tailDirection`).
- **Confirmed requirement:** DOM/reading/data order **equals** conversational
  playback order, independent of visual bubble position.

See [data model](../architecture/data-model.md) and
[comic layout](../architecture/comic-layout-system.md).

## 5. Per-Character Controls (`textVisible` / `audioEnabled`)

- **Confirmed requirement:** Each character has **independent** `textVisible` and
  `audioEnabled` controls. Never refer to hidden text as "muted".
- **Confirmed requirement — muted line waits real duration:** When
  `audioEnabled=false`, lines are **not skipped**. The panel stays visible, the
  bubble is highlighted, no sound plays, and the player **waits the real
  audio-file duration** before advancing.

## 6. Playback Capabilities

- **Confirmed requirement:** Play / pause / restart the complete conversation.
- **Confirmed requirement:** Click a bubble to play that individual line.
- **Confirmed requirement:** Resume complete playback from a selected bubble
  (the selection becomes the global playback position).
- **Confirmed requirement:** The active line's bubble is highlighted.
- **Recommended decision:** The playback engine is a framework-agnostic state
  machine with an audio adapter boundary — see
  [playback state](../architecture/playback-state.md) and
  [audio](../architecture/audio-strategy.md).

## 7. Learning Modes (summary)

- **Confirmed requirement:** Read, Listen, Practice modes, expressed purely
  through per-character `textVisible`/`audioEnabled` defaults.
- **Recommended decision:** MVP ships Read + Listen; Practice ships immediately
  after on the same foundation. Full detail in
  [learning modes](./learning-modes.md).

## 8. Accessibility (part of MVP)

- **Confirmed requirement:** Accessibility is in scope for MVP: keyboard
  operation of all controls, focus management, visible active-line indication,
  and screen-reader-friendly structure. Details and acceptance criteria live in
  [accessibility](../architecture/accessibility.md).

## 9. Non-Functional Requirements

- **Confirmed requirement:** Responsive web, **desktop-primary**; mobile fully
  functional (single-panel navigation with auto-advance).
- **Recommended decision:** Media (images, audio) stored as URLs/paths only; no
  binaries in MongoDB. Seed data, no admin UI.
- **Deferred decision:** Background/environmental audio is future-only; the
  architecture must not block it but MVP does not implement it.
- **Open question:** Target browser matrix and minimum mobile viewport width.

## 10. Explicitly Out of Scope (MVP)

See [mvp-scope.md](./mvp-scope.md) for the full non-goals list (accounts, auth,
payments, AI/TTS generation, pronunciation assessment, speech recognition,
admin/CMS, native apps, gamification, analytics, generic branching).
