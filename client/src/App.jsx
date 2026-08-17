import { Routes, Route } from "react-router-dom";

// Base routing shell. Only a placeholder route exists for now; the real
// ScenarioList (`/`) and ScenarioView (`/scenarios/:slug`) screens arrive with
// MEL-032. See docs/architecture/frontend-architecture.md.
function Placeholder() {
  return (
    <main>
      <h1>Manga English Lab</h1>
      <p>Client scaffold is running.</p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder />} />
    </Routes>
  );
}
