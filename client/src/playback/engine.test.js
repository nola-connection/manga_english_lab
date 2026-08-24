import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";

import { createEngine, State } from "./engine.js";

// Fake adapter records the commands the engine emits so tests assert on
// commands + state + cursor rather than on any DOM or real audio.
function makeAdapter() {
  const calls = [];
  return {
    calls,
    playLine: vi.fn((i, token) => calls.push(["playLine", i, token])),
    stop: vi.fn(() => calls.push(["stop"])),
    highlight: vi.fn((i) => calls.push(["highlight", i])),
    lastPlayToken() {
      const last = [...calls].reverse().find((c) => c[0] === "playLine");
      return last ? last[2] : undefined;
    },
  };
}

// Three audible lines across two panels: p0 has l0,l1; p1 has l2. Muted-line
// timing is exercised separately in the fake-clock suite, which builds its own
// queues; keeping these lines audible lets tests drive `ended` with the
// adapter's real play token.
function makeQueue() {
  return [
    { queueIndex: 0, panelIndex: 0, audioEnabled: true, speakerKey: "waiter" },
    {
      queueIndex: 1,
      panelIndex: 0,
      audioEnabled: true,
      speakerKey: "customer",
    },
    { queueIndex: 2, panelIndex: 1, audioEnabled: true, speakerKey: "waiter" },
  ];
}

describe("MEL-050 Playback state machine", () => {
  let adapter;
  let engine;

  beforeEach(() => {
    adapter = makeAdapter();
    engine = createEngine(makeQueue(), { adapter });
  });

  it("starts Idle at cursor 0 (AC1)", () => {
    expect(engine.state).toBe(State.Idle);
    expect(engine.cursor).toBe(0);
    expect(engine.activePanel).toBe(0);
  });

  it("Idle --play--> Playing from cursor, highlighting + playing line (AC1)", () => {
    engine.play();
    expect(engine.state).toBe(State.Playing);
    expect(engine.cursor).toBe(0);
    expect(adapter.highlight).toHaveBeenCalledWith(0);
    expect(adapter.playLine).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it("Playing --pause--> Paused keeps the cursor and stops audio (AC2)", () => {
    engine.play();
    engine.pause();
    expect(engine.state).toBe(State.Paused);
    expect(engine.cursor).toBe(0);
    expect(adapter.stop).toHaveBeenCalled();
  });

  it("Paused --play--> Playing resumes from the same cursor (AC2)", () => {
    engine.play();
    engine.ended(adapter.lastPlayToken());
    engine.pause();
    expect(engine.cursor).toBe(1);
    engine.play();
    expect(engine.state).toBe(State.Playing);
    expect(engine.cursor).toBe(1);
    expect(adapter.playLine).toHaveBeenLastCalledWith(1, expect.any(Number));
  });

  it("Playing --ended--> advances the cursor by one (AC4)", () => {
    engine.play();
    engine.ended(adapter.lastPlayToken());
    expect(engine.state).toBe(State.Playing);
    expect(engine.cursor).toBe(1);
    expect(engine.activePanel).toBe(0);
  });

  it("crossing a panel boundary updates the derived panelIndex (AC4)", () => {
    engine.play();
    engine.ended(adapter.lastPlayToken()); // -> cursor 1 (panel 0)
    engine.ended(adapter.lastPlayToken()); // -> cursor 2 (panel 1, muted)
    expect(engine.cursor).toBe(2);
    expect(engine.activePanel).toBe(1);
  });

  it("ended on the last line reaches Complete, holding the last cursor (AC5)", () => {
    engine.play();
    engine.ended(adapter.lastPlayToken()); // 0 -> 1
    engine.ended(adapter.lastPlayToken()); // 1 -> 2 (last line)
    engine.ended(adapter.lastPlayToken()); // 2 -> Complete
    expect(engine.state).toBe(State.Complete);
    expect(engine.cursor).toBe(2);
  });

  it("Complete --play--> Playing restarts from cursor 0 (AC5)", () => {
    engine.play();
    engine.ended(adapter.lastPlayToken());
    engine.ended(adapter.lastPlayToken());
    engine.ended(adapter.lastPlayToken());
    expect(engine.state).toBe(State.Complete);
    engine.play();
    expect(engine.state).toBe(State.Playing);
    expect(engine.cursor).toBe(0);
  });

  it("restart from any active state resets to cursor 0 and plays (AC5)", () => {
    engine.play();
    engine.ended(adapter.lastPlayToken()); // cursor 1
    engine.restart();
    expect(engine.state).toBe(State.Playing);
    expect(engine.cursor).toBe(0);
    expect(adapter.playLine).toHaveBeenLastCalledWith(0, expect.any(Number));
  });

  it("Idle --restart--> Idle (no-op) (AC5)", () => {
    engine.restart();
    expect(engine.state).toBe(State.Idle);
    expect(adapter.playLine).not.toHaveBeenCalled();
  });
});

describe("MEL-050 muted-line timing (fake clock)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits the real duration for an audioEnabled=false line, then advances (AC3)", () => {
    const adapter = makeAdapter();
    // Last line is muted with a 2s real duration.
    const engine = createEngine(
      [
        { queueIndex: 0, panelIndex: 0, audioEnabled: true },
        { queueIndex: 1, panelIndex: 0, audioEnabled: true },
        {
          queueIndex: 2,
          panelIndex: 1,
          audioEnabled: false,
          durationSeconds: 2,
        },
      ],
      { adapter },
    );
    engine.play();
    engine.ended(adapter.lastPlayToken()); // -> 1
    engine.ended(adapter.lastPlayToken()); // -> 2 (muted, 2s), timer armed
    // Muted lines emit no audio command; only a highlight.
    expect(adapter.highlight).toHaveBeenLastCalledWith(2);
    expect(adapter.playLine).toHaveBeenCalledTimes(2); // never for line 2
    // Not advanced before the duration elapses.
    vi.advanceTimersByTime(1999);
    expect(engine.state).toBe(State.Playing);
    expect(engine.cursor).toBe(2);
    // At the real duration it advances (here, to Complete as the last line).
    vi.advanceTimersByTime(1);
    expect(engine.state).toBe(State.Complete);
  });

  it("a muted line with no duration metadata falls back and still advances (AC3)", () => {
    const adapter = makeAdapter();
    const engine = createEngine(
      [
        { queueIndex: 0, panelIndex: 0, audioEnabled: false },
        { queueIndex: 1, panelIndex: 0, audioEnabled: true },
      ],
      { adapter },
    );
    engine.play(); // first line muted, no durationSeconds -> 5s fallback
    expect(engine.cursor).toBe(0);
    vi.advanceTimersByTime(5000);
    expect(engine.cursor).toBe(1);
    expect(engine.state).toBe(State.Playing);
  });
});

describe("MEL-050 bubble selection", () => {
  let adapter;
  let engine;

  beforeEach(() => {
    adapter = makeAdapter();
    engine = createEngine(makeQueue(), { adapter });
  });

  it("selectBubble(i) from Idle sets cursor=i and enters PlayingSelected (AC6)", () => {
    engine.selectBubble(1);
    expect(engine.state).toBe(State.PlayingSelected);
    expect(engine.cursor).toBe(1);
    expect(adapter.playLine).toHaveBeenLastCalledWith(1, expect.any(Number));
  });

  it("ended in PlayingSelected lands in Paused on the selected line (AC6)", () => {
    engine.selectBubble(1);
    engine.ended(adapter.lastPlayToken());
    expect(engine.state).toBe(State.Paused);
    expect(engine.cursor).toBe(1);
  });

  it("play after selectBubble resumes complete playback from line i (AC6)", () => {
    engine.selectBubble(1);
    engine.play();
    expect(engine.state).toBe(State.Playing);
    expect(engine.cursor).toBe(1);
    engine.ended(adapter.lastPlayToken());
    expect(engine.cursor).toBe(2); // auto-advances onward
  });
});

describe("MEL-050 race safety and lifecycle", () => {
  let adapter;
  let engine;

  beforeEach(() => {
    adapter = makeAdapter();
    engine = createEngine(makeQueue(), { adapter });
  });

  it("rapid selectBubble cancels the previous line; only the latest wins (AC7)", () => {
    engine.selectBubble(0);
    const staleToken = adapter.lastPlayToken();
    engine.selectBubble(2);
    expect(engine.cursor).toBe(2);
    // A late ended from the superseded line is ignored (stale token).
    engine.ended(staleToken);
    expect(engine.state).toBe(State.PlayingSelected);
    expect(engine.cursor).toBe(2);
  });

  it("error cancels the line and parks in Paused (AC7)", () => {
    engine.play();
    engine.error({ type: "load-error" });
    expect(engine.state).toBe(State.Paused);
    expect(engine.lastError).toEqual({ type: "load-error" });
    expect(adapter.stop).toHaveBeenCalled();
  });

  it("error from Complete stays Complete; error from Idle stays Idle (AC7)", () => {
    engine.error({ type: "x" });
    expect(engine.state).toBe(State.Idle);
    engine.play();
    engine.ended(adapter.lastPlayToken());
    engine.ended(adapter.lastPlayToken());
    engine.ended(adapter.lastPlayToken());
    expect(engine.state).toBe(State.Complete);
    engine.error({ type: "y" });
    expect(engine.state).toBe(State.Complete);
  });

  it("unmount tears everything down back to Idle (AC7)", () => {
    engine.play();
    engine.unmount();
    expect(engine.state).toBe(State.Idle);
    expect(adapter.stop).toHaveBeenCalled();
  });
});
