# Voice insight experiment — September 18, 2026

Approved: isolate on codex/voice-insight-preview from 5e7459dc37f, without merging
Claude's ongoing reader changes or deploying this experiment to production.

Default preset: Insight — direct. Give one developed insight anchored in a
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
