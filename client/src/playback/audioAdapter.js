/**
 * HTMLAudio audio adapter (MEL-051).
 *
 * The single side-effecting half of the playback split (ADR-0014): it executes
 * the dialogue commands the framework-agnostic engine (engine.js / MEL-050)
 * emits — `playLine(i, token)`, `stop()`, `preload(urls)`, `teardown()` — using
 * HTMLAudio, and translates browser media events back into the plain engine
 * events `ended(token)` / `error(info)` / `durationKnown(url, seconds)` (see
 * docs/architecture/audio-strategy.md "Adapter contract"). It owns every
 * element/listener and tears them down on stop/teardown so no stale audio or
 * listener survives a cancel, restart, route change, or unmount.
 *
 * Scope note: per MEL-051 this covers the single dialogue channel plus
 * metadata/duration preload. The environmental channel and settings mixer
 * (setVolumes/setMasterMute/startEnvironment) are non-goals here (MEL-061).
 */

// Conservative fallback (seconds) when a clip's metadata never resolves, so the
// duration cache — and the engine's muted-line timer — never stalls.
const DEFAULT_DURATION_SECONDS = 5;

/**
 * Create an HTMLAudio adapter over an ordered playback queue.
 *
 * @param {import('./queue.js').QueueItem[]} queue flattened playback queue; the
 *   adapter maps the engine's cursor index to a line's `audioUrl`.
 * @param {object} [deps]
 * @param {(token:number)=>void} [deps.onEnded] active line finished.
 * @param {(info:object)=>void} [deps.onError] load/decode/autoplay failure.
 * @param {(url:string, seconds:number)=>void} [deps.onDurationKnown] metadata
 *   resolved (or fell back to the default) for `url`.
 * @param {()=>HTMLAudioElement} [deps.createAudio] element factory (injectable
 *   so tests avoid real browser media).
 * @param {number} [deps.defaultDurationSeconds] fallback duration.
 * @returns {object} adapter with playLine/stop/preload/teardown + getDuration.
 */
export function createAudioAdapter(queue, deps = {}) {
  const items = Array.isArray(queue) ? queue : [];
  const { onEnded, onError, onDurationKnown } = deps;
  const defaultDurationSeconds =
    typeof deps.defaultDurationSeconds === "number"
      ? deps.defaultDurationSeconds
      : DEFAULT_DURATION_SECONDS;
  const makeAudio =
    deps.createAudio ||
    (() =>
      typeof Audio !== "undefined"
        ? new Audio()
        : globalThis.document.createElement("audio"));

  const elements = new Map(); // url -> HTMLAudioElement (preloaded/reused)
  const elementRemovers = new Map(); // el -> fn[] (element-level listeners)
  const durationCache = new Map(); // url -> seconds
  let active = null; // { el, token, url, removers, settled }

  function attach(el, type, handler) {
    el.addEventListener(type, handler);
    return () => el.removeEventListener(type, handler);
  }

  // Cache a resolved (or fallback) duration once and notify the engine.
  function cacheDuration(url, seconds) {
    if (durationCache.has(url)) return;
    durationCache.set(url, seconds);
    onDurationKnown?.(url, seconds);
  }

  function readMetadata(el, url) {
    const d = el.duration;
    const seconds =
      typeof d === "number" && Number.isFinite(d) && d > 0
        ? d
        : defaultDurationSeconds;
    cacheDuration(url, seconds);
  }

  // Create (or reuse) a metadata-preloaded element for `url`, wiring the
  // element-level listeners that feed the duration cache.
  function ensureElement(url) {
    let el = elements.get(url);
    if (el) return el;
    el = makeAudio();
    el.preload = "metadata";
    el.src = url;
    elements.set(url, el);
    elementRemovers.set(el, [
      attach(el, "loadedmetadata", () => readMetadata(el, url)),
      // A load failure at metadata time still yields a usable duration so the
      // sequence never stalls; a play-time failure is surfaced per active line.
      attach(el, "error", () => cacheDuration(url, defaultDurationSeconds)),
    ]);
    return el;
  }

  // Settle the active line exactly once: detach its per-play listeners, drop it
  // as active, then invoke the engine callback (so late events are ignored).
  function finish(entry, callback) {
    if (!entry || entry.settled) return;
    entry.settled = true;
    entry.removers.forEach((off) => off());
    if (active === entry) active = null;
    callback?.();
  }

  function stop() {
    if (!active) return;
    const entry = active;
    entry.settled = true;
    entry.removers.forEach((off) => off());
    active = null;
    entry.el.pause?.();
    try {
      entry.el.currentTime = 0;
    } catch {
      // jsdom/fakes may reject currentTime writes; harmless for cleanup.
    }
  }

  function playLine(index, token) {
    stop(); // cancel-before-play: never two dialogue clips at once
    const item = items[index];
    if (!item || !item.audioUrl) {
      onError?.({ token, index, reason: "missing-audio" });
      return;
    }
    const url = item.audioUrl;
    const el = ensureElement(url);
    try {
      el.currentTime = 0;
    } catch {
      // ignore non-writable currentTime on fakes
    }
    const entry = { el, token, url, removers: [], settled: false };
    active = entry;
    entry.removers.push(
      attach(el, "ended", () => finish(entry, () => onEnded?.(token))),
      attach(el, "error", () =>
        finish(entry, () => onError?.({ token, index, url, reason: "audio-error" })),
      ),
    );
    let started;
    try {
      started = el.play();
    } catch {
      finish(entry, () => onError?.({ token, index, url, reason: "play-rejected" }));
      return;
    }
    // A rejected play() promise is the autoplay-gesture gate (or a decode
    // failure); surface it as an error the UI can explain.
    if (started && typeof started.then === "function") {
      started.catch(() => {
        if (active === entry) {
          finish(entry, () =>
            onError?.({ token, index, url, reason: "autoplay-blocked" }),
          );
        }
      });
    }
  }

  function preload(urls) {
    if (!Array.isArray(urls)) return;
    urls.forEach((url) => {
      if (!url) return;
      const el = ensureElement(url);
      el.load?.();
    });
  }

  function destroyElement(el) {
    elementRemovers.get(el)?.forEach((off) => off());
    elementRemovers.delete(el);
    el.pause?.();
    el.removeAttribute?.("src");
    el.load?.();
  }

  function teardown() {
    stop();
    elements.forEach((el) => destroyElement(el));
    elements.clear();
    durationCache.clear();
  }

  return {
    playLine,
    stop,
    preload,
    teardown,
    getDuration: (url) => durationCache.get(url),
  };
}
