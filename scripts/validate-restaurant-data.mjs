/**
 * Internal-consistency validator for the static restaurant scenario (MEL-031).
 *
 * Verifies the acceptance/testing requirements from the ticket without
 * introducing a test framework (that is MEL-021's remit): every `speakerKey`
 * resolves to a declared character, bubble percentages stay within 0–100, and
 * each variation's `layoutTemplate` panel count equals its `panels.length`.
 * Also checks contiguous `order` values and the list-projection parity so the
 * fixtures stay faithful to `docs/architecture/api-contract.md`.
 *
 * Run with `npm run validate:data`. Exits non-zero on the first failure.
 */
import assert from "node:assert/strict";

import {
  restaurantScenario as scenario,
  scenarioList,
  scenariosBySlug,
} from "../client/src/api/staticData.js";

// Panel count declared by each named layout template (data-model.md).
const PANELS_PER_TEMPLATE = {
  single: 1,
  "two-up": 2,
  "grid-2x2": 4,
  "grid-2x3": 6,
};

const TAIL_DIRECTIONS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

const characterKeys = new Set(scenario.characters.map((c) => c.key));

// List projection mirrors GET /api/scenarios and stays in sync with the doc.
assert.equal(scenarioList.length, 1, "scenarioList should hold one scenario");
assert.deepEqual(
  scenarioList[0],
  {
    slug: scenario.slug,
    title: scenario.title,
    summary: scenario.summary,
  },
  "scenarioList projection must match the full document fields",
);
assert.equal(
  scenariosBySlug[scenario.slug],
  scenario,
  "scenariosBySlug must resolve the scenario by its slug",
);

assert.ok(scenario.published === true, "scenario must be published");
assert.ok(
  Array.isArray(scenario.variations) && scenario.variations.length >= 1,
  "scenario must have at least one variation",
);
assert.ok(scenario.glossary.length >= 1, "scenario must have a glossary");

scenario.variations.forEach((variation, vIndex) => {
  assert.equal(
    variation.order,
    vIndex + 1,
    `variation "${variation.key}" order must be contiguous from 1`,
  );

  const expectedPanels = PANELS_PER_TEMPLATE[variation.layoutTemplate];
  assert.ok(
    expectedPanels !== undefined,
    `variation "${variation.key}" has unknown layoutTemplate "${variation.layoutTemplate}"`,
  );
  assert.equal(
    variation.panels.length,
    expectedPanels,
    `variation "${variation.key}" panel count ${variation.panels.length} must equal template "${variation.layoutTemplate}" count ${expectedPanels}`,
  );

  variation.panels.forEach((panel, pIndex) => {
    assert.equal(
      panel.order,
      pIndex + 1,
      `variation "${variation.key}" panel order must be contiguous from 1`,
    );
    assert.ok(
      panel.dialogueLines.length >= 1,
      `variation "${variation.key}" panel ${panel.order} must have dialogue lines`,
    );

    panel.dialogueLines.forEach((line, lIndex) => {
      const where = `variation "${variation.key}" panel ${panel.order} line ${line.order}`;
      assert.equal(
        line.order,
        lIndex + 1,
        `${where}: order must be contiguous from 1`,
      );
      assert.ok(
        characterKeys.has(line.speakerKey),
        `${where}: speakerKey "${line.speakerKey}" does not resolve to a character`,
      );
      assert.ok(line.audioUrl, `${where}: missing audioUrl`);

      const { bubble } = line;
      for (const field of ["xPercent", "yPercent", "widthPercent"]) {
        const value = bubble[field];
        assert.ok(
          typeof value === "number" && value >= 0 && value <= 100,
          `${where}: bubble.${field} must be a number within 0–100 (got ${value})`,
        );
      }
      assert.ok(
        TAIL_DIRECTIONS.includes(bubble.tailDirection),
        `${where}: bubble.tailDirection "${bubble.tailDirection}" is invalid`,
      );
    });
  });
});

const totalVariations = scenario.variations.length;
const totalPanels = scenario.variations.reduce(
  (sum, v) => sum + v.panels.length,
  0,
);
console.log(
  `OK: restaurant scenario is internally consistent (${totalVariations} variations, ${totalPanels} panels).`,
);
