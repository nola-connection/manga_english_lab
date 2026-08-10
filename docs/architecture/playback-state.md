# Playback State Architecture

This is the playback deliverable: how a variation's dialogue is turned into an
ordered queue and driven through a deterministic state machine that is testable
without real audio. Related: [audio-strategy.md](./audio-strategy.md),
[ADR 0014 — Dialogue Audio Orchestration](../decisions/0014-dialogue-audio-orchestration.md).

## Playback queue construction

- **Confirmed content model:** variation → `panels[]` → dialogue `lines[]`.
- **Recommended decision:** at load, **flatten** the selected variation into a
  single ordered list of lines across all panels. Each queue entry carries its
  `panelIndex`, `lineIndex`, `speakerKey`, audio URL, and back-reference to the
  bubble. Panel and line ordering follow **data order** (= DOM order = reading
  order), never visual bubble position (see
  [comic-layout-system.md](./comic-layout-system.md)).

## Global playback position (cursor)

- **Recommended decision:** a single **global cursor** (index into the flattened
  queue) is the source of truth for "where we are." The active line, active
  bubble highlight, and visible/active panel are all derived from the cursor.
- Advancing the cursor past a panel boundary triggers a panel transition; the
  layout follows the cursor (mobile auto-advance, desktop highlight/scroll).

## State model

States (**Confirmed**): `Idle`, `Playing`, `Paused`, `PlayingSelected`,
`Complete`. Events: `play`, `pause`, `ended`, `selectBubble`, `restart`,
`error`, `unmount`.

### Transition table

| From \ Event      | play                     | pause    | ended                                   | selectBubble(i)                 | restart | error    | unmount |
| ----------------- | ------------------------ | -------- | --------------------------------------- | ------------------------------- | ------- | -------- | ------- |
| **Idle**          | Playing (from cursor)    | Idle     | —                                       | PlayingSelected (cursor=i)      | Idle    | Idle*    | Idle    |
| **Playing**       | Playing                  | Paused   | advance; Playing, or Complete at end    | PlayingSelected (cursor=i)      | Playing (cursor=0) | Paused* | Idle |
| **Paused**        | Playing (resume cursor)  | Paused   | —                                       | PlayingSelected (cursor=i)      | Playing (cursor=0) | Paused* | Idle |
| **PlayingSelected** | Playing (resume cursor) | Paused | Paused (stay on selected line)          | PlayingSelected (cursor=i)      | Playing (cursor=0) | Paused* | Idle |
| **Complete**      | Playing (cursor=0)       | Complete | —                                       | PlayingSelected (cursor=i)      | Playing (cursor=0) | Complete* | Idle |

\* `error` surfaces a non-fatal error, cancels the in-flight line, and lands in a
safe stopped state (see error handling). `unmount` always tears everything down.

## Behaviors

- **Play:** begin at the current cursor. Play the active line's audio, highlight
  its bubble, and on `ended` advance the cursor to the next line; advance the
  panel when the current panel is exhausted. At end of variation, enter
  `Complete`.
- **Pause:** stop the active audio, keep the cursor; `Play` resumes from it.
- **Restart-from-beginning:** set cursor to 0 and play from the top.
- **End-of-conversation:** on the last line's `ended`, transition to `Complete`;
  the final bubble may remain highlighted. `Play` from `Complete` restarts.
- **Individual bubble playback (`selectBubble`):** clicking a bubble sets the
  **global cursor** to that line, enters `PlayingSelected`, and plays only that
  line. **Confirmed:** the clicked bubble becomes the global position, so
  pressing `Play` afterward **resumes complete playback from that selected line**.
- **Active-line highlighting:** derived from the cursor + state; exactly one line
  is active at a time.
- **Panel transitions:** derived from the cursor's `panelIndex`; the layout
  reacts, playback does not depend on layout.

## Muted-character (audioEnabled=false) behavior

- **Confirmed requirement:** an `audioEnabled=false` line is **not skipped**. The
  panel is visible, the bubble is active + highlighted, **no audible sound**
  plays, and the engine **waits the natural audio-file duration**, then advances.
- **Recommended decision:** obtain the real duration from **preloaded metadata**
  (`preload='metadata'`, see [audio-strategy.md](./audio-strategy.md)) and drive
  a timer for exactly that duration — **do not use a fixed arbitrary delay**.
- This keeps Practice mode timing identical to Listen/Read mode timing.

## Avoiding conflicting audio and race conditions

- **Single active audio:** at most one dialogue line is ever playing.
- **Cancel-before-play:** every transition that starts a line first cancels the
  in-flight line (stop audio / clear timer / detach listeners).
- **Monotonic play tokens:** each start increments a token; `ended`/`timeout`
  callbacks are ignored unless their token is current. This defeats late events
  from a superseded line and makes rapid clicks safe.
- **Rapid repeated clicks:** debounced/cancelled via the token mechanism — the
  latest `selectBubble` wins; earlier in-flight lines are discarded.

## Lifecycle and hazards

- **Audio cleanup:** on pause, restart, new line, error, route change, and
  unmount, the adapter stops audio, clears timers, and removes listeners.
- **Route changes / component unmount:** the `unmount` event tears down the
  engine and adapter deterministically; no audio survives navigation.
- **Stale event listeners:** listeners are attached per-line and removed on
  cancel; the token check is the second line of defense.
- **Browser autoplay restrictions:** playback **requires a user gesture** to
  start (the first `Play` / bubble click). Documented as a constraint; the engine
  surfaces a "needs user gesture" error rather than silently failing.
- **Error handling (missing/invalid audio):** a load/`error` event cancels the
  line, emits `error`, and lands in a safe stopped state; the UI can show an
  inline message. For `audioEnabled=false`, missing metadata falls back to a
  conservative default duration so playback still advances.

## Testable separation from browser audio

- **Recommended decision:** the **engine is a framework-agnostic state machine**
  (`playback/engine.js`) that consumes events and emits transitions/commands
  (`playLine(i)`, `stop`, `highlight(i)`, `advance`). It holds no DOM references.
- A thin **HTMLAudio adapter** (`playback/audioAdapter.js`) executes commands and
  translates browser events (`ended`, `error`, `timeupdate`) back into engine
  events. See [audio-strategy.md](./audio-strategy.md).
- Because the engine only deals with plain events and tokens, it is **fully
  unit-testable without real audio** — tests feed `ended`/`error`/`selectBubble`
  and assert cursor + state + emitted commands.
- `usePlaybackEngine` (see [frontend-architecture.md](./frontend-architecture.md))
  binds the engine to React and the adapter.

## Open questions

- **Open question:** whether `Complete` keeps the last bubble highlighted or
  clears highlighting after a short delay.
- **Deferred decision:** cross-fade or gap timing between lines (currently a hard
  cut) — see [audio-strategy.md](./audio-strategy.md).
