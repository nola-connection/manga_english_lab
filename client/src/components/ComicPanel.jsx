import SpeechBubble from "./SpeechBubble.jsx";

/**
 * Renders one comic panel from data (MEL-033): the finished illustration plus
 * its speech bubbles, with no playback logic.
 *
 * Layout follows `docs/architecture/comic-layout-system.md`:
 * - The panel is an **aspect-ratio box** sized before the image loads, so the
 *   image and bubbles position against a stable box and the page does not
 *   reflow (no layout shift) once the image arrives.
 * - Speech bubbles are absolutely positioned from percentage coordinates;
 *   that positioning is purely visual.
 * - Bubbles are emitted in dialogue `order` so **DOM order equals reading and
 *   playback order**, independent of where each bubble sits visually.
 *
 * @param {object} props
 * @param {{ order: number, imageUrl: string, alt: string,
 *   dialogueLines: Array<{ order: number, speakerKey: string, text: string,
 *     bubble: object }> }} props.panel
 * @param {number} [props.aspectWidth=4] width part of the reserved aspect ratio
 * @param {number} [props.aspectHeight=3] height part of the reserved aspect ratio
 */
export default function ComicPanel({
  panel,
  aspectWidth = 4,
  aspectHeight = 3,
}) {
  // Sort a shallow copy by `order` so DOM order == reading/playback order even
  // if the source array is out of order; never mutate the incoming data.
  const lines = [...panel.dialogueLines].sort((a, b) => a.order - b.order);

  return (
    <div
      className="comic-panel"
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
        />
      ))}
    </div>
  );
}
