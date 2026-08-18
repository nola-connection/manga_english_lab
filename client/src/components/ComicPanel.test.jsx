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
