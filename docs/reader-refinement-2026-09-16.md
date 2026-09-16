# Selection and explanation refinement — September 16, 2026

Reviewed: 2026-09-16

Status: shipped and verified on production, September 16, 2026.
Anders approved these corrections from five supplied screenshots. Voice-mode
feedback can be supplied separately; no new voice-model change is part of this batch.

## Changes and rationale

- The mobile bottom-sheet override displaced selection actions from their passage.
  Lab popups now measure the selected text and their actual height, prefer the
  adjacent free space, and stay inside the viewport. Reader position is unchanged.
- Word and separator backgrounds produced uneven highlight edges. CSS text ranges
  now paint continuous highlights on supported browsers, including Read, Compare,
  wrapped words and verse-marker groups. The span fallback remains for browsers
  without the API. WebKit requires selectable text for this painting; existing
  pointer/default-event prevention still owns selection and suppresses native UI.
- The touch hold is 160 ms, formerly 240 ms. Movement in the first 100 ms retains
  the quick-swipe path; slower movement keeps the selection hold alive. The short
  line targeting correction from the earlier release remains.
- Explain omits the repeated quote, limits its scroll area to 28dvh/250px, shows
  a small Loading indicator and requests a short opening paragraph. It reveals
  complete paragraphs while the request
  continues. Chat and Talk use the actual reader menu icons and row styles.
  Outside press/Escape dismisses the card.
- Both actions retain the delivered explanation and selected passage in the
  conversation. Talk starts after that context is recorded. No second explanation
  is generated for the handoff. Chat's attachment scrolls without Expand/Collapse;
  its voice button remains available.

## Verification

Full suite: 184 files, 2,319 tests. Build and bundle verification passed.
Headless Chromium desktop and WebKit 390×844 accepted anchored selection,
compact full Markdown explanation, Chat/Talk rows, scrollable attachment,
explanation in Chat history and immediate sent-draft clearing. A synthetic,
muted voice startup verified the exact explanation in the outgoing Live context;
its endpoint was controlled, with no real microphone or provider call.
The actual Job 7 WEB passage was checked in dark WebKit; word rectangles stayed
identical before/after highlighting. All companion responses were mocked.
Original workspace documentation check: 12 files, zero errors or review reminders.

Limits: browser touch events and WebKit screenshots do not certify physical
finger comfort or audible voice behavior. Old browsers retain span painting.
No new model-latency claim; paragraph delivery uses the existing request.

Evidence: `output/reader-refinement-2026-09-16/`.
Production app commit: `5409bbad`. [Deploy 35080914057](https://github.com/anderskhv/tinct/actions/runs/35080914057)
passed, including exact-bundle verification and smoke tests. Production serves
`index-CiI-TB-E.js`. Desktop, phone, dark Job 7, and outgoing Talk context checks
passed against that build. Long attachment scrolling and a visible voice control
also passed locally. Earlier deploy 35080782218 correctly declined the superseded
commit after the opening-paragraph refinement reached main.

Next action: this refinement batch is complete. Subsequent voice feedback was
handled in the [Live conversation correction](voice-refinement-2026-09-16.md).
