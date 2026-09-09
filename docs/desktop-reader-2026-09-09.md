# Desktop reader stabilization — 9 September 2026

Shipped on tinct.app from the clean `codex/reader-stabilization-20260908` worktree. App commits: `9b5e6c70`, `3679e4af`, `7fc7fa17`. Main working checkout and its unrelated app/content/audio changes were preserved.

## Result

- Desktop Read displays two successive leaves. Compare replaces the right leaf with the other edition and aligns paragraph starts using shared measured rows.
- The chapter map is measured before display using the actual reading/heading fonts. Page turns use this stable map. Saved words select their containing page rather than creating a fragment page.
- Text reserves space for page numbers and the open audio dock. Navigation uses translucent buttons midway down the sides. Header controls are quieter and title descenders are no longer clipped.
- Covers fit the screen with their complete artwork visible. The compact audio dock and its speed popover have usable desktop surfaces and pointer targets.
- Desktop word follow remains enabled after Compare restoration. Exact word highlighting is verified with the matching Modern English narration.
- Initial account resolution waits even when no cached sign-in hint exists. This closes a concrete path that could show the local default before authentication finished. The user's specific Genesis 2 account record was not inspected, so that historical incident is not independently attributed to this path.

## Traced causes

Desktop still used the old iterative estimate/paint paginator. Compare changed the column geometry without measuring paired paragraphs, and its word-count slicing could truncate a longer translation. The new desktop-only paginator measures paired row height and maps contiguous proportional word boundaries without dropping translated words. Mobile's native paginator is unchanged.

Instrumentation additionally exposed a queued passive effect holding the provisional map after the measured map had committed. It could replace the exact saved anchor with an earlier estimated page boundary. Desktop now rejects that stale map and leaves page selection to the measured-map commit.

Cold-font frame tracing exposed another startup race: `document.fonts.ready` could resolve before the empty measurement tree had requested Literata. The first font swap then overflowed the page for a frame. Explicitly requesting the body and heading faces before measuring removes this first-paint change. Tests delay font responses and inspect 24 initial visible frames.

The desktop transport attribute was derived from the phone-only flag, so the desktop dock never reserved reading space. Desktop speed-popover styling was missing an appropriate surface, positioning and stacking. The cover used an unbounded percentage-height chain. These are corrected with desktop-scoped geometry and styles.

## Verification

- Full suite: 143 files, 1,570 tests passed. Build and verify-bundle passed before deployment; the approved npm deploy repeated both gates.
- Production Chrome and WebKit: 24 stable first-paint frames with deliberately delayed font responses; full Democracy in America introductory chapter in Read and Compare, every word exactly once in both editions, backward page identity, paragraph alignment, footer clearance, four refresh checks, and cover containment.
- Actual playback: pointer and keyboard speed changes verified; selected 2× reaches the playing Audio element's playbackRate. Done dismisses the popover. Actual Modern English word highlight advanced from “Of” to “all”.
- Production WebKit mobile: Jeremiah 43–44 play/pause, full word coverage, forward/backward identity, Compare return, audio browsing, resize and return-to-audio passed. `/lab/phone` also opened at 390×844 and was captured. Physical iPhone was not directly tested.
- Production desktop fixture-account return: delayed supporting data, delayed server position and a different library book all painted the correct chapter and exact anchor first. Supporting data case: 773 ms; deliberately delayed position case: 4,827 ms; different-book case: 737 ms. These controlled timings are not a general load-time benchmark.
- All 15 production smoke checks passed. Live JS bytes equal the locally deployed bundle.

## Deployment and artifacts

Approved `npm run deploy` succeeded; Worker version `3fba5725-8daa-4aaf-b64c-b12e255c8603`. This was a direct npm deployment, not a GitHub Actions run.

Bundle: `index-4wQbXgWg.js`.
SHA256: `0e08de35342201cccc942da4e5cc63a1a1efe62a7f8d182e179cce6b4da098dd`.

Screenshots, browser results, build/test/deploy logs and bundle comparison:
`/Users/andershvelplund/.codex/visualizations/2026/09/09/tinct-desktop-reader/`

Repeatable checks are `app/scripts/check-desktop-reader.cjs`, `check-desktop-word-sync.cjs`, `check-reader-transitions.cjs` and `check-reader-return.cjs`. Set TEST_ORIGIN=https://tinct.app; desktop engines can be selected with ENGINE=chromium or ENGINE=webkit. Return tests use intercepted fixture-account requests, never a real user's writes.

Word timing limitation: Democracy in America's available narration is Modern English. Viewing Reeve/Bowen while listening to that different wording uses paragraph correspondence; this release does not invent word timestamps for an unrecorded edition. No content, database schema or external dependency changed.
