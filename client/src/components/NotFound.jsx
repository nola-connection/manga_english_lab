import { Link } from "react-router-dom";

/**
 * Not-found presentation, reused for an unknown scenario slug and for the
 * catch-all route. Offers a keyboard-operable link back to the scenario list.
 */
export default function NotFound({ title = "Page not found", message }) {
  return (
    <main className="app-main">
      <h1>{title}</h1>
      <p className="status">
        {message ?? "We couldn’t find what you were looking for."}
      </p>
      <Link className="back-link" to="/">
        Back to scenarios
      </Link>
    </main>
  );
}
