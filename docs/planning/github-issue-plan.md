# GitHub Issue Plan

This is the chronological, dependency-aware issue backlog for Manga English Lab.
It is the source of truth for *what* gets built and *in what order*; the
milestone-level sequencing and critical path live in
[`implementation-roadmap.md`](./implementation-roadmap.md).

**How to read and use this plan:**

- **Every issue uses the template** in
  [`.github/ISSUE_TEMPLATE/implementation-task.md`](../../.github/ISSUE_TEMPLATE/implementation-task.md).
  The fields below are a condensed preview; the filed GitHub issue expands them
  into the full template.
- **Issues are deliberately small** — each is scoped to be reviewable in one
  sitting and to close with a single focused DRAFT pull request.
- **Architecture tickets precede implementation.** The three mandated
  architecture tickets — **MEL-014 (domain model)**, **MEL-015 (comic layout)**,
  and **MEL-016 (playback state)** — are completed before any issue that depends
  on them, and they produce ADRs.
- **The domain model is a working proposal.** MEL-014 proposes a concrete
  MongoDB structure, but it is explicitly refinable: any material change made
  during implementation is recorded as an ADR rather than silently applied.
- Each entry lists **Dependencies** (blocked by) and **Blocks** (issues that
  cannot start until this is done) so the graph is navigable from either side.
- The four flagged issues (**MEL-001, MEL-014, MEL-015, MEL-016**) include fuller
  detail (Purpose, Scope, Architecture questions, Testing, Accessibility,
  Documentation, Risks, Deferred follow-up) because they are foundational.

---

## M1 — Repository & tooling foundation

### MEL-001 — Initialize repo, npm workspaces & base config
- **Size:** S · **Milestone:** M1 · **Fits one PR:** yes
- **Dependencies:** none
- **Blocks:** MEL-002, MEL-003, MEL-004, MEL-005, MEL-030, MEL-070
- **Recommended branch:** `chore/repo-init`

**Purpose:** Establish the npm-workspaces monorepo skeleton (`client/`,
`server/`) with a root `package.json`, shared `.gitignore`, `.editorconfig`,
Node version pin, and baseline npm scripts so all later work has a consistent,
reproducible home.

**Scope:**
- Root `package.json` declaring npm workspaces (`client`, `server`) with ESM
  (`"type": "module"`).
- Placeholder `client/` and `server/` workspace `package.json` files (no app code
  yet, no runtime dependencies added).
- `.gitignore`, `.editorconfig`, `.nvmrc` (or `engines` field) pinning the Node
  version; root README stub.
- Root convenience scripts (e.g. `lint`, `test`, `dev`) wired to per-workspace
  scripts as no-op/placeholder where needed.

**Architecture questions to resolve:**
- Single monorepo with npm workspaces vs. two separate repos? (Recorded in
  ADR-0001, MEL-011.)
- ESM-only across both workspaces vs. mixed module systems?
- Node version to pin for local dev, CI, and deployment parity.

**Acceptance criteria:**
- [ ] `npm install` at the root bootstraps both workspaces without error.
- [ ] Root `package.json` declares `client` and `server` workspaces and ESM.
- [ ] `.gitignore`, `.editorconfig`, and Node version pin are present.
- [ ] Root scripts (`lint`, `test`) run across workspaces (placeholders OK).
- [ ] No application/source code and no runtime dependencies are added.

**Non-goals:**
- Adding ESLint/Prettier config (MEL-002) or CI (MEL-003).
- Scaffolding the React or Express apps (MEL-030, MEL-070).

**Testing requirements:** Verify a clean `npm install` and that placeholder
`npm test`/`npm run lint` exit successfully from the root.

**Accessibility requirements:** N/A (no UI).

**Documentation requirements:** README stub describing the monorepo layout and
bootstrap command; note that ADR-0001 will formalize the structure.

**Known risks:** Workspace/ESM misconfiguration causing cascading tooling
failures — mitigated by keeping the skeleton minimal and validating install
early. **Deferred follow-up:** shared internal packages beyond `client`/`server`
if later needed.

### MEL-002 — ESLint + Prettier shared config
- **Size:** S · **Milestone:** M1 · **Fits one PR:** yes
- **Dependencies:** MEL-001
- **Blocks:** MEL-003
- **Recommended branch:** `chore/lint-format`
- **Acceptance criteria:**
  - [ ] Shared ESLint config applied to both workspaces (ESM, React rules in `client`).
  - [ ] Prettier config plus format script; ESLint and Prettier do not conflict.
  - [ ] `npm run lint` and `npm run format:check` run from the root.
  - [ ] Existing placeholder files pass lint/format clean.
- **Non-goals:** Adding TypeScript; enforcing rules in CI (that is MEL-003).

### MEL-003 — CI skeleton (lint + test placeholders)
- **Size:** S · **Milestone:** M1 · **Fits one PR:** yes
- **Dependencies:** MEL-001, MEL-002
- **Blocks:** —
- **Recommended branch:** `ci/github-actions`
- **Acceptance criteria:**
  - [ ] GitHub Actions workflow runs on PRs and pushes to the default branch.
  - [ ] Workflow installs workspaces, runs lint and the test placeholder.
  - [ ] Node version matches the repo pin from MEL-001.
  - [ ] Workflow status is green on a no-op PR.
- **Non-goals:** Deployment automation (M13); coverage gates.

### MEL-004 — Issue & PR templates
- **Size:** XS · **Milestone:** M1 · **Fits one PR:** yes
- **Dependencies:** MEL-001
- **Blocks:** —
- **Recommended branch:** `chore/gh-templates`
- **Acceptance criteria:**
  - [ ] `.github/ISSUE_TEMPLATE/implementation-task.md` present with all fields.
  - [ ] `.github/pull_request_template.md` present with all sections.
  - [ ] New issues/PRs render the templates correctly on GitHub.
- **Non-goals:** Adding label automation or additional issue types.

### MEL-005 — Documentation scaffolding (`docs/` tree)
- **Size:** S · **Milestone:** M1 · **Fits one PR:** yes
- **Dependencies:** MEL-001
- **Blocks:** MEL-010
- **Recommended branch:** `docs/scaffold`
- **Acceptance criteria:**
  - [ ] `docs/` tree created (`docs/planning/`, `docs/adr/`, `docs/architecture/`).
  - [ ] `docs/adr/` contains an ADR template and numbering convention.
  - [ ] `docs/README.md` index explains the docs layout.
  - [ ] Links resolve within the repo.
- **Non-goals:** Writing product or architecture content (M2).

---

## M2 — Product & architecture decisions (ADR-producing, no app code)

> No application code is written in this milestone. Output is docs and ADRs.

### MEL-010 — Product requirements + MVP scope docs
- **Size:** M · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-005
- **Blocks:** MEL-012, MEL-013, MEL-014, MEL-015, MEL-016
- **Recommended branch:** `docs/product-requirements`
- **Acceptance criteria:**
  - [ ] Product overview: comic-style English learning, 3 scenarios × exactly 3 complete ordered variations.
  - [ ] MVP scope fixed: Read/Listen modes; Practice deferred; media as URLs only; background/environmental audio in MVP with a settings mixer.
  - [ ] Learner personas and the core learner journey documented.
  - [ ] Glossary of product terms (never call hidden text "muted"; muted = audio only).
  - [ ] Explicit in-scope vs. out-of-scope list for the MVP.
- **Non-goals:** Choosing technologies or data structures (ADRs / MEL-014–016).

### MEL-011 — ADR-0001 repository structure
- **Size:** XS · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-001, MEL-005
- **Blocks:** —
- **Recommended branch:** `docs/adr-0001`
- **Acceptance criteria:**
  - [ ] ADR-0001 records the npm-workspaces monorepo decision and alternatives.
  - [ ] Consequences and trade-offs documented.
  - [ ] Status set to Accepted; linked from the ADR index.
- **Non-goals:** Changing the repo layout established in MEL-001.

### MEL-012 — ADR-0002 JavaScript vs TypeScript
- **Size:** XS · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-010
- **Blocks:** —
- **Recommended branch:** `docs/adr-0002`
- **Acceptance criteria:**
  - [ ] ADR-0002 records the JavaScript-ESM decision with rationale.
  - [ ] Trade-offs vs. TypeScript (type safety, velocity, portfolio signal) captured.
  - [ ] Mitigations noted (JSDoc, runtime validation).
- **Non-goals:** Introducing TypeScript tooling.

### MEL-013 — ADR-0003 REST vs GraphQL
- **Size:** XS · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-010
- **Blocks:** MEL-018
- **Recommended branch:** `docs/adr-0003`
- **Acceptance criteria:**
  - [ ] ADR-0003 records the REST decision and rationale for this read-heavy app.
  - [ ] GraphQL alternative and trade-offs documented.
  - [ ] Implications for the API contract (MEL-018) noted.
- **Non-goals:** Specifying endpoints (that is MEL-018).

### MEL-014 — Domain-model architecture ticket ⭐
- **Size:** L · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-010
- **Blocks:** MEL-018, MEL-031, MEL-050, MEL-072
- **Recommended branch:** `docs/domain-model`

**Purpose:** Produce the authoritative, MongoDB-oriented data model for a
Scenario and everything embedded within it, so the frontend static data
(MEL-031), Mongoose schemas (MEL-072), API contract (MEL-018), and playback
engine (MEL-050) all build against one consistent shape.

**User/engineering value:** A single well-justified model prevents costly
divergence between client, server, and seed data, and demonstrates deliberate
data-modeling judgment to reviewers.

**Scope:**
- Propose **at least two** candidate MongoDB structures for a Scenario, each with
  a **complete example document** that contains:
  - exactly **3 variations**, ordered;
  - **multiple panels** per variation, with **more than one line** in at least
    one panel;
  - **character-to-line associations** via a stable `speakerKey`;
  - a **per-line audio path** (URL);
  - **percentage-based bubble placement** (x/y/width as percentages);
  - a per-variation **`layoutTemplate`** naming the panel arrangement, whose
    declared panel count matches that variation's `panels.length`;
  - an embedded **glossary**.
- Compare **embedded vs. referenced** modeling for characters, variations,
  panels, and lines, with the read/update patterns that justify the choice.
- Define proposed **Mongoose sub-schemas** (Scenario → characters[],
  variations[] → panels[] → lines[], glossary[]).
- Recommend a single **MVP structure** and mark it as a working proposal.

**Architecture questions to resolve:**
- **Semantic keys vs. Mongo `_id`s:** use human-readable `slug`/`speakerKey` for
  URLs and cross-references, or lean on ObjectIds? Where is each appropriate?
- Should subdocument `_id` fields be **retained or disabled** (`_id: false`) for
  embedded panels/lines/glossary entries?
- **Embedded vs. referenced:** given a Scenario is read whole and rarely edited,
  does full embedding win over references? What are the document-size and
  update-locality implications?
- How is **speaker-key referential integrity** enforced (every line's
  `speakerKey` maps to a declared character)? Schema-level, runtime, or both?
- What **runtime validation** (beyond Mongoose) guards seed authoring and API
  input?
- What **nested update patterns** would a later Practice/editing feature need,
  and do they pressure the embedded choice (i.e. **migration pressures**)?
- How are **slugs** generated, validated for uniqueness, and used in routes?

**Implementation notes:** Deliver as a design doc with side-by-side JSON example
documents and a decision matrix. Keep example audio/image values as URLs. The
recommended shape should be directly translatable into MEL-072 sub-schemas and
MEL-031 static data.

**Acceptance criteria:**
- [ ] ≥2 candidate structures, each with a full example document meeting every
      content requirement above (3 variations, multi-line panel, glossary, etc.).
- [ ] Embedded-vs-referenced comparison with explicit read/update rationale.
- [ ] Decisions on semantic keys vs. `_id`s and on subdocument `_id` retention.
- [ ] Proposed Mongoose sub-schemas and the speaker-key integrity strategy.
- [ ] A per-variation `layoutTemplate` field (named-template enum) with a
      validator asserting `panels.length` matches the template's panel count.
- [ ] A recommended MVP structure, marked refinable, with an ADR stub for it.
- [ ] Statement that material changes during implementation are recorded in an ADR.

**Non-goals:** Writing Mongoose code (MEL-072), building the API (MEL-018/080),
or authoring museum/directions content (M9).

**Testing requirements:** No code, but the example documents must be
machine-valid JSON and internally consistent (every `speakerKey` resolves; every
line has an audio URL; bubble percentages within 0–100; every variation's
`layoutTemplate` panel count equals its `panels.length`). Note the validation
checks MEL-072/MEL-073 will later enforce.

**Accessibility requirements:** Ensure the model can express what a11y needs —
line ordering (reading/playback order), per-character metadata, and text
separate from audio — so hidden-text and screen-reader features are expressible.

**Documentation requirements:** Design doc under `docs/architecture/`; an ADR
capturing the recommended MVP structure; cross-links from the API contract.

**Known risks:** Over-embedding causing unwieldy documents, or under-specifying
integrity leading to broken seeds. Mitigate by validating example docs and
documenting migration pressures up front. **Deferred follow-up:** editing/write
model for Practice mode; localization; versioned content.

### MEL-015 — Comic-layout architecture ticket ⭐
- **Size:** L · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-010
- **Blocks:** MEL-033, MEL-040, MEL-041, MEL-100
- **Recommended branch:** `docs/comic-layout`

**Purpose:** Define the reusable comic rendering system — how finished panel
images, speech bubbles, and layouts are composed — so panel/bubble components
(MEL-040/041), the desktop page (MEL-042), and the mobile single-panel view
(MEL-100) share one coherent model.

**User/engineering value:** A documented layout model prevents ad-hoc,
inconsistent components and ensures placement/accessibility behavior is uniform
across scenarios.

**Scope & questions to evaluate:**
- **Reusable panel templates** driven by data vs. bespoke per-scenario markup.
- **Named layout templates** selected per variation via `layoutTemplate`: a small
  catalog (e.g. `single`, `two-up`, `grid-2x2`, `grid-2x3`) fixing panel
  **count**, **dimensions**, and **arrangement**, with panel-count agreement
  enforced against `panels.length` (see data-model.md / ADR 0018).
- **Fixed aspect ratios** for panels and how **finished images** (URLs) fill them
  without distortion.
- **Percentage-based bubble positions** (x/y), **bubble width**, and **tail
  configuration** (direction/anchor toward the speaker).
- **Text wrapping** inside bubbles and behavior when **text is hidden**
  (bubble/space handling that never implies "muted").
- **Active highlighting** of the currently playing line/bubble.
- **Desktop multi-panel** layout vs. **mobile single-panel** layout, and
  **panel navigation** including **automatic mobile panel changes during
  playback**.
- **DOM order vs. visual order:** guarantee DOM/reading order equals playback
  order regardless of visual placement.
- **Keyboard interaction** and **screen-reader behavior** for panels/bubbles.
- **Image loading** strategy and avoiding **layout shift** (reserve space via
  aspect ratio).
- A set of **representative panel configurations** to test against (single line,
  multiple lines, edge-positioned bubbles, hidden text).

**Acceptance criteria:**
- [ ] Documented reusable panel/bubble model with fixed aspect ratios and
      percentage placement, width, and tail config.
- [ ] Named-template catalog documented (each `layoutTemplate` with its panel
      count/dimensions/arrangement) and the `panels.length` agreement rule stated.
- [ ] Defined behavior for text wrapping, hidden text, and active highlighting.
- [ ] Desktop multi-panel and mobile single-panel layouts specified, including
      auto panel changes during playback.
- [ ] DOM-order-equals-playback-order rule stated with rationale.
- [ ] Keyboard and screen-reader behavior for panels/bubbles defined.
- [ ] Image-loading/layout-shift strategy and a list of representative panel
      configs for testing.

**Non-goals:** Building the components (MEL-040/041) or the playback engine
(MEL-016/050).

**Testing requirements:** Enumerate the representative panel configurations that
MEL-122 component tests will cover; specify how layout-shift and placement are to
be verified.

**Accessibility requirements:** DOM/reading order = playback order; keyboard
operability; screen-reader panel descriptions and bubble semantics; text
independent of audio.

**Documentation requirements:** Layout design doc under `docs/architecture/`
with annotated diagrams and the representative-config catalog.

**Known risks:** Layout shift from late-loading images and bubble overlap at
extreme percentages. Mitigate with reserved aspect-ratio boxes and documented
placement constraints. **Deferred follow-up:** panel transition animations;
richer bubble shapes; theming.

### MEL-016 — Playback architecture ticket ⭐
- **Size:** L · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-010
- **Blocks:** MEL-017, MEL-050, MEL-051
- **Recommended branch:** `docs/playback-state`

**Purpose:** Specify the framework-agnostic playback state machine and its clean
separation from browser audio APIs, so the engine (MEL-050) and audio adapter
(MEL-051) can be built and unit-tested deterministically.

**User/engineering value:** A precise, testable spec makes the most complex part
of the app reliable and reviewable, and keeps playback logic independent of React
and the DOM.

**Scope & behaviors to define:**
- **Queue construction** from a variation's panels→lines and the **ordering**
  rule; a single **global position** (cursor) across all lines.
- Behavior for **play / pause / restart / end**, and **individual bubble
  playback** (play one line on click).
- **Moving the global position** after a bubble click, and how playback resumes
  from the selected line (PlayingSelected → Playing).
- **Active-line highlighting** derivation from the cursor and **panel
  transitions** as the cursor crosses panel boundaries.
- **Muted-character behavior:** a line with `audioEnabled=false` still advances,
  and playback **waits the real audio duration** (from preloaded metadata)
  before moving on — never treated as text-only skip.
- **Audio cleanup**, handling **rapid clicks**, **route changes**, component
  **unmounting**, and avoiding **stale listeners**.
- **Autoplay restrictions** (user-gesture requirement) and **missing/invalid
  audio error handling**.
- Playback states: **Idle / Playing / Paused / PlayingSelected / Complete**.
- A **testable separation** between pure playback state (deterministic, no
  browser APIs) and the audio adapter (side effects), enabling unit tests with a
  fake clock/adapter.

**Acceptance criteria:**
- [ ] State machine defined with states Idle/Playing/Paused/PlayingSelected/
      Complete and all transitions.
- [ ] Queue construction, ordering, global-position, and bubble-click reposition
      behavior specified.
- [ ] Muted-line rule specified: advance only after waiting real audio duration.
- [ ] Lifecycle/robustness rules for cleanup, rapid clicks, route change,
      unmount, and stale listeners.
- [ ] Autoplay-restriction and missing/invalid-audio error handling defined.
- [ ] Documented boundary between pure state and browser audio (unit-testable
      via injected adapter/clock).

**Non-goals:** Implementing the engine (MEL-050) or the HTMLAudio adapter
(MEL-051); UI wiring (MEL-052).

**Testing requirements:** Define the unit-test matrix MEL-121 will implement —
state transitions, cursor movement, muted-line timing with a fake clock, and
bubble-select resume — all without real audio.

**Accessibility requirements:** Active-line highlighting and cursor position must
be exposable for screen-reader announcements; state changes must be observable by
the UI a11y layer (MEL-111).

**Documentation requirements:** Playback design doc + state diagram under
`docs/architecture/`; interface for the audio adapter contract (feeds MEL-017).

**Known risks:** Hidden coupling to the DOM/audio making tests flaky, and timing
bugs around muted-line waits and rapid clicks. Mitigate via the injected-adapter
boundary and a fake clock. **Deferred follow-up:** variable playback speed;
gapless prefetch.

### MEL-017 — Audio strategy doc
- **Size:** M · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-016
- **Blocks:** MEL-051
- **Recommended branch:** `docs/audio-strategy`
- **Acceptance criteria:**
  - [ ] HTMLAudio approach and metadata/duration preload strategy documented.
  - [ ] Handling for missing/invalid audio and autoplay restrictions defined.
  - [ ] Muted-line real-duration-wait requirement restated for the adapter.
  - [ ] Media-as-URLs constraint noted; background/environmental audio (separate looping channel + settings mixer) documented as in-MVP.
- **Non-goals:** Implementing the adapter (MEL-051).

### MEL-018 — API contract doc
- **Size:** M · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-013, MEL-014
- **Blocks:** MEL-022, MEL-080
- **Recommended branch:** `docs/api-contract`
- **Acceptance criteria:**
  - [ ] REST endpoints defined: `GET /scenarios` (published list) and
        `GET /scenarios/:slug` (full document).
  - [ ] Request/response shapes match the MEL-014 domain model exactly.
  - [ ] Error responses, status codes, and published-vs-draft filtering specified.
  - [ ] Contract is explicitly the shared target for MEL-031 static data and the API.
- **Non-goals:** Implementing endpoints (MEL-080/081); write endpoints.

### MEL-019 — Frontend & backend architecture docs + state-mgmt ADR-0013
- **Size:** M · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-014, MEL-015, MEL-016
- **Blocks:** MEL-030, MEL-070
- **Recommended branch:** `docs/fe-be-architecture`
- **Acceptance criteria:**
  - [ ] Frontend architecture documented (component structure, data layer, routing).
  - [ ] Backend architecture documented (Express layering, config, error handling).
  - [ ] ADR-0013 records native React state + hooks (no Redux) with rationale.
  - [ ] Folder conventions for `client/` and `server/` defined.
- **Non-goals:** Scaffolding the apps (MEL-030/070).

### MEL-020 — Accessibility architecture doc
- **Size:** M · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-015, MEL-016
- **Blocks:** MEL-110, MEL-111, MEL-112
- **Recommended branch:** `docs/accessibility`
- **Acceptance criteria:**
  - [ ] A11y principles and targets (WCAG level) documented for the MVP.
  - [ ] Keyboard model, focus management, and screen-reader announcement plan defined.
  - [ ] Reading-order = playback-order requirement restated.
  - [ ] Reduced-motion, contrast, loading/error, and touch-target guidance included.
- **Non-goals:** Implementing a11y features (M11).

### MEL-021 — Testing strategy doc
- **Size:** M · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-014, MEL-015, MEL-016
- **Blocks:** MEL-120, MEL-121, MEL-122, MEL-123
- **Recommended branch:** `docs/test-strategy`
- **Acceptance criteria:**
  - [ ] Test pyramid defined: unit (playback), component, backend integration, e2e.
  - [ ] Tooling/runners chosen per layer with rationale.
  - [ ] Playback engine testability approach (fake clock/adapter) documented.
  - [ ] Coverage expectations and CI integration outlined.
- **Non-goals:** Writing tests (M12).

### MEL-022 — Deployment architecture doc + ADR-0017
- **Size:** M · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-018
- **Blocks:** MEL-130, MEL-131
- **Recommended branch:** `docs/deployment`
- **Acceptance criteria:**
  - [ ] Target hosting for frontend and backend documented; ADR-0017 records the choice.
  - [ ] MongoDB Atlas free-tier plan and env-var/config strategy defined.
  - [ ] CORS, environments, and seed-in-production approach outlined.
  - [ ] Rollback/smoke-test expectations noted.
- **Non-goals:** Performing deployment (M13).

### MEL-023 — Implementation roadmap + issue plan docs
- **Size:** M · **Milestone:** M2 · **Fits one PR:** yes
- **Dependencies:** MEL-010, MEL-011, MEL-012, MEL-013, MEL-014, MEL-015, MEL-016, MEL-017, MEL-018, MEL-019, MEL-020, MEL-021, MEL-022
- **Blocks:** —
- **Recommended branch:** `docs/roadmap`
- **Acceptance criteria:**
  - [ ] `implementation-roadmap.md` with M1–M14, entry/exit, critical path, parallelism.
  - [ ] `github-issue-plan.md` enumerating every issue with the template fields.
  - [ ] Cross-links between roadmap, issue plan, ADRs, and architecture docs resolve.
  - [ ] Architecture-before-implementation ordering reflected.
- **Non-goals:** Filing the issues on GitHub (process step, not a doc).

---

## M3 — Static restaurant vertical slice

### MEL-030 — Scaffold React (Vite) client app
- **Size:** S · **Milestone:** M3 · **Fits one PR:** yes
- **Dependencies:** MEL-001, MEL-019
- **Blocks:** MEL-032, MEL-033
- **Recommended branch:** `feat/client-scaffold`
- **Acceptance criteria:**
  - [ ] Vite + React app runs in the `client/` workspace with ESM.
  - [ ] Routing library installed and a base router with a placeholder route.
  - [ ] Folder structure follows the FE architecture doc (MEL-019).
  - [ ] `npm run dev` and `npm run build` succeed for the client.
- **Non-goals:** Building scenario UI or data (MEL-031/032/033).

### MEL-031 — Static restaurant seed data module (shaped like API response)
- **Size:** M · **Milestone:** M3 · **Fits one PR:** yes
- **Dependencies:** MEL-014
- **Blocks:** MEL-032, MEL-033, MEL-050, MEL-073
- **Recommended branch:** `feat/restaurant-static-data`
- **Acceptance criteria:**
  - [ ] Restaurant scenario as a static module matching the MEL-014 model exactly.
  - [ ] Exactly 3 ordered variations, panels with lines, characters[]+speakerKey, glossary.
  - [ ] Percentage bubble placement and per-line audio URLs present.
  - [ ] Shape matches the MEL-018 API contract so it can be swapped later.
  - [ ] Data is internally consistent (every `speakerKey` resolves).
- **Non-goals:** Fetching from a server; museum/directions content (M9).

### MEL-032 — Scenario list + scenario route (static)
- **Size:** S · **Milestone:** M3 · **Fits one PR:** yes
- **Dependencies:** MEL-030, MEL-031
- **Blocks:** MEL-033, MEL-082
- **Recommended branch:** `feat/scenario-list`
- **Acceptance criteria:**
  - [ ] Scenario list view renders from static data with slugs as links.
  - [ ] Scenario route (`/scenarios/:slug`) resolves to a scenario view.
  - [ ] Unknown slug shows a not-found state.
  - [ ] Navigation is keyboard operable.
  - [ ] Landing page renders a loading state wired to the fetch hook's `loading`, with room for a delayed cold-start message (see frontend-architecture.md); the message copy is exercised when the live API is wired in MEL-082.
- **Non-goals:** Rendering panels/playback (MEL-033+); live-API cold-start message copy (MEL-082).

### MEL-033 — Render a single panel from data (no playback)
- **Size:** M · **Milestone:** M3 · **Fits one PR:** yes
- **Dependencies:** MEL-031, MEL-032, MEL-015
- **Blocks:** MEL-040
- **Recommended branch:** `feat/panel-render`
- **Acceptance criteria:**
  - [ ] A single panel renders its finished image at a fixed aspect ratio.
  - [ ] Speech bubbles render at percentage positions with text.
  - [ ] DOM/reading order matches playback order.
  - [ ] No layout shift once the image loads.
- **Non-goals:** Multi-panel layout (MEL-042); playback (M5).

---

## M4 — Reusable panel & speech-bubble system

### MEL-040 — ComicPanel template component
- **Size:** M · **Milestone:** M4 · **Fits one PR:** yes
- **Dependencies:** MEL-033
- **Blocks:** MEL-041, MEL-042
- **Recommended branch:** `feat/comic-panel-template`
- **Acceptance criteria:**
  - [ ] Reusable `ComicPanel` renders any panel from data (image + bubbles).
  - [ ] Fixed aspect ratio reserves space to prevent layout shift.
  - [ ] Accepts an active-line indicator prop for later highlighting.
  - [ ] Handles multiple lines per panel.
- **Non-goals:** Bubble internals beyond composition (MEL-041); playback wiring.

### MEL-041 — SpeechBubble component (positioning/tail/width/hidden-text)
- **Size:** M · **Milestone:** M4 · **Fits one PR:** yes
- **Dependencies:** MEL-040
- **Blocks:** MEL-042, MEL-043, MEL-060
- **Recommended branch:** `feat/speech-bubble`
- **Acceptance criteria:**
  - [ ] Bubble positions via percentage x/y with configurable width.
  - [ ] Tail direction/anchor points toward the speaker.
  - [ ] Text wraps within the bubble; hidden-text state renders without implying "muted".
  - [ ] Supports an active-highlight visual state.
  - [ ] Bubble is a semantic, focusable element for later interaction.
- **Non-goals:** Playback logic (M5); text/audio controls (M6).

### MEL-042 — Desktop comic-page multi-panel layout
- **Size:** M · **Milestone:** M4 · **Fits one PR:** yes
- **Dependencies:** MEL-040, MEL-041
- **Blocks:** MEL-052, MEL-100
- **Recommended branch:** `feat/comic-page-desktop`
- **Acceptance criteria:**
  - [ ] Multiple panels lay out as a comic page on desktop.
  - [ ] Panels render in playback order; DOM order matches.
  - [ ] Layout is stable across representative panel configs (MEL-015).
  - [ ] No horizontal overflow at target desktop widths.
- **Non-goals:** Mobile single-panel view (MEL-100); playback (M5).

### MEL-043 — DOM/reading order = playback order (a11y)
- **Size:** S · **Milestone:** M4 · **Fits one PR:** yes
- **Dependencies:** MEL-041
- **Blocks:** MEL-111
- **Recommended branch:** `feat/reading-order`
- **Acceptance criteria:**
  - [ ] DOM order of panels/bubbles equals playback/reading order everywhere.
  - [ ] Tab order follows the same sequence.
  - [ ] Verified against a multi-panel, multi-line config.
- **Non-goals:** Screen-reader announcements (MEL-111).

---

## M5 — Playback engine

### MEL-050 — Playback state machine (framework-agnostic, unit-tested)
- **Size:** L · **Milestone:** M5 · **Fits one PR:** yes
- **Dependencies:** MEL-016, MEL-031
- **Blocks:** MEL-051, MEL-052, MEL-121
- **Recommended branch:** `feat/playback-engine`
- **Acceptance criteria:**
  - [ ] Engine implements Idle/Playing/Paused/PlayingSelected/Complete per MEL-016.
  - [ ] Builds an ordered queue with a single global position (cursor).
  - [ ] Pure and framework-agnostic; audio side effects injected via an adapter.
  - [ ] Unit tests cover transitions and cursor movement with a fake clock/adapter.
  - [ ] Bubble-select repositions the cursor and resumes correctly.
- **Non-goals:** Real HTMLAudio (MEL-051); UI wiring (MEL-052).

### MEL-051 — Audio adapter (HTMLAudio + metadata/duration preload)
- **Size:** M · **Milestone:** M5 · **Fits one PR:** yes
- **Dependencies:** MEL-050, MEL-017
- **Blocks:** MEL-052, MEL-061
- **Recommended branch:** `feat/audio-adapter`
- **Acceptance criteria:**
  - [ ] Adapter implements the MEL-050 audio interface using HTMLAudio.
  - [ ] Preloads metadata/duration for lines.
  - [ ] Handles missing/invalid audio and autoplay restrictions gracefully.
  - [ ] Cleans up listeners/resources on stop/unmount.
- **Non-goals:** Muted-line UI (MEL-061); the environmental-audio channel and settings mixer (tracked as separate work).

### MEL-052 — Wire engine to UI (play/pause/restart + active highlight)
- **Size:** M · **Milestone:** M5 · **Fits one PR:** yes
- **Dependencies:** MEL-050, MEL-051, MEL-042
- **Blocks:** MEL-053, MEL-060, MEL-061, MEL-100
- **Recommended branch:** `feat/playback-controls`
- **Acceptance criteria:**
  - [ ] Play/pause/restart controls drive the engine.
  - [ ] Active line/bubble is highlighted from the cursor.
  - [ ] Panel focus/scroll follows the cursor across panels.
  - [ ] Controls are keyboard operable with visible focus.
- **Non-goals:** Individual bubble select (MEL-053); character controls (M6).

### MEL-053 — Individual bubble playback + resume-from-selected
- **Size:** M · **Milestone:** M5 · **Fits one PR:** yes
- **Dependencies:** MEL-052
- **Blocks:** MEL-101, MEL-110
- **Recommended branch:** `feat/bubble-select`
- **Acceptance criteria:**
  - [ ] Clicking a bubble plays that line (PlayingSelected) and moves the cursor.
  - [ ] Resume continues from the selected line in order.
  - [ ] Rapid clicks are handled without overlapping audio.
  - [ ] Works via keyboard activation.
- **Non-goals:** Mobile nav (MEL-101); a11y announcements (M11).

---

## M6 — Character practice controls

### MEL-060 — Per-character textVisible controls
- **Size:** S · **Milestone:** M6 · **Fits one PR:** yes
- **Dependencies:** MEL-041, MEL-052
- **Blocks:** MEL-062
- **Recommended branch:** `feat/text-visibility`
- **Acceptance criteria:**
  - [ ] Per-character `textVisible` toggles show/hide that character's bubble text.
  - [ ] Hidden text never implies "muted"; audio unaffected.
  - [ ] State persists across panels within a session.
  - [ ] Toggles are keyboard operable and labeled.
- **Non-goals:** Audio toggles (MEL-061); mode presets (MEL-062).

### MEL-061 — Per-character audioEnabled controls (muted lines wait real duration)
- **Size:** M · **Milestone:** M6 · **Fits one PR:** yes
- **Dependencies:** MEL-051, MEL-052
- **Blocks:** MEL-062, MEL-121
- **Recommended branch:** `feat/audio-enabled`
- **Acceptance criteria:**
  - [ ] Per-character `audioEnabled` toggles that character's audio.
  - [ ] Muted lines still advance after waiting the real audio duration.
  - [ ] Muted state never hides text (independent from `textVisible`).
  - [ ] Toggles are keyboard operable and labeled.
- **Non-goals:** Mode presets (MEL-062).

### MEL-062 — Learning-mode presets Read/Listen/Practice
- **Size:** M · **Milestone:** M6 · **Fits one PR:** yes
- **Dependencies:** MEL-060, MEL-061
- **Blocks:** MEL-110, MEL-122
- **Recommended branch:** `feat/learning-modes`
- **Acceptance criteria:**
  - [ ] Read/Listen presets configure textVisible/audioEnabled appropriately (MVP).
  - [ ] Practice preset scaffolded per product scope (deferred behaviors noted).
  - [ ] Switching modes updates per-character controls consistently.
  - [ ] Mode selector is keyboard operable and labeled.
- **Non-goals:** Full Practice interactions beyond MVP.

---

## M7 — Express & MongoDB foundation

### MEL-070 — Scaffold Express server + env-var validation
- **Size:** S · **Milestone:** M7 · **Fits one PR:** yes
- **Dependencies:** MEL-001, MEL-019
- **Blocks:** MEL-071
- **Recommended branch:** `feat/server-scaffold`
- **Acceptance criteria:**
  - [ ] Express app runs in the `server/` workspace with ESM.
  - [ ] Environment variables validated at startup; missing config fails fast.
  - [ ] Health-check route responds; layering follows the BE architecture doc.
  - [ ] `npm run dev` starts the server.
- **Non-goals:** Database connection (MEL-071); routes (M8).

### MEL-071 — Mongoose connection + config
- **Size:** S · **Milestone:** M7 · **Fits one PR:** yes
- **Dependencies:** MEL-070
- **Blocks:** MEL-072
- **Recommended branch:** `feat/mongoose-connect`
- **Acceptance criteria:**
  - [ ] Mongoose connects using validated env config.
  - [ ] Connection lifecycle (connect/retry/disconnect) handled cleanly.
  - [ ] Connection errors are logged and fail fast where appropriate.
  - [ ] Local dev connection documented.
- **Non-goals:** Schemas (MEL-072); seeding (MEL-073).

### MEL-072 — Mongoose schemas & sub-schemas from data-model
- **Size:** L · **Milestone:** M7 · **Fits one PR:** yes
- **Dependencies:** MEL-014, MEL-071
- **Blocks:** MEL-073, MEL-080, MEL-120
- **Recommended branch:** `feat/schemas`
- **Acceptance criteria:**
  - [ ] Scenario schema with sub-schemas (characters[], variations→panels→lines, glossary).
  - [ ] Matches the MEL-014 recommended model, including `_id` decisions.
  - [ ] Slug uniqueness and speaker-key integrity enforced.
  - [ ] Validation for percentages, required audio URLs, and ordering.
  - [ ] `layoutTemplate` enum plus a validator asserting each variation's
        `panels.length` matches its template's declared panel count.
- **Non-goals:** Seeding (MEL-073); API endpoints (M8).

### MEL-073 — Seed script + seed-data validation
- **Size:** M · **Milestone:** M7 · **Fits one PR:** yes
- **Dependencies:** MEL-072, MEL-031
- **Blocks:** MEL-090, MEL-091
- **Recommended branch:** `feat/seed-restaurant`
- **Acceptance criteria:**
  - [ ] Seed script loads the restaurant scenario into MongoDB.
  - [ ] Seed validates data against schemas before insert.
  - [ ] Idempotent (safe to re-run) with clear logging.
  - [ ] Establishes the reusable seed pattern for M9 content.
- **Non-goals:** Museum/directions content (M9).

---

## M8 — API integration

### MEL-080 — GET /scenarios (published list)
- **Size:** S · **Milestone:** M8 · **Fits one PR:** yes
- **Dependencies:** MEL-072, MEL-018
- **Blocks:** MEL-081
- **Recommended branch:** `feat/api-list`
- **Acceptance criteria:**
  - [ ] `GET /scenarios` returns published scenarios per the MEL-018 contract.
  - [ ] Draft/unpublished scenarios are excluded.
  - [ ] Response shape matches the contract exactly.
  - [ ] Errors return documented status codes.
- **Non-goals:** Single-scenario endpoint (MEL-081); write endpoints.

### MEL-081 — GET /scenarios/:slug (full document)
- **Size:** S · **Milestone:** M8 · **Fits one PR:** yes
- **Dependencies:** MEL-080
- **Blocks:** MEL-082, MEL-120, MEL-130
- **Recommended branch:** `feat/api-by-slug`
- **Acceptance criteria:**
  - [ ] `GET /scenarios/:slug` returns the full embedded document.
  - [ ] Unknown slug returns 404 per the contract.
  - [ ] Response matches the MEL-018 shape used by the frontend.
  - [ ] Only published scenarios are retrievable.
- **Non-goals:** Frontend swap (MEL-082).

### MEL-082 — Frontend data layer swap static->API behind same contract
- **Size:** M · **Milestone:** M8 · **Fits one PR:** yes
- **Dependencies:** MEL-032, MEL-081
- **Blocks:** MEL-123, MEL-131
- **Recommended branch:** `feat/fe-data-layer`
- **Acceptance criteria:**
  - [ ] Frontend fetches scenarios from the API behind the existing data-layer interface.
  - [ ] Static module replaced without changing component contracts.
  - [ ] Loading and error states handled.
  - [ ] Landing page shows a cold-start-aware loader: after a short delay (~1s) the loading UI reveals a brief message that the first load may be slow while the free-tier API wakes; announced via an `aria-live` region (see accessibility.md).
  - [ ] Behavior matches the pre-swap static experience.
- **Non-goals:** New UI features; deployment (M13).

---

## M9 — Remaining scenario content

### MEL-090 — Museum scenario seed (3 variations)
- **Size:** M · **Milestone:** M9 · **Fits one PR:** yes
- **Dependencies:** MEL-073
- **Blocks:** MEL-092
- **Recommended branch:** `feat/museum-content`
- **Acceptance criteria:**
  - [ ] Museum scenario authored with exactly 3 complete ordered variations.
  - [ ] Conforms to schemas; validates and seeds cleanly.
  - [ ] Bubble percentages, audio URLs, and glossary present.
  - [ ] Speaker keys resolve to declared characters.
- **Non-goals:** Directions content (MEL-091).

### MEL-091 — Directions scenario seed (3 variations)
- **Size:** M · **Milestone:** M9 · **Fits one PR:** yes
- **Dependencies:** MEL-073
- **Blocks:** MEL-092
- **Recommended branch:** `feat/directions-content`
- **Acceptance criteria:**
  - [ ] Directions scenario authored with exactly 3 complete ordered variations.
  - [ ] Conforms to schemas; validates and seeds cleanly.
  - [ ] Bubble percentages, audio URLs, and glossary present.
  - [ ] Speaker keys resolve to declared characters.
- **Non-goals:** Museum content (MEL-090).

### MEL-092 — Content validation pass across all scenarios
- **Size:** S · **Milestone:** M9 · **Fits one PR:** yes
- **Dependencies:** MEL-090, MEL-091
- **Blocks:** —
- **Recommended branch:** `test/content-validation`
- **Acceptance criteria:**
  - [ ] Automated check validates all three scenarios against schemas/rules.
  - [ ] Confirms exactly 3 variations each and integrity of speaker keys.
  - [ ] Flags missing audio URLs or out-of-range percentages.
  - [ ] Runs in CI.
- **Non-goals:** Authoring new content.

---

## M10 — Responsive & mobile single-panel

### MEL-100 — Mobile single-panel view (scaled, aspect preserved)
- **Size:** M · **Milestone:** M10 · **Fits one PR:** yes
- **Dependencies:** MEL-042, MEL-052
- **Blocks:** MEL-101, MEL-102
- **Recommended branch:** `feat/mobile-single-panel`
- **Acceptance criteria:**
  - [ ] Mobile view shows one panel at a time, aspect ratio preserved.
  - [ ] Bubbles scale with the panel and stay positioned by percentage.
  - [ ] No layout shift or overflow on target mobile widths.
  - [ ] Reuses the ComicPanel/SpeechBubble components.
- **Non-goals:** Navigation controls (MEL-101).

### MEL-101 — Mobile prev/next nav + auto-advance during playback
- **Size:** M · **Milestone:** M10 · **Fits one PR:** yes
- **Dependencies:** MEL-100, MEL-053
- **Blocks:** MEL-110, MEL-122, MEL-123
- **Recommended branch:** `feat/mobile-nav`
- **Acceptance criteria:**
  - [ ] Prev/next controls move between panels on mobile.
  - [ ] During playback the visible panel auto-advances with the cursor.
  - [ ] Manual nav and playback stay in sync without conflicts.
  - [ ] Controls are keyboard/touch operable with adequate targets.
- **Non-goals:** Desktop layout changes.

### MEL-102 — Responsive controls & glossary panel
- **Size:** S · **Milestone:** M10 · **Fits one PR:** yes
- **Dependencies:** MEL-100
- **Blocks:** —
- **Recommended branch:** `feat/responsive-controls`
- **Acceptance criteria:**
  - [ ] Playback/character controls reflow responsively across breakpoints.
  - [ ] Glossary is accessible on mobile and desktop.
  - [ ] No overlap/clipping of controls at target widths.
  - [ ] Controls remain keyboard operable.
- **Non-goals:** New control behaviors.

---

## M11 — Accessibility refinement

### MEL-110 — Keyboard controls & visible focus for all interactions
- **Size:** M · **Milestone:** M11 · **Fits one PR:** yes
- **Dependencies:** MEL-053, MEL-062, MEL-101
- **Blocks:** MEL-111, MEL-112
- **Recommended branch:** `a11y/keyboard-focus`
- **Acceptance criteria:**
  - [ ] All interactions (playback, bubbles, modes, nav) are keyboard operable.
  - [ ] Visible focus indicators throughout; logical focus order.
  - [ ] No keyboard traps; Escape/expected keys behave sensibly.
  - [ ] Focus is managed on panel/route changes.
- **Non-goals:** Screen-reader announcements (MEL-111).

### MEL-111 — Screen-reader dialogue order, panel descriptions, active-line announcements
- **Size:** M · **Milestone:** M11 · **Fits one PR:** yes
- **Dependencies:** MEL-043, MEL-110
- **Blocks:** —
- **Recommended branch:** `a11y/screen-reader`
- **Acceptance criteria:**
  - [ ] Dialogue is exposed to screen readers in playback order.
  - [ ] Panels have descriptive accessible names/descriptions.
  - [ ] Active line changes are announced (polite live region).
  - [ ] Verified with at least one screen reader.
- **Non-goals:** Visual polish (MEL-112).

### MEL-112 — Reduced-motion, contrast, loading/error states, touch targets
- **Size:** S · **Milestone:** M11 · **Fits one PR:** yes
- **Dependencies:** MEL-110
- **Blocks:** —
- **Recommended branch:** `a11y/polish`
- **Acceptance criteria:**
  - [ ] Reduced-motion preference respected for animations/auto-advance.
  - [ ] Color contrast meets the documented target.
  - [ ] Loading and error states are clear and accessible.
  - [ ] Touch targets meet minimum size guidance.
- **Non-goals:** New features.

---

## M12 — Testing & reliability

### MEL-120 — Backend integration tests (schemas/seed/slug/published/ordering)
- **Size:** M · **Milestone:** M12 · **Fits one PR:** yes
- **Dependencies:** MEL-072, MEL-081
- **Blocks:** —
- **Recommended branch:** `test/backend`
- **Acceptance criteria:**
  - [ ] Integration tests cover schema validation and seeding.
  - [ ] Tests cover `GET /scenarios` published filtering and `:slug` retrieval.
  - [ ] Ordering of variations/panels/lines is asserted.
  - [ ] Tests run against a test database and pass in CI.
- **Non-goals:** Frontend tests.

### MEL-121 — Playback engine unit tests (states/cursor/muted timing/bubble select)
- **Size:** M · **Milestone:** M12 · **Fits one PR:** yes
- **Dependencies:** MEL-050, MEL-061
- **Blocks:** —
- **Recommended branch:** `test/playback`
- **Acceptance criteria:**
  - [ ] Tests cover all state transitions and cursor movement.
  - [ ] Muted-line timing verified with a fake clock (waits real duration).
  - [ ] Bubble-select and resume-from-selected covered.
  - [ ] No reliance on real browser audio.
- **Non-goals:** Component/e2e tests.

### MEL-122 — Component tests (bubbles/panel/text-audio controls/mobile nav)
- **Size:** M · **Milestone:** M12 · **Fits one PR:** yes
- **Dependencies:** MEL-041, MEL-062, MEL-101
- **Blocks:** —
- **Recommended branch:** `test/components`
- **Acceptance criteria:**
  - [ ] Tests cover SpeechBubble/ComicPanel rendering across representative configs.
  - [ ] textVisible/audioEnabled controls tested (hidden text ≠ muted).
  - [ ] Mobile prev/next and auto-advance behavior tested.
  - [ ] Tests pass in CI.
- **Non-goals:** Backend/e2e tests.

### MEL-123 — One end-to-end learner journey
- **Size:** M · **Milestone:** M12 · **Fits one PR:** yes
- **Dependencies:** MEL-082, MEL-101
- **Blocks:** MEL-141
- **Recommended branch:** `test/e2e-journey`
- **Acceptance criteria:**
  - [ ] E2E test covers list → scenario → play → bubble select → complete.
  - [ ] Runs against the API-backed frontend.
  - [ ] Covers at least one mobile viewport path.
  - [ ] Runs in CI (or documented runner).
- **Non-goals:** Exhaustive e2e coverage.

---

## M13 — Deployment

### MEL-130 — Deploy backend + Atlas free tier (research at execution)
- **Size:** M · **Milestone:** M13 · **Fits one PR:** yes
- **Dependencies:** MEL-081, MEL-022
- **Blocks:** MEL-131, MEL-132
- **Recommended branch:** `deploy/backend`
- **Acceptance criteria:**
  - [ ] Backend deployed to the host chosen in ADR-0017.
  - [ ] Connected to MongoDB Atlas free tier via env config.
  - [ ] Health check reachable in production.
  - [ ] Deployment steps documented.
- **Non-goals:** Frontend deploy (MEL-131).

### MEL-131 — Deploy frontend + CORS/env config
- **Size:** M · **Milestone:** M13 · **Fits one PR:** yes
- **Dependencies:** MEL-082, MEL-130
- **Blocks:** MEL-132, MEL-140
- **Recommended branch:** `deploy/frontend`
- **Acceptance criteria:**
  - [ ] Frontend deployed and pointing at the production API.
  - [ ] CORS configured for the frontend origin.
  - [ ] Environment/config values set per the deployment doc.
  - [ ] Live URL loads the scenario list.
- **Non-goals:** Production seeding (MEL-132).

### MEL-132 — Production seed + smoke test
- **Size:** S · **Milestone:** M13 · **Fits one PR:** yes
- **Dependencies:** MEL-130, MEL-131
- **Blocks:** MEL-141
- **Recommended branch:** `deploy/seed-smoke`
- **Acceptance criteria:**
  - [ ] All three scenarios seeded into the production database.
  - [ ] Smoke test verifies list and a scenario load end-to-end.
  - [ ] Playback works against production audio URLs.
  - [ ] Smoke steps documented for repeatability.
- **Non-goals:** New content or features.

---

## M14 — Portfolio presentation & documentation

### MEL-140 — README polish (screenshots/gifs/run instructions/live link)
- **Size:** S · **Milestone:** M14 · **Fits one PR:** yes
- **Dependencies:** MEL-131
- **Blocks:** —
- **Recommended branch:** `docs/readme-polish`
- **Acceptance criteria:**
  - [ ] README includes overview, screenshots/GIFs, and the live link.
  - [ ] Local setup and run instructions are accurate end-to-end.
  - [ ] Tech stack and key features summarized.
  - [ ] Links resolve.
- **Non-goals:** Deep architecture write-up (MEL-141).

### MEL-141 — Architecture write-up & decisions index for reviewers
- **Size:** S · **Milestone:** M14 · **Fits one PR:** yes
- **Dependencies:** MEL-123, MEL-132
- **Blocks:** —
- **Recommended branch:** `docs/portfolio-writeup`
- **Acceptance criteria:**
  - [ ] Architecture write-up summarizes domain model, layout, and playback design.
  - [ ] Indexed list of ADRs with one-line rationales.
  - [ ] Highlights testing approach and key trade-offs for reviewers.
  - [ ] Cross-links to roadmap, issue plan, and architecture docs.
- **Non-goals:** README changes (MEL-140).