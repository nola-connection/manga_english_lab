/**
 * Self-check for the panel image-prompt generator (MEL-150).
 *
 * Without introducing a test framework (matching validate-restaurant-data.mjs),
 * builds a prompt for every panel in every scenario and asserts each prompt is
 * well-formed: it states the 4:3 background-only/no-text rule, lists every
 * dialogue line's bubble percentages, and names each resolved character. Also
 * verifies resolvePanel's error handling. Run with `npm run prompt:image:check`;
 * exits non-zero on the first failure.
 */
import assert from "node:assert/strict";

import { scenariosBySlug } from "../client/src/api/staticData.js";

import { buildPanelPrompt, resolvePanel } from "./lib/image-prompt.mjs";

let panelCount = 0;

for (const [slug, scenario] of Object.entries(scenariosBySlug)) {
  for (const variation of scenario.variations) {
    for (const panel of variation.panels) {
      const where = `${slug}/${variation.key}/panel ${panel.order}`;
      const prompt = buildPanelPrompt(scenario, variation, panel);

      // Format rules must always be present.
      assert.match(
        prompt,
        /4:3/,
        `${where}: prompt must state 4:3 aspect ratio`,
      );
      assert.match(
        prompt,
        /background\/scene image ONLY/,
        `${where}: prompt must state it is background-only`,
      );
      assert.match(
        prompt,
        /Do NOT draw any speech bubbles/,
        `${where}: prompt must forbid bubbles/text`,
      );
      assert.ok(
        prompt.includes(panel.alt),
        `${where}: prompt must include the panel's alt/ambience text`,
      );

      // Every line contributes its percentages and its resolved character name.
      for (const line of panel.dialogueLines) {
        const { xPercent, yPercent, widthPercent } = line.bubble;
        assert.ok(
          prompt.includes(`x=${xPercent}%, y=${yPercent}%`),
          `${where} line ${line.order}: prompt must include x/y percentages`,
        );
        assert.ok(
          prompt.includes(`width ≈ ${widthPercent}%`),
          `${where} line ${line.order}: prompt must include width percentage`,
        );

        const character = scenario.characters.find(
          (c) => c.key === line.speakerKey,
        );
        assert.ok(
          character,
          `${where} line ${line.order}: speakerKey resolves`,
        );
        assert.ok(
          prompt.includes(character.displayName),
          `${where} line ${line.order}: prompt must name the resolved character`,
        );
      }

      panelCount += 1;
    }
  }
}

// resolvePanel must reject unknown handles with a clear, throwing error.
const anySlug = Object.keys(scenariosBySlug)[0];
assert.throws(
  () => resolvePanel(scenariosBySlug, "no-such-slug", "x", 1),
  /Unknown scenario slug/,
  "unknown slug must throw",
);
assert.throws(
  () => resolvePanel(scenariosBySlug, anySlug, "no-such-variation", 1),
  /Unknown variation/,
  "unknown variation must throw",
);
assert.throws(
  () =>
    resolvePanel(
      scenariosBySlug,
      anySlug,
      scenariosBySlug[anySlug].variations[0].key,
      999,
    ),
  /Unknown panel order/,
  "unknown panel order must throw",
);

console.log(
  `OK: image-prompt generator produced valid prompts for ${panelCount} panels.`,
);
