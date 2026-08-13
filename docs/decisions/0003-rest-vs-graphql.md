# 0003 — REST vs GraphQL

## Status

Proposed

## Context

The client needs to fetch learning content from the server. The read model is
deliberately narrow: list published scenarios, and fetch one scenario by its
`slug` (which returns the entire embedded document — characters, variations,
panels, dialogue lines, glossary — see
[0004](./0004-embedded-scenario-document.md)). There is no admin UI and no
user-generated writes in the MVP. We must choose an API paradigm that fits this
shape without over-engineering.

## Options considered

- **REST** with a couple of resource endpoints (`GET /scenarios`,
  `GET /scenarios/:slug`) — trivial to implement, cache, and reason about; the
  client accepts whatever shape the server returns. *(chosen)*
- **GraphQL** with a schema, resolvers, and a client cache — flexible,
  client-driven field selection and strong tooling, at the cost of significant
  setup and conceptual overhead relative to the tiny read model here.

## Decision

Expose a **REST** API with a small set of resource endpoints; the scenario
endpoint returns the full client-ready document.

## Rationale

The data needs are simple and uniform: a list view and a by-`slug` detail view
that always wants the whole scenario. GraphQL's core advantages — clients
selecting exactly the fields they need, aggregating many resources in one
round-trip — provide little value when there is effectively one aggregate that is
always fetched in full. REST matches the embedded-document model perfectly: one
`findOne({ slug })` maps to one endpoint returning one payload. It is faster to
build, easier to cache with plain HTTP semantics, and simpler to test.

## Positive consequences

- Minimal server code; endpoints map directly to Mongo reads.
- Standard HTTP caching and status semantics work out of the box.
- The by-`slug` response is already the client-ready shape, no assembly needed.
- Lower cognitive load and fewer dependencies than a GraphQL server + client.

## Negative consequences

- Clients cannot shape responses; they receive the full scenario even if a view
  needs only part of it (acceptable given bounded document size).
- Adding many divergent read shapes later would require more endpoints or query
  parameters rather than a single flexible query.

## Risks

- **Over-fetching** if future views need only slices of a scenario. Mitigated by
  the bounded document size (a small, soft-capped variation count); payloads stay
  small.
- **Endpoint proliferation** if read requirements diversify. Monitored as a
  revisit trigger below.

## Conditions that would justify revisiting

- Client data needs become highly variable, with many views each wanting
  different field subsets or cross-resource aggregations.
- The number of ad-hoc endpoints or query parameters grows to the point where a
  single flexible query interface (GraphQL, or a query DSL) would materially
  reduce complexity.
- A public/third-party API surface emerges where client-driven field selection
  is a genuine requirement.

## Implications for the API contract

This decision fixes the paradigm the API contract (MEL-018) specifies in detail;
see [`../architecture/api-contract.md`](../architecture/api-contract.md):

- **Endpoints** are REST resources: `GET /scenarios` (published list) and
  `GET /scenarios/:slug` (the full embedded document), rather than a single
  GraphQL query endpoint.
- **Response shapes** are server-defined and match the domain model
  ([0004](./0004-embedded-scenario-document.md) and
  [`../architecture/data-model.md`](../architecture/data-model.md)) exactly;
  clients receive the whole scenario and do not select fields.
- **Errors and status codes** use standard HTTP semantics (e.g. `404` for an
  unknown `slug`), and **published-vs-draft filtering** is enforced server-side
  so unpublished scenarios are never returned. The contract is the shared target
  for both the static frontend data (MEL-031) and the real endpoints (MEL-080/081).
