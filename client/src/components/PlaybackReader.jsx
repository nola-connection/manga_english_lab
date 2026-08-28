/**
 * Playback reader (MEL-052).
 *
 * Composes the whole playback experience for one variation: it flattens the
 * variation into a queue (queue.js), binds it to the engine + audio adapter via
 * `usePlaybackEngine`, and renders the `PlaybackControls` above a `ComicPage`.
 * The playback cursor is the single source of truth (playback-state.md): the
 * active line's `panelIndex`/`lineOrder` drive which bubble is highlighted, and
 * this component follows the cursor across panels by scrolling the active panel
 * into view and moving focus to it, and announces the active line through a
 * polite `aria-live` region for screen-reader users (accessibility.md).
 *
 * `engineOptions` (`createAudio`/`clock`) is forwarded to the hook so tests can
 * drive playback without real browser audio; production passes nothing.
 *
 * @param {object} props
 * @param {{ layoutTemplate: string, panels: Array<object> }} props.variation
 * @param {{ createAudio?: Function, clock?: object }} [props.engineOptions]
 */
import { useEffect, useMemo, useRef } from "react";

import { buildQueue } from "../playback/queue.js";
import { usePlaybackEngine } from "../hooks/usePlaybackEngine.js";
import ComicPage from "./ComicPage.jsx";
import PlaybackControls from "./PlaybackControls.jsx";

export default function PlaybackReader({ variation, engineOptions }) {
  const queue = useMemo(() => buildQueue(variation), [variation]);
  const { state, activeLine, activePanelIndex, isPlaying, play, pause, restart } =
    usePlaybackEngine(queue, engineOptions);

  const pageRef = useRef(null);
  // Remember the last panel we followed so we only scroll/focus when the cursor
  // crosses into a new panel, not on every line change within a panel.
  const lastPanelRef = useRef(null);

  useEffect(() => {
    if (activePanelIndex === null) {
      lastPanelRef.current = null;
      return;
    }
    if (activePanelIndex === lastPanelRef.current) return;
    lastPanelRef.current = activePanelIndex;

    const page = pageRef.current;
    if (!page) return;
    const panelEl = page.querySelector(
      `[data-panel-index="${activePanelIndex}"]`,
    );
    if (!panelEl) return;

    // Honor reduced motion for the scroll; jsdom implements neither matchMedia
    // nor scrollIntoView, so both are guarded.
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (typeof panelEl.scrollIntoView === "function") {
      panelEl.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    }
    // Move focus to the panel container so keyboard/screen-reader users follow
    // the panel change; preventScroll avoids fighting the smooth scroll above.
    panelEl.focus?.({ preventScroll: true });
  }, [activePanelIndex]);

  // Concise polite announcement (speaker + line) on each cursor advance.
  const announcement = activeLine
    ? `${activeLine.speakerKey}: ${activeLine.text}`
    : "";

  return (
    <div className="playback-reader" data-state={state}>
      <PlaybackControls
        state={state}
        isPlaying={isPlaying}
        onPlay={play}
        onPause={pause}
        onRestart={restart}
      />

      <ComicPage
        ref={pageRef}
        variation={variation}
        activePanelIndex={activePanelIndex}
        activeLineOrder={activeLine ? activeLine.lineOrder : null}
      />

      {/* Off-screen live region; role=status is polite by default. */}
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
