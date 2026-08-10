# Implementation Roadmap

This roadmap sequences Manga English Lab from an empty repository to a deployed,
portfolio-ready MERN application. Work is organized into 14 milestones (M1–M14).
Each milestone has a single-paragraph goal, explicit **entry** and **exit**
criteria, and maps to the issues enumerated in
[`github-issue-plan.md`](./github-issue-plan.md).

Two principles drive the ordering:

1. **Architecture before implementation.** The three mandated architecture
   tickets — **MEL-014 (domain model)**, **MEL-015 (comic layout)**, and
   **MEL-016 (playback state)** — are completed in M2, *before* any feature code
   depends on them. They produce ADRs and documented contracts that downstream
   issues build against.
2. **Contract-first parallelism.** Frontend and backend proceed in parallel
   against a shared, documented API contract (MEL-018), so a static frontend
   slice and the Express/Mongo foundation can be built at the same time and
   integrated later with minimal rework.

---

## Milestones

### M1 — Repository & tooling foundation
**Goal:** Stand up the npm-workspaces monorepo (`client/`, `server/`) with shared
lint/format config, a CI skeleton, and GitHub issue/PR templates so every later
change is consistent and reviewable.
**Entry:** Empty repository on `main`.
**Exit:** Monorepo initialized (MEL-001), shared ESLint+Prettier (MEL-002), CI
running lint/test placeholders (MEL-003), issue/PR templates present (MEL-004),
and the `docs/` tree scaffolded (MEL-005).

### M2 — Product & architecture decisions (ADR-producing, no app code)
**Goal:** Lock the product scope and the load-bearing architecture through
written docs and ADRs — crucially the domain model, comic layout, and playback
state — so implementation has an authoritative reference. **No application code
is written in this milestone.**
**Entry:** M1 complete; `docs/` scaffold exists.
**Exit:** Product requirements (MEL-010), foundational ADRs (MEL-011/012/013),
the three architecture tickets (MEL-014/015/016), and the supporting strategy
docs (MEL-017–MEL-023) are merged. The API contract (MEL-018) is stable enough
to build against from both sides.

### M3 — Static restaurant vertical slice
**Goal:** Prove the domain model end-to-end in the UI with zero backend by
rendering the "restaurant" scenario from a static data module shaped exactly like
the future API response.
**Entry:** MEL-014 (domain model) and MEL-015 (comic layout) merged.
**Exit:** Vite client scaffolded (MEL-030), static restaurant data (MEL-031),
scenario list + route (MEL-032), and a single rendered panel with no playback
(MEL-033).

### M4 — Reusable panel & speech-bubble system
**Goal:** Build the reusable comic primitives — panel template and speech bubble
(percentage placement, tail, width, hidden text, active highlight) — and the
desktop multi-panel page, with DOM order matching playback order.
**Entry:** M3 slice renders a panel; MEL-015 merged.
**Exit:** `ComicPanel` (MEL-040), `SpeechBubble` (MEL-041), desktop comic-page
layout (MEL-042), and reading-order guarantee (MEL-043).

### M5 — Playback engine
**Goal:** Implement the framework-agnostic playback state machine and audio
adapter defined in MEL-016/MEL-017, then wire them to the UI for
play/pause/restart with active-line highlighting and individual-bubble playback.
**Entry:** MEL-016 merged; static data (MEL-031) and desktop layout (MEL-042)
available.
**Exit:** Unit-tested engine (MEL-050), HTMLAudio adapter with duration preload
(MEL-051), UI playback controls (MEL-052), and bubble-select/resume (MEL-053).

### M6 — Character practice controls
**Goal:** Add per-character learning controls — `textVisible` and `audioEnabled`
(muted lines still wait real audio duration) — and Read/Listen/Practice mode
presets.
**Entry:** Playback wired to UI (MEL-052) and bubbles rendered (MEL-041).
**Exit:** Text-visibility controls (MEL-060), audio-enabled controls with
real-duration waits (MEL-061), and learning-mode presets (MEL-062).

### M7 — Express & MongoDB foundation
**Goal:** Stand up the Express server with env-var validation, the Mongoose
connection, schemas/sub-schemas derived from the domain model, and a validated
seed script for the restaurant scenario.
**Entry:** MEL-014 merged; monorepo + FE/BE architecture docs (MEL-019) done.
**Exit:** Server scaffold (MEL-070), Mongoose connection (MEL-071), schemas
(MEL-072), and seed + seed validation (MEL-073).

### M8 — API integration
**Goal:** Expose the read endpoints from the API contract and swap the frontend
data source from the static module to the live API behind the same contract.
**Entry:** Schemas (MEL-072) and API contract (MEL-018) done.
**Exit:** `GET /scenarios` (MEL-080), `GET /scenarios/:slug` (MEL-081), and the
frontend data-layer swap (MEL-082).

### M9 — Remaining scenario content
**Goal:** Author the museum and directions scenarios (each with one or more
complete, ordered variations — typically 3, soft-capped at ~5) as validated seed
data and run a cross-scenario content validation pass.
**Entry:** Seed pattern (MEL-073) established.
**Exit:** Museum content (MEL-090), directions content (MEL-091), and content
validation (MEL-092).

### M10 — Responsive & mobile single-panel
**Goal:** Deliver the mobile single-panel experience (aspect preserved) with
prev/next navigation that auto-advances during playback, plus responsive controls
and glossary.
**Entry:** Desktop layout (MEL-042) and playback (MEL-052/053) done.
**Exit:** Mobile single-panel view (MEL-100), mobile nav + auto-advance
(MEL-101), and responsive controls/glossary (MEL-102).

### M11 — Accessibility refinement
**Goal:** Harden accessibility across all interactions: full keyboard operation
with visible focus, screen-reader dialogue order and active-line announcements,
and reduced-motion/contrast/loading-error/touch-target polish.
**Entry:** Interactive features (playback, modes, mobile nav) exist.
**Exit:** Keyboard/focus (MEL-110), screen-reader support (MEL-111), and a11y
polish (MEL-112).

### M12 — Testing & reliability
**Goal:** Solidify confidence with backend integration tests, playback engine
unit tests, component tests, and one full end-to-end learner journey.
**Entry:** API integration (MEL-082) and mobile nav (MEL-101) done.
**Exit:** Backend tests (MEL-120), playback tests (MEL-121), component tests
(MEL-122), and an e2e journey (MEL-123).

### M13 — Deployment
**Goal:** Deploy backend (with MongoDB Atlas free tier) and frontend (CORS/env
configured), then seed production and run a smoke test.
**Entry:** API (MEL-081) and deployment doc (MEL-022) done.
**Exit:** Backend deployed (MEL-130), frontend deployed (MEL-131), and production
seed + smoke test (MEL-132).

### M14 — Portfolio presentation & documentation
**Goal:** Make the project legible and impressive to reviewers with a polished
README (screenshots/GIFs/run instructions/live link) and an architecture
write-up with a decisions index.
**Entry:** Frontend deployed (MEL-131) and e2e journey (MEL-123) done.
**Exit:** README polish (MEL-140) and portfolio architecture write-up (MEL-141).

---

## Critical path

The longest chain of strictly dependent work — the sequence that determines the
minimum end-to-end schedule — is:

**MEL-001 → MEL-005 → MEL-010 → MEL-014 → MEL-031 → MEL-050 → MEL-051 → MEL-052
→ MEL-053 → MEL-082 → MEL-123 → MEL-130/131/132 → MEL-140/141**

Read as: bootstrap the repo, scaffold docs, define the product, then the domain
model (MEL-014). The domain model unblocks the static data module (MEL-031),
which (with the playback architecture from M2) feeds the playback engine chain
(MEL-050 → 051 → 052 → 053). Playback plus the API swap (MEL-082) enable the
end-to-end journey (MEL-123), which gates deployment (MEL-130/131/132) and the
final portfolio docs (MEL-140/141).

Within M2, **MEL-015 (comic layout)** and **MEL-016 (playback state)** are
**parallel architecture gates**: they run alongside MEL-014 but each blocks its
own downstream stream (MEL-015 → layout/panel work; MEL-016 → playback work).
All three architecture tickets precede any implementation that depends on them.

## Parallelizable work

- **Architecture tickets (M2):** MEL-014, MEL-015, and MEL-016 can be authored
  in parallel by different contributors; they share MEL-010 as input but do not
  depend on each other.
- **Frontend slice vs backend foundation:** the static frontend slice
  (MEL-031–MEL-033) proceeds in parallel with the Express/Mongo foundation
  (MEL-070–MEL-073) because both build against the same documented API contract
  (MEL-018). They converge at MEL-082.
- **Accessibility alongside features:** a11y requirements are drafted and applied
  as features are built (M3–M10), then consolidated in M11 (MEL-110–MEL-112),
  rather than bolted on at the end.
- **Content in parallel:** the museum and directions content tickets (MEL-090,
  MEL-091) can be written in parallel with each other and with other work as
  soon as the seed pattern (MEL-073) exists.
