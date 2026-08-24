import { describe, it, expect } from "vitest";

import { buildQueue } from "./queue.js";

// A two-panel variation whose panels AND lines are declared OUT of `order` so
// the tests prove the queue flattens by data order (sorted by `order`) rather
// than by array position (ADR-0009).
function makeVariation() {
  return {
    panels: [
      {
        order: 2,
        dialogueLines: [
          {
            order: 2,
            speakerKey: "waiter",
            text: "Enjoy your meal.",
            audioUrl: "/media/p2-l2.mp3",
            bubble: { xPercent: 10, yPercent: 20, widthPercent: 30 },
          },
          {
            order: 1,
            speakerKey: "customer",
            text: "Thank you!",
            audioUrl: "/media/p2-l1.mp3",
            audioEnabled: false,
            bubble: { xPercent: 40, yPercent: 50, widthPercent: 25 },
          },
        ],
      },
      {
        order: 1,
        dialogueLines: [
          {
            order: 1,
            speakerKey: "waiter",
            text: "Are you ready to order?",
            audioUrl: "/media/p1-l1.mp3",
            bubble: { xPercent: 5, yPercent: 8, widthPercent: 35 },
          },
        ],
      },
    ],
  };
}

describe("MEL-050 buildQueue", () => {
  it("flattens panels and lines into a single data-ordered queue (AC4)", () => {
    const queue = buildQueue(makeVariation());
    expect(queue.map((q) => q.text)).toEqual([
      "Are you ready to order?", // panel order 1
      "Thank you!", // panel order 2, line order 1
      "Enjoy your meal.", // panel order 2, line order 2
    ]);
  });

  it("assigns contiguous queueIndex values in order (AC4)", () => {
    const queue = buildQueue(makeVariation());
    expect(queue.map((q) => q.queueIndex)).toEqual([0, 1, 2]);
  });

  it("derives panelIndex from data-ordered panels (AC4)", () => {
    const queue = buildQueue(makeVariation());
    expect(queue.map((q) => q.panelIndex)).toEqual([0, 1, 1]);
  });

  it("derives lineIndex within each panel (AC4)", () => {
    const queue = buildQueue(makeVariation());
    expect(queue.map((q) => q.lineIndex)).toEqual([0, 0, 1]);
  });

  it("carries panelOrder and lineOrder from the source data (AC4)", () => {
    const queue = buildQueue(makeVariation());
    expect(queue.map((q) => [q.panelOrder, q.lineOrder])).toEqual([
      [1, 1],
      [2, 1],
      [2, 2],
    ]);
  });

  it("carries speakerKey, audioUrl, and bubble references (AC4)", () => {
    const queue = buildQueue(makeVariation());
    expect(queue[0].speakerKey).toBe("waiter");
    expect(queue[0].audioUrl).toBe("/media/p1-l1.mp3");
    expect(queue[0].bubble).toEqual({
      xPercent: 5,
      yPercent: 8,
      widthPercent: 35,
    });
  });

  it("defaults audioEnabled to true and respects explicit false (AC3)", () => {
    const queue = buildQueue(makeVariation());
    expect(queue[0].audioEnabled).toBe(true); // no flag -> audible
    expect(queue[1].audioEnabled).toBe(false); // explicit false preserved
  });

  it("does not mutate the source variation (AC4)", () => {
    const variation = makeVariation();
    const originalFirstPanelOrder = variation.panels[0].order;
    buildQueue(variation);
    expect(variation.panels[0].order).toBe(originalFirstPanelOrder);
  });

  it("returns an empty array for missing or malformed input (AC4)", () => {
    expect(buildQueue(undefined)).toEqual([]);
    expect(buildQueue({})).toEqual([]);
    expect(buildQueue({ panels: [] })).toEqual([]);
  });
});
