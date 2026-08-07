# User Flows — Manga English Lab

Step-by-step learner flows for the MVP. Every step is **keyboard-accessible**;
where relevant the keyboard behavior is called out. See
[accessibility](../architecture/accessibility.md) and
[playback state](../architecture/playback-state.md) for the underlying rules.

## (a) Browse & Select a Scenario

1. Learner lands on the scenarios list (3 scenarios).
   - _First load:_ a loader appears; if the request is slow (free-tier cold
     start), a short message explains the server is waking up. Announced via an
     `aria-live` region (see [accessibility](../architecture/accessibility.md)).
2. Each scenario shows title and short description.
3. Learner selects a scenario (click, or `Tab` to focus + `Enter`/`Space`).
4. App navigates to the scenario page and loads its variations.
   - _Keyboard:_ list items are focusable; focus moves to the scenario heading
     on navigation.

## (b) Select a Variation

1. Scenario page lists exactly 3 variations in order.
2. Learner picks a variation (`Tab` + `Enter`).
3. App loads the variation's ordered panels and builds the playback queue.
4. First panel renders with its bubbles; playback is idle at the first line.
   - _Keyboard:_ focus lands on the first panel/first bubble.

## (c) Complete Playback

1. Learner presses **Play** (button, or `Space`/`Enter` when focused).
2. The current line's bubble highlights; its audio plays.
3. On audio end, the player advances to the **next line** (reading order).
4. When a panel's lines are done, the player advances to the **next panel**.
5. Playback **stops at the end** of the last line of the last panel.
   - _Keyboard:_ `Space` toggles play/pause while the player has focus.

## (d) Pause, Click a Bubble, Resume From There

1. Learner presses **Pause**; the active line stops, bubble stays highlighted.
2. Learner clicks (or focuses + `Enter`) a different bubble.
3. That bubble becomes the **global playback position** (cursor moves there).
4. The selected line plays once and is highlighted.
5. Pressing **Play** resumes the **complete** conversation from that line
   onward (not from the start).
   - _Keyboard:_ every bubble is a focusable control with an accessible label.

## (e) Reveal / Hide Text Per Character

1. Learner opens the per-character controls panel.
2. For a chosen character, learner toggles **Show/Hide text** (`textVisible`).
3. Only that character's bubbles change; other characters are unaffected.
4. Hidden text is described as **hidden**, never "muted".
   - _Keyboard:_ each toggle is a labeled control reachable via `Tab`.

## (f) Enable / Disable Audio Per Character (Muted Line Waits Real Duration)

1. Learner toggles **Audio on/off** (`audioEnabled`) for a character.
2. During playback, when a line belongs to a character with `audioEnabled=false`:
   - The panel stays visible and the bubble is highlighted.
   - **No sound** plays.
   - The player **waits the real audio-file duration** for that line.
   - Then it advances normally — the line is **never skipped**.
   - _Keyboard:_ the toggle is labeled; state changes are announced.

## (g) Mobile Single-Panel Navigation with Auto-Advance

1. On mobile, one panel is shown at a time.
2. Learner presses Play; lines play in order within the panel.
3. When the panel's lines finish, the app **auto-advances** to the next panel
   and continues playback.
4. Learner can manually go **previous/next** panel between plays.
   - _Keyboard:_ previous/next controls are focusable; swipe is an enhancement,
     not the only path.

## (h) Open the Glossary

1. Learner opens the glossary for the current scenario.
2. Glossary lists key terms and meanings.
3. Learner closes the glossary and returns to the comic at the same position.
   - _Keyboard:_ glossary opens with focus moved into it and returns focus to
     the trigger on close (focus trap while open).

## Notes

- Reading/DOM order always equals playback order regardless of bubble position
  on the illustration.
- The global playback cursor is a single source of truth shared by complete
  playback, individual-line playback, and resume — see
  [playback state](../architecture/playback-state.md).
