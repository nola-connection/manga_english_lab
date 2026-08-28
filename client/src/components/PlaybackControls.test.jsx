import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PlaybackControls from "./PlaybackControls.jsx";

describe("MEL-052 PlaybackControls", () => {
  it("shows Play with accessible names when not playing (AC)", () => {
    render(
      <PlaybackControls state="Idle" isPlaying={false} onPlay={() => {}} />,
    );

    const toggle = screen.getByRole("button", { name: "Play" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Restart" })).toBeInTheDocument();
  });

  it("shows Pause with aria-pressed while playing (AC)", () => {
    render(
      <PlaybackControls state="Playing" isPlaying onPause={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "Pause" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("dispatches play/pause/restart intents on click (AC)", async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    const onRestart = vi.fn();
    const { rerender } = render(
      <PlaybackControls
        state="Idle"
        isPlaying={false}
        onPlay={onPlay}
        onRestart={onRestart}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(onPlay).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Restart" }));
    expect(onRestart).toHaveBeenCalledTimes(1);

    // Once playing, the same toggle calls onPause instead.
    const onPause = vi.fn();
    rerender(
      <PlaybackControls state="Playing" isPlaying onPause={onPause} />,
    );
    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("is fully keyboard operable — tab to focus, Enter/Space to activate (AC)", async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    render(
      <PlaybackControls state="Idle" isPlaying={false} onPlay={onPlay} />,
    );

    // Tab moves focus to the toggle (a real <button>, so it is in tab order).
    await user.tab();
    const toggle = screen.getByRole("button", { name: "Play" });
    expect(toggle).toHaveFocus();

    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onPlay).toHaveBeenCalledTimes(2);
  });

  it("exposes the engine state as a data hook for styling/testing", () => {
    const { container } = render(
      <PlaybackControls state="Paused" isPlaying={false} />,
    );

    const group = container.querySelector(".playback-controls");
    expect(group).toHaveAttribute("data-state", "Paused");
    expect(group).toHaveAttribute("aria-label", "Playback controls");
  });
});
