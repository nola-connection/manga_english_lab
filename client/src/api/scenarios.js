/**
 * Data-access layer for scenarios (MEL-032).
 *
 * All scenario reads go through these functions; components and hooks never
 * touch the data source directly (see
 * `docs/architecture/frontend-architecture.md`). For the MVP they resolve from
 * the static fixtures in `staticData.js`; swapping to the live REST API
 * (MEL-082) is a localized change here — the async signatures and returned
 * shapes already match `docs/architecture/api-contract.md`.
 */
import { scenarioList, scenariosBySlug } from "./staticData.js";

/**
 * Raised when a scenario cannot be found for a slug. Mirrors the API's `404 /
 * NOT_FOUND`, letting callers distinguish "no such scenario" from other errors.
 */
export class ScenarioNotFoundError extends Error {
  constructor(slug) {
    super(`Scenario not found: ${slug}`);
    this.name = "ScenarioNotFoundError";
    this.code = "NOT_FOUND";
    this.slug = slug;
  }
}

/**
 * List published scenarios as the lightweight `{ slug, title, summary }`
 * projection returned by `GET /api/scenarios`.
 *
 * @returns {Promise<Array<{ slug: string, title: string, summary: string }>>}
 */
export async function getScenarios() {
  return scenarioList.map((s) => ({ ...s }));
}

/**
 * Fetch the full scenario document for a slug, as returned by
 * `GET /api/scenarios/:slug`.
 *
 * @param {string} slug
 * @returns {Promise<object>} the full scenario document
 * @throws {ScenarioNotFoundError} when no scenario matches the slug
 */
export async function getScenario(slug) {
  const scenario = scenariosBySlug[slug];
  if (!scenario) {
    throw new ScenarioNotFoundError(slug);
  }
  return scenario;
}
