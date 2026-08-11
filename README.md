# Manga English Lab

A comic-style English-learning web application for beginner TEFL learners.

Learners choose a real-life scenario (ordering at a restaurant, buying museum
tickets, asking for directions) and practice a short, illustrated conversation
presented as comic panels with speech bubbles and model-pronunciation audio.

> **Status:** Planning & documentation phase. Application code has not been
> implemented yet. Architecture, product requirements, decision records, and a
> dependency-aware GitHub issue plan are being authored first.

## Stack

MERN — MongoDB, Mongoose, Express, React, Node.js (JavaScript / ES modules),
React with Vite, React Router, REST API. See `docs/` for details (added via the
documentation pull request).

## Monorepo layout

This repository is an npm-workspaces monorepo (ESM throughout):

- `client/` — React (Vite) frontend workspace (`@manga-english-lab/client`)
- `server/` — Express/Mongo backend workspace (`@manga-english-lab/server`)

Both workspaces are placeholders at this stage; application code is scaffolded in
later issues (MEL-030 for the client, MEL-070 for the server). The monorepo
structure is formalized in ADR-0001 (MEL-011).

The pinned Node version lives in `.nvmrc`; run `nvm use` to match it.

### Bootstrap

```sh
npm install        # installs and links all workspaces from the root
npm run lint       # runs lint across workspaces (placeholders for now)
npm test           # runs tests across workspaces (placeholders for now)
```

## Documentation

Planning and architecture documentation lives under `docs/` once the
documentation pull request is merged:

- `docs/product/` — requirements, MVP scope, user flows, learning modes
- `docs/architecture/` — system, frontend, backend, data model, API, comic
  layout, playback, audio, accessibility, deployment
- `docs/testing/` — test strategy
- `docs/planning/` — implementation roadmap and GitHub issue plan
- `docs/decisions/` — Architecture Decision Records (ADRs)

## Repository

Public portfolio project. Work is tracked through chronologically organized
GitHub issues and small, focused draft pull requests reviewed before merging.
