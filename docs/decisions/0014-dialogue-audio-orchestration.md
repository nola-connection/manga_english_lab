# 0014 — Dialogue audio orchestration

## Status

Proposed

## Context

Playback drives a variation's dialogue in order, one line at a time, with a
single audio clip per line. Requirements make this non-trivial: only **one**
audio may play at a time; rapid interactions (clicking bubbles, play/pause) must
not produce overlapping or stale audio; and **muted lines** (`audioEnabled=false`)
are **not skipped** — they wait the **real audio-file duration** and then advance.
We also want the logic to be testable without a real browser audio element. Full
behavior is specified in
[`../architecture/playback-state.md`](../architecture/playback-state.md).

## Options considered

- **A framework-agnostic playback state machine + a thin HTMLAudio adapter** —
  the engine holds no DOM references and is unit-testable; the adapter executes
  commands and translates browser events. *(chosen)*
- **Ad-hoc effects in components** wiring `HTMLAudioElement` directly inside React
  effects — quick to start, but prone to race conditions, hard to test, and
  entangles audio with rendering.
- **A third-party audio/playback library** — batteries included, but an extra
  dependency whose model may not fit the muted-line-waits-real-duration rule.

## Decision

Implement a **framework-agnostic playback state machine** (states `Idle`,
`Playing`, `Paused`, `PlayingSelected`, `Complete`) **separated from a thin
HTMLAudio adapter**. Enforce a **single active audio**, **cancel-before-play**,
and **monotonic play tokens**; **muted lines wait the real audio-file duration**
obtained from preloaded metadata.

## Rationale

Separating a pure state machine from the audio adapter makes the hard part — the
transitions, cursor, and race-safety — **fully unit-testable without real audio**:
tests feed `ended`/`error`/`selectBubble` events and assert state and emitted
commands. Cancel-before-play plus monotonic tokens defeat overlapping audio and
late events from superseded lines, making rapid clicks safe. Waiting the real
duration for muted lines (via `preload='metadata'`) keeps timing identical across
Read/Listen/Practice instead of using an arbitrary delay. The engine binds to
React through `usePlaybackEngine` ([0013](./0013-frontend-state-management.md)).

## Positive consequences

- Deterministic, race-free playback; never two clips at once.
- Engine is unit-testable without a DOM or real audio.
- Muted-line timing matches audible timing exactly.
- Audio concerns are isolated behind an adapter, swappable if needed.

## Negative consequences

- More upfront structure than wiring audio directly in components.
- Relies on preloaded metadata being available for accurate muted-line duration.
- The engine/adapter boundary and token protocol must be understood by contributors.

## Risks

- **Missing/invalid audio metadata** could break muted-line timing. Mitigated by a
  conservative default duration fallback so playback still advances.
- **Browser autoplay restrictions** require a user gesture to start; the engine
  surfaces a "needs user gesture" error rather than failing silently.
- **Stale event listeners** across route changes. Mitigated by per-line listener
  cleanup plus the token check as a second line of defense.

## Conditions that would justify revisiting

- Playback needs advanced audio features (cross-fade, richer mixing) beyond the
  in-scope dialogue channel plus a single looping background/environmental channel
  and its settings mixer, which a thin adapter cannot cleanly provide.
- A mature audio library would clearly reduce complexity without violating the
  muted-line-duration rule.
- The state model must support new modes or non-linear traversal.
