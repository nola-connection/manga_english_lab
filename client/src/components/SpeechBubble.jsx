/**
 * Speech bubble (MEL-041, building on MEL-033/MEL-040). Renders a single
 * dialogue line's text inside an absolutely-positioned box whose
 * `left`/`top`/`width` come from the bubble's percentage coordinates (see
 * `docs/architecture/comic-layout-system.md` and ADR-0011): `xPercent`/`yPercent`
 * anchor the box's top-left corner and `widthPercent` is a percentage of panel
 * width. Height is content-driven and text wraps within the fixed width — the
 * bubble never widens to fit long text (the styles own the wrapping).
 *
 * The bubble is a semantic, focusable `<button>` so it is keyboard-reachable and
 * ready for later interaction (playing its line). No audio or playback logic
 * lives here; that arrives in later tickets.
 *
 * Positioning is purely visual and never affects DOM order — the parent emits
 * bubbles in dialogue order so DOM order equals reading/playback order.
 *
 * A `tailDirection` renders a tail pointing toward the corner nearest the
 * speaker; it is decorative (`aria-hidden`) and the template maps the diagonal
 * hint to a tail style.
 *
 * The optional `isActive` flag marks this bubble as the currently-active line so
 * the template can highlight it (MEL-040). It only toggles presentation
 * (a class, `aria-current`, and a data hook); the playback cursor that drives it
 * arrives with playback wiring.
 *
 * The optional `isHidden` flag hides the dialogue text for Listen/Practice modes
 * while preserving the bubble's shape and position (no layout shift): the text
 * is visually hidden and `aria-hidden` so screen readers don't read content the
 * learner is meant to recall, and the button keeps an accessible name via
 * `aria-label`. Hidden text is a text-visibility state and never implies "muted"
 * (audio is a separate concern).
 *
 * @param {object} props
 * @param {{ xPercent: number, yPercent: number, widthPercent: number,
 *   tailDirection: "top-left"|"top-right"|"bottom-left"|"bottom-right" }} props.bubble
 * @param {string} props.text dialogue text shown in the bubble
 * @param {string} [props.speakerKey] character key, exposed for styling/hooks
 * @param {boolean} [props.isActive=false] whether this is the active line
 * @param {boolean} [props.isHidden=false] whether the text is hidden (not muted)
 */
export default function SpeechBubble({
  bubble,
  text,
  speakerKey,
  isActive = false,
  isHidden = false,
}) {
  const { xPercent, yPercent, widthPercent, tailDirection } = bubble;

  const className = [
    "speech-bubble",
    `speech-bubble--tail-${tailDirection}`,
    isActive && "speech-bubble--active",
    isHidden && "speech-bubble--text-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  // When the text is hidden it is `aria-hidden`, so the button needs an
  // accessible name that does not leak the content and never says "muted".
  const hiddenLabel = speakerKey
    ? `Hidden dialogue text for ${speakerKey}`
    : "Hidden dialogue text";

  return (
    <button
      type="button"
      className={className}
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        width: `${widthPercent}%`,
      }}
      data-speaker={speakerKey}
      data-active={isActive || undefined}
      data-text-hidden={isHidden || undefined}
      aria-current={isActive ? "true" : undefined}
      aria-label={isHidden ? hiddenLabel : undefined}
    >
      <span
        className="speech-bubble__text"
        aria-hidden={isHidden ? "true" : undefined}
      >
        {text}
      </span>
      <span
        className="speech-bubble__tail"
        data-tail-direction={tailDirection}
        aria-hidden="true"
      />
    </button>
  );
}
