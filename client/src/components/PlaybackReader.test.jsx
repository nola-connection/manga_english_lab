import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PlaybackReader from "./PlaybackReader.jsx";

// Controllable clock so muted-line playback advances deterministically.
function createTestClock() {
  let seq = 0;
  const timers = new Map();
  return {
    setTimeout: (fn) => {
      const id = ++seq;
      timers.set(id, fn);
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    flushNext() {
      const entry = timers.entries().next().value;
      if (!entry) return false;
      timers.delete(entry[0]);
      entry[1]();
      return true;
    },
  };
}

function bubble(x) {
  return { xPercent: x, yPercent: 10, widthPercent: 40, tailDirection: "bottom-left" };
}

// Two panels; all lines muted (no audioUrl) so the fake clock drives playback.
const VARIATION = {
  key: "v1",
  label: "V1",
  order: 1,
  layoutTemplate: "two-up",
  panels: [
    {
      order: 1,
      imageUrl: "/p1.png",
      alt: "Panel 1",
      dialogueLines: [
        { order: 1, speakerKey: "waiter", text: "Hi there", audioEnabled: false, bubble: bubble(8) },
        { order: 2, speakerKey: "guest", text: "Hello back", audioEnabled: false, bubble: bubble(52) },
      ],
    },
    {
      order: 2,
      imageUrl: "/p2.png",
      alt: "Panel 2",
      dialogueLines: [
        { order: 1, speakerKey: "waiter", text: "Ready to order?", audioEnabled: false, bubble: bubble(8) },
      ],
    },
  ],
};

function activeText(container) {
  return container.querySelector(".speech-bubble--active")?.textContent;
}

describe("MEL-052 PlaybackReader integration", () => {
  beforeEach(() => {
    // jsdom implements neither of these; stub scrollIntoView so the follow is
    // observable and focus() below doesn't throw.
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("highlights nothing until playback starts (AC)", () => {
    const { container } = render(
      <PlaybackReader variation={VARIATION} engineOptions={{ clock: createTestClock() }} />,
    );
    expect(container.querySelector(".speech-bubble--active")).toBeNull();
  });

  it("highlights the active line from the cursor and follows it within a panel (AC)", async () => {
    const user = userEvent.setup();
    const clock = createTestClock();
    const { container } = render(
      <PlaybackReader variation={VARIATION} engineOptions={{ clock }} />,
    );

    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(activeText(container)).toBe("Hi there");
    expect(container.querySelector(".speech-bubble--active")).toHaveAttribute(
      "aria-current",
      "true",
    );

    // Next line in the same panel: highlight moves, exactly one bubble active.
    act(() => clock.flushNext());
    expect(activeText(container)).toBe("Hello back");
    expect(container.querySelectorAll(".speech-bubble--active")).toHaveLength(1);
  });

  it("scrolls and focuses the active panel as the cursor crosses panels (AC)", async () => {
    const user = userEvent.setup();
    const clock = createTestClock();
    const { container } = render(
      <PlaybackReader variation={VARIATION} engineOptions={{ clock }} />,
    );

    const panel0 = container.querySelector('[data-panel-index="0"]');
    const panel1 = container.querySelector('[data-panel-index="1"]');

    await user.click(screen.getByRole("button", { name: "Play" }));
    // Starting playback follows into the first panel.
    expect(panel0.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(panel0);

    // Advancing within panel 0 must NOT re-scroll/re-focus.
    panel0.scrollIntoView.mockClear();
    act(() => clock.flushNext());
    expect(panel0.scrollIntoView).not.toHaveBeenCalled();

    // Crossing into panel 1 scrolls it into view and moves focus to it.
    act(() => clock.flushNext());
    expect(panel1.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(panel1);
  });

  it("announces the active line in a polite live region (AC)", async () => {
    const user = userEvent.setup();
    const clock = createTestClock();
    render(<PlaybackReader variation={VARIATION} engineOptions={{ clock }} />);

    const live = screen.getByRole("status");
    expect(live).toHaveAttribute("aria-live", "polite");

    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(live).toHaveTextContent("waiter: Hi there");

    act(() => clock.flushNext());
    expect(live).toHaveTextContent("guest: Hello back");
  });
});
