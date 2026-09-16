# Live conversation corrections — September 16, 2026

Status: implemented and verified locally; production acceptance pending.

The Live migration dropped the explicit Realtime trial's passage retrieval and
outside-source research contract. It also inferred turn state from a 120 ms audio
level check and treated 1.5-second caption pauses as completed turns. These are
shared reader voice failures, not a Job-specific content problem.

- Live now uses the existing direct reading prompt, exact passage retrieval,
  source search and Tinct controls. Named-commentator questions are supported;
  the chapter boundary limits spoilers, not outside knowledge. Research remains
  authenticated and returns clickable sources. Unavailable search must be
  distinguished from verified attribution.
- The Live conversation prompt follows the documented frontend/backend split,
  with minimal backchannels, patience for unfinished questions and pauses, and
  explicit handling of corrections. GPT Live remains the voice model.
- Connected calls show a stable Live label. The orb follows audio without
  changing between Listening/Thinking/Speaking on each breath. Mute and actual
  disconnection remain distinct.
- Captions are grouped at backend work and speaker boundaries, not silence
  timers. Replacement-character-only fragments are discarded. Voice fragments
  no longer receive the typed-chat unanswered-question diagnosis.
- Transcript callbacks cannot execute resume themselves. Playback, navigation,
  speed, history, undo and view controls keep their existing tool handlers.
  Navigation honors the handler's resume-playback outcome. Tool results retain
  their response guidance, including research failure handling.

Local checks: 184 test files / 2,329 tests passed; build and bundle verification
passed. Added regressions cover Live/default versus explicit Realtime research
and resume, sources, controls inventory, caption pauses and noise, stable UI,
function results and navigation playback outcomes. A muted headless phone browser
verified the stable Live surface. Attempts to exercise new frontend instructions
against the old production Worker are not acceptance evidence; production must
be checked after the new Worker instructions are deployed.

No Anthropic development calls or physical microphone/speaker tests were used.
Physical conversational comfort remains a verification limit even after a
synthetic spoken test. Evidence directory: `output/voice-refinement-2026-09-16/`.

Prompt reference: https://developers.openai.com/api/docs/guides/live-prompting

Next action: deploy this commit, verify its exact bundle and production smoke,
then exercise the actual Live prompt with a paused spoken Keller question and
reader controls in an isolated, muted browser.
