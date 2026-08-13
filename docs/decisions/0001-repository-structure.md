# 0001 — Repository structure

## Status

Accepted

## Context

Manga English Lab is a MERN application with a clearly separable frontend
(React + Vite) and backend (Node + Express + Mongoose). Both halves are authored
by a single developer for a portfolio, but the codebase should still demonstrate
the structure a professional team would recognize. We need a layout that keeps
client and server independently runnable and buildable, allows shared tooling
(lint/format config, scripts) without duplication, and does not impose ceremony
that a two-person-effort project cannot justify.

## Options considered

- **Two separate repositories** (one for client, one for server) — clean process
  isolation and independent deploys, but cross-cutting changes span two repos,
  two PRs, and two histories; heavier than the project warrants.
- **One repository, separate `client/` and `server/` directories without a
  workspace manager** — simple, but each package is installed and scripted
  independently with no first-class notion of a shared root or hoisted tooling.
- **One repository as an npm-workspaces monorepo** with `client/`, `server/`,
  and `docs/` — a single install, hoisted dependencies, root-level scripts, one
  history, at the cost of slightly more root configuration. *(chosen)*

## Decision

Use a **single repository organized as an npm-workspaces monorepo** with
top-level `client/`, `server/`, and `docs/` workspaces and a root `package.json`
that defines the workspaces and shared scripts.

## Rationale

Workspaces are the least-complex structure that still shows professional
practice. A single `npm install` at the root provisions both packages, shared
dev tooling (formatter, linter, editorconfig) lives once at the root, and
root-level scripts can run or build both halves. One history keeps client and
server changes atomic in a single PR, which matches how features here span both
tiers. Separate repos would add coordination overhead with no isolation benefit
for one developer; separate directories without workspaces would lose the
hoisting and unified scripting that make the monorepo pleasant.

## Positive consequences

- One clone, one install, one place for shared config and CI.
- Atomic cross-tier commits (schema + API + UI change together).
- Independent `client` and `server` scripts remain available per workspace.
- `docs/` sits alongside code, keeping planning artifacts version-controlled.

## Negative consequences

- Root configuration (workspace globs, script wiring) is extra up-front setup.
- Dependency hoisting can occasionally mask a package's missing direct
  dependency until it is built in isolation.
- A single history means client-only and server-only churn share one log.

## Risks

- **Accidental coupling** between client and server via shared root code. Mitigated
  by keeping shared code explicit and minimal; there is no shared runtime package
  in the MVP.
- **Tooling drift** if a workspace overrides root config unnecessarily. Mitigated
  by centralizing lint/format at the root.

## Conditions that would justify revisiting

- The server needs an independent release cadence or deployment pipeline that a
  shared history obstructs.
- Additional deployable services appear, making a polyrepo or a heavier monorepo
  tool (e.g. Turborepo/Nx) worth the added complexity.
- A shared package genuinely needs to be published and versioned separately.
