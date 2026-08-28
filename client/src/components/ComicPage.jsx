import { forwardRef } from "react";

import ComicPanel from "./ComicPanel.jsx";

/**
 * Desktop comic-page template (MEL-042, building on MEL-040/MEL-041). Composes a
 * variation's panels into a comic-page **grid**, rendering each panel through the
 * reusable `ComicPanel` template — a page is data composed by a template, never a
 * bespoke hand-laid component (see ADR-0010 and
 * `docs/architecture/comic-layout-system.md`).
 *
 * Layout follows `comic-layout-system.md`:
 * - The `variation.layoutTemplate` (a named template from the closed catalog —
 *   `single`, `two-up`, `grid-2x2`, `grid-2x3`) determines the **column count**;
 *   the row count is implicit from the panel count. Columns are template
 *   constants, not per-panel data.
 * - Columns use `minmax(0, 1fr)` tracks (set inline) so they share the row width
 *   and the page **never overflows horizontally** at desktop widths, even when a
 *   panel's content is wide.
 * - Panels are emitted in `order` so **DOM order equals reading and playback
 *   order**; the grid fills cells in DOM order (row-major) with no reordering, so
 *   visual order matches too.
 *
 * Active-line highlighting is driven by the playback cursor (MEL-052): the
 * cursor's `panelIndex`/line `order` are threaded in as `activePanelIndex` and
 * `activeLineOrder`, and only the active panel receives the active line so
 * exactly one bubble is highlighted across the whole page
 * (docs/architecture/playback-state.md). The `ref` exposes the page element so a
 * parent can scroll/focus the active panel as the cursor crosses panels.
 *
 * This template owns no playback logic beyond deriving highlight from props and
 * no mobile single-panel view (MEL-100); those arrive in later tickets.
 *
 * @param {object} props
 * @param {{ layoutTemplate: "single"|"two-up"|"grid-2x2"|"grid-2x3",
 *   panels: Array<{ order: number, imageUrl: string, alt: string,
 *     dialogueLines: Array<object> }> }} props.variation the variation to render
 * @param {number|null} [props.activePanelIndex=null] index (in playback order)
 *   of the panel holding the active line, or null when nothing is active.
 * @param {number|null} [props.activeLineOrder=null] `order` of the active line
 *   within its panel.
 */
const ComicPage = forwardRef(function ComicPage(
  { variation, activePanelIndex = null, activeLineOrder = null },
  ref,
) {
  const { layoutTemplate, panels } = variation;
  const columns = COLUMNS_PER_TEMPLATE[layoutTemplate] ?? 1;

  // Sort a shallow copy by `order` so DOM order == reading/playback order even
  // if the source array is out of order; never mutate the incoming data.
  const orderedPanels = [...panels].sort((a, b) => a.order - b.order);

  return (
    <div
      ref={ref}
      className={`comic-page comic-page--${layoutTemplate}`}
      data-layout-template={layoutTemplate}
      data-columns={columns}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {orderedPanels.map((panel, panelIndex) => (
        <ComicPanel
          key={panel.order}
          panel={panel}
          panelIndex={panelIndex}
          activeLineOrder={
            panelIndex === activePanelIndex ? activeLineOrder : null
          }
        />
      ))}
    </div>
  );
});

export default ComicPage;

/**
 * Column count per named layout template (see `comic-layout-system.md`). Row
 * count is implicit from the panel count. Unknown templates fall back to a single
 * column; the panel-count agreement itself is enforced upstream by the seed
 * validator (see `scripts/validate-restaurant-data.mjs` and `data-model.md`).
 */
const COLUMNS_PER_TEMPLATE = {
  single: 1,
  "two-up": 2,
  "grid-2x2": 2,
  "grid-2x3": 2,
};
