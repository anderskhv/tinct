# Private voice test room — September 17, 2026

Status: approved, implementation and acceptance in progress.

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
No microphone permission or paid model call during automated UI acceptance.

Pre-release verification: 192 test files / 2,391 tests passed; focused protocol
and authorization regressions 22/22. Build and verify-bundle passed. Muted
Chromium desktop and WebKit phone checks confirmed prompt/model transport,
separate transcripts/backend output, export, saved presets and chat isolation.
Artifacts: `output/voice-lab-2026-09-17/`. Production acceptance pending.
