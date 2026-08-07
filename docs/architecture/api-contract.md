# API Contract

REST endpoints for the **Manga English Lab** MVP. The API is served under an
`/api` prefix by the Express server described in
[`backend-architecture.md`](./backend-architecture.md). Responses are JSON and
match the schemas in [`data-model.md`](./data-model.md).

> **Status:** _Recommended decision_ for the MVP surface. New endpoints or
> shape changes should be reflected here and, if material, in an ADR under
> [`../decisions/`](../decisions/).

## Conventions

- **Versioning** — all routes live under the `/api` prefix _(Recommended
  decision)_. A future breaking revision would move to `/api/v2`; the MVP is the
  implicit v1 under `/api`.
- **Public lookup by `slug`, not `_id`** _(Confirmed requirement)_. Public
  routes address a scenario by its human-readable `slug` (e.g.,
  `ordering-at-a-restaurant`). Rationale: slugs are stable, meaningful, and
  URL-friendly; Mongo `_id` values are opaque, implementation-leaking, and
  should not appear in shareable URLs.
- **Published filtering** _(Confirmed requirement)_. Only scenarios with
  `published: true` are visible to the public API. Unpublished scenarios are
  treated as non-existent (`404`), never merely hidden fields.
- **Content type** — `application/json; charset=utf-8`.
- **CORS** is a **configuration concern**, not domain logic: allowed origins
  come from the validated `CORS_ORIGIN` env var (see
  [`backend-architecture.md`](./backend-architecture.md)) and are applied as
  middleware; controllers/services are unaware of it.

## Endpoints

### `GET /api/scenarios`

Returns the list of **published** scenarios as a **lightweight projection** —
`slug`, `title`, `summary`, and `thumbnail` only. It deliberately does **not**
include the nested `variations`/`panels` content, keeping the browse payload
small.

**200 response**

```json
{
  "data": [
    {
      "slug": "ordering-at-a-restaurant",
      "title": "Ordering at a Restaurant",
      "summary": "Order food and drinks politely at a casual restaurant.",
      "thumbnail": "/media/restaurant/thumb.png"
    },
    {
      "slug": "buying-museum-tickets",
      "title": "Buying Museum Tickets",
      "summary": "Buy tickets and ask about opening hours.",
      "thumbnail": "/media/museum/thumb.png"
    }
  ]
}
```

### `GET /api/scenarios/:slug`

Returns the **full** scenario document (characters, variations, panels, dialogue
lines, glossary) for a single published scenario. Returns `404` if no scenario
matches the `slug` **or** the match is unpublished.

**200 response** (abbreviated; full nested shape per
[`data-model.md`](./data-model.md))

```json
{
  "data": {
    "slug": "ordering-at-a-restaurant",
    "title": "Ordering at a Restaurant",
    "summary": "Order food and drinks politely at a casual restaurant.",
    "published": true,
    "characters": [
      { "key": "customer", "displayName": "Mia", "role": "learner" },
      { "key": "waiter", "displayName": "Waiter", "role": "staff" }
    ],
    "variations": [
      {
        "_id": "64a2...",
        "key": "polite-basic",
        "label": "Polite basics",
        "order": 1,
        "panels": [
          {
            "_id": "64a3...",
            "order": 1,
            "imageUrl": "/media/restaurant/v1/p1.png",
            "alt": "A waiter greeting a seated customer with a menu.",
            "dialogueLines": [
              {
                "order": 1,
                "speakerKey": "waiter",
                "text": "Hi! Are you ready to order?",
                "audioUrl": "/media/restaurant/v1/p1-l1.mp3",
                "bubble": { "xPercent": 60, "yPercent": 15,
                            "widthPercent": 34, "tailDirection": "left" }
              },
              {
                "order": 2,
                "speakerKey": "customer",
                "text": "Yes, could I have the tomato soup, please?",
                "audioUrl": "/media/restaurant/v1/p1-l2.mp3",
                "bubble": { "xPercent": 8, "yPercent": 62,
                            "widthPercent": 40, "tailDirection": "right" }
              }
            ]
          }
        ]
      }
    ],
    "glossary": [
      { "term": "bill", "definition": "The list of what you must pay.",
        "example": "Could we have the bill, please?" }
    ]
  }
}
```

Note the `variations[]` array above is truncated to one variation for brevity;
a real response contains exactly **3** variations.

## Error shapes

Errors share a consistent envelope produced by the error-handling middleware
(see [`backend-architecture.md`](./backend-architecture.md)):

```json
{ "error": { "code": "NOT_FOUND", "message": "Scenario not found." } }
```

| Status | `code` | When |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Malformed request (bad `slug` shape, unknown query params) — rejected at the edge before DB access |
| `404` | `NOT_FOUND` | No published scenario matches the `slug` (includes unpublished matches) |
| `500` | `INTERNAL_ERROR` | Unexpected server/DB failure; internal details are not exposed in production |

A `400` example:

```json
{ "error": { "code": "VALIDATION_ERROR",
             "message": "slug must be a non-empty string." } }
```

## Pagination

_(Deferred decision)_ With exactly **3 scenarios**, `GET /api/scenarios` returns
the full list unpaginated. If the catalog grows, add cursor/offset pagination
(e.g., `?limit=&cursor=`) and a `meta` block alongside `data`; this would be a
material change recorded in an ADR.

This concerns the scenario **catalog** only. **Pagination within a single
scenario** — a variation whose panels span multiple comic pages — is a client
**rendering** concern, not an API one: `GET /api/scenarios/:slug` always returns
the full ordered panel set, and the client decides how to page it. See
[comic-layout-system.md](./comic-layout-system.md#responsive-layout).

## Related documents

- [`data-model.md`](./data-model.md) — the schema the single-scenario response
  mirrors.
- [`backend-architecture.md`](./backend-architecture.md) — validation
  boundaries, error middleware, and CORS configuration.
- [`deployment.md`](./deployment.md) — hosting, environment, and how the `/api`
  prefix and CORS origins are configured per environment.
- [`../decisions/`](../decisions/) — ADRs 0004–0009.
