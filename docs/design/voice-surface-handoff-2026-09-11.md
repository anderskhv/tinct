# Voice conversation surface — locked design brief

Status: locked 2026-09-11, not yet implemented.
Decision date: 2026-09-11.
Canvas: https://claude.ai/code/artifact/ac90dc42-aa66-43ec-8827-a11ea722fe92
Source: Anders's voice-mode design session ("our conversation mode is not
beautiful enough"), ending with "yes, boom … lock this concept".

## Outcome and scope

Replace the look of the v2 phone call surface (`LabVoiceCall.tsx`, the
`.lab-call*` rules in `lab.css`) and give desktop a voice surface of its own.
No change to the voice model, the session controller, the state machine, or
the reader-owned session invariant in `docs/voice-v1-architecture.md`. The
`LabCallView` (status, motion, connection, broken, micOff) keeps driving
everything; only its rendering changes.

## Locked experience

### The orb (both platforms)

- A **dotted sphere drawn on a plain 2D canvas**: ~420 points on a Fibonacci
  sphere, orthographic projection, slow rotation about a tilted axis. Dot size
  and opacity follow depth. No WebGL, no blur filters, no gradients.
- **Monochrome.** Ink `#0b0b0b` on paper; bone `#f1eadb` on the night theme.
  No accent colour anywhere on the surface, including the buttons.
- Four states, mapped from `LabCallStatus`:
  - **connecting** — dots fade in and out in slow patches while the line opens.
  - **listening** — a wave rolls down the sphere (radial displacement by
    latitude over time). No ring.
  - **thinking** — faster spin, tilt oscillates, dots flicker.
  - **speaking** — the sphere swells with the assistant's **real loudness**
    from `getAssistantLevel()`, exactly as `--lab-call-level` does today. With
    no level it rests at base size; never a timed fake pulse.
  - **muted / disconnected** — keep the existing semantics: muted shows the
    sphere still with reduced opacity; disconnected shows it still and faint
    with the Reconnect control. (The broken-ring idea is retired.)
- `prefers-reduced-motion`: draw one static frame, no animation loop.
- Reference: the thinking-orbs library's dotted monochrome orbs. Do not add
  the dependency; the renderer is ~80 lines and lives in the repo.

### Type and controls (both platforms)

- **No monospace and no uppercase anywhere on the surface.** The mono
  connection line, the uppercase pill buttons and the uppercase mic-off line
  are all gone.
- Status word: Playfair Display, regular weight, 34px on phone, 28px in the
  desktop panel. Book line and helper text: EB Garamond italic.
- Connection: "• Connected" in Garamond, small, next to the book line at the
  top. Same wording table as `LAB_CALL_COPY`; the connection-lost help text
  keeps its wording.
- Controls are **round icon buttons with a single word beneath** (Garamond,
  15px, muted): 60px on phone, 52px on desktop. Stroke icons, 1.5px:
  microphone = Mute/Unmute, three lines = Transcript, X = End.
  End is a filled ink circle with a paper X; the others are hairline outlines.
  Reconnect replaces Mute when the connection is lost, as today.
- "See transcript in real time." as an underlined link is retired; Transcript
  is the icon button.

### Phone

Full-screen call surface as today: book line and connection at the top, orb
(280px) and status word centred, an optional one-line italic caption of what
she is saying or "Ask about this page." beneath, three buttons at the bottom.

### Desktop (new)

- Default: the voice conversation lives in the **companion panel** (560px,
  existing panel chrome). Orb (170px) at the top with the status word and
  connection beneath, a hairline, then the transcript streaming in the panel
  body (You / Tinct labels in italic Garamond), a hairline, then Mute and End.
  No Transcript button here because the transcript is in view.
- A small **minimize** control (diagonal arrows icon) at the top right of the
  panel collapses it to a **pill** in the bottom-right corner of the page:
  orb (84px), status word (21px Playfair), one truncated italic line of the
  current utterance, then Mute, Transcript, End and an expand control.
  The call keeps running while minimized.
- Clicking the pill's orb, its Transcript button or its expand control
  restores the panel.
- The passage under discussion is tinted on the page in both states
  (`rgba(11,11,11,.08)` band behind the paragraph).

## Not included

The full-window desktop "theatre" variant, the coloured ink-diffusion and
lantern orbs, and the Rings and Constellation orb styles were explored and
rejected. They stay on the canvas for the record only.

## Implementation notes

- Port the canvas renderer from the canvas artboards (`data-state`,
  `data-style="globe"`, `data-color`) into a `VoiceOrb` component that takes
  `status`, `level` and `color`; keep the `requestAnimationFrame` loop owned
  by the component and cancelled on unmount.
- Keep every `data-testid` that the existing call-surface tests rely on
  (`lab-call`, `lab-call-circle`, `lab-call-status`, `lab-call-mute`,
  `lab-call-transcript`, `lab-call-end`, `lab-call-reconnect`).
- Desktop needs the panel/pill state in `LabApp.tsx` next to the existing
  `callOpen` / `phoneAskOpen` handling; the phone bar (`LabVoiceCallBar`)
  is unchanged.
- Verify on phone 390×844 and desktop 1440×900, light and night, before deploy.
