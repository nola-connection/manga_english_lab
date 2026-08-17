import { Routes, Route } from "react-router-dom";

import ScenarioList from "./components/ScenarioList.jsx";
import ScenarioView from "./components/ScenarioView.jsx";
import NotFound from "./components/NotFound.jsx";

// Routing shell for the MVP (see docs/architecture/frontend-architecture.md):
// `/` browses scenarios, `/scenarios/:slug` views one, and a catch-all renders
// the not-found state.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ScenarioList />} />
      <Route path="/scenarios/:slug" element={<ScenarioView />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
