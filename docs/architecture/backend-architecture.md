# Backend Architecture

Internal structure of the **Manga English Lab** Express + Mongoose API server
(`server/` workspace). Node.js, JavaScript ES modules, REST. For how the server
fits the whole system see [`system-overview.md`](./system-overview.md).

## Application structure

A conventional layered structure keeps HTTP concerns, business logic, and data
access separable and testable _(Recommended decision)_:

```
server/
  src/
    config/        # env loading + validation, constants
    db/            # Mongoose connection + lifecycle
    models/        # Mongoose schemas & sub-schemas
    routes/        # Express routers -> map paths to controllers
    controllers/   # HTTP: parse/validate request, shape response
    services/      # domain logic, Mongoose queries
    middleware/    # error handler, request validation, CORS
    app.js         # builds the Express app (no listen)
    server.js      # loads config, connects DB, starts listening
  scripts/
    seed.js        # seed + integrity-check scenario content
```

- **Routes** declare paths and HTTP methods and delegate to controllers.
- **Controllers** own the HTTP boundary: validate request _shape_, call a
  service, map results/errors to status codes and JSON.
- **Services** contain domain logic and all Mongoose access, so controllers stay
  thin and logic is unit-testable without HTTP.
- **Models** define schemas and invariants (see
  [`data-model.md`](./data-model.md)).

## Configuration & environment validation

_(Recommended decision)_ All runtime configuration comes from environment
variables loaded once in `config/`. The config module **validates required
variables at startup and fails fast** with a clear message if any are missing or
malformed, so the process never runs half-configured.

- Required: `MONGODB_URI`, `PORT`, `NODE_ENV`, `CORS_ORIGIN`.
- Validation checks presence and basic format (e.g., `PORT` is a number,
  `MONGODB_URI` is a non-empty connection string).
- The rest of the app imports typed/normalized values from `config/`, never
  `process.env` directly.

## Mongoose connection strategy

_(Recommended decision)_ A single connection is established at startup in `db/`:

- Connection string and options come from validated config.
- **Retry with backoff** on initial connect failure (bounded attempts) so
  transient DB unavailability does not crash a fresh deploy.
- Register listeners for `connected`, `error`, and `disconnected` for
  observability; log state transitions.
- Graceful shutdown: on `SIGINT`/`SIGTERM`, close the Mongoose connection before
  exiting so in-flight operations settle.

## Error handling

- Services throw typed/domain errors (e.g., `NotFoundError`,
  `ValidationError`); controllers translate them to HTTP status codes.
- A single Express **error-handling middleware** is the last-registered
  middleware. It maps known error types to the response shapes documented in
  [`api-contract.md`](./api-contract.md) (`400`, `404`, `500`) and hides
  internal details in production.
- Async handlers are wrapped so rejected promises reach the error middleware
  rather than crashing the process.

## Validation boundaries (avoid duplicated logic)

Three distinct responsibilities — each owns a different concern, so logic is not
duplicated _(Recommended decision)_:

1. **Request-shape validation — at the edge (controllers/middleware).** Checks
   the _incoming HTTP request_: params, query, and body types/format (e.g.,
   `slug` is a valid string). Rejects malformed requests with `400` before any
   DB work. Does **not** re-check domain invariants.
2. **Data invariants — in Mongoose schemas (models).** Required fields, enums,
   defaults, casting, and custom validators (e.g., bubble percentages in
   `0–100`, `speakerKey` matches a character `key`). This is the single source
   of truth for what a _valid stored document_ looks like.
3. **Integrity checks — in seed scripts.** Cross-document / referential sanity
   that is awkward to express per-document (e.g., exactly 3 variations per
   scenario, unique slugs across the dataset) is asserted when seeding.

The rule: **shape at the edge, invariants in schemas, integrity in seeds** — no
layer re-implements another's checks.

## Mongoose sub-schemas — runtime behavior, not compile-time types

_(Important clarification.)_ The nested `characters[]`, `variations[]`,
`panels[]`, `dialogueLines[]`, and `glossary[]` structures are defined as
Mongoose **sub-schemas**. Sub-schemas provide **runtime behavior**:

- Nested document structure and array typing.
- `required`, `enum`, `default`, and type **casting**.
- **Custom validators** run on save/validate.
- Optional automatic subdocument `_id` (can be disabled per sub-schema).

Sub-schemas are **not** TypeScript compile-time types — this is a JavaScript
codebase, and even in TypeScript, static types vanish at runtime. Runtime
validation is still required because data enters the system from many paths that
static typing could never guarantee:

- **API requests** (untrusted client input),
- **seed scripts**, **tests**, and **migrations**,
- and ordinary **server code** constructing documents.

Schema-level validation is therefore the durable guardrail regardless of
language choice. See the concrete schemas in [`data-model.md`](./data-model.md).

## Seed-data strategy

_(Recommended decision)_ There is **no admin/CMS UI** (see non-goals in
[`system-overview.md`](./system-overview.md)). Content is authored as data and
loaded with a **seed script** (`scripts/seed.js`):

- Reads scenario definitions (JS/JSON) for the 3 scenarios, each with exactly 3
  variations.
- Runs **integrity checks** before insert (unique slugs, variation/panel/line
  ordering, `speakerKey` references resolve to a character `key`).
- Is idempotent: safe to re-run (e.g., upsert by `slug` or clear-and-reseed a
  dev database).
- Fails loudly on any invariant violation so bad content never reaches the DB.

## Related documents

- [`system-overview.md`](./system-overview.md) — where the server sits.
- [`data-model.md`](./data-model.md) — the Mongoose schemas and validators.
- [`domain-model-options.md`](./domain-model-options.md) — why the embedded
  model was chosen.
- [`api-contract.md`](./api-contract.md) — endpoint and error contracts.
- [`../decisions/`](../decisions/) — ADRs 0004–0009.
