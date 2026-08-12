# Glossary — Manga English Lab

A shared vocabulary of **product and domain terms** used across the product,
architecture, and planning docs. The goal is that every document uses these
words to mean exactly the same thing. This is distinct from the per-scenario
**content glossary** of English vocabulary a learner opens while reading (see
[user flows](./user-flows.md) §(h)); "glossary" in *this* file means the
definitions below.

> **Terminology rule (must-follow):** Hidden text is always called **hidden**,
> never "muted". **"Muted" refers only to audio** — a line whose character has
> `audioEnabled=false`. Text visibility and audio are independent controls, so
> conflating the two words is a defect.

## Content structure

- **Scenario** — One real-life situation of comic-style English learning (e.g.
  ordering at a restaurant). The MVP ships exactly **three** scenarios. Each
  scenario owns its characters, its variations, and its content glossary.
- **Variation** — One complete, ordered dialogue for a scenario. A scenario has
  **one or more** variations — typically **three** in the MVP content, kept under
  a soft upper bound of about five. Variations are authored alternatives, not
  dynamic branches.
- **Panel** — One finished illustration image plus one or more ordered lines. A
  variation is an ordered sequence of panels. Illustrations are finished images;
  there is no dynamic composition.
- **Line** — The atomic unit of dialogue: one **speech bubble** plus exactly one
  **audio file**, attributed to a character via its `speakerKey`.
- **Speech bubble (bubble)** — The on-illustration rendering of a line's text,
  positioned with data-driven percentages (`xPercent`, `yPercent`,
  `widthPercent`, optional `tailDirection`). A bubble is a focusable, clickable
  control during playback.
- **Character** — A participant in a scenario's conversations (e.g. `waiter`,
  `customer`), identified by a stable **character key**.
- **Content glossary** — The per-scenario list of key English vocabulary a
  learner can open while reading (term + meaning in the MVP). Not to be confused
  with *this* product-terms glossary.

## Identifiers and ordering

- **key** — A stable, human-readable semantic string inside embedded documents
  (a character key, a line's `speakerKey`). Keys are used for association within
  a scenario.
- **`_id` / `*Id`** — Reserved for real MongoDB or external identifiers, **not**
  for semantic association. See [data model](../architecture/data-model.md).
- **Reading order / playback order** — The single ordered sequence of lines.
  **DOM / reading / data order equals conversational playback order**, regardless
  of where a bubble sits on the illustration.
- **Playback cursor (global playback position)** — The single source of truth for
  "which line is current", shared by complete playback, individual-line playback,
  and resume. See [playback state](../architecture/playback-state.md).

## Per-character controls

- **`textVisible`** — Independent per-character control for whether that
  character's bubble **text is shown or hidden**. Hidden text is called
  **hidden** (never "muted").
- **`audioEnabled`** — Independent per-character control for whether that
  character's line audio **plays**. `audioEnabled=false` is what "muted" means.
- **Muted** — Shorthand for `audioEnabled=false` for a character. A **muted
  line is never skipped**: the panel stays visible, the bubble is highlighted,
  no sound plays, and the player **waits the real audio-file duration** before
  advancing.

## Learning modes

- **Read mode** — Preset: all text **visible**, all audio **on**.
- **Listen mode** — Preset: all text **hidden**, all audio **on**; the learner
  can reveal text on demand.
- **Practice mode** — Preset: the performed character's text **hidden** and audio
  **off** (muted, waits real duration); all others **visible and audible**.
  MVP ships Read + Listen; Practice ships immediately after on the same
  foundation. See [learning modes](./learning-modes.md).

## Audio

- **Dialogue audio** — Model-pronunciation audio for a line. One audio file per
  line. No TTS generation, no recognition, no assessment.
- **Background / environmental audio** — A separate **looping ambience channel**
  per scenario that plays alongside dialogue. It never blocks or overlaps dialogue
  timing and is never required to understand the conversation.
- **Mixer** — The settings control (a toggleable dropdown) that turns
  background/environmental audio on/off and adjusts the
  **dialogue-vs-environment balance**; dialogue stays dominant by default.
  See [audio](../architecture/audio-strategy.md).

## Related documents

- [product requirements](./product-requirements.md) — the full requirement set.
- [MVP scope](./mvp-scope.md) — in-scope vs. out-of-scope for the first release.
- [user flows](./user-flows.md) — the core learner journeys.
- [learning modes](./learning-modes.md) — Read / Listen / Practice presets.
