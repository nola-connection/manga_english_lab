import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import App from "../App.jsx";

// Slug/title come from the static restaurant fixture (MEL-031).
const SLUG = "ordering-at-a-restaurant";
const TITLE = "Ordering at a Restaurant";

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("MEL-032 scenario list + routing", () => {
  it("renders the scenario list with slugs as links (AC1)", async () => {
    renderAt("/");

    const link = await screen.findByRole("link", { name: /Ordering at a/i });
    expect(link).toHaveAttribute("href", `/scenarios/${SLUG}`);
  });

  it("renders a loading state wired to the fetch hook before data resolves (AC5)", () => {
    renderAt("/");

    // Synchronously present on first render, before the async loader resolves.
    expect(screen.getByRole("status")).toHaveTextContent(/loading scenarios/i);
  });

  it("resolves /scenarios/:slug to the scenario view (AC2)", async () => {
    renderAt(`/scenarios/${SLUG}`);

    expect(
      await screen.findByRole("heading", { level: 1, name: TITLE }),
    ).toBeInTheDocument();
  });

  it("shows a not-found state for an unknown slug (AC3)", async () => {
    renderAt("/scenarios/does-not-exist");

    expect(
      await screen.findByRole("heading", { name: /scenario not found/i }),
    ).toBeInTheDocument();
  });

  it("navigates from the list to a scenario using the keyboard (AC4)", async () => {
    const user = userEvent.setup();
    renderAt("/");

    const link = await screen.findByRole("link", { name: /Ordering at a/i });

    // Move focus with Tab, then activate with Enter — no mouse involved.
    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard("{Enter}");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: TITLE }),
      ).toBeInTheDocument(),
    );
  });
});
