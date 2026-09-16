# Live conversation corrections — September 16, 2026

Status: shipped and production-verified. App commit `3d18c2b9`; bundle
`index-DoEZc0-j.js`. [Deploy 35084093321](https://github.com/anderskhv/tinct/actions/runs/35084093321)
passed, including exact-bundle verification and production smoke.

## Failure class and correction

The Live migration dropped the previous direct voice path's passage retrieval
and outside-source research contract. It also inferred turn state from a 120 ms
audio-level check and treated 1.5-second caption pauses as completed turns. These
were shared reader voice failures, not a Job-specific content problem.

- Live uses the existing direct reading prompt, exact passage retrieval, source
  search and Tinct controls. Named-commentator questions are supported; the
  chapter boundary limits spoilers, not outside knowledge. Authenticated research
  returns clickable sources. Search failures are distinguished from verified
  attribution.
- The conversation prompt separates speaking behavior from backend reasoning,
  allows pauses and unfinished questions, uses minimal backchannels, and follows
  corrections. GPT Live remains the voice model; detailed reading work runs in
  its configured backend.
- Connected calls show a stable Live label. The orb follows audio without
  alternating Listening/Thinking/Speaking on each breath. Mute and actual
  disconnection remain distinct.
- Captions are grouped at backend work and speaker boundaries, not silence
  timers. Replacement-character-only fragments are discarded. Voice fragments
  no longer receive the typed-chat unanswered-question diagnosis.
- Transcript callbacks cannot execute resume themselves. The resume tool carries
  `play_audio` explicitly, so a damaged caption cannot override the understood
  request. A page-only return restores the prior reading mode. Audiobook resume
  retains the earlier sentence-start behavior.
- Playback, navigation, speed, history, undo and view controls keep their existing
  handlers. Navigation honors the handler's playback outcome. Tool results retain
  response guidance, including research failure handling.
- Frontend context updates contain only concise reading-location facts. The
  backend receives its current prompt/history separately. Repeated transcript
  updates no longer copy truncated backend instructions into Live's small
  speaking context.

## Verification

Full suite: 184 files / 2,332 tests. Build and bundle verification passed.
Documentation check: 12 maintained files, zero errors or review reminders.
Regressions cover default Live and explicit Realtime research/resume, sources,
controls inventory, caption pauses/noise, stable UI, tool result guidance,
navigation playback outcomes, explicit audio intent and context separation.

On the final production bundle, isolated headless Chromium at 390×844 used
synthetic microphone audio with all speaker output muted:

- “Has Tim Keller” followed by a deliberate pause and the rest of the Job question
  reached source search and received a relevant answer.
- Interrupting with “No, sorry. I mean, what is the title of his book about
  suffering?” produced *Walking with God through Pain and Suffering* after the
  corrected question. The Live label stayed unchanged.
- A complete spoken sequence set audiobook speed to 1.25, undid it to 1, then
  resumed the audiobook with `play_audio:true`. The call closed, the actual media
  element was unpaused and its playback clock advanced (1.72 seconds at capture).

Evidence: `output/voice-refinement-2026-09-16/acceptance.json`,
`production-controls.json`, `production-correction.json`, and their phone
screenshots. No Anthropic development calls or physical microphone/speaker tests
were used. The signed-out production research test correctly reported that
sources could not be verified and answered from general background. Authenticated
source dispatch/link persistence are covered by mocked regressions; live
signed-in research was not exercised in this session. Synthetic speech does not
certify every accent, background-noise condition or physical device.

## Acceptance corrections

The first deployment (`16d52b37`, `index-BXMG7Xh_.js`) passed the Keller check but
read the excerpt in response to a playback request. `b5589981` made playback
explicit in both the prompt and tool intent; fresh spoken resume passed on
`index-Zb5L2Ggh.js`. A longer sequence exposed inconsistent later delegation.
Tracing identified the context writer crossing the frontend/backend boundary;
the final correction separates those channels. The complete spoken sequence and
Keller correction were repeated successfully on the final bundle. Local-preview
playback and tests that appended new instructions to an older Worker were not
used as final playback evidence.

The frontend/backend policy follows the
[Live prompting guide](https://developers.openai.com/api/docs/guides/live-prompting)
and [delegation guide](https://developers.openai.com/api/docs/guides/live-delegation).

Next action: this feedback batch is complete. Any further acoustic edge cases
should be investigated from their actual transcript and device conditions.
