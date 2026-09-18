# Voice insight experiment — September 18, 2026

Approved: isolate on codex/voice-insight-preview from 5e7459dc37f, without merging
Claude's ongoing reader changes or deploying this experiment to production.

Original preset (superseded below): Insight — direct. Give one developed insight anchored in a
concrete detail; use direct voice for grounded familiar interpretation and Sol
for uncertain facts, verified named-author claims, difficult reasoning and tools.
Insight — Sol reasoning uses the same style with substantive interpretation
delegated. Current and Lighter conversation remain baselines.

The frontend receives bounded reference text in experimental sessions. This
does not fix the reader-position mismatch: that remains deferred while Claude
works on the reader. No reader navigation or persistence changes in this branch.
The experiment retains auth/admin gates and existing reader actions. It isolates
code/assets, not accounts, provider costs or shared storage; the test room's
existing history-isolation behavior remains.

Cloud-only editing through GitHub and cloud-only tests/build/browser acceptance.
npm run deploy uploads a Cloudflare version with voice-insight preview alias,
without a production traffic deployment. The branch refuses the normal production
deploy route. Preview credentials/bindings use the existing Worker; no secrets
are copied into code. Later merges on main do not replace this version's code.
An immutable version URL is also recorded for reproducible trials.

Evaluation: time from final input transcript to first substantive spoken answer,
not acknowledgments. Compare grounded insight, continuity, attribution accuracy,
filler, and tool use. Reuse sparrows/Keller plus a held-out literary question;
avoid writing the desired sparrows answer into the prompt. Browser simulations
verify wiring only; actual voice latency and quality need an audible trial.
Do not request microphone access or play audio on Anders's Mac during automation.

Original rollout (superseded by the streamed trial below): preview published and cloud acceptance passed September 18, 2026.

[Preview](https://voice-insight-tinct.ahvelplund.workers.dev/lab/voice)
defaults to Insight — direct. [Immutable version](https://bf0a0291-tinct.ahvelplund.workers.dev/lab/voice)
pins Worker bf0a0291-4fdd-4ec0-a842-6eed0ae97d05 and bundle index-CBk9KNLF.js.
Source commit: 58536285cc703e01ca8cb4d8811f5940e94088b7.

[Cloud run 35333333605](https://github.com/anderskhv/tinct/actions/runs/35333333605)
passed 2,397 tests in 192 files, documentation check, build and verify-bundle,
version upload, exact served-bundle byte comparison, Chromium desktop and WebKit
phone acceptance. Tests checked default preset, insight instructions, bounded
frontend reference, late-result guard, export, saved presets and history isolation.
[Artifacts](https://github.com/anderskhv/tinct/actions/runs/35333333605/artifacts/10541928558)
contain screenshots and production.json (the existing script's name for remote
acceptance; these were run against the preview). No page errors. No real model,
microphone or audible quality test was performed. The unauthenticated preview
admin endpoint returned allowed:false. Production still served index-DpT2T9Ec.js
at verification; no main commits or production traffic deployment were made.

Original next step (superseded): compare Insight — direct and Insight — Sol reasoning on the same questions,
including one unseen passage, assessing insight and substantive-answer latency.
The known reader-position issue remains intentionally deferred. Research service
output limits remain unchanged in this first controlled prompt comparison.

## Streamed Sol trial — approved September 18, 2026

The user approved the next experiment after reviewing voice transcripts:
Sol alone authors the spoken answer, using low reasoning effort and native web
search when verification is needed. Transcription uses gpt-live-transcribe;
gpt-4o-mini-tts/Marin reads each complete thought as Sol continues generating.
Default becomes **Sol — streamed voice**; all previous Live presets remain
available for comparison. This supersedes the original default above, not the
production voice configuration.

Failure class: multiple models restating answers, incomplete clarification
continuations, repeated questions restarting pending research, and delayed
generated text continuing after interruption. The preview introduces explicit
turn ownership, ordered transcription completions, status/exact-repeat retention,
speech cancellation, and a guard against executing reader actions while a spoken
correction is still being transcribed. Heard history contains completed audio
chunks; interrupted unfinished drafts are explicitly labelled as unheard.
The current chapter is supplied as bounded reference without claiming it is the
visible page. Reader position/navigation state is not changed.

Sources come from native web citation annotations, are added to the test room's
chat and exported diagnostics, then announced aloud. Existing preview history
isolation remains; this does not persist experiments to normal book chat.
The admin-only streaming endpoint fixes provider models and restricts tools,
request sizes and rates. No dependency or database changes. Provider keys stay
on the Worker. Development does not call Anthropic.

First cloud run 35338764314 passed 2,413 tests in 195 files. Deployment correctly
refused its outdated commit after additional regression work advanced the branch;
no version was uploaded in that run. Final verification is recorded below. Added tests cover early PCM playback, cancellation, out-of-order
transcriptions, yes-after-clarification, pending repeats/status, tool continuation,
source handling and audio resume. Cloud browser acceptance exercises both Live
and streamed paths using simulated microphones and PCM on Chromium and WebKit.

Verification limits: automated audio is simulated. These checks do not establish
provider account access, actual acoustic turn detection, audible quality or
real-world latency. The chapter-position mismatch remains deferred. No latency
promise is made; the next user trial should compare time to first useful spoken
thought, insight, correction handling and sentence-to-sentence voice continuity.
The preview continues to share account data and credentials with the existing
Worker; production code and traffic remain untouched.

### Streamed preview release evidence

Published September 18, 2026 from commit
3827307e851a520cb3d2509ff9e7607de305de85.
[Cloud run 35339030045](https://github.com/anderskhv/tinct/actions/runs/35339030045)
passed **2,416 tests in 196 files**, documentation validation, build,
verify-bundle, version upload, exact served-bundle comparison, and silent
Chromium desktop / WebKit phone acceptance. Both browser runs had zero page
errors and exercised the new streamed preset as well as the prior Live preset.
The first speech request contained the first complete sentence; diagnostics
recorded first scheduled audio, and exported settings retained the transport.

Current [preview](https://voice-insight-tinct.ahvelplund.workers.dev/lab/voice)
defaults to **Sol — streamed voice**.
[Immutable version](https://ead86fe1-tinct.ahvelplund.workers.dev/lab/voice):
ead86fe1-505e-4a34-acda-e5cc4ba8889c, bundle **index-C2SCWlKR.js**.
[Acceptance artifacts](https://github.com/anderskhv/tinct/actions/runs/35339030045/artifacts/10544252905)
include desktop-streamed-voice.png and phone-streamed-voice.png under
output/voice-lab-2026-09-17, along with existing settings/results screenshots
and remote acceptance JSON.

Independent HTTP checks confirmed the preview bundle, unauthenticated POST
/api/voice-chain returns 403, and production still serves index-DpT2T9Ec.js.
Production was not deployed. These are wiring/security/streaming checks with
simulated audio, not proof of real provider availability, human-perceived
latency or acoustic quality. Next: one audible comparison using the default
streamed preset, then inspect the exported first-audio timing and conversation.

## Startup correction — September 18, 2026

The first human trial could not start voice. The screenshot contained only the
generic reader fallback; the precise browser failure was not captured.
Code/API-contract inspection found an invalid transcription configuration path:
the multipart /realtime/calls session parameter accepts conversational realtime
configuration, while transcription configuration belongs on /realtime/client_secrets.
The preview now creates a short-lived transcription credential server-side and
uses it to exchange raw SDP. The credential never reaches the app or diagnostics.
Startup stages and bounded provider error codes are retained; the reader also
preserves thrown startup errors rather than replacing them with its generic notice.

This is a verified configuration defect, not proof that it was the sole cause
of the reported screenshot. Cloudflare's bounded classification query returned
zero matching provider-error logs. The old tests simulated the provider and
therefore accepted the invalid configuration. New endpoint tests assert the
two-step contract and rejection behavior. Browser acceptance on both platforms
asserts a rejected startup displays its specific stage/code.

[Run 35340163621](https://github.com/anderskhv/tinct/actions/runs/35340163621)
passed 2,417 tests in 196 files, documentation check, build, verify-bundle,
version upload, served-bundle comparison, Chromium and WebKit acceptance.
Source ec069d20c835894121d73c490bde764e8b1660df.
Current preview bundle: index-DsLey6ca.js.
[Immutable corrected preview](https://1c10b971-tinct.ahvelplund.workers.dev/lab/voice),
Worker 1c10b971-1f65-490e-8907-ddd683b98726.
[Artifacts](https://github.com/anderskhv/tinct/actions/runs/35340163621/artifacts/10544822226)
include desktop-startup-error.png and phone-startup-error.png.
Production remains index-DpT2T9Ec.js.

The added silent real-provider WebRTC probe did not run: CI lacks OPENAI_API_KEY.
Its explicit REAL_PROVIDER_CHECK_UNAVAILABLE result is not a successful provider
test. Worker credentials remain configured and are not copied into CI.
Next: retry the human voice trial; if it still fails, use the newly captured
startup stage/error to identify the actual remaining path before another patch.

## Confirmed session rejection and diagnostic gap — September 18, 2026

The subsequent user export confirms startup reached transcription_session and
failed after 2,548 ms with invalid_value. It never connected. This isolates the
observed failure to upstream session configuration validation; it provides no
evidence of interference from concurrent reader changes. The rejected field was
not included in the export, so the precise configuration defect remains unknown.

With explicit user approval to publish only the provider classification and
setting name, cloud diagnostic runs 35342491273 and 35342593973 searched bounded
telemetry by message field and full-text needle. Both returned zero matching
events. No credentials or private transcript content were printed. The separate
codex/voice-startup-diagnostics branch performs no deployment.

The preview now preserves only allowlisted configuration parameter names in the
admin endpoint's error response and startup export. Tests cover allowed fields
and suppression of unknown/private payloads; browser checks require the field
in the visible failure notice. This is instrumentation, not a claimed startup
fix. Session settings and models remain unchanged pending direct evidence.
Next: after this diagnostic release passes, capture one startup failure with
its rejected field. Real provider acceptance remains blocked by absent CI
provider credentials; simulated checks do not establish a working call.

### Diagnostic release verification

[Run 35342783639](https://github.com/anderskhv/tinct/actions/runs/35342783639)
passed 2,418 tests in 196 files, documentation validation, build, verify-bundle,
preview upload, exact served-bundle comparison, and silent Chromium/WebKit
acceptance. Source f035d9133e82d9984f19376e9588916148c5a788.
Worker 154eccfa-d33a-4daa-897c-be182f2f0049; bundle index-DN5Pvp4J.js,
also independently confirmed on the preview URL.
[Artifacts](https://github.com/anderskhv/tinct/actions/runs/35342783639/artifacts/10546375407)
include desktop-startup-error.png and phone-startup-error.png with the rejected
field displayed. Provider handshake remains explicitly UNAVAILABLE in CI;
no real working voice connection or configuration correction is claimed.
One signed-in startup attempt is needed to capture the rejected field.

## Turn-detection compatibility correction — September 18, 2026

The user's instrumented startup error identifies
session.audio.input.turn_detection as invalid_value. This establishes rejection
of the submitted server-VAD configuration with gpt-live-transcribe in this
deployment, not a reader update or microphone failure.

The streamed chain depends on speech_started/stopped events and automatic
audio commits. Setting turn_detection to null alone would let startup progress
but leave question submission and interruption broken. The narrow correction
uses gpt-4o-transcribe with the existing server VAD configuration, preserving
the 900 ms silence interval and the chain's turn ownership. Sol remains the
answer author; Marin remains speech output. No reader or production change.
This supersedes the transcription model recorded earlier in this document.
The optional cloud provider probe now uses the same model as the endpoint.

Official reference: [Realtime input transcription and VAD](https://developers.openai.com/api/docs/guides/voice-latency-cost?api=realtime)
documents gpt-4o-transcribe transcription when audio is committed manually or
through VAD. Endpoint regression checks assert this model together with the
configured silence interval. End-to-end provider access remains unavailable in
CI; release gates and browser simulation do not prove a live voice connection.
Next: complete cloud release verification, then verify a real startup/turn.
