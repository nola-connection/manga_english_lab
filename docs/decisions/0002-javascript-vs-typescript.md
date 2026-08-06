# 0002 — JavaScript vs TypeScript

## Status

Proposed

## Context

The stack must be chosen for the whole MERN codebase. TypeScript is the default
expectation for many new projects, so choosing JavaScript is itself a decision
that deserves a record. The primary correctness risk in this project is
**data-entry integrity** in seed content (speaker-key references, ordering,
percentage ranges) and **request/response shape** at the API boundary — both of
which are validated at runtime regardless of the language. The author is
deliberately refreshing hands-on MERN fundamentals, and the domain model is
small and well understood before implementation begins.

## Options considered

- **JavaScript (ES modules)** across client and server — zero compile step,
  fastest iteration, relies on runtime validation for data safety; loses
  compile-time type guarantees. *(chosen)*
- **TypeScript** across client and server — compile-time type safety and better
  editor refactoring, at the cost of a build/type-check step, type definitions
  for Mongoose/Express, and additional configuration.

## Decision

Use **JavaScript with ES modules** for both the client and the server in the
MVP.

## Rationale

The risks TypeScript would most help with here are covered by **runtime**
validation that we need anyway: Mongoose schemas enforce required fields, enums,
types, and custom validators on persistence, and request validation guards the
API boundary. Seed integrity is checked by dedicated scripts (see
[0016](./0016-seed-data-strategy.md)). Given a small, stable domain model and a
single author intentionally practicing core MERN, the compile step and typing
overhead of TypeScript buy relatively little for the MVP. JavaScript keeps
iteration fast and the codebase approachable.

## Positive consequences

- No build/type-check step on the server; direct ESM execution.
- Faster iteration and a smaller toolchain surface.
- Runtime validation remains the single source of truth for data safety, avoiding
  duplicate type-and-validator definitions.

## Negative consequences

- No compile-time type checking; refactors rely on tests and discipline.
- Editor autocompletion and cross-module refactoring are weaker than with TS.
- Contributors accustomed to TS lose static guarantees they may expect.

## Risks

- **Domain-model churn** could make the absence of types costly, as wide-reaching
  shape changes would not be caught by a compiler. Mitigated by tests and
  validators; monitored as a revisit trigger below.
- **Onboarding** additional contributors may be harder without type contracts.
  Mitigated by clear schema docs under [`../architecture/`](../architecture/).

## Conditions that would justify revisiting

- The domain model begins churning badly, with shape changes repeatedly causing
  runtime bugs a type system would have caught.
- Additional contributors join and would benefit from enforced type contracts.
- The project grows beyond the MVP into features where compile-time safety
  clearly outweighs the toolchain cost (incremental adoption via JSDoc types or
  a gradual TS migration would then be evaluated).
