# 0013 — Frontend state management

## Status

Proposed

## Context

The React client manages several kinds of state: the loaded scenario/variation,
per-character controls (`textVisible`, `audioEnabled`), and playback/session
state (cursor, playing/paused, selected bubble — see
[0014](./0014-dialogue-audio-orchestration.md)). Durable content lives in MongoDB
and is fetched via REST; the client state here is transient UI/session state. We
must choose how to organize it without reaching for more machinery than the app
needs.

## Options considered

- **Native React state (`useState`/`useReducer`) + focused custom hooks**, with
  React Context only for the current-exercise state shared across the comic
  subtree; no external state library. *(chosen)*
- **Redux (or similar global store)** — powerful devtools and a single global
  store, but boilerplate and conceptual overhead unjustified by this app's scope.
- **Everything in Context** — no extra deps, but a single broad context causes
  unnecessary re-renders and tangles unrelated concerns.

## Decision

Use **native React state** (`useState`/`useReducer`) plus **focused custom
hooks** (`usePlaybackEngine`, `useCharacterControls`, `useScenario`), with
**React Context only for current-exercise state**. **Do not use Redux** or an
external state library.

## Rationale

The state is local to a single exercise view and naturally decomposes into a few
cohesive concerns, each a custom hook: fetching/holding the scenario, character
controls, and driving the playback engine. `useReducer` handles the playback
state machine's transitions cleanly. Context is used narrowly to share the
current-exercise state with the comic subtree, avoiding prop drilling without
making everything global. Redux's store, actions, and middleware would add
boilerplate and indirection disproportionate to a bounded, single-view app.

## Positive consequences

- Minimal dependencies; idiomatic React.
- Concerns are isolated in named hooks, easy to test and reason about.
- `useReducer` maps directly onto the playback state machine.
- Narrow Context scope limits re-renders and keeps state cohesive.

## Negative consequences

- No global devtools/time-travel debugging that Redux provides.
- Cross-cutting state, if it grows, must be threaded through hooks/Context by hand.
- Discipline is needed to keep Context scope narrow.

## Risks

- **State outgrows local hooks** if many sibling views need to share complex
  state, causing Context/prop friction. Monitored as a revisit trigger.
- **Context misuse** (too broad) causing re-render churn. Mitigated by keeping
  Context limited to current-exercise state and splitting hooks by concern.

## Conditions that would justify revisiting

- Cross-cutting state grows to span many unrelated views and interactions.
- Debugging complex state flows would materially benefit from a store's devtools.
- Server-state caching needs (dedupe, invalidation) justify a data-fetching
  library, evaluated separately from global UI state.
