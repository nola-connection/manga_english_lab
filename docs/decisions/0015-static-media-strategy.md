# 0015 — Static media strategy

## Status

Proposed

## Context

Scenarios reference two kinds of binary media: panel **illustrations** and
per-line **audio** clips. The data model stores media as **URLs/paths only** —
never binaries in MongoDB (see
[`../architecture/data-model.md`](../architecture/data-model.md)). We must decide
where those assets physically live and how they are served for the MVP, keeping
cost and complexity low while remaining portable across the free-tier hosting we
target ([0017](./0017-free-tier-deployment.md)).

## Options considered

- **Store media as URLs/paths; bundle images/audio with the frontend build**, and
  treat hosting as a configuration concern. Simplest, cheapest, most portable for
  a small fixed asset set. *(chosen)*
- **Store binaries in MongoDB (documents or GridFS)** — keeps everything in one
  store, but bloats the database, complicates reads, and misuses the DB for blob
  storage.
- **Object storage / CDN from day one** (e.g. S3-style bucket) — production-grade
  and scalable, but adds a service, credentials, and cost unjustified for a small,
  finite asset set at MVP.

## Decision

Store media as **URLs/paths only** (no binaries in MongoDB) and **bundle the
images and audio with the frontend** initially; **where assets are hosted is a
configuration concern**, not a domain concern.

## Rationale

The asset set is small and fixed (a few scenarios), so bundling it with the
frontend is the simplest, cheapest, and most portable option and requires no
extra service or credentials. Keeping only URLs/paths in the database keeps
documents lean and reads fast, and keeps MongoDB doing what it is good at.
Treating hosting as configuration means the domain model and API are unaffected
by a later move to object storage or a CDN — only the base URL/path changes.

## Positive consequences

- No extra storage service, credentials, or cost for the MVP.
- Lean documents; database stays focused on content, not blobs.
- Portable across hosts; swapping storage is a config change, not a model change.
- Assets are versioned alongside the code that renders them.

## Negative consequences

- Bundling large media grows the frontend build and initial download.
- Updating media requires a redeploy of the frontend.
- No independent cache/CDN control over assets while bundled.

## Risks

- **Asset volume grows** and bloats the bundle / slows loads. Monitored as the
  primary revisit trigger.
- **No CDN edge caching** while bundled may hurt latency for distant users.
  Acceptable at MVP scale; mitigated later by moving to object storage/CDN.

## Conditions that would justify revisiting

- Asset volume or file sizes grow enough to bloat the bundle or hurt load times.
- Media must be updated independently of frontend deploys.
- Global performance needs warrant a CDN, or user-generated media requires
  server-side upload storage (object storage) — recorded then as a new ADR.
