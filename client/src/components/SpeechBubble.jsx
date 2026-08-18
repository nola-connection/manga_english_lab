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
 * @param {object} props
 * @param {{ xPercent: number, yPercent: number, widthPercent: number,
 *   tailDirection: "top-left"|"top-right"|"bottom-left"|"bottom-right" }} props.bubble
 * @param {string} props.text dialogue text shown in the bubble
 * @param {string} [props.speakerKey] character key, exposed for styling/hooks
 */
export default function SpeechBubble({ bubble, text, speakerKey }) {
  const { xPercent, yPercent, widthPercent, tailDirection } = bubble;

  return (
    <div
      className={`speech-bubble speech-bubble--tail-${tailDirection}`}
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        width: `${widthPercent}%`,
      }}
      data-speaker={speakerKey}
    >
      <p className="speech-bubble__text">{text}</p>
    </div>
  );
}
