# Library and reader iteration — September 17, 2026

Status: implementation in cloud; verification and production release pending.

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
and finish only the shelf's own capture loss. Full matrix retest pending.
Published text audit: Divine Comedy 111,065 words; Frankenstein 75,021;
Niels Lyhne 68,480; War and Peace 563,543. Ranges use 140–200 words/minute;
notes and pauses are extra. No actual print-edition page count is claimed.

Preparation sign-in returns through the explicit book-detail entry because the
one-use handoff is consumed and preparation intentionally does not write a reading
position. Ordinary reading retains its existing route/resume tuple.
