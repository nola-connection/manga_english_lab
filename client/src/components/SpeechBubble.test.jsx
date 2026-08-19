import { render, screen } from "@testing-library/react";

import SpeechBubble from "./SpeechBubble.jsx";

// Base bubble config; individual tests override coordinates/tail as needed.
const baseBubble = {
  xPercent: 20,
  yPercent: 30,
  widthPercent: 40,
  tailDirection: "bottom-left",
};

function renderBubble(props = {}) {
  const { bubble, ...rest } = props;
  return render(
    <SpeechBubble
      bubble={{ ...baseBubble, ...bubble }}
      text="Hi! Are you ready to order?"
      speakerKey="waiter"
      {...rest}
    />,
  );
}

describe("MEL-041 SpeechBubble", () => {
  it("positions via percentage x/y with a configurable width (AC1)", () => {
    const { container } = renderBubble({
      bubble: { xPercent: 12, yPercent: 64, widthPercent: 38 },
    });

    const box = container.querySelector(".speech-bubble");
    expect(box).toHaveStyle({ left: "12%", top: "64%", width: "38%" });
  });

  it("keeps edge/corner bubbles positioned from their coordinates (AC1)", () => {
    // A bubble placed hard against the bottom-right corner still renders from its
    // percentage coordinates rather than being widened or repositioned.
    const { container } = renderBubble({
      bubble: {
        xPercent: 96,
        yPercent: 96,
        widthPercent: 4,
        tailDirection: "bottom-right",
      },
    });

    expect(container.querySelector(".speech-bubble")).toHaveStyle({
      left: "96%",
      top: "96%",
      width: "4%",
    });
  });

  it.each([
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ])("renders a tail pointing toward the speaker: %s (AC2)", (tailDirection) => {
    const { container } = renderBubble({ bubble: { tailDirection } });

    const box = container.querySelector(".speech-bubble");
    expect(box).toHaveClass(`speech-bubble--tail-${tailDirection}`);

    const tail = container.querySelector(".speech-bubble__tail");
    expect(tail).toHaveAttribute("data-tail-direction", tailDirection);
    // The tail is decorative and must not be read as content.
    expect(tail).toHaveAttribute("aria-hidden", "true");
  });

  it("wraps long text within the fixed bubble width (AC3)", () => {
    const longText =
      "I would absolutely love to order the slow-roasted heirloom tomato " +
      "soup with a side of freshly baked sourdough, if that is still available.";
    const { container } = renderBubble({
      bubble: { widthPercent: 30 },
      text: longText,
    });

    // Width is fixed from the coordinate (the bubble never widens to fit), and
    // the full text is present to wrap and grow the content-driven height.
    const box = container.querySelector(".speech-bubble");
    expect(box).toHaveStyle({ width: "30%" });
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it("hides text without implying muted and without layout shift (AC3)", () => {
    const { container, rerender } = renderBubble();
    const shown = container.querySelector(".speech-bubble");
    const shownStyle = shown.getAttribute("style");

    rerender(
      <SpeechBubble bubble={baseBubble} text="Hi! Are you ready to order?" speakerKey="waiter" isHidden />,
    );

    const hidden = container.querySelector(".speech-bubble");
    // Shape/position preserved: same inline positioning whether shown or hidden.
    expect(hidden.getAttribute("style")).toBe(shownStyle);
    expect(hidden).toHaveClass("speech-bubble--text-hidden");

    // The text node stays in the DOM but is hidden from screen readers.
    const textNode = container.querySelector(".speech-bubble__text");
    expect(textNode).toHaveTextContent("Hi! Are you ready to order?");
    expect(textNode).toHaveAttribute("aria-hidden", "true");

    // Hidden text is a text-visibility state — never "muted".
    const label = hidden.getAttribute("aria-label") ?? "";
    expect(label).not.toMatch(/mut/i);
    expect(label).toMatch(/hidden/i);
  });

  it("supports an active-highlight visual state (AC4)", () => {
    const { container } = renderBubble({ isActive: true });

    const box = container.querySelector(".speech-bubble");
    expect(box).toHaveClass("speech-bubble--active");
    expect(box).toHaveAttribute("aria-current", "true");
    expect(box).toHaveAttribute("data-active", "true");
  });

  it("is a semantic, focusable button for later interaction (AC5)", () => {
    renderBubble();

    // Semantic button with an accessible name derived from its text.
    const button = screen.getByRole("button", {
      name: "Hi! Are you ready to order?",
    });
    expect(button).toHaveClass("speech-bubble");

    // Focusable by keyboard/programmatically without a tabindex hack.
    button.focus();
    expect(button).toHaveFocus();
  });

  it("keeps an accessible name when the text is hidden (AC5)", () => {
    renderBubble({ isHidden: true });

    // A focusable control must still have a name; it names the speaker's hidden
    // text rather than exposing the content or saying "muted".
    const button = screen.getByRole("button", {
      name: "Hidden dialogue text for waiter",
    });
    button.focus();
    expect(button).toHaveFocus();
  });
});
