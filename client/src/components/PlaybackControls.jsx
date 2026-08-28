/**
 * Playback controls (MEL-052).
 *
 * Presentational play/pause/restart controls that dispatch intents into the
 * playback engine (via callbacks) rather than touching audio directly
 * (frontend-architecture.md). Play and Pause share one toggle button whose label
 * and `aria-pressed` follow the engine state; Restart returns to the top. Both
 * are semantic `<button>`s, so they are keyboard operable with the app's visible
 * focus styles (accessibility.md). Individual-bubble select is a non-goal here
 * (MEL-053).
 *
 * @param {object} props
 * @param {string} props.state current engine state (Idle/Playing/…); exposed as
 *   a data hook and used to reflect the toggle's pressed state.
 * @param {boolean} props.isPlaying whether audio is currently advancing.
 * @param {() => void} props.onPlay start/resume from the cursor.
 * @param {() => void} props.onPause pause and keep the cursor.
 * @param {() => void} props.onRestart restart from the first line.
 */
export default function PlaybackControls({
  state,
  isPlaying,
  onPlay,
  onPause,
  onRestart,
}) {
  return (
    <div
      className="playback-controls"
      role="group"
      aria-label="Playback controls"
      data-state={state}
    >
      <button
        type="button"
        className="playback-controls__button playback-controls__button--toggle"
        onClick={isPlaying ? onPause : onPlay}
        aria-pressed={isPlaying}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      <button
        type="button"
        className="playback-controls__button playback-controls__button--restart"
        onClick={onRestart}
      >
        Restart
      </button>
    </div>
  );
}
