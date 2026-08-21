/**
 * Panel image-prompt generator CLI (MEL-150).
 *
 * Prints a paste-ready ChatGPT image-generation prompt for a panel, addressed by
 * the same stable handles the app uses: scenario `slug` + variation `key` +
 * panel `order`. Prompts are derived from `client/src/api/staticData.js` (4:3,
 * background-only/no-text, bubble keep-out zones, characters, ambience, dialogue
 * order); see scripts/lib/image-prompt.mjs for the builder.
 *
 * Usage:
 *   npm run prompt:image -- <slug> <variationKey> <panelOrder>  # one panel
 *   npm run prompt:image -- <slug> <variationKey>               # a variation
 *   npm run prompt:image -- <slug>                              # a scenario
 *   npm run prompt:image                                        # list scenarios
 *
 * Exits non-zero with usage text on an unknown slug/key/order.
 */
import { scenariosBySlug } from "../client/src/api/staticData.js";

import {
  buildPanelPrompt,
  buildVariationPrompts,
  resolvePanel,
} from "./lib/image-prompt.mjs";

const USAGE = [
  "Usage:",
  "  npm run prompt:image -- <slug> <variationKey> <panelOrder>  # one panel",
  "  npm run prompt:image -- <slug> <variationKey>               # a variation",
  "  npm run prompt:image -- <slug>                              # a scenario",
  "  npm run prompt:image                                        # list scenarios",
].join("\n");

// Separator between multiple prompts so each is easy to copy individually.
function header(scenario, variation, panel) {
  return `===== ${scenario.slug} / ${variation.key} / panel ${panel.order} =====`;
}

function listScenarios() {
  const slugs = Object.keys(scenariosBySlug);
  console.log("Available scenarios:\n");
  for (const slug of slugs) {
    const scenario = scenariosBySlug[slug];
    console.log(`  ${slug}`);
    for (const variation of scenario.variations) {
      const orders = variation.panels.map((p) => p.order).join(", ");
      console.log(
        `    - variation "${variation.key}" (${variation.layoutTemplate}) ` +
          `panels: ${orders}`,
      );
    }
  }
  console.log(`\n${USAGE}`);
}

function printVariation(scenario, variation) {
  const prompts = buildVariationPrompts(scenario, variation);
  prompts.forEach(({ panel, prompt }, index) => {
    if (index > 0) console.log("");
    console.log(header(scenario, variation, panel));
    console.log(prompt);
  });
}

function main(argv) {
  const [slug, variationKey, panelOrder] = argv;

  // No slug: list everything so the author can discover valid references.
  if (!slug) {
    listScenarios();
    return;
  }

  const scenario = scenariosBySlug[slug];
  if (!scenario) {
    const known = Object.keys(scenariosBySlug).join(", ") || "(none)";
    console.error(`Unknown scenario slug "${slug}". Known slugs: ${known}.\n`);
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  // Slug only: one prompt per panel across every variation.
  if (!variationKey) {
    scenario.variations.forEach((variation, vIndex) => {
      if (vIndex > 0) console.log("");
      printVariation(scenario, variation);
    });
    return;
  }

  // Slug + variation key: one prompt per panel in that variation.
  if (!panelOrder) {
    const variation = scenario.variations.find((v) => v.key === variationKey);
    if (!variation) {
      const knownKeys = scenario.variations.map((v) => v.key).join(", ");
      console.error(
        `Unknown variation "${variationKey}" in "${slug}". ` +
          `Known keys: ${knownKeys}.\n`,
      );
      console.error(USAGE);
      process.exitCode = 1;
      return;
    }
    printVariation(scenario, variation);
    return;
  }

  // Slug + variation key + panel order: a single prompt.
  try {
    const resolved = resolvePanel(
      scenariosBySlug,
      slug,
      variationKey,
      panelOrder,
    );
    console.log(
      buildPanelPrompt(resolved.scenario, resolved.variation, resolved.panel),
    );
  } catch (error) {
    console.error(`${error.message}\n`);
    console.error(USAGE);
    process.exitCode = 1;
  }
}

main(process.argv.slice(2));
