# Talk on Grok native speech-to-speech — 2026-09-18

Audience: Anders and any agent touching voice.

## What changed

Talk (every conversational voice entry point: the Chrome V2 phone call, the
desktop companion panel, the classic reader's AudioStrip, and the library
assistant) now runs on xAI's native speech-to-speech model. The model hears the
reader's audio and speaks its own answer. The previous chain — GPT Live over
WebRTC delegating to a separate "Sol" backend model, plus the older Realtime
transcription trial paths — is gone from the active path.

- Model: `grok-voice-latest` (xAI alias for `grok-voice-think-fast-2.0`).
  The synced Female/Male preference resolves to exact xAI voices `ursa` and
  `helios`; provider IDs remain absent from the UI. Server VAD and PCM16 at
  24 kHz remain the transport defaults.
- Transport: one browser WebSocket to `wss://api.x.ai/v1/realtime`,
  authenticated with a single-use ephemeral client secret. The Worker mints the
  secret at `/api/voice-session` (signed-in, entitlement-checked, one message
  charged) or `/api/lab-voice-session` (guest, IP rate limited). The xAI key
  never reaches the browser; the Worker accepts no provider parameters.
- Audio: microphone PCM16 via an AudioWorklet (ScriptProcessor fallback),
  provider audio deltas scheduled straight into the AudioContext. Playback level
  drives the orb.
- Prompt: `GROK_VOICE_INSTRUCTIONS` in `app/src/voice/grokConfig.ts`, the
  approved minimal prompt plus two lines added for demonstrated issues
  (46-second first answer; "I'll check…" narration before a search). Reference
  material (book, edition, chapter, page, paragraph, excerpt, reading angle,
  the last four turns including an Explain quote and its explanation) is
  appended as JSON under a "data, not instructions" header. Reader movement
  refreshes it with `session.update`; xAI keeps the conversation
  (`keep_context: true` was observed).
- Tools: the existing function tools (resume with `play_audio`, end, hold,
  passage retrieval, `search_reading_sources`, personal history, reading
  history, views, theme, font, speed, undo, chapter/paragraph navigation) plus
  xAI native `web_search`. Tool results carry `responseInstructions` as
  per-response instructions. A resume issued with a goodbye runs first.
- Interruption: on `input_audio_buffer.speech_started` local playback stops,
  an in-flight response is cancelled, and late audio for it is dropped. The
  provider streams answers roughly four times faster than real time, so most
  interruptions are local; the answer is recorded as interrupted.
- Removed: `/lab/voice` experiment lab, `?voiceTrial=` model selection,
  `LiveVoiceSessionController`, `VoiceSessionController`, the accumulated Live
  and Realtime prompts. `OPENAI_API_KEY` stays for typed-chat and voice source
  research only. CSP `connect-src` now allows `wss://api.x.ai` and no longer
  lists `api.openai.com`.

Files: `app/src/voice/GrokVoiceSessionController.ts`, `grokConfig.ts`,
`session.ts`, `app/src/hooks/useVoiceSession.ts`,
`app/src/worker/routes/voice.ts`, `app/src/lab/labDirectVoice.ts`,
`app/scripts/grok-voice-smoke.mjs`.

## Secrets

- Worker: `XAI_API_KEY` uploaded with `npx wrangler versions secret put` (plain
  `secret put` was refused because an undeployed version existed). The deploy
  carries it.
- GitHub Actions: `XAI_API_KEY` is not needed by the deploy workflow; runtime
  secrets live on the Worker.

## Verification

- `npm test`: 191 files, 2376 tests passing after the change.
- `CI=true npm run build` and `npm run verify-bundle`: pass.
- Protocol probes from Node against the real API (`grok-voice-latest`):
  server VAD, transcripts, cancel (`status: cancelled`), mid-session
  `session.update` keeping memory, function calls, native web search.
- Real-provider browser smoke (`node scripts/grok-voice-smoke.mjs`): headless
  Chromium, fake microphone playing a synthesized spoken question (made with
  the provider's own `force_message`), audio muted, no real microphone or
  playback. Against the local Worker (`wrangler dev` + `.dev.vars`):
  - connected in 3.5 s; two user transcripts; a 94-word spoken answer;
  - interruption observed when the looped question started over the answer
    (answer recorded as interrupted, playback stopped);
  - End closed the call and every microphone track read `ended`;
  - a spoken "take me back to the audiobook" called `resume_audiobook`
    (with `play_audio: true`) and closed the call.
- Latency, measured in the page from the provider's `speech_stopped` to the
  first `response.output_audio.delta` (audio, not transcript): 362 ms and 373 ms
  locally; Node probes 248–365 ms. User transcript arrives ~35 ms after
  speech end. Filler is not counted: the assertion requires a ≥12-word answer
  that does not open with "hmm/okay/sure/let me".

## Production release

- Deploy workflow run 185 (`https://github.com/anderskhv/tinct/actions/runs/35356830019`)
  on commit `6aeb71ce` succeeded: tests, `npm run deploy`, bundle-served
  check, `scripts/smoke-test.sh`, library/entry/hyphenation browser checks.
- Served bundle `/assets/index-DklYJ_Hz.js`; live Worker version
  `410b729f-3c19-4250-995b-5a7fe1d967ce` (100%).
- `POST https://tinct.app/api/lab-voice-session` returns a Grok client secret
  with `model: grok-voice-latest`; the CSP on `/lab/phone` allows
  `wss://api.x.ai`.
- Real-provider browser smoke against `https://tinct.app` (headless, fake
  microphone, muted):
  - connected in 4.95 s; two user transcripts; an 84-word spoken answer;
    interruption observed; End closed the call; microphone tracks `ended`;
  - speech end → first audio delta: 398 ms and 355 ms (page-measured
    `__tinctVoiceDebug`: 398, 356); speech end → user transcript ≈31 ms;
  - spoken "take me back to the audiobook": `resume_audiobook` ran before the
    accompanying `end_voice_session`, the call closed and the audiobook
    reported playing (`data-playing="true"`).

## First-turn and lookup follow-up — 21 September 2026

Status: shipped and accepted on production, 21 September 2026 at 18:45 UTC.

The first sentence could begin while Tinct was still minting the ephemeral
secret and connecting the WebSocket. Capture previously started only after
`session.updated`, so that early audio was absent rather than merely delayed.
After microphone permission succeeds, Tinct now starts its existing local
capture graph immediately and retains at most 15 seconds of 24 kHz frames. It
does not send or discard them until the configured session is acknowledged.
The permission-before-token billing invariant remains: a pending or refused
microphone never mints a provider session.

Application lookups that are still unresolved after 1.5 seconds use xAI's
documented `force_message` event to speak exactly **One moment.** in the selected
Grok voice. Fast lookups say nothing; the line is emitted once; and final output
waits for the acknowledgement lifecycle so speech cannot overlap. Native
provider web search receives the corresponding prompt rule. Tests cover fast
and delayed paths, exact copy, output order, retained early frames and cleanup.

Official xAI documentation current on 21 September lists `force_message` as a
supported realtime extension and recommends capturing/buffering microphone
audio while the WebSocket initializes. CI performs a bounded live-provider
acceptance for exact `ursa`/`helios`, plus force-message transcript, audio bytes
and `response.done`, with a fake microphone and muted output.

This does not certify perceived timing, AirPods behavior or background capture
on a physical iPhone. Those remain part of the agreed device window, including
first and later turns, a delayed lookup, lock while listening/speaking, and
unlock recovery.

PR #135 merged as `d56ae18ae0ce3132acf16ac7d56c52a9604c6a31` after
[verify run 35637055401](https://github.com/anderskhv/tinct/actions/runs/35637055401)
passed the full suite and the bounded live-provider acceptance. That acceptance
received provider audio bytes, the expected **One moment.** transcript and
`response.done` for the exact `force_message`; the exact `ursa` and `helios`
session updates were accepted without substitution. Serialized production
[deploy run 35638636285](https://github.com/anderskhv/tinct/actions/runs/35638636285)
and post-merge
[verify run 35638636481](https://github.com/anderskhv/tinct/actions/runs/35638636481)
completed successfully. The served bundle is `index-CdxhFG7Y.js`, and the
production deploy's muted Grok microphone-recovery check passed against that
bundle.

The provider test establishes protocol support and ordered audio output, not
subjective voice quality, first-response perception or iOS background
microphone continuity. Those remain physical-device acceptance items; no
browser-only result is recorded as an audible or lock-screen verification.

### Standalone acceptance closeout

Post-deploy voice-lab run 35640493699 exposed an operational test failure, not
a product failure: its preserved 17 September script still waited for the
removed **Voice test room** heading and never contacted xAI. PR #137 replaced
that stale route/selector with the current reader/Talk handshake, retained a
deterministic muted microphone, added serialized workflow concurrency and
stored current voice-capture artifacts. It merged as
`dfc3be72f5607eac2c32713c32ee6f7602059416` after verify run 35641165614
passed.

Serialized deploy run 35642731138 and post-merge verify run 35642731146 both
completed successfully. The final served bundle is `index-y_UmWX9a.js`.
Automatically triggered voice-lab
[run 35644446005](https://github.com/anderskhv/tinct/actions/runs/35644446005)
then passed: female requested and received exact `ursa`; male requested and
received exact `helios`; the female `force_message` produced 53,295 audio bytes,
transcript **One moment.**, and `response.done`, with no page errors. The
[576-byte evidence artifact](https://github.com/anderskhv/tinct/actions/runs/35644446005/artifacts/10659776205)
contains both handshake records. This supersedes the stale-selector failures;
the physical-device limits above are unchanged.

## Sandbox notes (not production)

The cloud sandbox's egress proxy negotiates HTTP/2 with Chromium and cannot
relay a WebSocket upgrade (xAI answers 400 "Upgrade header did not include
websocket"); curl over HTTP/1.1 through the same proxy succeeds. The smoke
script therefore takes `TINCT_PROXY_BYPASS=api.x.ai` (adds the host to the
browser's `no_proxy`), `TINCT_CHROMIUM_SPKI` (pins the proxy CA keys) and
`TINCT_CHROMIUM=/opt/pw-browsers/chromium`. Production browsers do not use this
proxy.

## Rollback

`git revert` the Grok commit on `main` and let the deploy workflow ship it.
The OpenAI Worker secret and the research route are untouched, so the previous
Live path works again immediately. No user-facing comparison controls exist.

## Not verified

- Ephemeral secret TTL is 600 s; whether an open session outlives that is not
  tested (a 5-minute session was not paid for).
- Echo cancellation with real speakers: the smoke test runs muted. Chrome AEC
  is enabled on the microphone constraints; a false barge-in from speaker
  bleed would stop playback early.
- Danish is not in xAI's listed languages; auto-detection is untested.
- Cost per session at $0.08/min audio was not measured across a long session.
