# Frontend Architecture

React + Vite single-page application for **Manga English Lab**. This document
describes the app structure, routing, component tree, state strategy, and the
data-fetching layer. Related deliverables: [playback-state.md](./playback-state.md),
[comic-layout-system.md](./comic-layout-system.md), and
[ADR 0013 — Frontend State Management](../decisions/0013-frontend-state-management.md).

## Goals and constraints

- **Confirmed requirement:** React + Vite, React Router, native React state with
  focused custom hooks, React Context only where justified, **no Redux**.
- **Confirmed requirement:** desktop/laptop is the primary demo target; the app
  must degrade gracefully to a single-panel mobile experience.
- **Recommended decision:** keep the app small and composable — a thin routing
  shell, presentational comic components, and a testable playback engine that is
  isolated from the DOM (see [playback-state.md](./playback-state.md)).

## Routing

React Router with two routes for the MVP:

| Path                | Component      | Purpose                                   |
| ------------------- | -------------- | ----------------------------------------- |
| `/`                 | `ScenarioList` | Browse and select a scenario.             |
| `/scenarios/:slug`  | `ScenarioView` | View a scenario, pick a variation, play.  |

- **Recommended decision:** use a human-readable `slug` (a semantic `key`, not an
  `_id`) in the URL so shared links are stable and portfolio-friendly.
- **Assumption:** deep-linking directly to a variation is **deferred**; variation
  selection lives in component state within `ScenarioView` for the MVP.
- **Deferred decision:** a 404 / not-found route and an error boundary route are
  planned but not part of the first milestone.

## Component tree

```
App
├── ScenarioList                 (route: /)
└── ScenarioView                 (route: /scenarios/:slug)
    ├── VariationSelector        (choose 1 of exactly 3 variations)
    ├── PlaybackControls         (play / pause / restart, progress)
    ├── CharacterControls[]      (per-character textVisible + audioEnabled)
    ├── ComicPage                (desktop: multi-panel; mobile: single panel)
    │   └── ComicPanel[]
    │       └── SpeechBubble[]   (absolutely positioned, DOM order = data order)
    └── GlossaryPanel            (per-scenario vocabulary support)
```

- `ComicPage` owns responsive layout selection (comic-page vs single-panel); see
  [comic-layout-system.md](./comic-layout-system.md).
- `SpeechBubble` is purely presentational: it renders text/tail/highlight from
  props and reports clicks upward. It never owns audio or playback logic.
- `PlaybackControls` and `SpeechBubble` both dispatch intents into the playback
  engine rather than manipulating audio directly.

## State strategy

**Recommended decision:** compose native React primitives instead of a global
store. Three concerns, three ownership boundaries:

1. **`useScenario(slug)`** — fetches and holds the scenario, characters, and
   variations; exposes `{ data, loading, error, retry }`. Owns server state.
2. **`usePlaybackEngine(queue)`** — wraps the framework-agnostic playback state
   machine ([playback-state.md](./playback-state.md)). Exposes the current state
   (`Idle | Playing | Paused | PlayingSelected | Complete`), the global cursor
   (current line), and intent callbacks (`play`, `pause`, `restart`,
   `selectBubble`). Deterministic and unit-testable without real audio.
3. **`useCharacterControls(characters)`** — holds each character's independent
   `textVisible` and `audioEnabled` flags. `audioEnabled=false` never skips a
   line; it changes how the engine treats duration (see playback docs). Text
   visibility is a rendering concern only and never called "muted".

### Context — used sparingly

- **Recommended decision:** a single `ExerciseContext` scoped to `ScenarioView`
  holds the *current-exercise* state (selected variation, playback engine handle,
  character controls) so deeply nested `SpeechBubble` / `CharacterControls` avoid
  prop-drilling. It is **not** an app-global store and does not wrap `App`.
- **Assumption:** `ScenarioList` needs no context; it consumes `useScenario`
  output locally.

### Why no Redux — see [ADR 0013](../decisions/0013-frontend-state-management.md)

- The domain is a single active exercise with a bounded state machine; Redux's
  boilerplate, middleware, and global store add cost without benefit here.
- Server state is better served by explicit fetch hooks with loading/error
  states than by hand-rolled reducers of remote data.
- The playback engine is intentionally framework-agnostic, so it does not need
  (and should not depend on) any particular state library.

## Data-fetching layer

- **Confirmed requirement:** REST API; media referenced as URLs/paths only.
- **Recommended decision:** all network access goes through a small
  `src/api/` module exposing functions like `getScenarios()` and
  `getScenario(slug)`. Components/hooks never call `fetch` directly.
- **Recommended decision:** ship first against a **static-data module**
  (`src/api/staticData.js`) that returns the same shapes the REST endpoints will
  return. Swapping to the live API is a one-line change behind the identical
  contract, so UI work can proceed before the backend exists.
- Every fetch hook exposes explicit `loading`, `error`, and `retry` states;
  screens render loading and error UI accordingly (see
  [accessibility.md](./accessibility.md) for accessible loading/error states).
- **Assumption:** no client-side caching library for the MVP; a per-hook cache
  keyed by `slug` may be added later. **Deferred decision.**

## Folder layout (`client/src`)

```
client/src/
├── main.jsx                 # Vite entry, router mount
├── App.jsx                  # route definitions, layout shell
├── api/
│   ├── client.js            # fetch wrapper, base URL, error normalization
│   ├── scenarios.js         # getScenarios(), getScenario(slug)
│   └── staticData.js        # MVP-first fixtures behind the API contract
├── hooks/
│   ├── useScenario.js
│   ├── usePlaybackEngine.js
│   └── useCharacterControls.js
├── playback/
│   ├── engine.js            # framework-agnostic state machine
│   └── audioAdapter.js      # thin HTMLAudio adapter (see audio-strategy.md)
├── context/
│   └── ExerciseContext.jsx
├── components/
│   ├── ScenarioList.jsx
│   ├── ScenarioView.jsx
│   ├── VariationSelector.jsx
│   ├── ComicPage.jsx
│   ├── ComicPanel.jsx
│   ├── SpeechBubble.jsx
│   ├── PlaybackControls.jsx
│   ├── CharacterControls.jsx
│   └── GlossaryPanel.jsx
└── styles/
```

- **Recommended decision:** keep `playback/` free of React imports so the engine
  can be tested in isolation and reused if the UI framework ever changes.
- **Open question:** whether `styles/` uses CSS Modules or plain CSS is not yet
  decided; the layout system doc drives that choice.
