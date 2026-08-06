# Learning Modes — Manga English Lab

The three learning modes — **Read**, **Listen**, **Practice** — are not separate
engines. Each mode is simply a **preset of per-character `textVisible` and
`audioEnabled` defaults** applied on top of the same playback foundation. See
[product requirements](./product-requirements.md) and
[playback state](../architecture/playback-state.md).

> **Label key:** _Confirmed requirement_ · _Recommended decision_ ·
> _Deferred decision_.

## 1. Read Mode

- **Confirmed requirement:** All text **visible**, all audio **on**.
- Purpose: lowest-effort comprehension — the learner reads and hears every line.
- Behavior: complete playback highlights each line and plays its audio; every
  bubble shows its text.

## 2. Listen Mode

- **Confirmed requirement:** All text **hidden**, all audio **on**; the learner
  can **reveal** text on demand.
- Purpose: listening practice with visual/comic context but without reading the
  words first.
- Behavior: bubbles are highlighted and audio plays as normal; the learner may
  reveal a specific character's text (or an individual bubble) at any time. This
  uses the same per-character `textVisible` control described below.

## 3. Practice Mode

- **Confirmed requirement:** The learner **picks a character to perform**. That
  character's text is **hidden** and its `audioEnabled` is **off**; all other
  characters remain **visible and audible**.
- **Confirmed requirement — muted practice lines wait natural duration:** Because
  the performed character's `audioEnabled=false`, their lines are **not
  skipped** — the panel stays visible, the bubble is highlighted, no sound plays,
  and the player **waits the real audio-file duration**, giving the learner the
  natural time window to say the line, before advancing.
- Purpose: the learner voices one role in time with the rest of the
  conversation.

## 4. Modes Map Onto Per-Character Controls

- Every mode resolves to the same two independent per-character controls:
  `textVisible` and `audioEnabled`.
- Modes only set **defaults**; a learner can still adjust individual characters
  afterward (e.g., reveal one line in Listen mode).
- Hidden text is always called **hidden**, never "muted"; "muted" refers only to
  `audioEnabled=false`.

### Mode → Default Settings

| Mode     | `textVisible` (default) | `audioEnabled` (default)                         |
| -------- | ----------------------- | ------------------------------------------------ |
| Read     | All characters: **on**  | All characters: **on**                           |
| Listen   | All characters: **off** (learner can reveal) | All characters: **on**       |
| Practice | Performed character: **off**; others: **on** | Performed character: **off**; others: **on** |

## 5. Why Practice Ships Right After MVP

- **Recommended decision:** MVP ships **Read + Listen**; **Practice** ships
  immediately after, on the **same foundation**.
- **Confirmed requirement:** Per-character `textVisible`/`audioEnabled` and the
  muted-line-waits-real-duration behavior are required in the MVP foundation
  regardless of when Practice's UI ships. Practice therefore adds only a
  character-picker and mode framing — **no new playback mechanics**.
- **Deferred decision:** Practice-specific polish (performance prompts, clearer
  "your turn" cues) is deferred but designed for; nothing in the data model or
  playback engine blocks it.

## 6. Timing Rule (applies to all modes)

Whenever a line's character has `audioEnabled=false`, the playback engine treats
the line as a **silent wait of the real audio-file duration**. This keeps
conversational pacing identical whether a line is heard or performed. The engine
learns the duration through the audio adapter boundary — see
[audio](../architecture/audio-strategy.md) and
[playback state](../architecture/playback-state.md).
