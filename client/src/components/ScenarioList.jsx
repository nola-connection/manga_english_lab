import { Link } from "react-router-dom";

import { useScenarios } from "../hooks/useScenario.js";

/**
 * Landing page (route `/`). Browses published scenarios from static data and
 * renders each as a keyboard-operable link to `/scenarios/:slug`.
 *
 * The loading state is wired to the fetch hook's `loading` and announced via an
 * `aria-live` region; the delayed cold-start message that fills this region is
 * added when the live API is wired in MEL-082 (see frontend-architecture.md).
 */
export default function ScenarioList() {
  const { data: scenarios, loading, error, retry } = useScenarios();

  return (
    <main className="app-main">
      <h1>Manga English Lab</h1>
      <p>Choose a scenario to practice.</p>

      {loading && (
        <p className="status" role="status" aria-live="polite">
          Loading scenarios…
        </p>
      )}

      {error && !loading && (
        <div className="status status--error" role="alert">
          <p>Sorry, we couldn’t load the scenarios.</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && scenarios && (
        <ul className="scenario-list">
          {scenarios.map((scenario) => (
            <li key={scenario.slug}>
              <Link
                className="scenario-list__link"
                to={`/scenarios/${scenario.slug}`}
              >
                <span className="scenario-list__title">{scenario.title}</span>
                <span className="scenario-list__summary">
                  {scenario.summary}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
