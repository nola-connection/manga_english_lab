import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ComicPage from "./ComicPage.jsx";

// MEL-043: reading/DOM order must equal playback order everywhere, and tab order
// must follow the same sequence. Playback walks a variation panel by panel, and
// within each panel line by line (ADR-0009). These tests verify the invariant on
// a MULTI-PANEL, MULTI-LINE config whose panels AND lines are declared OUT of
// order, so a pass proves the render sorts to playback order rather than relying
// on source array position.

function line(panelOrder, lineOrder) {
  return {
    order: lineOrder,
    speakerKey: lineOrder % 2 === 1 ? "waiter" : "customer",
    // Text encodes panel.line so DOM/tab order is directly assertable.
    text: `${panelOrder}.${lineOrder}`,
    bubble: {
      xPercent: 10 * lineOrder,
      yPercent: 10 * panelOrder,
      widthPercent: 30,
      tailDirection: "bottom-left",
    },
  };
}

function panel(order, lineOrders) {
  return {
    order,
    imageUrl: `/media/test/p${order}.png`,
    alt: `Panel ${order}`,
    dialogueLines: lineOrders.map((lo) => line(order, lo)),
  };
}

// Four panels (grid-2x2); panels 1 and 3 carry two lines each. Panels are listed
// out of order, and each panel's lines are listed out of order too.
const variation = {
  key: "reading-order",
  label: "Reading order",
  order: 1,
  layoutTemplate: "grid-2x2",
  panels: [
    panel(3, [2, 1]),
    panel(1, [2, 1]),
    panel(4, [1]),
    panel(2, [1]),
  ],
};

// Canonical playback/reading order derived from the data itself: panels by
// `order`, then lines by `order` within each panel. The rendered order must
// equal this, so the expectation is derived rather than hard-coded.
function expectedPlaybackTexts(v) {
  return [...v.panels]
    .sort((a, b) => a.order - b.order)
    .flatMap((p) =>
      [...p.dialogueLines]
        .sort((a, b) => a.order - b.order)
        .map((l) => l.text),
    );
}

describe("MEL-043 reading/DOM order equals playback order", () => {
  it("emits panels and bubbles in playback order in the DOM (AC1, AC3)", () => {
    const { container } = render(<ComicPage variation={variation} />);

    // Panels appear in ascending `order`, independent of source position.
    const panelAlts = [...container.querySelectorAll(".comic-panel img")].map(
      (img) => img.getAttribute("alt"),
    );
    expect(panelAlts).toEqual(["Panel 1", "Panel 2", "Panel 3", "Panel 4"]);

    // Bubbles across the whole page follow the flattened playback order
    // (panel by panel, line by line).
    const bubbleTexts = [
      ...container.querySelectorAll(".speech-bubble__text"),
    ].map((el) => el.textContent);
    expect(bubbleTexts).toEqual(expectedPlaybackTexts(variation));
    expect(bubbleTexts).toEqual([
      "1.1",
      "1.2",
      "2.1",
      "3.1",
      "3.2",
      "4.1",
    ]);
  });

  it("moves focus through bubbles in playback order when tabbing (AC2, AC3)", async () => {
    const user = userEvent.setup();
    render(<ComicPage variation={variation} />);

    const expected = expectedPlaybackTexts(variation);

    // Tabbing visits each bubble button once, in playback order; the bubbles are
    // the only focusable elements, so nothing interleaves out of sequence.
    const focusedTexts = [];
    for (let i = 0; i < expected.length; i += 1) {
      await user.tab();
      const active = document.activeElement;
      expect(active).toHaveClass("speech-bubble");
      focusedTexts.push(active.textContent);
    }

    expect(focusedTexts).toEqual(expected);
  });

  it("makes only the bubble buttons tabbable (AC2)", async () => {
    const user = userEvent.setup();
    const { container } = render(<ComicPage variation={variation} />);

    const bubbleCount = container.querySelectorAll(".speech-bubble").length;

    // After tabbing once per bubble, a further Tab leaves the bubbles entirely
    // (focus is not on a bubble), proving images/containers add no tab stops
    // between bubbles that would break the sequence.
    for (let i = 0; i < bubbleCount; i += 1) {
      await user.tab();
    }
    expect(document.activeElement).toHaveClass("speech-bubble");

    await user.tab();
    expect(document.activeElement).not.toHaveClass("speech-bubble");
  });
});
