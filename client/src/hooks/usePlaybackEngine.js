/**
 * React binding for the playback engine (MEL-052).
 *
 * Wraps the framework-agnostic state machine (playback/engine.js / MEL-050) and
 * the HTMLAudio adapter (playback/audioAdapter.js / MEL-051) into a React hook,
 * per docs/architecture/frontend-architecture.md. The engine and adapter own the
 * behavior (states, cursor, cancel-before-play, real audio); this hook only
 * mirrors the engine's `state`/`cursor` into React state so components re-render,
 * routes intent callbacks (`play`/`pause`/`restart`/`selectBubble`) into the
 * engine, and forwards the adapter's `ended`/`error` events back to it. The
 * active line, active panel, and bubble highlight are all derived from the cursor
 * (playback-state.md). `createAudio`/`clock` are injectable so the hook is
 * testable without real browser audio.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createEngine, State } from "../playback/engine.js";
import { createAudioAdapter } from "../playback/audioAdapter.js";

/**
 * Bind a flattened playback queue to React.
 *
 * @param {import('../playback/queue.js').QueueItem[]} queue ordered queue
 * @param {object} [options]
 * @param {()=>HTMLAudioElement} [options.createAudio] audio element factory
 *   (injectable for tests; defaults to real HTMLAudio inside the adapter).
 * @param {{ setTimeout: Function, clearTimeout: Function }} [options.clock]
 *   timer source for muted-line duration (injectable for tests).
 * @returns {{ state: string, cursor: number, activeLine: object|null,
 *   activePanelIndex: number|null, isPlaying: boolean, play: Function,
 *   pause: Function, restart: Function, selectBubble: (i:number)=>void }}
 */
export function usePlaybackEngine(queue, options = {}) {
  const { createAudio, clock } = options;
  const items = useMemo(() => (Array.isArray(queue) ? queue : []), [queue]);

  const engineRef = useRef(null);
  const [snapshot, setSnapshot] = useState({ state: State.Idle, cursor: 0 });

  useEffect(() => {
    const sync = () => {
      const engine = engineRef.current;
      if (engine) setSnapshot({ state: engine.state, cursor: engine.cursor });
    };
    // The adapter's browser events feed back into the engine, then we mirror the
    // engine's new state/cursor into React so highlight + controls stay in sync.
    const adapter = createAudioAdapter(items, {
      onEnded: (token) => {
        engineRef.current?.ended(token);
        sync();
      },
      onError: (info) => {
        engineRef.current?.error(info);
        sync();
      },
      createAudio,
    });
    // Muted lines advance on the engine's own timer (no adapter event), so wrap
    // the clock to mirror the engine into React after each timer-driven advance;
    // otherwise the highlight would stall on muted lines (playback-state.md).
    const baseClock = clock || { setTimeout, clearTimeout };
    const syncedClock = {
      setTimeout: (fn, ms) =>
        baseClock.setTimeout(() => {
          fn();
          sync();
        }, ms),
      clearTimeout: (id) => baseClock.clearTimeout(id),
    };
    const engine = createEngine(items, { adapter, clock: syncedClock });
    engineRef.current = engine;

    // Preload metadata/duration ahead of the cursor so durations are known
    // before a line becomes active (audio-strategy.md).
    adapter.preload(items.map((item) => item.audioUrl).filter(Boolean));
    sync();

    return () => {
      engine.unmount();
      adapter.teardown();
      engineRef.current = null;
    };
  }, [items, createAudio, clock]);

  // Run an engine intent, then mirror the resulting state/cursor into React.
  const run = useCallback((intent) => {
    const engine = engineRef.current;
    if (!engine) return;
    intent(engine);
    setSnapshot({ state: engine.state, cursor: engine.cursor });
  }, []);

  const play = useCallback(() => run((e) => e.play()), [run]);
  const pause = useCallback(() => run((e) => e.pause()), [run]);
  const restart = useCallback(() => run((e) => e.restart()), [run]);
  const selectBubble = useCallback(
    (i) => run((e) => e.selectBubble(i)),
    [run],
  );

  // Highlight/active state is derived from the cursor, but suppressed in Idle so
  // nothing is highlighted before the first play (playback-state.md).
  const showActive = snapshot.state !== State.Idle;
  const activeLine = showActive ? (items[snapshot.cursor] ?? null) : null;

  return {
    state: snapshot.state,
    cursor: snapshot.cursor,
    activeLine,
    activePanelIndex: activeLine ? activeLine.panelIndex : null,
    isPlaying:
      snapshot.state === State.Playing ||
      snapshot.state === State.PlayingSelected,
    play,
    pause,
    restart,
    selectBubble,
  };
}
