# 0005 — Character association strategy

## Status

Proposed

## Context

Every dialogue line is spoken by a character, and the UI must display consistent
speaker names and roles, apply **per-character controls** (`textVisible` and
`audioEnabled`), and eventually attach voice metadata (e.g. a voice id/locale).
Characters recur across the panels and variations of a scenario but are **not**
shared across scenarios in the MVP. We must decide how a line is associated with
its speaker within the embedded Scenario document
([0004](./0004-embedded-scenario-document.md)).

## Options considered

- **Speaker text on every line** — each line stores its own speaker display name
  directly. Simplest to render one line, but duplicates the name across lines,
  invites drift, and has nowhere to hang per-character controls or voice metadata.
- **Embedded `characters[]` array + `speakerKey` on each line** — characters are
  defined once per scenario with a stable semantic `key`; each line references a
  character by `speakerKey`. The line holds the association. *(chosen)*
- **Separate `Character` collection** — characters as their own documents
  referenced by id. Enables cross-scenario reuse, but adds a collection, joins,
  and cross-document integrity for a reuse requirement that does not exist yet.

## Decision

Define characters once in an **embedded `characters[]` array** (each with a
stable `key`, `displayName`, and `role`) and associate every dialogue line to
its speaker via a **`speakerKey`** that matches a `characters[].key`.

## Rationale

Defining each character once gives consistent display names and roles and a
single place to attach per-character `textVisible`/`audioEnabled` state and
future voice metadata. `speakerKey` on the line keeps the association where it is
used and read — on the line — so **characters do not carry duplicate arrays of
line references**. Because there is no cross-scenario reuse requirement, a
separate collection is unjustified overhead; embedding keeps the scenario
self-contained and single-query readable.

## Positive consequences

- One authoritative definition per character → consistent names/roles.
- Natural home for per-character controls and future voice metadata.
- No duplicated speaker text and no drift across lines.
- The line owns the association; no redundant line-reference arrays to maintain.

## Negative consequences

- A referential invariant must be enforced: every `speakerKey` must match some
  `characters[].key` (validated at the document level and in seed scripts).
- Characters cannot be reused across scenarios without duplication.

## Risks

- **Dangling `speakerKey`** if a character key is renamed or removed. Mitigated by
  a `pre('validate')` integrity check and seed-time validation
  ([0016](./0016-seed-data-strategy.md)).
- **Future reuse pressure** could make embedding feel duplicative. Monitored below.

## Conditions that would justify revisiting

- Characters need to be shared across scenarios, favoring a separate `Character`
  collection referenced by id.
- Per-character data grows large or is edited independently of scenarios.
- A global directory of characters (e.g. a voice-casting view) becomes a product
  requirement.
