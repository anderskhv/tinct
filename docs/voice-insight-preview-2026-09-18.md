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

Status: preview published and cloud acceptance passed September 18, 2026.

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

Next: compare Insight — direct and Insight — Sol reasoning on the same questions,
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
no version was uploaded in that run. Final verification is pending on the frozen
branch head. Added tests cover early PCM playback, cancellation, out-of-order
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
