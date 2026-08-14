# Test Strategy — Manga English Lab

A practical, proportionate testing approach focused on the behaviors that make
this product correct: content integrity, the REST API contract, and the comic
**playback engine**. We do **not** chase coverage numbers or write tests that
merely re-verify library behavior.

> **Label key:** _Confirmed requirement_ · _Recommended decision_.

## 1. Testing Philosophy

- **Recommended decision:** No meaningless coverage targets. A modest policy:
  every critical domain rule and interaction behavior has at least one test that
  would fail if the rule broke.
- **Recommended decision:** Avoid tests that duplicate framework/library
  behavior (React rendering internals, Mongoose plumbing, the browser audio
  element). Test **our** logic and contracts instead.
- **Confirmed requirement:** The playback engine is a **framework-agnostic state
  machine** unit-tested **without real audio** via an **audio adapter boundary**
  (a fake adapter reports durations and end events) and an **injected clock /
  timer** so duration waits advance deterministically with no real delays. See
  [playback state](../architecture/playback-state.md) and
  [audio](../architecture/audio-strategy.md).

## 2. Recommended Tools

- **Frontend unit/component:** **Vitest** + **React Testing Library**.
- **Backend integration:** **Vitest (or Jest)** + **Supertest** +
  **mongodb-memory-server** (real routes, in-memory Mongo, no external service).
- **End-to-end:** **Playwright** for a single complete learner journey.
- **Accessibility checks:** RTL queries by role/name plus an axe-style automated
  audit in component tests; see [accessibility](../architecture/accessibility.md).

## 3. What We Test

### 3.1 Data & Content
- Schema & sub-schema validation (Scenario, character, variation, panel, line,
  bubble placement percentages, `speakerKey`).
- Seed-data validation: 3 scenarios, each with a variable number of variations
  within the soft upper bound of ~5 (not a fixed count); ordered panels and
  lines; every line references an existing character `key` and an audio path.

### 3.2 API Route Integration
- Scenario lookup **by slug**.
- **Published-scenario filtering** (unpublished not served).
- **Dialogue ordering** preserved in responses (panels and lines in order).
- Not-found and malformed-slug responses.

### 3.3 Playback Engine (no real audio)
- Playback **queue creation** from a variation (reading order == playback order).
- **Play / pause / restart** state transitions.
- **Bubble selection** moves the **global cursor**; individual-line playback.
- **Resume** from a selected bubble continues the complete conversation.
- **Active-line highlighting** reflects the cursor.
- **Muted-character timing:** with `audioEnabled=false`, the engine **waits the
  real audio-file duration** (from the fake adapter) and **never skips**.
- **Per-character** `textVisible` and `audioEnabled` applied independently.
- **Panel changes during playback** (advance across panel boundaries).
- **Missing-audio failure behavior** (surface an error/failed state; no silent
  hang).

### 3.4 Interaction & Accessibility (component)
- **Keyboard controls:** play/pause via `Space`/`Enter`; bubbles focusable and
  activatable; glossary focus trap and focus restore.
- **Accessibility checks:** roles/names for controls, active-line indication,
  reveal/hide announced correctly (hidden text never labeled "muted").

### 3.5 Layout
- **Desktop layouts:** multi-panel comic rendering with data-driven bubbles.
- **Mobile single-panel navigation** with auto-advance to the next panel.

### 3.6 End-to-End (exactly one)
- **One complete learner journey** with Playwright: browse → open scenario →
  pick variation → play complete conversation → pause → click a bubble → resume
  → toggle a per-character control → open glossary.

## 4. Mapping to Milestones

- **M12 — Testing:** schema/seed validation, API integration, playback-engine
  unit tests, component interaction/accessibility, layout tests.
- **Post-M12 milestones:** the single Playwright e2e journey acts as the final
  MVP gate (see [mvp-scope.md](../product/mvp-scope.md)).
- Practice-mode tests reuse the muted-timing and per-character suites since the
  foundation is shared (see [learning modes](../product/learning-modes.md)).

## 5. Explicit Non-Tests

- No tests asserting exact audio playback in a real browser element.
- No snapshot tests that lock arbitrary markup with no behavioral meaning.
- No pronunciation/recognition/TTS tests — those features are out of scope.

## 6. Continuous Integration

- **Confirmed requirement:** the suite runs in CI. The workflow at
  [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs lint and the
  workspace tests on every pull request and on pushes to `main`, so no change
  merges without a green run.
- **Recommended decision:** the layered suites (§3) run in the workspace they
  belong to — frontend unit/component under `client/`, backend integration
  under `server/` — via the root `npm test`, which fans out to each workspace.
- **Recommended decision:** coverage is reported per the philosophy in §1 (every
  critical domain rule has a failing-if-broken test) rather than enforced as a
  numeric gate; a coverage threshold may be added later if it earns its keep.
- **Open question:** whether the single Playwright e2e journey (§3.6) runs on
  every PR or only pre-deploy depends on the CI build-minute budget (see
  [deployment](../architecture/deployment.md)).
