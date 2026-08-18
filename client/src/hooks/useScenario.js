/**
 * Fetch hooks for scenario data (MEL-032).
 *
 * Each hook owns its server state and exposes the explicit
 * `{ data, loading, error, retry }` contract from
 * `docs/architecture/frontend-architecture.md`, so screens render loading and
 * error UI consistently. They call the data-access layer (`api/scenarios.js`)
 * and never the data source directly, keeping the eventual static→live swap
 * (MEL-082) invisible to components.
 */
import { useCallback, useEffect, useState } from "react";

import { getScenario, getScenarios } from "../api/scenarios.js";

/**
 * Runs an async loader and tracks loading/error/data, re-running on `retry` or
 * when `deps` change. Ignores results from stale runs so out-of-order
 * resolutions can't overwrite fresh state.
 */
function useAsync(loader, deps) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.resolve()
      .then(loader)
      .then((result) => {
        if (active) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err);
          setData(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  return { data, loading, error, retry };
}

/**
 * Loads the published scenario list (browse view).
 * @returns {{ data: Array|null, loading: boolean, error: Error|null, retry: () => void }}
 */
export function useScenarios() {
  return useAsync(() => getScenarios(), []);
}

/**
 * Loads a single scenario by slug. `error.code === "NOT_FOUND"` distinguishes
 * an unknown slug from other failures so the view can render a not-found state.
 * @param {string} slug
 * @returns {{ data: object|null, loading: boolean, error: Error|null, retry: () => void }}
 */
export function useScenario(slug) {
  return useAsync(() => getScenario(slug), [slug]);
}
