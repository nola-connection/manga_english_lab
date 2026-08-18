import { render, screen, fireEvent } from "@testing-library/react";

import ComicPanel from "./ComicPanel.jsx";

// Representative panel config. Dialogue lines are intentionally declared OUT of
// `order` so the test proves the component sorts to reading/playback order
// rather than relying on array position.
const panel = {
  order: 1,
  imageUrl: "/media/restaurant/v1/p1.png",
  alt: "A waiter greeting a seated customer and handing over a menu.",
  dialogueLines: [
    {
      order: 2,
      speakerKey: "customer",
      text: "Yes, could I have the tomato soup, please?",
      bubble: {
        xPercent: 8,
        yPercent: 60,
        widthPercent: 42,
        tailDirection: "top-right",
      },
    },
    {
      order: 1,
      speakerKey: "waiter",
      text: "Hi! Are you ready to order?",
      bubble: {
        xPercent: 58,
        yPercent: 12,
        widthPercent: 36,
        tailDirection: "bottom-left",
      },
    },
  ],
};

// A different, single-line panel config to prove the template renders ANY panel
// from data rather than anything specific to the two-line fixture above.
const singleLinePanel = {
  order: 2,
  imageUrl: "/media/restaurant/v3/p1.png",
  alt: "The waiter presenting the menu to the seated customer.",
  dialogueLines: [
    {
      order: 1,
      speakerKey: "waiter",
      text: "Good evening. Here is our menu.",
      bubble: {
        xPercent: 50,
        yPercent: 12,
        widthPercent: 44,
        tailDirection: "bottom-left",
      },
    },
  ],
};

describe("MEL-033 single comic panel render", () => {
  it("renders the finished image at a fixed aspect ratio (AC1)", () => {
    const { container } = render(<ComicPanel panel={panel} />);

    const img = screen.getByRole("img", { name: panel.alt });
    expect(img).toHaveAttribute("src", panel.imageUrl);

    // The panel box reserves a fixed aspect ratio before the image loads.
    const box = container.querySelector(".comic-panel");
    expect(box).toHaveStyle({ aspectRatio: "4 / 3" });
  });

  it("renders speech bubbles at their percentage positions with text (AC2)", () => {
    const { container } = render(<ComicPanel panel={panel} />);

    expect(screen.getByText("Hi! Are you ready to order?")).toBeInTheDocument();
    expect(
      screen.getByText("Yes, could I have the tomato soup, please?"),
    ).toBeInTheDocument();

    const bubbles = container.querySelectorAll(".speech-bubble");
    expect(bubbles).toHaveLength(2);

    // First DOM bubble is the first spoken line (order 1), positioned from its
    // percentage coordinates.
    expect(bubbles[0]).toHaveStyle({ left: "58%", top: "12%", width: "36%" });
    expect(bubbles[1]).toHaveStyle({ left: "8%", top: "60%", width: "42%" });
  });

  it("emits bubbles in DOM order equal to reading/playback order (AC3)", () => {
    const { container } = render(<ComicPanel panel={panel} />);

    const texts = [...container.querySelectorAll(".speech-bubble__text")].map(
      (el) => el.textContent,
    );

    // Despite the source array being out of order, DOM order follows `order`.
    expect(texts).toEqual([
      "Hi! Are you ready to order?",
      "Yes, could I have the tomato soup, please?",
    ]);
  });

  it("does not shift bubble layout once the image loads (AC4)", () => {
    const { container } = render(<ComicPanel panel={panel} />);

    const img = screen.getByRole("img", { name: panel.alt });
    const firstBubble = container.querySelector(".speech-bubble");

    // Inline positioning is driven by the reserved box, not the image, so it is
    // identical before and after the image's load event fires.
    const before = firstBubble.getAttribute("style");
    fireEvent.load(img);
    const after = firstBubble.getAttribute("style");

    expect(after).toBe(before);
    expect(firstBubble).toHaveStyle({ left: "58%", top: "12%", width: "36%" });
  });
});

describe("MEL-040 reusable ComicPanel template", () => {
  it("renders any panel from data — image and bubbles (AC1)", () => {
    const { container } = render(<ComicPanel panel={singleLinePanel} />);

    expect(
      screen.getByRole("img", { name: singleLinePanel.alt }),
    ).toHaveAttribute("src", singleLinePanel.imageUrl);
    expect(
      screen.getByText("Good evening. Here is our menu."),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".speech-bubble")).toHaveLength(1);
  });

  it("reserves a fixed aspect ratio to prevent layout shift (AC2)", () => {
    const { container } = render(
      <ComicPanel panel={singleLinePanel} aspectWidth={16} aspectHeight={9} />,
    );

    // The reserved box carries the aspect ratio regardless of image load, and a
    // custom ratio is honored — proving space is reserved from the ratio alone.
    const box = container.querySelector(".comic-panel");
    expect(box).toHaveStyle({ aspectRatio: "16 / 9" });

    const img = screen.getByRole("img", { name: singleLinePanel.alt });
    const before = box.getAttribute("style");
    fireEvent.load(img);
    expect(box.getAttribute("style")).toBe(before);
  });

  it("handles multiple lines per panel (AC4)", () => {
    const { container } = render(<ComicPanel panel={panel} />);

    // Both lines render as bubbles, in reading order, from a multi-line panel.
    const texts = [...container.querySelectorAll(".speech-bubble__text")].map(
      (el) => el.textContent,
    );
    expect(texts).toEqual([
      "Hi! Are you ready to order?",
      "Yes, could I have the tomato soup, please?",
    ]);
  });

  it("honors the active-line indicator prop, marking exactly one bubble (AC3)", () => {
    const { container } = render(
      <ComicPanel panel={panel} activeLineOrder={2} />,
    );

    const active = container.querySelectorAll(".speech-bubble--active");
    expect(active).toHaveLength(1);

    // The active bubble is the one whose line order matches, not DOM position.
    expect(active[0]).toHaveTextContent(
      "Yes, could I have the tomato soup, please?",
    );
    expect(active[0]).toHaveAttribute("aria-current", "true");
    // The panel is flagged so inactive bubbles can be dimmed.
    expect(container.querySelector(".comic-panel")).toHaveClass(
      "comic-panel--has-active",
    );
  });

  it("marks no bubble active when the active-line prop is unset (AC3)", () => {
    const { container } = render(<ComicPanel panel={panel} />);

    expect(container.querySelectorAll(".speech-bubble--active")).toHaveLength(
      0,
    );
    expect(container.querySelector(".comic-panel")).not.toHaveClass(
      "comic-panel--has-active",
    );
  });
});
