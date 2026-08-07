# Data Model

The **recommended working schema** for **Manga English Lab**, expressed as
Mongoose-style sub-schemas. This realizes **Option A** (fully-embedded Scenario
document) chosen in [`domain-model-options.md`](./domain-model-options.md).

> **Status:** _Recommended decision_ / refinable. Material changes must be
> recorded as an ADR under [`../decisions/`](../decisions/).

## Overview

A Scenario is one MongoDB document. Nested content is modeled with Mongoose
**sub-schemas**, which provide runtime structure, `required`/`enum`/`default`,
type casting, and custom validators (see the sub-schema explanation in
[`backend-architecture.md`](./backend-architecture.md)).

## Schemas

```js
// DialogueLineSchema — one speech bubble + one audio clip.
const BubbleSchema = new Schema({
  xPercent:      { type: Number, required: true, min: 0, max: 100 },
  yPercent:      { type: Number, required: true, min: 0, max: 100 },
  widthPercent:  { type: Number, required: true, min: 0, max: 100 },
  tailDirection: { type: String, required: true,
                   enum: ["top-left", "top-right", "bottom-left", "bottom-right"] }
                   // the diagonal the tail points toward the speaker
}, { _id: false });

const DialogueLineSchema = new Schema({
  order:      { type: Number, required: true, min: 1 },
  speakerKey: { type: String, required: true, trim: true },
  text:       { type: String, required: true, trim: true },
  audioUrl:   { type: String, required: true, trim: true },
  bubble:     { type: BubbleSchema, required: true }
}, { _id: false });

// PanelSchema — one illustration + ordered dialogue lines.
const PanelSchema = new Schema({
  order:         { type: Number, required: true, min: 1 },
  imageUrl:      { type: String, required: true, trim: true },
  alt:           { type: String, required: true, trim: true },
  dialogueLines: { type: [DialogueLineSchema], required: true }
});  // keeps auto _id (stable panel handle)

// VariationSchema — one complete, ordered conversation.
const VariationSchema = new Schema({
  key:    { type: String, required: true, trim: true },
  label:  { type: String, required: true, trim: true },
  order:  { type: Number, required: true, min: 1 },
  panels: { type: [PanelSchema], required: true }
});  // keeps auto _id (stable variation handle)

// CharacterSchema — a speaker in the scenario.
const CharacterSchema = new Schema({
  key:         { type: String, required: true, trim: true },
  displayName: { type: String, required: true, trim: true },
  role:        { type: String, required: true,
                 enum: ["learner", "staff", "narrator", "other"] }
  // voice metadata (e.g., voiceId, locale) reserved for the future.
}, { _id: false });

const GlossaryEntrySchema = new Schema({
  term:       { type: String, required: true, trim: true },
  definition: { type: String, required: true, trim: true },
  example:    { type: String, trim: true }        // optional
}, { _id: false });

// ScenarioSchema — the top-level document.
const ScenarioSchema = new Schema({
  title:      { type: String, required: true, trim: true },
  slug:       { type: String, required: true, unique: true, trim: true,
                lowercase: true },
  summary:    { type: String, required: true, trim: true },
  published:  { type: Boolean, required: true, default: false },
  characters: { type: [CharacterSchema], required: true },
  variations: { type: [VariationSchema], required: true },
  glossary:   { type: [GlossaryEntrySchema], default: [] }
}, { timestamps: true });
```

## Field rules

### Required fields, enums, defaults, casting

- **Required**: nearly all content fields are `required` — a partial scenario is
  never renderable. `glossary[].example` is the notable optional.
- **Enums**: `bubble.tailDirection` ∈
  `{top-left,top-right,bottom-left,bottom-right}` — the **diagonal** toward which
  the tail points, since a bubble typically sits diagonally offset from its
  speaker; `character.role` ∈ `{learner,staff,narrator,other}`.
- **Defaults**: `published` defaults to `false` (content is private until
  explicitly published); `glossary` defaults to `[]`.
- **Casting**: Mongoose casts inputs to the declared types (e.g., numeric
  strings from seed data become `Number`). Casting failures raise validation
  errors before persistence.

### Custom validators

_(Recommended decision)_

- **Percentage range** — `xPercent`, `yPercent`, `widthPercent` are constrained
  to `0–100` via `min`/`max` so bubbles stay within the panel.
- **Speaker integrity** — a document-level (`pre('validate')`) validator asserts
  every `variations[].panels[].dialogueLines[].speakerKey` matches some
  `characters[].key`. This cross-array check must run at the Scenario level
  because a sub-schema cannot see its siblings.
- **Unique ordering** — validators assert `order` values are unique and
  contiguous within each `variations`, `panels`, and `dialogueLines` array.

## Subdocument `_id` strategy

_(Recommended decision)_ Identity is assigned deliberately, not uniformly:

- **Keep auto `_id`** on `VariationSchema` and `PanelSchema`. These are the
  natural targets of positional updates, deep-links, and test assertions, so a
  stable server-generated handle is worth the extra field.
- **Disable auto `_id`** (`{ _id: false }`) on `DialogueLineSchema`,
  `CharacterSchema`, and `GlossaryEntrySchema`. Their identity is better carried
  by a semantic `key` (characters) or by **array position + `order`** (lines,
  glossary), keeping documents lean.

**Trade-off:** dropping `_id` on lines means you cannot address a line by a
server-generated id — you address it by its containing panel's `_id` plus the
line's `order`/position. That is acceptable because lines are always read and
edited in the context of their panel, never independently. If a future feature
needs to reference an individual line globally, reintroducing its `_id` (or a
`key`) is a **material change** and warrants an ADR.

Reserve `_id`/`*Id` for real MongoDB or external identifiers. A `key` is a
stable **semantic string**, not an ID — do not invent sequential integer IDs to
imitate a relational database.

## Ordering

_(Recommended decision)_ **Array order is the source of truth** for sequencing —
Mongoose preserves array order, and the client renders variations, panels, and
lines in stored order. Explicit integer `order` fields are kept **in addition**
because they:

- make intent explicit and self-documenting in seed data,
- allow detecting accidental reordering (validator checks position vs `order`),
- enable robust, deterministic test assertions,
- provide a stable sort key if an array is ever reconstructed from a query.

The two must agree; the ordering validator enforces this.

## Slug and identity summary

- `slug` is a **unique, lowercase, human-readable** string used for public URLs
  and API lookups (e.g., `/scenarios/ordering-at-a-restaurant`). It is **not**
  the Mongo `_id`. See [`api-contract.md`](./api-contract.md) for why public
  routes resolve by `slug`.
- `character.key` / `variation.key` are stable semantic strings; `speakerKey`
  associates a line to a character by that `key`. The line holds the speaker
  association — characters do **not** keep duplicate arrays of line references.

## Indexes

- Unique index on `slug` (enforced by `unique: true`).
- A partial/compound consideration for `published` filtering is noted for the
  future; with only 3 scenarios it is not required for the MVP.

## Refinement note

This schema is a working proposal and may be refined during implementation.
**Material** changes (identity strategy, embedding vs referencing, new
collections) must be recorded as an ADR under
[`../decisions/`](../decisions/).

## Related documents

- [`domain-model-options.md`](./domain-model-options.md) — why Option A was chosen.
- [`backend-architecture.md`](./backend-architecture.md) — validation boundaries
  and the sub-schema (runtime, not compile-time) explanation.
- [`api-contract.md`](./api-contract.md) — how these documents are exposed.
- [`../decisions/`](../decisions/) — ADRs 0004–0009.
