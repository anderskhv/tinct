# Private voice test room — September 17, 2026

Status: deployed and cloud acceptance verified September 17, 2026.

URL: `/lab/voice`. Reuses the real reader and Live1 transport. The room and
custom session settings require the existing Supabase site_admins membership;
guests and ordinary accounts cannot create experimental sessions.

Separate speaking and reasoning prompt editors, current/lighter presets, and
allowlisted Terra/Sol/Luna reasoning choices apply on the next call. Voice remains
GPT Live1. Grok is explicitly a later adapter, not a working option in this release.
Current expands the production prompt/history via `{{reader_context}}`; lighter
uses only position and nearby text via `{{passage}}`. Reader tools remain real.
No default production prompt or model changes.

Presets save locally per account (12 maximum). Call settings are copied at startup;
resolved backend updates, transcripts, backend text, tool durations and manual
useful-answer marks are exportable as JSON. No raw audio recording. Event times
are client receipt times; useful-answer timing includes observer/transcript delay.
These metrics must not be presented as measured waveform latency. New voice turns
are not persisted in normal book chat history. Existing history can supply current
preset context. Results stay in the tab and are lost on reload unless exported.

Acceptance: focused request validation, admin authorization and protocol tests;
isolated muted Chromium/WebKit browser checks with controlled transport, then
full tests/build/bundle verification, GitHub deployment and production acceptance.
Automated acceptance uses simulated media and provider responses; no paid model calls.
A macOS WebKit production rerun unexpectedly raised microphone permission prompts
(reported by Anders). Stopped local browser runs; the acceptance script now rejects
macOS outright, seals the mock mediaDevices property and runs in Linux GitHub CI.
The earlier local pass does not establish real microphone/audio quality.

Pre-release verification: 192 test files / 2,391 tests passed; focused protocol
and authorization regressions 22/22. Build and verify-bundle passed. Muted
Chromium desktop and WebKit phone checks confirmed prompt/model transport,
separate transcripts/backend output, export, saved presets and chat isolation.
Artifacts: `output/voice-lab-2026-09-17/`; authoritative screenshots and report in
GitHub artifact `voice-room-acceptance` on the acceptance run below.

Comparison procedure: use the same passage and questions; change prompts first,
then models. Export and reload between independent trials so earlier test turns
do not remain in the in-memory recent conversation. Saved presets survive reload;
unexported results do not. Live microphone quality and end-to-end audible latency
require an agreed listening session and are not established by mocked acceptance.

Release evidence: app commit `ffefd412ef8`, [deploy 35224219703](https://github.com/anderskhv/tinct/actions/runs/35224219703) succeeded, including smoke and library/landing acceptance.
Production serves `index--Iq8OnMT.js`, confirmed byte-for-byte by deployment.
[Cloud voice acceptance 35225147603](https://github.com/anderskhv/tinct/actions/runs/35225147603) passed Chromium desktop and WebKit phone on that same bundle with mocked authentication/media/providers. Real unauthenticated `/api/voice-lab` returned `allowed:false`; the guest experiment route returned 403.
Next: compare current and lighter prompts with real conversations; do not infer
spoken quality or audible latency from these transport/UI checks.
