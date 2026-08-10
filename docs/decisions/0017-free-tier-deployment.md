# 0017 — Free-tier deployment

## Status

Proposed

## Context

Manga English Lab is a **non-commercial portfolio** project. It has a static
React frontend, a Node/Express API, and a MongoDB database, with media bundled
with the frontend ([0015](./0015-static-media-strategy.md)). We want to deploy it
for free or near-free, demonstrate a realistic production topology, and avoid
locking domain or application code to any specific vendor. Because free-tier
offerings change frequently, the specific providers should be **researched at
deploy time**, not hard-committed now.

## Options considered

- **Free/hobby tiers across specialized hosts** — a static frontend host, a
  separate Node/Express host, and MongoDB Atlas' free cluster, with bundled static
  media; pick concrete vendors at deploy time. Zero/low cost, realistic topology.
  *(chosen)*
- **A single paid PaaS/VPS** — simplest ops and no cold starts, but ongoing cost
  unjustified for a portfolio.
- **Self-hosting on personal hardware** — full control and free, but unreliable
  availability and undesirable maintenance/security burden.

## Decision

Target **free/hobby tiers**: a **static frontend host** + a **separate
Node/Express host** + a **MongoDB Atlas free cluster**, with **bundled static
media**. **Research and select the specific vendors at deploy time** rather than
locking them in now; keep hosting concerns out of domain logic.

## Rationale

Free tiers are appropriate for a non-commercial portfolio and still model a
credible three-part production topology (static site, API service, managed
database). Deferring vendor choice avoids committing to offerings that churn, and
keeping hosting as a configuration concern ([0015](./0015-static-media-strategy.md))
means the domain and application code do not depend on any provider. This
preserves a clean migration path to paid tiers or commercial hosting if the
project ever needs it.

## Positive consequences

- Zero/low cost for a portfolio deployment.
- Realistic, demonstrable production topology (frontend / API / managed DB).
- Vendor flexibility; no premature lock-in to churning free offerings.
- Domain logic stays hosting-agnostic, easing later migration.

## Negative consequences

- Free API hosts often **sleep**, causing **cold-start** latency on first request.
- Free tiers impose **quota/resource limits** (compute, bandwidth, DB size,
  connections) that constrain load.
- Splitting across providers adds configuration (CORS, env, base URLs) to manage.

## Risks

- **Cold starts / sleeping services** degrade first-visit UX. Mitigated by a
  **cold-start-aware loading message on the landing page** so the first-visit wait
  is understandable (see
  [frontend-architecture.md](../architecture/frontend-architecture.md)); an
  optional warm-ping or a paid tier remain fallbacks if it matters.
- **Quota exhaustion** under unexpected traffic. Mitigated by the small,
  read-dominant workload and monitoring.
- **Free-tier discontinuation** by a vendor. Mitigated by hosting-agnostic code
  and researching vendors at deploy time.

## Conditions that would justify revisiting

- Cold starts, quotas, or reliability materially harm the intended experience.
- The project becomes commercial or needs SLAs, warranting paid tiers — document
  the migration path then.
- Asset/traffic growth requires a CDN or object storage
  ([0015](./0015-static-media-strategy.md)) alongside the app hosts.
