import { describe, it, expect, vi, beforeEach } from "vitest";

import { createAudioAdapter } from "./audioAdapter.js";

// A controllable fake HTMLAudio element: records listeners so we can fire media
// events deterministically and assert cleanup, and lets each test decide how
// play() resolves (to model autoplay-restriction rejections). No real audio.
function makeFakeAudio() {
  const listeners = new Map();
  const el = {
    preload: "",
    src: "",
    currentTime: 0,
    duration: NaN,
    paused: true,
    played: 0,
    loaded: 0,
    playResult: Promise.resolve(),
    addEventListener: vi.fn((type, fn) => {
      const set = listeners.get(type) || new Set();
      set.add(fn);
      listeners.set(type, set);
    }),
    removeEventListener: vi.fn((type, fn) => listeners.get(type)?.delete(fn)),
    play: vi.fn(() => {
      el.played += 1;
      el.paused = false;
      return el.playResult;
    }),
    pause: vi.fn(() => {
      el.paused = true;
    }),
    load: vi.fn(() => {
      el.loaded += 1;
    }),
    removeAttribute: vi.fn((name) => {
      if (name === "src") el.src = "";
    }),
    emit(type) {
      [...(listeners.get(type) || [])].forEach((fn) => fn({ type }));
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    },
  };
  return el;
}

function makeQueue() {
  return [
    { queueIndex: 0, audioUrl: "/a.mp3", audioEnabled: true },
    { queueIndex: 1, audioUrl: "/b.mp3", audioEnabled: true },
    { queueIndex: 2, audioUrl: "", audioEnabled: true },
  ];
}

describe("MEL-051 HTMLAudio audio adapter", () => {
  let created;
  let createAudio;
  let deps;

  beforeEach(() => {
    created = [];
    createAudio = vi.fn(() => {
      const el = makeFakeAudio();
      created.push(el);
      return el;
    });
    deps = {
      onEnded: vi.fn(),
      onError: vi.fn(),
      onDurationKnown: vi.fn(),
      createAudio,
      defaultDurationSeconds: 5,
    };
  });

  it("plays the queued line's audio and reports ended with its token (AC1)", () => {
    const adapter = createAudioAdapter(makeQueue(), deps);
    adapter.playLine(0, 7);
    expect(created[0].src).toBe("/a.mp3");
    expect(created[0].preload).toBe("metadata");
    expect(created[0].played).toBe(1);
    created[0].emit("ended");
    expect(deps.onEnded).toHaveBeenCalledWith(7);
  });

  it("preloads metadata and caches/reports duration by url (AC2)", () => {
    const adapter = createAudioAdapter(makeQueue(), deps);
    adapter.preload(["/a.mp3", "/b.mp3"]);
    expect(created[0].preload).toBe("metadata");
    expect(created[0].loaded).toBe(1);
    created[0].duration = 3.5;
    created[0].emit("loadedmetadata");
    expect(deps.onDurationKnown).toHaveBeenCalledWith("/a.mp3", 3.5);
    expect(adapter.getDuration("/a.mp3")).toBe(3.5);
  });

  it("falls back to the default duration when metadata is invalid (AC2/AC3)", () => {
    const adapter = createAudioAdapter(makeQueue(), deps);
    adapter.preload(["/a.mp3"]);
    created[0].duration = Infinity; // browser could not resolve real duration
    created[0].emit("loadedmetadata");
    expect(deps.onDurationKnown).toHaveBeenCalledWith("/a.mp3", 5);
    // A load error also yields the fallback exactly once (no duplicate emit).
    adapter.preload(["/c.mp3"]);
    created[1].emit("error");
    expect(deps.onDurationKnown).toHaveBeenCalledWith("/c.mp3", 5);
  });

  it("emits an error for a missing url without playing (AC3)", () => {
    const adapter = createAudioAdapter(makeQueue(), deps);
    adapter.playLine(2, 4);
    expect(deps.onError).toHaveBeenCalledWith(
      expect.objectContaining({ token: 4, index: 2, reason: "missing-audio" }),
    );
  });

  it("surfaces a rejected play() as an autoplay-blocked error (AC3)", async () => {
    const adapter = createAudioAdapter(makeQueue(), deps);
    adapter.playLine(0, 1);
    created[0].playResult = Promise.reject(new Error("gesture required"));
    // Re-play with a rejecting promise to model the autoplay gate.
    adapter.playLine(0, 2);
    await Promise.resolve();
    await Promise.resolve();
    expect(deps.onError).toHaveBeenCalledWith(
      expect.objectContaining({ token: 2, reason: "autoplay-blocked" }),
    );
  });

  it("emits an error on a media error event (AC3)", () => {
    const adapter = createAudioAdapter(makeQueue(), deps);
    adapter.playLine(0, 9);
    created[0].emit("error");
    expect(deps.onError).toHaveBeenCalledWith(
      expect.objectContaining({ token: 9, url: "/a.mp3", reason: "audio-error" }),
    );
  });

  it("stop() pauses the active line and detaches its listeners (AC4)", () => {
    const adapter = createAudioAdapter(makeQueue(), deps);
    adapter.playLine(0, 1);
    expect(created[0].listenerCount("ended")).toBe(1);
    adapter.stop();
    expect(created[0].pause).toHaveBeenCalled();
    expect(created[0].listenerCount("ended")).toBe(0);
    // A late ended after stop must not reach the engine.
    created[0].emit("ended");
    expect(deps.onEnded).not.toHaveBeenCalled();
  });

  it("cancel-before-play stops the previous line before starting the next (AC4)", () => {
    const adapter = createAudioAdapter(makeQueue(), deps);
    adapter.playLine(0, 1);
    adapter.playLine(1, 2);
    expect(created[0].pause).toHaveBeenCalled();
    expect(created[1].src).toBe("/b.mp3");
    expect(created[1].played).toBe(1);
  });

  it("teardown() releases every element and its listeners (AC4)", () => {
    const adapter = createAudioAdapter(makeQueue(), deps);
    adapter.preload(["/a.mp3"]);
    adapter.playLine(1, 3);
    adapter.teardown();
    created.forEach((el) => {
      expect(el.pause).toHaveBeenCalled();
      expect(el.removeAttribute).toHaveBeenCalledWith("src");
      expect(el.listenerCount("loadedmetadata")).toBe(0);
      expect(el.listenerCount("error")).toBe(0);
    });
    expect(adapter.getDuration("/a.mp3")).toBeUndefined();
  });
});
