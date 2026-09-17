# Library and reader iteration — September 17, 2026

Status: merged as PR #100; release and production acceptance receipt below.

Approved: a settling cover reveal with “Pick your book”; quiet mobile Featured
selection; easier horizontal swipes; no shelf rule or logo; richer, smoothly
changing cover colour. Short novels, Epics, Philosophy lead the complete catalogue.
Keep full descriptions. Replace pseudo print-page counts with disclosed reading
ranges, using published text counts where available.

Preparation keeps its stable frame. Optional conversation uses “Find your way
into the book”, supporting copy and separate Talk / Chat buttons. Edition labels
state language/provenance; order is Primary, Audiobook, Compare. Keys and selection
callbacks are unchanged. Remove the programmatic heading focus outline.

Reader selection adds Ask below Explain, preserves Copy, and reveals a compact
colour palette before the optional note field. Suggestion cards submit directly.
Sign-in must accept the current reader route and retain book parameters.

Account policy: ten anonymous AI interactions shared across Explain, Chat and
spoken questions. No book-opening nudge. Reading remains free without signing in.
Account creation continues the existing first-month trial; no billing schema or
paid-tier changes. The eleventh AI request is held behind the account sheet.

Required acceptance: full tests, build, verify-bundle, docs, silent isolated
Chromium/WebKit phone/tablet/desktop checks and production verification.
No physical-device acceptance or live paid model calls claimed.

Cloud verification: run 35219516515 passed 2,383 tests, build and bundle gates,
plus preparation/selection checks. Native short-touch acceptance exposed bubbled
implicit-capture loss prematurely finishing a reel drag; ignore descendant loss
and finish only the shelf's own capture loss. The complete matrix subsequently passed in run 35221720375.
Published text audit: Divine Comedy 111,065 words; Frankenstein 75,021;
Niels Lyhne 68,480; War and Peace 563,543. Ranges use 140–200 words/minute;
notes and pauses are extra. No actual print-edition page count is claimed.

Preparation sign-in returns through the explicit book-detail entry because the
one-use handoff is consumed and preparation intentionally does not write a reading
position. Ordinary reading retains its existing route/resume tuple.

## Release receipt — September 17, 2026

- Merge: `7742fa06e96ab9eb0b942c7d06226cbac224cf02` ([PR #100](https://github.com/anderskhv/tinct/pull/100)).
- [Final pre-release verification](https://github.com/anderskhv/tinct/actions/runs/35221720375):
  2,384 tests in 190 files, documentation checks, build and bundle verification,
  Chromium/WebKit at 375×560, 390×660, 430×780, 820×1024, 1180×720, 1440×900.
- Expected reader bundle: `/assets/index-Corw3DXZ.js`.
- [Production deployment and acceptance](https://github.com/anderskhv/tinct/actions/runs/35222369685)
  is the authoritative release receipt: exact served bundle bytes, smoke test,
  explicit `/lab/phone?chrome=v2` and desktop preparation/selection, then the
  live Chromium/WebKit responsive matrix. Completion requires this run to be green.
- Walkthrough artifact: `production-library-preparation` in that run;
  folders `library-layout/` and `entry-responsive/` include preparation,
  edition choices, compact palette, landing and shelf screenshots.
- Verified interaction scope: native short left/right touch gestures, mouse drag,
  horizontal wheel, keyboard selection, vertical catalogue access, stable frame,
  Ask/Copy presence, colour-only palette and Save note flow. AI turn gating is
  tested with controlled fixtures; no microphone or live paid inference used.
- Limits: browser viewport checks do not claim physical iPhone/iPad acceptance.
  Account return routing is tested without a live external authentication session.
  Published word counts are text estimates, not print pages; notes/pause time is extra.

Next action: no further design changes are queued for this iteration. Treat any
physical-device follow-up as a specific observed issue and preserve reader positions.
