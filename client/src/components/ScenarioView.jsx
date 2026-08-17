import { Link, useParams } from "react-router-dom";

import { useScenario } from "../hooks/useScenario.js";
import NotFound from "./NotFound.jsx";

/**
 * Scenario route (`/scenarios/:slug`). Resolves the scenario from static data
 * and shows its overview: title, summary, the available variations, and the
 * glossary terms. Unknown slugs render the not-found state.
 *
 * Rendering panels, speech bubbles, and playback is intentionally out of scope
 * here (MEL-033+); this view only proves the route resolves to a scenario.
 */
export default function ScenarioView() {
  const { slug } = useParams();
  const { data: scenario, loading, error, retry } = useScenario(slug);

  if (loading) {
    return (
      <main className="app-main">
        <p className="status" role="status" aria-live="polite">
          Loading scenario…
        </p>
      </main>
    );
  }

  if (error?.code === "NOT_FOUND") {
    return (
      <NotFound
        title="Scenario not found"
        message={`We couldn't find a scenario for "${slug}".`}
      />
    );
  }

  if (error) {
    return (
      <main className="app-main">
        <div className="status status--error" role="alert">
          <p>Sorry, we couldn’t load this scenario.</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app-main">
      <Link className="back-link" to="/">
        Back to scenarios
      </Link>
      <h1>{scenario.title}</h1>
      <p>{scenario.summary}</p>

      <section aria-labelledby="variations-heading">
        <h2 id="variations-heading">Variations</h2>
        <ul>
          {scenario.variations.map((variation) => (
            <li key={variation.key}>{variation.label}</li>
          ))}
        </ul>
      </section>

      {scenario.glossary?.length > 0 && (
        <section aria-labelledby="glossary-heading">
          <h2 id="glossary-heading">Glossary</h2>
          <dl>
            {scenario.glossary.map((entry) => (
              <div key={entry.term}>
                <dt>{entry.term}</dt>
                <dd>{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </main>
  );
}
