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

Status: cloud verification and preview publication pending.
