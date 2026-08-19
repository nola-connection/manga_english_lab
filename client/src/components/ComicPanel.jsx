import SpeechBubble from "./SpeechBubble.jsx";

/**
 * Reusable comic-panel template (MEL-040, building on MEL-033). Renders **any**
 * panel from data — the finished illustration plus its speech bubbles — with no
 * playback logic. A page is data composed by this template, never a bespoke
 * hand-laid component (see ADR-0010 and `comic-layout-system.md`).
 *
 * Layout follows `docs/architecture/comic-layout-system.md`:
 * - The panel is an **aspect-ratio box** sized before the image loads, so the
 *   image and bubbles position against a stable box and the page does not
 *   reflow (no layout shift) once the image arrives.
 * - Speech bubbles are absolutely positioned from percentage coordinates;
 *   that positioning is purely visual.
 * - Bubbles are emitted in dialogue `order` so **DOM order equals reading and
 *   playback order**, independent of where each bubble sits visually. Multiple
 *   lines per panel are supported.
 * - `activeLineOrder` marks the one bubble whose line matches the playback
 *   cursor as active for highlighting; the cursor that supplies it is wired in a
 *   later ticket. When it is unset (or matches no line), no bubble is active.
 *
 * @param {object} props
 * @param {{ order: number, imageUrl: string, alt: string,
 *   dialogueLines: Array<{ order: number, speakerKey: string, text: string,
 *     bubble: object }> }} props.panel
 * @param {number|null} [props.activeLineOrder=null] `order` of the active line
 * @param {number} [props.aspectWidth=4] width part of the reserved aspect ratio
 * @param {number} [props.aspectHeight=3] height part of the reserved aspect ratio
 */
export default function ComicPanel({
  panel,
  activeLineOrder = null,
  aspectWidth = 4,
  aspectHeight = 3,
}) {
  // Sort a shallow copy by `order` so DOM order == reading/playback order even
  // if the source array is out of order; never mutate the incoming data.
  const lines = [...panel.dialogueLines].sort((a, b) => a.order - b.order);

  // When a line is active, mark the panel so inactive bubbles can be dimmed.
  const hasActiveLine = lines.some((line) => line.order === activeLineOrder);
  const className = hasActiveLine
    ? "comic-panel comic-panel--has-active"
    : "comic-panel";

  return (
    <div
      className={className}
      style={{ aspectRatio: `${aspectWidth} / ${aspectHeight}` }}
    >
      <img
        className="comic-panel__image"
        src={panel.imageUrl}
        alt={panel.alt}
      />
      {lines.map((line) => (
        <SpeechBubble
          key={line.order}
          bubble={line.bubble}
          text={line.text}
          speakerKey={line.speakerKey}
          isActive={line.order === activeLineOrder}
        />
      ))}
    </div>
  );
}
