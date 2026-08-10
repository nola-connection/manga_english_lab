# Audio Strategy

How dialogue audio is loaded, timed, and cleaned up, and how background/
environmental audio and its mixer attach. Related:
[playback-state.md](./playback-state.md),
[ADR 0014 — Dialogue Audio Orchestration](../decisions/0014-dialogue-audio-orchestration.md),
[ADR 0015 — Static Media Strategy](../decisions/0015-static-media-strategy.md).

## Scope

- **Confirmed requirement:** each dialogue line has **one audio file**.
- **Recommended decision (MVP):** a **single active dialogue channel** — at most
  one dialogue line is audible at any moment — running alongside a separate
  **looping background/environmental channel**. The two channels are combined by a
  lightweight **mixer** exposed as a toggleable dropdown in the settings (see
  [Background / environmental audio (in MVP)](#background--environmental-audio-in-mvp)).
- Audio is referenced by URL/path only; files are static assets (see
  [deployment.md](./deployment.md)).

## Metadata loading and duration

- **Recommended decision:** create audio elements with `preload='metadata'` so
  the browser fetches enough to expose `audio.duration` without downloading the
  full clip up front. Duration is the timing source for advancing lines.
- **Recommended decision:** preload metadata for a variation's lines when it is
  selected (or lazily, just ahead of the cursor) so durations are known before a
  line becomes active. Cache duration by audio URL.
- **Assumption:** durations are stable per file; if metadata is unavailable, fall
  back to a conservative default duration so playback still advances (see error
  handling and [playback-state.md](./playback-state.md)).

## Timing a muted-character line without audible sound

**Confirmed requirement:** an `audioEnabled=false` line still occupies its real
duration — the panel is visible, the bubble is active/highlighted, no sound is
heard, and playback advances **after the natural audio-file duration**, never a
fixed arbitrary delay.

**Decision — metadata + timer:** read `audio.duration` from the preloaded
metadata and run a timer for that duration; never call `play()`. This is the
cleanest to unit-test (the engine just receives a `timeout` event that mirrors
`ended`).

**Rejected alternative — muted element:** actually `play()` a `muted` audio
element and rely on its `ended` event for timing. It offers simpler event
symmetry, but muted autoplay policies vary and it does real network/decode work
for no audible benefit. Not chosen; revisit only if metadata-only `duration`
proves unreliable in practice (see Open questions).

Either way, the playback engine treats the completion signal identically to a
normal `ended` event, so muted and audible lines share one code path.

## Autoplay policy

- **Confirmed constraint:** browsers block audio until a **user gesture**. The
  first `Play` press or bubble click is that gesture; after it, subsequent lines
  in the same session may play programmatically.
- **Recommended decision:** never attempt audio on mount or route load. Surface a
  clear "press play to start" affordance; if a programmatic `play()` is rejected,
  emit an `error` the UI can explain (see [accessibility.md](./accessibility.md)).

## Error handling for missing/invalid audio

- On a load/`error` event: cancel the line, emit `error` to the engine, and land
  in a safe stopped state (per [playback-state.md](./playback-state.md)).
- For `audioEnabled=false` lines with missing metadata, use the conservative
  default duration so the sequence never stalls.
- **Recommended decision:** surface inline, non-blocking messaging rather than
  throwing; a single broken clip must not break the whole conversation.

## Caching

- **Recommended decision (MVP):** rely on standard HTTP caching for static audio
  plus an in-memory `Map` of URL → duration.
- **Recommended decision (MVP):** register a **service worker** that caches static
  assets (comic images, dialogue and environmental audio, app shell) so revisited
  scenarios load quickly and tolerate flaky connections. Scope it to versioned,
  URL-addressed static media; the API JSON is not required to be offline-first for
  the MVP.
- **Deferred decision:** full offline play of every scenario and cache-eviction
  tuning beyond a simple versioned cache.

## Cleanup and lifecycle

- The HTMLAudio adapter owns all elements/timers/listeners and tears them down on
  pause, restart, new line, error, route change, and unmount (single source of
  cleanup; see the token/cancel-before-play rules in
  [playback-state.md](./playback-state.md)).

## Background / environmental audio (in MVP)

**Confirmed requirement:** background/environmental noise (restaurant chatter,
traffic, museum crowds, station noise) is **part of the MVP**. It plays on a
**separate looping channel** beside dialogue and must never be required to
understand the conversation.

- **Mixer in settings:** dialogue and environmental levels are combined by a
  lightweight mixer surfaced as a **toggleable dropdown in the settings**.
  Learners can turn background audio on/off and adjust the balance; the default
  keeps dialogue clearly dominant.
- **Reset to default:** the mixer includes a **reset-to-default button** that
  restores all audio settings (on/off state and dialogue/environment balance) to
  their default values in one action.
- **Multiple audio channels:** a dialogue channel and an `environmentChannel` run
  in parallel. The engine isolates "start a line" behind adapter commands, so the
  parallel, looping environmental channel does not change dialogue orchestration.
- **Independent volumes:** `dialogueVolume` and `environmentVolume` are adapter
  settings driven by the mixer; the state machine stays volume-agnostic.
- **Master mute:** a single flag applied at the adapter over all channels.
- **Scenario-appropriate sounds:** an environmental track referenced per scenario
  (URL/path), loaded like dialogue audio and cached by the service worker.
- **Autoplay / gestures:** environmental audio reuses the same user-gesture gate;
  it starts only after the first Play/bubble gesture.
- **Cleanup / route changes / pausing:** the adapter teardown covers all channels
  with no engine changes.
- **Accessibility:** environmental audio is disable-able from the mixer and never
  required to understand dialogue (see [accessibility.md](./accessibility.md)).
- **Deferred decision — persisted preferences:** remembering mixer settings across
  sessions (local storage) is a follow-up, isolated in the adapter/settings layer,
  not the domain model. See
  [ADR 0014](../decisions/0014-dialogue-audio-orchestration.md).

## Open questions

- **Open question:** reliability of `metadata`-only `duration` across target
  browsers — validate during playback prototyping.
- **Open question:** whether to prefetch full audio for the active variation or
  stream on demand; depends on typical clip sizes and hosting bandwidth (see
  [deployment.md](./deployment.md)).
