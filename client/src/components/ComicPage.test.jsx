import { render } from "@testing-library/react";

import ComicPage from "./ComicPage.jsx";

// Build a minimal panel; `alt` encodes the order so DOM order is assertable.
function makePanel(order) {
  return {
    order,
    imageUrl: `/media/test/p${order}.png`,
    alt: `Panel ${order}`,
    dialogueLines: [
      {
        order: 1,
        speakerKey: "waiter",
        text: `Line for panel ${order}`,
        bubble: {
          xPercent: 10,
          yPercent: 10,
          widthPercent: 40,
          tailDirection: "bottom-left",
        },
      },
    ],
  };
}

function makeVariation(layoutTemplate, orders) {
  return {
    key: `v-${layoutTemplate}`,
    label: layoutTemplate,
    order: 1,
    layoutTemplate,
    panels: orders.map(makePanel),
  };
}

// Representative configs: one per named layout template, at its declared panel
// count and expected desktop column count (see comic-layout-system.md).
const TEMPLATES = [
  { layoutTemplate: "single", count: 1, columns: 1 },
  { layoutTemplate: "two-up", count: 2, columns: 2 },
  { layoutTemplate: "grid-2x2", count: 4, columns: 2 },
  { layoutTemplate: "grid-2x3", count: 6, columns: 2 },
];

function ordersUpTo(count) {
  return Array.from({ length: count }, (_, i) => i + 1);
}

describe("MEL-042 desktop comic-page multi-panel layout", () => {
  it("lays multiple panels out as a comic page on desktop (AC1)", () => {
    const variation = makeVariation("grid-2x2", ordersUpTo(4));
    const { container } = render(<ComicPage variation={variation} />);

    const page = container.querySelector(".comic-page");
    expect(page).toBeInTheDocument();
    expect(page).toHaveClass("comic-page--grid-2x2");
    // Every panel is composed into the page as its own ComicPanel.
    expect(container.querySelectorAll(".comic-panel")).toHaveLength(4);
  });

  it("renders panels in playback order so DOM order matches (AC2)", () => {
    // Source panels are intentionally OUT of order to prove the page sorts by
    // `order` rather than relying on array position.
    const variation = makeVariation("grid-2x2", [3, 1, 4, 2]);
    const { container } = render(<ComicPage variation={variation} />);

    const domOrder = [...container.querySelectorAll(".comic-panel img")].map(
      (img) => img.getAttribute("alt"),
    );
    expect(domOrder).toEqual([
      "Panel 1",
      "Panel 2",
      "Panel 3",
      "Panel 4",
    ]);
  });

  it.each(TEMPLATES)(
    "is stable across the $layoutTemplate config (AC3)",
    ({ layoutTemplate, count, columns }) => {
      const variation = makeVariation(layoutTemplate, ordersUpTo(count));
      const { container } = render(<ComicPage variation={variation} />);

      const page = container.querySelector(".comic-page");
      // Correct panel count and declared column count for the template.
      expect(container.querySelectorAll(".comic-panel")).toHaveLength(count);
      expect(page).toHaveAttribute("data-layout-template", layoutTemplate);
      expect(page).toHaveAttribute("data-columns", String(columns));
    },
  );

  it.each(TEMPLATES)(
    "guards against horizontal overflow for $layoutTemplate (AC4)",
    ({ layoutTemplate, count, columns }) => {
      const variation = makeVariation(layoutTemplate, ordersUpTo(count));
      const { container } = render(<ComicPage variation={variation} />);

      // Columns use `repeat(N, minmax(0, 1fr))`: fractional tracks with a 0 min
      // share the row width and never force the row wider than the container, so
      // the page cannot overflow horizontally at desktop widths.
      const page = container.querySelector(".comic-page");
      const style = page.getAttribute("style") ?? "";
      expect(style).toContain(`repeat(${columns}, minmax(0, 1fr))`);
    },
  );
});
