# Voice source links — September 16, 2026

Status: shipped. App change `8e15e53e`; release `1858d9ef`.
[Deploy 35106632815](https://github.com/anderskhv/tinct/actions/runs/35106632815)
passed, including exact-bundle verification and all 15 production smoke checks.
Verified production bundle: `index-rJJURov7.js`.

Successful outside-source research retains clickable citations in the book-scoped
chat transcript and instructs the voice to finish with “I've added the source
links in chat,” once, without reading URLs aloud. Failed, empty or malformed
research must not promise links. Results superseded by a new question or book
must not announce stale sources. OpenAI voice and backend models are unchanged.

Cloud verification: 187 test files / 2,361 tests passed, followed by build and
bundle verification. The existing transcript integration test verifies rendered
links and persisted chat together with the announcement instruction. New tests
cover usable sources, failed/empty/malformed results and signed-out research.

A separate pre-existing smoke-check failure searched only the entry bundle for
the audio route after code splitting. The check now uses the same reachable
static-import graph as the configuration checks. The actual audio marker was
confirmed in a shared production chunk; the corrected release passed all checks.

Production acceptance at https://tinct.app/lab/phone, 390×844, confirmed the
announcement instruction in the tool response, a clickable chat source, and its
persistence in book-scoped local history. Evidence:
`output/voice-source-notice-2026-09-16/acceptance.json` and
`output/voice-source-notice-2026-09-16/production-chat.png`.

Limits: browser transport, sign-in and research responses were controlled
fixtures, with audio muted. This verifies the deployed integration, not actual
spoken model compliance or live authenticated source search. Research still
requires sign-in. No physical microphone, audible playback or Anthropic
development calls were used.

Documentation checker: 12 maintained files, zero errors or review reminders.
The historical Documents product brief remains untouched under the archive
policy; this release report records the new behavior. No further product action
is required for this request.
