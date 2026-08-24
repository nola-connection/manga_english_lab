/**
 * Playback state machine (MEL-050).
 *
 * A framework-agnostic, deterministic engine that drives a flattened playback
 * queue (see queue.js) through the states Idle/Playing/Paused/PlayingSelected/
 * Complete per docs/architecture/playback-state.md. It holds no DOM references
 * and performs no real audio: side effects are delegated to an injected
 * `adapter` (playLine/stop/highlight) and muted-line timing to an injected
 * `clock`, so the whole machine is unit-testable with a fake adapter + fake
 * clock (ADR-0014). A single global cursor is the source of truth; monotonic
 * play tokens plus cancel-before-play defeat stale callbacks and rapid clicks.
 */

export const State = Object.freeze({
  Idle: "Idle",
  Playing: "Playing",
  Paused: "Paused",
  PlayingSelected: "PlayingSelected",
  Complete: "Complete",
});

// Fallback duration (seconds) for a muted line whose real audio metadata is
// unavailable, so playback still advances (playback-state.md error handling).
const DEFAULT_MUTED_DURATION_SECONDS = 5;

/**
 * Create a playback engine over an ordered queue.
 *
 * @param {import('./queue.js').QueueItem[]} queue flattened playback queue
 * @param {object} deps
 * @param {{ playLine: Function, stop: Function, highlight?: Function }} deps.adapter
 *   audio side-effect adapter; `playLine(queueIndex)` starts a line, `stop()`
 *   cancels the in-flight line, `highlight(queueIndex)` marks the active line.
 * @param {{ setTimeout: Function, clearTimeout: Function }} [deps.clock]
 *   timer source for muted-line duration (defaults to the global timers).
 * @param {(seconds:number)=>void} [deps.onError] optional error sink.
 * @returns {object} engine with state/cursor/queue getters + intent methods.
 */
export function createEngine(queue, { adapter, clock, onError } = {}) {
  const items = Array.isArray(queue) ? queue : [];
  const timers = clock || { setTimeout, clearTimeout };

  let state = State.Idle;
  let cursor = 0;
  let playToken = 0;
  let mutedTimer = null;
  let lastError = null;

  function clearMutedTimer() {
    if (mutedTimer !== null) {
      timers.clearTimeout(mutedTimer);
      mutedTimer = null;
    }
  }

  // Cancel any in-flight line: stop audio/timer and invalidate outstanding
  // tokens so late ended/error callbacks are ignored (cancel-before-play).
  function cancelInFlight() {
    clearMutedTimer();
    playToken += 1;
    adapter?.stop?.();
  }

  // Start the line at the current cursor. Increments the token, highlights the
  // bubble, and either delegates to the adapter (audible) or arms a duration
  // timer that synthesizes an `ended` for muted lines.
  function startLine() {
    clearMutedTimer();
    playToken += 1;
    const token = playToken;
    const item = items[cursor];
    adapter?.highlight?.(cursor);
    if (item && item.audioEnabled === false) {
      const seconds =
        typeof item.durationSeconds === "number" && item.durationSeconds >= 0
          ? item.durationSeconds
          : DEFAULT_MUTED_DURATION_SECONDS;
      mutedTimer = timers.setTimeout(() => {
        mutedTimer = null;
        handleEnded(token);
      }, seconds * 1000);
    } else {
      adapter?.playLine?.(cursor, token);
    }
  }

  // Advance from a finished line: to the next line (Playing) or Complete.
  function advanceAfterEnded() {
    if (cursor >= items.length - 1) {
      cursor = items.length === 0 ? 0 : items.length - 1;
      state = State.Complete;
      return;
    }
    cursor += 1;
    state = State.Playing;
    startLine();
  }

  function handleEnded(token) {
    if (token !== playToken) return; // stale callback from a superseded line
    if (state === State.Playing) {
      advanceAfterEnded();
    } else if (state === State.PlayingSelected) {
      state = State.Paused; // selected line stays put; no auto-advance
    }
    // ended is a no-op in Idle/Paused/Complete per the transition table.
  }

  return {
    get state() {
      return state;
    },
    get cursor() {
      return cursor;
    },
    get queue() {
      return items;
    },
    get activeLine() {
      return items[cursor] || null;
    },
    get activePanel() {
      return items[cursor] ? items[cursor].panelIndex : 0;
    },
    get lastError() {
      return lastError;
    },
    play: () => play(),
    pause: () => pause(),
    restart: () => restart(),
    selectBubble: (i) => selectBubble(i),
    ended: (token) => handleEnded(token),
    error: (info) => error(info),
    unmount: () => unmount(),
  };

  // --- Intent handlers (declared after return via hoisting) ---

  function play() {
    if (items.length === 0) return;
    if (state === State.Complete) cursor = 0;
    state = State.Playing;
    startLine();
  }

  function pause() {
    if (state === State.Playing || state === State.PlayingSelected) {
      cancelInFlight();
      state = State.Paused;
    }
  }

  function restart() {
    if (items.length === 0) return;
    if (state === State.Idle) return; // Idle --restart--> Idle
    cancelInFlight();
    cursor = 0;
    state = State.Playing;
    startLine();
  }

  function selectBubble(i) {
    if (i < 0 || i >= items.length) return;
    cancelInFlight();
    cursor = i;
    state = State.PlayingSelected;
    startLine();
  }

  function error(info) {
    cancelInFlight();
    lastError = info ?? null;
    onError?.(info);
    // Land in a safe stopped state: Idle stays Idle, Complete stays Complete,
    // everything else parks in Paused (transition table error column).
    if (state !== State.Idle && state !== State.Complete) {
      state = State.Paused;
    }
  }

  function unmount() {
    cancelInFlight();
    state = State.Idle;
  }
}
