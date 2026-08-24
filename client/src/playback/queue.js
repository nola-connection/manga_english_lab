/**
 * Playback queue construction (MEL-050).
 *
 * Flattens a variation into a single ordered list of dialogue lines across all
 * panels, so the engine can drive one global cursor over it (see
 * docs/architecture/playback-state.md). Panel and line ordering follow **data
 * order = DOM order = reading order** (ADR-0009); a shallow copy is sorted by
 * `order` defensively so the queue is correct even if the source arrays are out
 * of order, and the input is never mutated. This module is pure and
 * framework-agnostic — no React, no DOM, no audio.
 */

/**
 * @typedef {object} QueueItem
 * @property {number} queueIndex Position in the flattened queue (0-based).
 * @property {number} panelIndex Which panel this line belongs to (0-based).
 * @property {number} lineIndex Position of the line within its panel (0-based).
 * @property {number} panelOrder The panel's `order` (1-based).
 * @property {number} lineOrder The line's `order` within its panel (1-based).
 * @property {string} speakerKey Character key the line belongs to.
 * @property {string} text Dialogue text.
 * @property {string} [audioUrl] Per-line audio path (URL/path reference only).
 * @property {boolean} audioEnabled Whether audio is audible for this line.
 * @property {object} bubble Back-reference to the line's bubble placement.
 */

/**
 * Build the flattened, ordered playback queue for a variation.
 *
 * @param {{ panels: Array<{ order: number, dialogueLines: Array<object> }> }} variation
 * @returns {QueueItem[]} the ordered queue (empty array when there are no lines)
 */
export function buildQueue(variation) {
  if (!variation || !Array.isArray(variation.panels)) {
    return [];
  }

  const orderedPanels = [...variation.panels].sort((a, b) => a.order - b.order);

  const queue = [];
  orderedPanels.forEach((panel, panelIndex) => {
    const lines = Array.isArray(panel.dialogueLines)
      ? [...panel.dialogueLines].sort((a, b) => a.order - b.order)
      : [];

    lines.forEach((line, lineIndex) => {
      queue.push({
        queueIndex: queue.length,
        panelIndex,
        lineIndex,
        panelOrder: panel.order,
        lineOrder: line.order,
        speakerKey: line.speakerKey,
        text: line.text,
        audioUrl: line.audioUrl,
        // Audio is audible unless a line explicitly disables it. Character-level
        // toggles are layered on later (MEL-052); a per-line default keeps the
        // pure queue self-contained and testable.
        audioEnabled: line.audioEnabled !== false,
        bubble: line.bubble,
      });
    });
  });

  return queue;
}
