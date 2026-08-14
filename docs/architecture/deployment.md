# Deployment

Deployment plan for a **free / hobby-tier portfolio** deployment of Manga English
Lab. This document defines the **structure and concerns**, not final vendor
choices. Related: [api-contract.md](./api-contract.md),
[ADR 0017 — Free-Tier Deployment](../decisions/0017-free-tier-deployment.md).

> **Confirmed requirement:** specific free-tier / hobby-tier hosting options
> **must be researched at the time the deployment ticket runs**. Provider
> free-tier terms change frequently; do **not** rely on assumptions captured in
> this doc. Treat everything here as the shape of the solution, not a locked
> vendor list.

## Topology

Three deployable units plus static media:

1. **Static React frontend** — the Vite build output (`client/dist`), served by a
   static host / CDN.
2. **Node/Express API** — a separate service exposing the REST API (see
   [api-contract.md](./api-contract.md)).
3. **MongoDB** — a MongoDB Atlas free / entry-tier cluster.
4. **Static image/audio assets** — **Recommended decision (MVP):** bundle media
   with the frontend build initially (served from the same static host). A
   dedicated object store / CDN is a later migration, not an MVP requirement.

- **Recommended decision:** keep frontend and API as **separate hosts**. This
  matches typical free-tier offerings (static host + small Node service) and
  keeps concerns clean, at the cost of needing CORS configuration (below).

## Concerns to evaluate at deploy time

These must be checked against **current** provider terms when the deployment
ticket runs:

- **Free-tier limitations** — request quotas, project/service counts, feature
  gates.
- **Cold starts** — first-request latency after idle on the API host. **Frontend
  mitigation:** the landing page shows a cold-start-aware loader that, after a
  short delay, explains the first load may take a moment while the server wakes
  (see [frontend-architecture.md](./frontend-architecture.md)).
- **Sleep behavior** — whether the API host sleeps when idle and how it wakes;
  impact on a recruiter's first click (softened by the loader message above).
- **Build limits** — build minutes, build frequency, artifact size caps.
- **Bandwidth limits** — especially relevant because audio/image assets are the
  bulk of transfer.
- **Database storage limits** — Atlas free-tier storage/connection caps.
- **Cross-origin (CORS)** — the API must allow the frontend origin; configure
  allowed origins/methods/headers explicitly. **Recommended decision:** origins
  come from an environment variable, never hard-coded.
- **Environment variables** — API base URL (frontend), Mongo connection string
  and allowed origins (API); injected per environment at build/deploy time.
- **Secret management** — the Mongo connection string and any keys are provided
  through the host's secret store / env vars, never committed. Do not log secret
  values.
- **Static asset size** — total bundled media size vs. build/bandwidth caps;
  budget and, if needed, compress audio/images.
- **Audio caching** — set long-lived cache headers on immutable audio/image
  assets (fingerprinted filenames) so repeat playback avoids re-download.
- **Browser autoplay restrictions** — a deployment/runtime reality, not just a
  frontend concern; the "press play" gesture requirement (see
  [audio-strategy.md](./audio-strategy.md)) must hold on the deployed origin.
- **Migration options if the project becomes commercial** — paid tiers, dedicated
  DB clusters, moving media to object storage/CDN, and a custom domain; note the
  path but do not build for it now. **Deferred decision.**

## Configuration boundary

- **Recommended decision:** all hosting-provider specifics stay as
  **configuration** — environment variables, deploy settings, and infra scripts.
  They must **not** leak into domain logic. The API reads config at startup; the
  frontend reads `import.meta.env`-style build-time config for the API base URL.
- The static-data-first approach (see
  [frontend-architecture.md](./frontend-architecture.md)) means the frontend can
  be deployed and demoed before the API/DB exist, then repointed via config.

## Environments

- **Assumption:** a single production/portfolio environment for the MVP, plus
  local development. A separate staging environment is a **deferred decision**.
- **Recommended decision:** parity between local and deployed config surfaces
  (same env-var names) to avoid environment-specific code paths.

## CI/CD (lightweight)

- **Recommended decision:** deploy the frontend on push to the main branch via
  the static host's built-in Git integration; deploy the API similarly on its
  host. No custom pipeline for the MVP.
- **Open question:** whether to gate deploys on the test suite in CI — desirable,
  but depends on the free-tier build-minute budget confirmed at deploy time.

## Seeding, smoke test & rollback

- **Seed in production.** There is no admin/CMS UI, so content ships as data
  (see [backend-architecture.md](./backend-architecture.md)). After the API is
  deployed, run the **idempotent seed script** (`server/scripts/seed.js`) against
  the production Atlas connection string to load the three scenarios. It runs the
  same integrity checks as locally and is safe to re-run (upsert by `slug` /
  clear-and-reseed), so seeding is the content-release step, not a migration.
- **Smoke test.** After deploy + seed, verify end-to-end on the deployed origin:
  `GET /scenarios` and `GET /scenarios/:slug` respond per
  [api-contract.md](./api-contract.md), the frontend scenario list loads, and
  playback works against the production audio URLs. **Recommended decision:**
  keep these steps written down so the check is repeatable each deploy.
- **Rollback.** Because content is data and the seed is idempotent, rollback is
  low-risk: redeploy the previous frontend/API build (the static/API hosts retain
  prior deploys), and if a bad seed shipped, re-run the seed to restore
  known-good content. **Assumption:** no destructive schema migrations in the
  MVP, so there is no forward-only data migration to unwind.

## Open questions

- **Open question:** which specific free-tier providers meet the bandwidth needs
  of bundled audio at demo time — **research when the ticket runs**.
- **Open question:** whether bundled media stays within the frontend host's size
  limits, or whether an object store is needed sooner than expected.
- **Deferred decision:** custom domain and HTTPS specifics for the portfolio URL.
