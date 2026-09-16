# Reader feedback corrections — September 16, 2026

Reviewed: 2026-09-16

Status: shipped and verified on production, September 16, 2026.
Anders approved implementation, tests and production deployment of this whole batch.

## Scope and mechanism

- Explain uses the existing Chat and Read icons, renders the full Markdown answer
  in a scrollable opaque card, and carries the selected passage and actual answer
  into book-scoped Chat history only when the reader chooses Chat. Outside press
  and Escape return to the book without changing reading position.
- Signed-in multiword selections start one speculative explanation after 180 ms.
  The same in-flight request/answer is reused for 60 seconds, keyed by book,
  chapter, edition, paragraphs and selected text. Guests do not spend free actions
  through speculation. Explanations use low effort; typed Chat retains medium.
  No claim of measured provider latency improvement: development tests mock the
  companion provider, in keeping with the no-Anthropic-development-calls rule.
- Highlight is the sole action label. Choosing a colour saves any note, recolours
  the same highlight and dismisses the selection overlay so its colour is visible.
- Chat previously cleared drafts after successful answer completion. It now clears
  when a turn is accepted; failed turns retain retry context, and later completion
  cannot erase a newly typed draft.
- Touch selection starts at 240 ms, down from 300 ms. Whitespace targeting now
  works for touch as well as mouse and prioritizes the nearest line, making short
  trailing lines selectable without crossing into the following paragraph.
- Returning from conversation seeks to the current sentence's first verified word.
  Ordinary pause/play remains exact. Missing timings fall back to paragraph start.
  Cancelled voice startup cannot resume later after token resolution and pause audio.
- GPT Live uses a separate WebRTC session adapter and server-side `/v1/live/sessions`
  creation, with GPT-5.6 Terra selecting the existing companion and reader tools.
  API keys remain server-side; account/balance/rate checks remain in place.
  Explicit Realtime comparison trials keep their existing protocol. Live captions
  are collected independently for both speakers; playback metering drives speaking
  state. Tool results are submitted before backend continuation.

## Verification and deployment

Final full suite: 183 files and 2,315 tests passed. Build and bundle verification
passed. GitHub production deploy [35074466321](https://github.com/anderskhv/tinct/actions/runs/35074466321)
succeeded, including exact-bundle byte verification and production smoke test.
Release app commit: `a33d6f114ddd9b8a8b6f7dda1ca528e76b7e7fef`.
Production bundle: `index-Cb5kzdkL.js`.

Isolated headless Chromium desktop and WebKit 390×844 accepted same-ID recolour
with note preservation, full formatted scrolling explanation, complete Chat
context and draft clearing before the controlled answer on tinct.app. No page
errors. Screenshots wait for entrance animation completion; Explain is opaque.
The companion provider was mocked in accordance with project development rules.

A muted Chromium session with synthetic microphone input verified the real
OpenAI GPT Live handshake (HTTP 200, `gpt-live-1`, `session.started`), backend
function execution (`set_audiobook_speed`), and stored speed 1.25. The backend
continued successfully after the tool result. The first acceptance run exposed an
old route default that selected full Realtime; the final correction removes it
while retaining explicit comparison trials and current reader voice controls.

Physical finger interaction, audible voice quality and real explanation latency
are not certified by these tests. Sentence return uses verified word timings;
without those timings, it restarts the paragraph. No content or narration authored.

Evidence: `output/reader-feedback-2026-09-16/`. The authoritative product brief
and first-reader feedback plan are maintained in the original working tree; those
files and the documentation checker are absent from current remote main.
The product brief is now 1,076 words, within its 1,100-word limit. The mandatory
checker was run, but its final pass could not finish reading the iCloud-only
`CLAUDE.md` placeholder despite download requests. That pointer remains unverified;
no review dates were advanced for unrelated documents.

Next action: this approved batch is complete. Measure explanation latency and
assess physical touch/voice comfort when real usage evidence becomes available;
this is not an automatic monitoring commitment.
