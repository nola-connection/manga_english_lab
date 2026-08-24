---
name: generate-panel-image-prompt
description: >-
  Produce a paste-ready ChatGPT image-generation prompt for a single comic panel
  from its scenario data. Use this when the user wants to create a background
  image for a panel and provides a panel reference (scenario slug + variation key
  + panel order) and a style-reference image. Emits a 4:3, background-only
  (no text/bubbles) prompt with per-bubble keep-out zones, resolved characters,
  ambience, and dialogue order by running scripts/generate-image-prompt.mjs.
---

# Generate a Panel Image Prompt

Turn one panel's data into a **paste-ready ChatGPT image prompt** for a
background illustration that fits the panel's 4:3 box and leaves the speech-bubble
regions clear (bubbles are drawn later as a DOM/CSS overlay).

## Inputs

- **Panel reference** (required): the stable handles the app uses —
  - scenario **`slug`** (e.g. `ordering-at-a-restaurant`),
  - variation **`key`** (e.g. `full-order`),
  - panel **`order`** (e.g. `3`).
  A slug alone is not enough: prompts are per-panel, two levels below the
  scenario. If only a slug (or slug + variation key) is given, the tool emits a
  prompt for every panel in scope.
- **Style-reference image** (required for a good result): an example image in the
  target art style. The prompt tells the model to match it; the user attaches it
  in ChatGPT alongside the pasted prompt.

If the panel reference is missing or ambiguous, ask the user for it, or run the
tool with no arguments to list the available scenarios/variations/panels.

## Rules

1. **Do not invent panel data.** The prompt is derived from
   `client/src/api/staticData.js` via the generator script — never hand-fabricate
   coordinates, characters, or scene text.
2. **Background only.** The emitted prompt must forbid speech bubbles, text,
   lettering, captions, sfx, and logos, because bubbles are overlaid at runtime.
3. **4:3 landscape.** The panel box is a 4:3 aspect-ratio box; the prompt states
   this so the image fits without important detail being cropped.
4. **Keep-out zones in playback order.** Each dialogue line contributes a bubble
   keep-out zone (top-left corner x/y %, width %, and the speaker side implied by
   `tailDirection`), listed in dialogue `order`.
5. **Do not modify data or images.** This skill only reads data and prints a
   prompt. It never edits `staticData.js`, generates images, or writes files.

## Procedure

### 1. Confirm the panel reference

Ask for the scenario slug, variation key, and panel order if not provided. To
discover valid values, list them:

```sh
npm run prompt:image
```

### 2. Generate the prompt

Run the generator for the requested scope (root of the repo):

```sh
# One panel:
npm run prompt:image -- <slug> <variationKey> <panelOrder>

# All panels in a variation:
npm run prompt:image -- <slug> <variationKey>

# All panels in a scenario:
npm run prompt:image -- <slug>
```

Example:

```sh
npm run prompt:image -- ordering-at-a-restaurant full-order 3
```

If the tool exits non-zero, it prints the unknown handle and usage text — fix the
reference (or list options with `npm run prompt:image`) and retry.

### 3. Return the prompt to the user

Give the user the printed prompt verbatim (in a copyable block) and remind them
to **attach their style-reference image** in ChatGPT alongside it. When multiple
prompts are emitted, each is preceded by a
`===== <slug> / <variationKey> / panel <n> =====` header so they can copy one at
a time.

## Output

A paste-ready prompt containing:

- **Format:** 4:3 landscape, background/scene only, explicit no-text/no-bubbles.
- **Scene/ambience:** from the panel's `alt` text.
- **Characters:** resolved from each line's `speakerKey` to display name + role.
- **Bubble keep-out zones:** per line, in playback order, with x/y (from the
  top-left corner), width, and the speaker side implied by `tailDirection`.
- **Style:** an instruction to match the attached style-reference image.

## Guardrails

- Never fabricate or alter panel coordinates, characters, or scene text — always
  source them from the generator.
- Never omit the background-only / no-text rule.
- Do not generate images, call an image API, or write the prompt/image to any
  file — only print the prompt for the user to paste.
