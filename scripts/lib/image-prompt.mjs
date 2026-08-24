/**
 * Panel image-prompt builder (MEL-150).
 *
 * Turns a single panel's data (from `client/src/api/staticData.js`) into a
 * paste-ready ChatGPT image-generation prompt: a 4:3, background-only scene with
 * no text/bubbles, whose bubble keep-out zones, characters, ambience, and
 * dialogue order are derived from the panel — not hard-coded. Speech bubbles are
 * drawn later as a DOM/CSS overlay (see docs/architecture/comic-layout-system.md
 * and client/src/components/ComicPanel.jsx, whose panel box is a 4/3 aspect box),
 * so the generated image must leave those regions clear.
 *
 * Pure and dependency-free so both the CLI and the self-check can reuse it.
 */

// Panel box aspect ratio (matches ComicPanel's aspectWidth/aspectHeight default).
export const ASPECT = { width: 4, height: 3 };

// Which side of the panel the speaker sits on, implied by the tail direction
// (the tail points from the bubble toward the speaker).
const SPEAKER_SIDE = {
  "top-left": "upper-left",
  "top-right": "upper-right",
  "bottom-left": "lower-left",
  "bottom-right": "lower-right",
};

// Rough region label for a bubble's top-left corner, for author readability.
function regionFor(xPercent, yPercent) {
  const vertical = yPercent < 50 ? "upper" : "lower";
  const horizontal = xPercent < 50 ? "left" : "right";
  return `${vertical}-${horizontal}`;
}

/** Resolve a panel and its context, throwing a clear error when not found. */
export function resolvePanel(scenariosBySlug, slug, variationKey, panelOrder) {
  const scenario = scenariosBySlug[slug];
  if (!scenario) {
    const known = Object.keys(scenariosBySlug).join(", ") || "(none)";
    throw new Error(`Unknown scenario slug "${slug}". Known slugs: ${known}.`);
  }
  const variation = scenario.variations.find((v) => v.key === variationKey);
  if (!variation) {
    const known = scenario.variations.map((v) => v.key).join(", ");
    throw new Error(
      `Unknown variation "${variationKey}" in "${slug}". Known keys: ${known}.`,
    );
  }
  const order = Number(panelOrder);
  const panel = variation.panels.find((p) => p.order === order);
  if (!panel) {
    const known = variation.panels.map((p) => p.order).join(", ");
    throw new Error(
      `Unknown panel order "${panelOrder}" in "${slug}/${variationKey}". ` +
        `Known orders: ${known}.`,
    );
  }
  return { scenario, variation, panel };
}

/** Map a line's speakerKey to a readable "DisplayName (role)" label. */
function speakerLabel(scenario, speakerKey) {
  const character = scenario.characters.find((c) => c.key === speakerKey);
  if (!character) return speakerKey;
  return `${character.displayName} (${character.role})`;
}

/**
 * Build the paste-ready prompt string for a single panel.
 * @returns {string}
 */
export function buildPanelPrompt(scenario, variation, panel) {
  // Dialogue in playback order so keep-out zones read panel-by-line correctly.
  const lines = [...panel.dialogueLines].sort((a, b) => a.order - b.order);

  const speakers = [
    ...new Set(lines.map((l) => speakerLabel(scenario, l.speakerKey))),
  ];

  const zoneLines = lines.map((line) => {
    const { xPercent, yPercent, widthPercent, tailDirection } = line.bubble;
    const who = speakerLabel(scenario, line.speakerKey);
    const side = SPEAKER_SIDE[tailDirection] ?? "unknown";
    const region = regionFor(xPercent, yPercent);
    return (
      `  ${line.order}. ${who} — keep-out zone in the ${region} region: ` +
      `top-left corner at x=${xPercent}%, y=${yPercent}% (from the panel's ` +
      `top-left), width ≈ ${widthPercent}% of the panel. Place this speaker ` +
      `toward the ${side} so the bubble tail (${tailDirection}) points at them.`
    );
  });

  return [
    `Use the attached image as the exact art-style reference. Create a`,
    `BACKGROUND illustration for a single comic panel in that same style.`,
    ``,
    `Canvas / format`,
    `- Aspect ratio ${ASPECT.width}:${ASPECT.height}, landscape (e.g. 1536 × 1152 px). The image is`,
    `  cropped object-fit: cover inside a ${ASPECT.width}:${ASPECT.height} box, so keep important`,
    `  content within a safe central area and avoid critical detail at the edges.`,
    `- This is a background/scene image ONLY. Do NOT draw any speech bubbles,`,
    `  dialogue, text, letters, captions, sound effects, or logos anywhere —`,
    `  bubbles are added later as a separate UI layer on top.`,
    ``,
    `Scene (${scenario.title} — variation "${variation.label}", panel ${panel.order})`,
    `- ${panel.alt}`,
    `- Characters present: ${speakers.join("; ")}.`,
    `- Mood: friendly, polite, everyday-conversation tone.`,
    ``,
    `Composition / bubble keep-out zones (leave these areas visually calm — light,`,
    `low-detail, no faces or key objects — so overlaid bubbles stay legible).`,
    `Coordinates are % of the panel measured from the top-left corner:`,
    ...zoneLines,
    ``,
    `Style`,
    `- Match the reference exactly: line weight, coloring, shading, character`,
    `  proportions, and palette. Consistent, clean comic/manga-style art.`,
  ].join("\n");
}

/** Build prompts for every panel in a variation, in playback order. */
export function buildVariationPrompts(scenario, variation) {
  return [...variation.panels]
    .sort((a, b) => a.order - b.order)
    .map((panel) => ({
      panel,
      prompt: buildPanelPrompt(scenario, variation, panel),
    }));
}
