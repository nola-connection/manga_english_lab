/**
 * Presentational speech bubble (MEL-033). Renders a single dialogue line's text
 * inside an absolutely-positioned box whose `left`/`top`/`width` come from the
 * bubble's percentage coordinates (see
 * `docs/architecture/comic-layout-system.md`): `xPercent`/`yPercent` anchor the
 * box's top-left corner and `widthPercent` is a percentage of panel width.
 *
 * Positioning is purely visual and never affects DOM order — the parent emits
 * bubbles in dialogue order so DOM order equals reading/playback order. This
 * component owns no audio or playback logic; that arrives in later tickets.
 *
 * The optional `isActive` flag marks this bubble as the currently-active line so
 * the template can highlight it (MEL-040). It only toggles presentation
 * (a class, `aria-current`, and a data hook); the playback cursor that drives it
 * and the announcement of the active line arrive with playback wiring.
 *
 * @param {object} props
 * @param {{ xPercent: number, yPercent: number, widthPercent: number,
 *   tailDirection: "top-left"|"top-right"|"bottom-left"|"bottom-right" }} props.bubble
 * @param {string} props.text dialogue text shown in the bubble
 * @param {string} [props.speakerKey] character key, exposed for styling/hooks
 * @param {boolean} [props.isActive=false] whether this is the active line
 */
export default function SpeechBubble({
  bubble,
  text,
  speakerKey,
  isActive = false,
}) {
  const { xPercent, yPercent, widthPercent, tailDirection } = bubble;

  const className = [
    "speech-bubble",
    `speech-bubble--tail-${tailDirection}`,
    isActive && "speech-bubble--active",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        width: `${widthPercent}%`,
      }}
      data-speaker={speakerKey}
      data-active={isActive || undefined}
      aria-current={isActive ? "true" : undefined}
    >
      <p className="speech-bubble__text">{text}</p>
    </div>
  );
}
