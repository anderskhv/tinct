# Voice conversation surface — implementation and verification (2026-09-11)

Branch: `claude/voice-surface-20260911`. Brief: `docs/design/voice-surface-handoff-2026-09-11.md`
(locked 2026-09-11; its `DECISIONS.md` row is binding). Screenshots and the
check log: `docs/verification/voice-surface-2026-09-11/`.

Status: **done.** Phone call surface restyled, desktop panel and pill built,
orb ported to a 2D canvas, tests added, gates green. Nothing deployed and
nothing merged; the coordinator lands the branch.

Gates at the push: `npm test` 156 files / 1898 tests green (baseline on `main` before this
work: 154 files / 1858 tests). `CI=true npm run build` and
`CI=true npm run verify-bundle` pass (CI mode bakes in the public client
values; the sandbox has no `.env`).

Scope kept to rendering: no change to the voice model, `VoiceSessionController`,
the voice state machine, or the reader-owned session invariant. `LabCallView`
(`labCallView` in `labVoiceCall.ts`) still drives everything; only what draws
it changed. The phone bar (`LabVoiceCallBar`) is unchanged in structure and
copy; only its accent colour gave way to ink (see decisions).

## What changed

### The orb — `app/src/lab/VoiceOrb.tsx` (new)

- `fibonacciSphere` (`VoiceOrb.tsx:48`): 420 points on the unit sphere by the
  golden-angle spiral, built once and shared.
- `drawVoiceOrb` (`VoiceOrb.tsx:84`): one frame on a `CanvasRenderingContext2D`.
  Orthographic projection, rotation about a 0.35 rad tilted axis, dot size and
  opacity by depth. Plain `arc` + `fill` only — no gradients, no filters, no
  WebGL. Exported so the tests can drive it with a proxy context.
- State mapping, ported from the canvas's `data-state` renderer:
  - connecting — dots fade in and out in slow patches (alpha modulated by
    position and time) with a faint 3% radial breath;
  - listening — a wave rolls down the sphere: radial displacement
    `1 + 0.07·sin(6y − 3.2t)` by latitude over time;
  - thinking — spin 0.9 rad/s instead of 0.22, tilt oscillates
    `0.55 ± 0.2·sin t`, dots flicker;
  - speaking — radius swells `1 + level·0.14` and dots `1 + level·0.3` with the
    smoothed real level; with no level it rests at base size;
  - muted / disconnected — one still frame at 45% / 28% opacity
    (`voiceOrbOpacity`, `VoiceOrb.tsx:77`).
- Colour: the canvas draws in its own computed CSS `color`, so the theme
  decides: `--lab-call-ink` is `#0b0b0b` on paper and `#f1eadb` (bone) on
  night (`lab.css:5811`, `lab.css:5823`). A `color` prop can override.
- The `requestAnimationFrame` loop is owned by the component and cancelled on
  unmount (`VoiceOrb.tsx:151`). Motion `still` or `prefers-reduced-motion`
  draws one static frame and runs no loop (`VoiceOrb.tsx:195`). In the
  speaking state the loop reads `getAssistantLevel()` each frame; a `null`
  level draws the resting sphere and stops the loop — exactly the existing
  "never a timed fake pulse" rule (`VoiceOrb.tsx:210`). The wrapper still
  carries `--lab-call-level` and `data-level-source`, which the existing
  call-surface tests read.
- jsdom has no 2D context; the component probes once and renders its DOM
  without painting, so the surface tests run unchanged.

### Phone — `app/src/lab/LabVoiceCall.tsx`, `lab.css:5924–6021`

- `LabVoiceCall` (`LabVoiceCall.tsx:84`) now renders: the book line
  ("The Bible, Genesis 1", italic Garamond) and "• Connected" at the top
  (`LabVoiceCall.tsx:114`); the 280px orb and the Playfair status word (34px,
  regular) centred; an optional italic caption (`LabVoiceCall.tsx:136`) —
  what she is saying while speaking, "Ask about this page." while listening,
  nothing otherwise (`labCallCaption`, `labVoiceCall.ts:198`); the
  microphone-off, help and notice lines in italic Garamond; and three round
  icon buttons with one word beneath (`LabVoiceCall.tsx:149–178`).
- Controls are the shared `VoiceControl` in `LabVoiceIcons.tsx` (new): 60px
  hairline discs on the phone, 52px on the desktop, 1.5px stroke icons in
  `currentColor`. Microphone = Mute/Unmute (a slash when muted), three lines =
  Transcript, X = End as a filled ink disc with a paper X. Reconnect (a
  turning arrow) replaces Mute when the connection is lost, as before.
- Every `data-testid` the existing tests rely on is kept: `lab-call`,
  `lab-call-circle` (now the orb wrapper), `lab-call-status`,
  `lab-call-connection`, `lab-call-micoff`, `lab-call-help`, `lab-call-notice`,
  `lab-call-mute`, `lab-call-transcript`, `lab-call-end`, `lab-call-reconnect`,
  plus the bar's `lab-call-bar-*`. New: `lab-call-book`, `lab-call-caption`.
- The connection dot is solid ink while connected and hollow while connecting
  or lost (`lab.css:5916`).

### Desktop — `app/src/lab/LabVoiceDesktop.tsx` (new), `LabApp.tsx`, `lab.css:6023–6246`

- `LabVoiceDesktopPanel` (`LabVoiceDesktop.tsx:88`): the companion panel
  (560px, the existing panel chrome — border, paper fill, blur, shadow, night
  variant — copied onto `.lab-voice-panel` so the voice panel does not inherit
  the chat pane's internals). Top right: the minimize control (diagonal
  arrows, `LabVoiceDesktop.tsx:130`). Then the 170px orb, the status word
  (28px Playfair), "• Connected", a hairline, the transcript
  (`LabVoiceDesktop.tsx:161`; You / Tinct labels in italic Garamond, a caret on
  the reply she is speaking, "Ask about this page." when empty), a hairline,
  then Mute and End. No Transcript button, since the transcript is in view.
  The thread follows the newest line unless the reader has scrolled up.
- `LabVoicePill` (`LabVoiceDesktop.tsx:207`): bottom-right of the page, 84px
  orb, status word (21px Playfair), one truncated italic line of the current
  utterance (`LabVoiceDesktop.tsx:248`), then Mute, Transcript, End (icon-only,
  named by `aria-label`) and the expand control. The orb, Transcript and
  expand all call `onExpand`.
- Wiring in `LabApp.tsx`, next to the existing `callOpen` handling:
  - `voiceCallSurface` is now `chromeV2` on both platforms, `voicePanelSurface`
    is the desktop half (`LabApp.tsx:346–349`). The call model (intent,
    anchor, view, connect timeout, end, reconnect, mute) is shared; only the
    rendering forks: phone full screen (`callFullScreen`, now also gated on
    `showPhoneChrome`), desktop panel/pill (`desktopVoiceOpen`,
    `LabApp.tsx:2121`).
  - `callMinimized` (`LabApp.tsx:501`) is rendering state only. Minimize and
    restore touch nothing else; `handleTalk` and `endCall` reset it.
  - `handleTalk`'s call branch closes the chat pane and captures the paragraph
    under discussion (`LabApp.tsx:3096`); the voice-active effect no longer
    opens the chat pane during a V2 call (`LabApp.tsx:2010`).
  - Panel and pill are rendered in the companion's slot
    (`LabApp.tsx:3794–3818`); `LabAskPane` yields to them there.
    `data-desktop-panel` reports `talk` (panel) or `pill` (`LabApp.tsx:3468`).
  - The passage under discussion: `callParagraph` (`LabApp.tsx:503`) is the
    focus paragraph or the reader's place when Talk opens, follows
    `focusParagraph` while the call runs (`LabApp.tsx:3119`), and is handed to
    `LabPassage` as `discussedParagraph` (`LabApp.tsx:3709`), which adds
    `is-discussed` to that paragraph's lines (`LabPassage.tsx:605`). The tint
    is `rgba(11,11,11,.08)` behind the paragraph on the desktop
    (`lab.css:6241`), bone at 10% on night. It shows in both panel and pill
    states and clears when the call ends.
  - Chat chosen from the super-menu during a desktop call ends the call (place
    given back through `restoreCallAnchor`) and opens the companion as Chat
    (`LabApp.tsx:3163`); the voice-ended effect keeps that Chat pane open
    (`LabApp.tsx:2035`).

### Copy — `app/src/lab/labVoiceCall.ts`

- `LAB_CALL_COPY.transcript` is `'Transcript'` (`labVoiceCall.ts:42`); the
  underlined "See transcript in real time." is retired. `endWord: 'End'` is the
  word under the X; `end: 'End conversation'` stays as the accessible name and
  the phone bar's label. New: `askAboutPage`, `minimize`, `expand`.
- `labCallUtterance` (`labVoiceCall.ts:179`) — the newest assistant line,
  whitespace collapsed, the tail behind an ellipsis when it runs past 120
  characters. `labCallCaption` (`labVoiceCall.ts:198`) — the line under the
  status word by state.

### Removed

The `--lab-call-accent` tokens, the SVG ring and core, the `lab-call-turn` /
`lab-call-breathe` keyframes and every monospace / uppercase rule on the
surface. `grep` finds no remaining reference.

## How each locked item is met

| Locked item | Where |
|---|---|
| Dotted sphere on a plain 2D canvas, ~420 points, orthographic, slow tilted rotation, depth-sized dots | `VoiceOrb.tsx:48–120` |
| No WebGL, blur or gradients | `drawVoiceOrb` uses `arc`/`fill` only; the test "draws with plain 2D calls only" proxies the context and asserts no gradient or filter call |
| Monochrome: ink on paper, bone on night, no accent anywhere incl. buttons | `--lab-call-ink` tokens `lab.css:5811/5823`; controls and dot use it; screenshots `*-dark-*` |
| connecting / listening / thinking / speaking mapped from `LabCallStatus` | `drawVoiceOrb` branches on `status`; test "maps each call status onto the sphere" |
| speaking follows real `getAssistantLevel()`, never a timed pulse | `VoiceOrb.tsx:207–219`; tests "follows the real assistant level" and "rests at base size, loop stopped, when no level exists"; screenshot check "speaking orb follows real audio — source=audio level=0.39" |
| muted still + reduced opacity; disconnected still + faint + Reconnect | `voiceOrbOpacity`; `phone-*-5-muted.png`, `phone-*-6-disconnected.png` |
| reduced motion: one static frame, no loop | `VoiceOrb.tsx:195`; `phone-light-reduced-motion-listening.png` (`data-motion=still`) |
| No monospace, no uppercase anywhere on the surface | Screenshot check walks every element inside `lab-call` / `lab-voice-panel` and counts computed `font-family` containing "mono" and `text-transform: uppercase`: 0 and 0 on both platforms and themes |
| Status word Playfair regular 34px phone / 28px panel; Garamond italic book line, connection, captions | `lab.css:5991` (34px), `lab.css:6091` (28px), `.lab-call-book`, `.lab-call-caption`, `.lab-voice-turn-label` |
| "• Connected" in Garamond beside the book line; same wording table | `LabVoiceCall.tsx:114–119`, `LAB_CALL_COPY.connection*` unchanged, help text unchanged |
| Round icon buttons, one word beneath, 60px / 52px, 1.5px strokes; End filled | `LabVoiceIcons.tsx`, `lab.css:5848–5900` |
| Reconnect replaces Mute when the connection is lost | `LabVoiceCall.tsx:148`, `LabVoiceDesktop.tsx:41` |
| Underlined transcript link retired | `labVoiceCall.ts:42`; test "is the icon button with one word beneath it" |
| Phone: full-screen call, book line + connection top, 280px orb + status centred, caption, three buttons | `phone-light-3-speaking.png` |
| Desktop: 560px companion panel, 170px orb, status, connection, hairline, transcript with You/Tinct, hairline, Mute + End, no Transcript button | `desktop-light-2-panel-speaking.png`; test "offers Mute and End at the bottom, and no Transcript button" |
| Minimize control (diagonal arrows) top right → pill bottom right with 84px orb, 21px status, one truncated line, Mute / Transcript / End / expand; call keeps running | `desktop-light-3-pill-speaking.png`; tests "collapses the panel to the pill with the call still running" |
| Pill orb, Transcript and expand restore the panel | test "restores the panel from the orb, the Transcript button and the expand control" (component and app level); screenshot check "orb and Transcript restore the panel" |
| Passage under discussion tinted in both states | `lab.css:6241`; screenshot checks "passage tinted on the page" / "still tinted while minimized" (1 line each — Genesis 1 paragraph 1 is one `lab-hearing-line`) |
| Reading position sacred: minimize / restore / end never move the place | Screenshot checks compare `data-chapter`, `data-place` and the first visible words before/after each transition: unchanged, light and night. App test "never moves the reader's place". |
| Every existing `data-testid` kept | listed above; the pre-existing tests pass unchanged apart from the two label assertions below |
| Not built: theatre, coloured orbs, Rings, Constellation | nothing of them in the code; `drawVoiceOrb` has no style switch |

## Decisions taken

1. **Two existing test assertions changed to match the brief.**
   `LabVoiceCall.test.tsx` asserted the transcript control read exactly
   "See transcript in real time." and that End read "End conversation";
   `LabApp.voiceCall.test.tsx` asserted the same transcript label. The brief
   retires the link and puts one word beneath each button ("Transcript",
   "End"), so those assertions now expect the words, and the End test also
   checks the accessible name is still "End conversation". Every other
   existing voice test passes untouched.
2. **The phone transcript bar lost its accent.** The brief leaves
   `LabVoiceCallBar` unchanged; its structure, ids and copy are. Its colours
   referenced the retired `--lab-call-accent` tokens, so the dot, "on" state and
   End button now use `--lab-call-ink`, and its connection line is italic
   Garamond instead of uppercase mono. That keeps "no accent, no mono, no
   uppercase" true for the whole phone surface, transcript view included.
3. **The Voice action lab panel is hidden during a V2 call.** The lab's
   diagnostic overlay (`LabVoiceActionPanel`, mono uppercase, fixed at the
   bottom centre, z-index 210) sat across the desktop panel's Mute button and
   intercepted clicks on the pill. It is now `active` only when voice runs
   outside the V2 call surface (`LabApp.tsx:4158`). Its own component tests
   are unaffected; V1 Talk still shows it.
4. **The desktop call surface uses the phone's call model, not the chat pane.**
   `voiceCallSurface` became `chromeV2` on both platforms so the reader's
   intent (`callOpen`), the place anchor and the connect timeout are one code
   path; the phone-only pieces are gated on `showPhoneChrome`. The V1 desktop
   Talk (no flag) is untouched: `LabApp.test.tsx`'s desktop Talk tests pass.
5. **Chat during a desktop call ends the call.** There is no "transcript view"
   on the desktop apart from the panel itself, so picking Chat from the menu
   hands over: the call ends, the place is given back, the companion opens as
   Chat with the same transcript. Audio the call had paused stays paused for
   Chat and resumes when Chat closes, as it does today.
6. **Which paragraph is tinted.** The brief says "the passage under
   discussion"; the model is told the reader's place at session start and can
   jump paragraphs. The tint is the focus paragraph, or the reader's place,
   when Talk opens, and follows `focusParagraph` while the call runs. It is
   desktop only: the phone call covers the page.
7. **Caption length.** The one-line caption and pill line carry the tail of a
   long utterance (last 120 characters behind an ellipsis), since the end of
   the sentence is what she is saying now. The phone caption may wrap to two
   lines (`-webkit-line-clamp: 2`), matching the canvas.
8. **Pill controls are icon-only.** The canvas pill shows discs without words;
   they carry `aria-label` and `title` instead. The panel and the phone keep
   the word beneath.

## Screenshots

All in `docs/verification/voice-surface-2026-09-11/`, taken with Playwright
(Chromium at `/opt/pw-browsers/chromium-1194`) against the local CI build
served by `app/scripts/serve-dist.cjs` (a static server with the Worker's
SPA fallback). The driver is `app/scripts/voice-surface-shots.cjs`: the voice
layer is stubbed as in `voice-call-shots.cjs` (no network, an oscillator for
the assistant's voice), and the four states are driven through Realtime
events on the stubbed data channel. `results.json` holds the 25 checks (all
passed).

Phone 390×844 (light and dark):
`phone-{theme}-0-reader.png` (plain reader, no regression),
`1-connecting`, `2-listening`, `3-speaking`, `4-thinking`, `5-muted`,
`6-disconnected`; `phone-light-reduced-motion-listening.png`.

Desktop 1440×900 (light and dark):
`desktop-{theme}-0-reader.png` (plain reader, no regression),
`1-panel-connecting`, `1b-panel-listening`, `2-panel-speaking`,
`3-pill-speaking`, `4-panel-restored`, `5-panel-thinking`, `6-panel-muted`,
`7-panel-disconnected`, `8-reader-after` (call ended: place unchanged, tint
gone).

Place invariant, from `results.json` (identical on light and dark):
chapter 1, place `0:0`, first words "1 In the beginning God created the
heaven" before the panel opened, with the panel, minimized, restored, and
after End.

## Tests

New: `VoiceOrb.test.tsx` (sphere geometry, 2D-only drawing, swell with level,
state → orb mapping, loop rules, reduced motion, unmount), `LabVoiceDesktop.test.tsx`
(panel and pill rendering, callbacks, Reconnect, reduced motion),
`labVoiceCall.test.ts` (caption and utterance), and a desktop describe in
`LabApp.voiceCall.test.tsx` (panel opens, tint, minimize/restore three ways,
place unchanged, End, connect timeout → Reconnect, Chat handover).

Result: 156 files / 1898 tests green. Build and verify-bundle pass in CI mode.

## Not done / notes for the coordinator

- The screenshot driver injects only the assistant's line into the transcript.
  A user transcript event that reads as a book question is (correctly)
  escalated to the typed companion, which the static server cannot answer; a
  greeting is not surfaced as a turn by the session controller. The You /
  Tinct labelling is covered by `LabVoiceDesktop.test.tsx` instead.
- `app/scripts/voice-call-shots.cjs` (the previous surface's screenshot
  script) still drives the old sequence; it is superseded by
  `voice-surface-shots.cjs` and can be deleted by whoever next touches it.
- Nothing deployed. Production verification on tinct.app is the coordinator's
  step after landing.
