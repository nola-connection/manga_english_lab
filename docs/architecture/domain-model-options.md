# Domain Model Options

This is the **domain-model architecture deliverable**: it proposes and compares
two MongoDB document structures for a **Manga English Lab** scenario, shows
representative example documents, and selects a recommended MVP structure.

> **Status:** _Recommended decision_ / working proposal. It may be refined during
> implementation; any **material** change (e.g., moving to referencing, changing
> identity strategy) must be recorded as an ADR under
> [`../decisions/`](../decisions/) — see ADRs
> [0004](../decisions/0004-embedded-scenario-document.md)–[0009](../decisions/).

## The content hierarchy

_(Confirmed requirement)_

```
Scenario
  ├─ metadata (title, slug, summary, published)
  ├─ characters[]        (key, displayName, role)
  ├─ variations[]  (one or more complete ordered conversations; typically 3, soft cap ~5)
  │    └─ panels[]       (order, imageUrl, alt)
  │         └─ dialogueLines[]  (order, speakerKey, text, audioUrl, bubble)
  └─ glossary[]          (term, definition, example?)
```

There are exactly **3 scenarios**, each with a **variable number** of complete,
ordered variations — typically **3** in the MVP content, kept under a soft upper
bound of ~5 (not a fixed count, and not a generic branching engine). The example
below shows a scenario with 3 variations.

## Option A — Fully embedded single Scenario document (recommended)

Everything for a scenario lives in **one** MongoDB document: characters,
variations, panels, dialogue lines, and glossary are all embedded arrays. A read
of one scenario is a single `findOne({ slug })`.

### Worked example (restaurant scenario)

```js
// One MongoDB document in the `scenarios` collection.
{
  _id: ObjectId("64a1..."),            // real MongoDB identifier
  slug: "ordering-at-a-restaurant",    // unique, human-readable, public lookup
  title: "Ordering at a Restaurant",
  summary: "Order food and drinks politely at a casual restaurant.",
  published: true,
  characters: [
    { key: "customer", displayName: "Mia",   role: "learner" },
    { key: "waiter",   displayName: "Waiter", role: "staff" }
  ],
  variations: [
    {
      _id: ObjectId("64a2..."),        // stable handle for this variation
      key: "polite-basic",
      label: "Polite basics",
      order: 1,
      layoutTemplate: "two-up",        // 2 panels; must match panels.length
      panels: [
        {
          _id: ObjectId("64a3..."),    // stable handle for this panel
          order: 1,
          imageUrl: "/media/restaurant/v1/p1.png",
          alt: "A waiter greeting a seated customer with a menu.",
          dialogueLines: [
            {
              order: 1,
              speakerKey: "waiter",     // associates line -> characters[].key
              text: "Hi! Are you ready to order?",
              audioUrl: "/media/restaurant/v1/p1-l1.mp3",
              bubble: { xPercent: 60, yPercent: 15, widthPercent: 34,
                        tailDirection: "bottom-left" }
            },
            {
              order: 2,                 // second line in the SAME panel
              speakerKey: "customer",
              text: "Yes, could I have the tomato soup, please?",
              audioUrl: "/media/restaurant/v1/p1-l2.mp3",
              bubble: { xPercent: 8, yPercent: 62, widthPercent: 40,
                        tailDirection: "top-right" }
            }
          ]
        },
        {
          _id: ObjectId("64a4..."),
          order: 2,
          imageUrl: "/media/restaurant/v1/p2.png",
          alt: "The waiter writing the order on a notepad.",
          dialogueLines: [
            {
              order: 1,
              speakerKey: "waiter",
              text: "Great choice. Anything to drink?",
              audioUrl: "/media/restaurant/v1/p2-l1.mp3",
              bubble: { xPercent: 55, yPercent: 20, widthPercent: 38,
                        tailDirection: "bottom-left" }
            }
          ]
        }
      ]
    },
    {
      _id: ObjectId("64a5..."),
      key: "with-substitution",
      label: "Asking for a change",
      order: 2,
      layoutTemplate: "single",        // 1 panel
      panels: [
        {
          _id: ObjectId("64a6..."),
          order: 1,
          imageUrl: "/media/restaurant/v2/p1.png",
          alt: "A customer pointing at a menu item.",
          dialogueLines: [
            {
              order: 1, speakerKey: "customer",
              text: "Can I get the salad without onions?",
              audioUrl: "/media/restaurant/v2/p1-l1.mp3",
              bubble: { xPercent: 10, yPercent: 18, widthPercent: 42,
                        tailDirection: "bottom-right" }
            }
          ]
        }
      ]
    },
    {
      _id: ObjectId("64a7..."),
      key: "paying-the-bill",
      label: "Paying the bill",
      order: 3,
      layoutTemplate: "single",        // 1 panel
      panels: [
        {
          _id: ObjectId("64a8..."),
          order: 1,
          imageUrl: "/media/restaurant/v3/p1.png",
          alt: "A customer handing a card to the waiter.",
          dialogueLines: [
            {
              order: 1, speakerKey: "customer",
              text: "Could we have the bill, please?",
              audioUrl: "/media/restaurant/v3/p1-l1.mp3",
              bubble: { xPercent: 12, yPercent: 20, widthPercent: 40,
                        tailDirection: "bottom-right" }
            }
          ]
        }
      ]
    }
  ],
  glossary: [
    { term: "bill", definition: "The list of what you must pay.",
      example: "Could we have the bill, please?" },
    { term: "substitution", definition: "Changing one item for another." }
  ]
}
```

## Option B — Partially referenced collections

Split the tree across collections and join by reference. Keep a `scenarios`
collection with metadata + characters + glossary, and store `variations` (with
their panels/lines still embedded) in their own collection that references the
parent scenario by `_id`. The worked example below covers the **same content**
as Option A — the restaurant scenario with three ordered variations, a two-line
panel, `speakerKey` associations, per-line audio URLs, percentage bubbles,
per-variation `layoutTemplate` matching `panels.length`, and an embedded
glossary — so the two options are compared on equal footing.

### Worked example (restaurant scenario)

```js
// Collection: scenarios  — one document holds metadata, characters, glossary.
{
  _id: ObjectId("64a1..."),
  slug: "ordering-at-a-restaurant",       // unique, human-readable, public lookup
  title: "Ordering at a Restaurant",
  summary: "Order food and drinks politely at a casual restaurant.",
  published: true,
  characters: [
    { key: "customer", displayName: "Mia",    role: "learner" },
    { key: "waiter",   displayName: "Waiter",  role: "staff" }
  ],
  glossary: [
    { term: "bill", definition: "The list of what you must pay.",
      example: "Could we have the bill, please?" },
    { term: "substitution", definition: "Changing one item for another." }
  ]
}

// Collection: variations  — each references its parent by scenarioId.
// Panels and dialogue lines remain embedded within a variation.
{
  _id: ObjectId("64a2..."),
  scenarioId: ObjectId("64a1..."),        // reference to scenarios._id
  key: "polite-basic",
  label: "Polite basics",
  order: 1,
  layoutTemplate: "two-up",               // 2 panels; must match panels.length
  panels: [
    {
      _id: ObjectId("64a3..."),
      order: 1,
      imageUrl: "/media/restaurant/v1/p1.png",
      alt: "A waiter greeting a seated customer with a menu.",
      dialogueLines: [
        { order: 1, speakerKey: "waiter",
          text: "Hi! Are you ready to order?",
          audioUrl: "/media/restaurant/v1/p1-l1.mp3",
          bubble: { xPercent: 60, yPercent: 15, widthPercent: 34,
                    tailDirection: "bottom-left" } },
        { order: 2, speakerKey: "customer",   // second line in the SAME panel
          text: "Yes, could I have the tomato soup, please?",
          audioUrl: "/media/restaurant/v1/p1-l2.mp3",
          bubble: { xPercent: 8, yPercent: 62, widthPercent: 40,
                    tailDirection: "top-right" } }
      ]
    },
    {
      _id: ObjectId("64a4..."),
      order: 2,
      imageUrl: "/media/restaurant/v1/p2.png",
      alt: "The waiter writing the order on a notepad.",
      dialogueLines: [
        { order: 1, speakerKey: "waiter",
          text: "Great choice. Anything to drink?",
          audioUrl: "/media/restaurant/v1/p2-l1.mp3",
          bubble: { xPercent: 55, yPercent: 20, widthPercent: 38,
                    tailDirection: "bottom-left" } }
      ]
    }
  ]
}
{
  _id: ObjectId("64a5..."),
  scenarioId: ObjectId("64a1..."),
  key: "with-substitution", label: "Asking for a change", order: 2,
  layoutTemplate: "single",               // 1 panel
  panels: [
    { _id: ObjectId("64a6..."), order: 1,
      imageUrl: "/media/restaurant/v2/p1.png",
      alt: "A customer pointing at a menu item.",
      dialogueLines: [
        { order: 1, speakerKey: "customer",
          text: "Can I get the salad without onions?",
          audioUrl: "/media/restaurant/v2/p1-l1.mp3",
          bubble: { xPercent: 10, yPercent: 18, widthPercent: 42,
                    tailDirection: "bottom-right" } }
      ] }
  ]
}
{
  _id: ObjectId("64a7..."),
  scenarioId: ObjectId("64a1..."),
  key: "paying-the-bill", label: "Paying the bill", order: 3,
  layoutTemplate: "single",               // 1 panel
  panels: [
    { _id: ObjectId("64a8..."), order: 1,
      imageUrl: "/media/restaurant/v3/p1.png",
      alt: "A customer handing a card to the waiter.",
      dialogueLines: [
        { order: 1, speakerKey: "customer",
          text: "Could we have the bill, please?",
          audioUrl: "/media/restaurant/v3/p1-l1.mp3",
          bubble: { xPercent: 12, yPercent: 20, widthPercent: 40,
                    tailDirection: "bottom-right" } }
      ] }
  ]
}
```

Assembling a full scenario requires a `findOne` on `scenarios` plus a `find` on
`variations` (`{ scenarioId }`, sorted by `order`), then stitching in application
code or with an aggregation `$lookup`. Note the `speakerKey` values reference
`characters[].key`, which now lives in a **different document** — so the
speaker-integrity check spans collections in this option (see Comparison).

## Comparison

| Dimension | Option A — Embedded | Option B — Referenced |
|---|---|---|
| Embedding vs referencing | One self-contained doc | Parent + child collections joined by `_id` |
| Query simplicity | `findOne({ slug })` returns everything | Multi-query / `$lookup` + stitching |
| Update complexity | Positional/`$` array updates within one doc | Simpler to update one child in isolation |
| Duplication | None — single source per scenario | Risk of drift between parent and children |
| Validation | Whole tree validated in one schema | Cross-collection integrity is manual |
| Document growth | Bounded (soft-capped ~5 variations, few panels) | Unbounded children more naturally sharded |
| Seed-data maintenance | One object per scenario, easy to author | Must create + link multiple documents |
| API response shape | Already the client-ready shape | Must reassemble before responding |
| Frontend consumption | Direct render from one payload | Same, after server reassembly |
| Future extensibility | Refactor if content explodes | Ready for very large / shared content |

### Detailed considerations (both options)

- **Subdocument `_id` fields.** _(Recommended decision)_ Retain Mongoose's auto
  `_id` on **Variation** and **Panel** — they benefit from a stable handle for
  positional updates, deep-linking, and tests. Disable auto `_id` on
  **dialogue lines**, **characters**, and **glossary entries**, whose identity is
  better expressed by a semantic `key` or array position. Trade-offs are detailed
  in [`data-model.md`](./data-model.md).
- **Stable semantic `key` fields.** Yes — `character.key` and
  `variation.key` are stable, human-meaningful strings used in content and by
  `speakerKey`. A `key` is **not** an ID: reserve `_id`/`*Id` for real
  MongoDB/external identifiers; never invent sequential integer IDs to imitate a
  relational DB.
- **Speaker-key integrity.** Each `dialogueLines[].speakerKey` must match some
  `characters[].key`. In Option A this is a single-document custom validator; in
  Option B the character list lives in a different document, so the check spans
  collections and is easy to get wrong. Seed scripts assert it either way.
- **Ordering.** Array order is the source of truth, but explicit `order`
  integers on variations, panels, and lines add robustness (detect accidental
  reordering, enable stable sorting, make tests assert intent). Both are kept.
- **Nested updates.** Option A edits one line via a positional operator, e.g.
  `updateOne({ slug, "variations._id": vId }, { $set: { "variations.$[v].panels.$[p]...": ... } })`
  with array filters. Option B updates the child document directly by its `_id`.
- **Data placement.** MongoDB holds durable **content**; React holds **playback/
  session/UI** state; browser storage is reserved for **future preferences**.
  See [`system-overview.md`](./system-overview.md).

## Recommendation — Option A (embedded) for the MVP

_(Recommended decision)_ Choose the **fully-embedded Scenario document**:

- The content is **bounded and stable** (3 scenarios, each with a small,
  soft-capped variation count, and a handful of panels/lines) — the classic case
  where embedding wins.
- Reads are the dominant operation and become a single query returning a
  **client-ready** payload (matches [`api-contract.md`](./api-contract.md)).
- Validation and seed integrity live in **one** schema/document, avoiding
  cross-collection drift.
- No cross-scenario reuse of characters has been demonstrated, so a separate
  `Character` collection is **not** justified yet.

**This is a working proposal.** It may be refined during implementation; any
**material** change (adopting referencing, changing identity strategy) must be
recorded as an ADR.

## Related documents

- [`data-model.md`](./data-model.md) — the recommended Option A schemas.
- [`api-contract.md`](./api-contract.md) — response shapes derived from this model.
- [`system-overview.md`](./system-overview.md) — data placement across tiers.
- ADRs [0004](../decisions/0004-embedded-scenario-document.md)–[0009](../decisions/).
