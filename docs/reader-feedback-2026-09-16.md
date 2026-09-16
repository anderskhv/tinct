# Reader feedback corrections — September 16, 2026

Reviewed: 2026-09-16

Status: implemented and under final acceptance; production deployment pending.
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

## Verification

Final full suite: 183 files and 2,315 tests passed. Build and bundle
verification passed. Headless Chromium desktop and WebKit 390×844 accepted
same-ID recolour/note, full formatted scrolling explanation, complete Chat context,
and draft clearing before the mocked answer. No page errors. Screenshots exposed
an existing WebKit popup translucency issue; this batch makes Explain opaque.
Final rebuilt desktop and phone visual checks passed on index-BuzCdP5A.js. Actual voice-provider connection remains pending deployment.

Evidence is in `output/reader-feedback-2026-09-16/` in the isolated release checkout.
Physical finger interaction and audible voice quality are not certified by muted
browser tests. Documentation maintenance files exist in the original working tree
but are absent from current remote main; they are not silently reconstructed here.
The original checker initially reports one existing product-brief word-limit error.

Next action: finish final gates, publish current-main commit, verify exact deployed
bundle and silently verify GPT Live session access; record results here and in the
original authoritative product/feedback notes.
