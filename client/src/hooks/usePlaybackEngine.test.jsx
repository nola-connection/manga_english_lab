import { renderHook, act } from "@testing-library/react";

import { usePlaybackEngine } from "./usePlaybackEngine.js";
import { State } from "../playback/engine.js";

// A controllable fake clock: the engine schedules muted-line durations through
// it, so flushing a timer deterministically advances playback without real audio
// or wall-clock time (see docs/architecture/playback-state.md).
function createTestClock() {
  let seq = 0;
  const timers = new Map();
  return {
    setTimeout: (fn) => {
      const id = ++seq;
      timers.set(id, fn);
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    flushNext() {
      const entry = timers.entries().next().value;
      if (!entry) return false;
      timers.delete(entry[0]);
      entry[1]();
      return true;
    },
    get pending() {
      return timers.size;
    },
  };
}

// Three muted lines across two panels (no audioUrl → no real audio elements),
// so the engine advances on the clock alone.
const QUEUE = [
  { queueIndex: 0, panelIndex: 0, lineOrder: 1, speakerKey: "waiter", text: "Hi", audioEnabled: false },
  { queueIndex: 1, panelIndex: 0, lineOrder: 2, speakerKey: "guest", text: "Hello", audioEnabled: false },
  { queueIndex: 2, panelIndex: 1, lineOrder: 1, speakerKey: "waiter", text: "Order?", audioEnabled: false },
];

describe("MEL-052 usePlaybackEngine", () => {
  it("starts Idle with nothing highlighted", () => {
    const clock = createTestClock();
    const { result } = renderHook(() => usePlaybackEngine(QUEUE, { clock }));

    expect(result.current.state).toBe(State.Idle);
    expect(result.current.activeLine).toBeNull();
    expect(result.current.activePanelIndex).toBeNull();
    expect(result.current.isPlaying).toBe(false);
  });

  it("play highlights the first line and reports the active panel", () => {
    const clock = createTestClock();
    const { result } = renderHook(() => usePlaybackEngine(QUEUE, { clock }));

    act(() => result.current.play());

    expect(result.current.state).toBe(State.Playing);
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.cursor).toBe(0);
    expect(result.current.activeLine.text).toBe("Hi");
    expect(result.current.activePanelIndex).toBe(0);
  });

  it("advances the cursor across lines and panels as timers fire", () => {
    const clock = createTestClock();
    const { result } = renderHook(() => usePlaybackEngine(QUEUE, { clock }));

    act(() => result.current.play());
    act(() => clock.flushNext());
    expect(result.current.cursor).toBe(1);
    expect(result.current.activeLine.text).toBe("Hello");
    expect(result.current.activePanelIndex).toBe(0);

    act(() => clock.flushNext());
    expect(result.current.cursor).toBe(2);
    expect(result.current.activePanelIndex).toBe(1);

    // Last line finishing lands in Complete with the highlight retained.
    act(() => clock.flushNext());
    expect(result.current.state).toBe(State.Complete);
    expect(result.current.activeLine.text).toBe("Order?");
  });

  it("pause stops advancing and keeps the current line highlighted", () => {
    const clock = createTestClock();
    const { result } = renderHook(() => usePlaybackEngine(QUEUE, { clock }));

    act(() => result.current.play());
    act(() => result.current.pause());

    expect(result.current.state).toBe(State.Paused);
    expect(result.current.isPlaying).toBe(false);
    // The pending muted timer was cancelled, so flushing does nothing.
    expect(clock.pending).toBe(0);
    expect(result.current.activeLine.text).toBe("Hi");
  });

  it("restart returns the cursor to the first line", () => {
    const clock = createTestClock();
    const { result } = renderHook(() => usePlaybackEngine(QUEUE, { clock }));

    act(() => result.current.play());
    act(() => clock.flushNext());
    expect(result.current.cursor).toBe(1);

    act(() => result.current.restart());
    expect(result.current.state).toBe(State.Playing);
    expect(result.current.cursor).toBe(0);
    expect(result.current.activeLine.text).toBe("Hi");
  });
});
