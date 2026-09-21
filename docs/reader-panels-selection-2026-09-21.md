# Desktop and mobile reader polish — 2026-09-21

Status: deployed and production-verified on September 21, 2026.
Merged [PR 122](https://github.com/anderskhv/tinct/pull/122): `e8cb75ab89029fa5727e08011eca190e2acb150a`.
Baseline: `c771b3349f5f0f9c6236756b02bdb63fec2838a9`.

## Approved scope

- Shared desktop drag behaviour for Chat, Talk, Explain, Define and Reading settings. Chat/Talk minimize and restore; text remains selectable and small selection menus stay anchored. Windows stay inside the viewport and default clear of page arrows. Mobile remains a sheet/card interface.
- Stable highlighting without layout movement; easier final-word capture on both platforms; preserve continuous verse bands and cross-page selection; paint a trailing hyphenated fragment while selecting; remove the edge hint.
- Explain expands only to its text (bounded by the viewport and one desktop leaf), with visible close, unobstructed scrollbar, theme-coloured More/Less and a highlight-colour action.
- Dictionary misses use lexical Define UI; connect the shipped archaic supplement, normalize words and retry failed asset fetches. Generated definitions have subtle AI provenance.
- Diagnose Talk stopping after one answer independently of dictation. Keep the Grok model/prompt, instrument capture and correct lifecycle failures; exercise repeated turns, interruption, mute and restart.
- Align the mobile header with reading margins; use the book font for its small progress footer. Match desktop frame colour to the page, add a subtle centre gutter shadow.
- Full library in the book-title switcher on both layouts. Desktop progress toggles percent of book/chapter. Comparison label is **Tinct Modern English**; distinguish edition labels from page folios.
- Keep desktop settings fully reachable, remove helper copy and divider artefacts. Three bounded sliders with editable decimal-comma values and Restore defaults. Preserve edition, position and user data.

## Failure classes and scope

Highlight-only letter spacing changed the geometry around verse markers. Nearest-word picking used a wrapped word's combined bounding rectangle. Page-edge decoration had no selection paint. These are shared rendering/selection paths across books and editions.

Dictionary shard failures were permanently cached as misses, and the shipped archaic supplement was never loaded. The main word list does not contain “these”; missing entries must remain definitions, not chapter explanations.

Voice capture exceptions were swallowed, so a dead graph could claim to be listening. Worklet registration was repeated on the same audio context after restarting. A late cancellation completion could clear the next response. Capture recovery and response identity now have independent regressions; the user's precise device failure was not reproduced.


## Verification and release — September 21

All authoring, tests and builds used GitHub/Actions on Node 24.13.0. The historical Documents checkout was not changed. Local temporary files contain only downloaded cloud QA artifacts.

- [Candidate acceptance](https://github.com/anderskhv/tinct/actions/runs/35578585953) passed every job. [Final acceptance](https://github.com/anderskhv/tinct/actions/runs/35579348664) additionally required fresh spoken audio after same-page restart.
- [Production deployment and acceptance](https://github.com/anderskhv/tinct/actions/runs/35579840357) passed. It ran `npm test`, then the approved `npm run deploy` path, including build and bundle verification.
- Production tests: **2,521 passed, one skipped**, across 199 passing test files and one skipped file.
- Served bundle: **`/assets/index-A51kguxB.js`**. The release compared its bytes with the built bundle, passed the production smoke test, and asserted the exact bundle in desktop and phone browser checks.
- All six Chromium/WebKit reader cases passed on tinct.app, including `/lab/phone` at 390×844. They covered character geometry during selection and saved highlights, Explain sizing/close/highlight, lexical Define fallback, window dragging/resizing/minimizing/restoring, header bounds, menus above companions, numeric settings and reading-position preservation, all themes, library navigation and **Tinct Modern English** comparison labels.
- Live Grok acceptance passed dictation-to-Talk ownership handoff, a complete spoken answer returning to listening, three turns, interruption, mute/unmute, minimize/restore, End cleanup, and fresh spoken audio after restarting on the same page.
- Production library/preparation, responsive landing/library and hyphenation acceptance passed. Existing book, edition, chapter, copy/accessibility and logical-word ownership checks remain in place.

The window review found inherited docked dimensions overriding floating sizes and menus falling behind companions. Shared bounds now reserve the header, while companions remain below menus. Both browsers exercise an upper-edge drag and opening Settings while Chat is present.

## Evidence and limits

Durable screenshots and reports are in the deployment's `reader-panels-acceptance` and `production-library-preparation` artifacts. The [reader artifact](https://github.com/anderskhv/tinct/actions/runs/35579840357/artifacts/10629444492) contains all six reader cases. Local inspected copies are under `/tmp/tinct-production-reader` and `/tmp/tinct-production-voice/voice-capture`.

Dictionary and Explain browser replies are fixtures; no Anthropic development calls were made. Grok uses the real provider with a synthetic microphone and muted playback. Dictation uses a SpeechRecognition lifecycle fixture. Cloud WebKit/phone viewports do not establish physical iPhone touch, Safari browser chrome, Bluetooth routing or speaker-echo behaviour. The supplied X video could not be fetched (403); the windows follow the approved written interaction requirements.

The precise device-specific “stuck Listening” report remains unproven. Capture diagnostics now expose frame age, sent chunks, context/track/socket state without recording speech or credentials; capture failures show reconnect recovery instead of silently claiming to listen. Live acceptance measured first audio at 344 and 627 ms after the provider's speech-ended event, and 626 ms after same-page restart. These controlled cloud measurements are not a real-device latency promise.

No further implementation or automated release-acceptance work remains for this batch. If the physical-device issue recurs, the next action is to capture those state counters and reproduce the device/routing condition before changing prompts or models.

## Full-height book fold follow-up — September 21

Anders reported that the new gutter stops abruptly at the text height and approved a softer, full-page book treatment. The failure class affects desktop Read, Compare and chapter-end spreads: decoration was attached to content-sized columns. The released follow-up moves it to the complete sheet, uses a broader graduated shadow with a quiet reflected edge, and adds soft exterior depth. It changes no source, text dimensions, pagination, position or phone layout.

[PR 126](https://github.com/anderskhv/tinct/pull/126) released commit `aab4afa15d058187a10f3851cc746cdeead5d554`. [Candidate verification](https://github.com/anderskhv/tinct/actions/runs/35582184901) passed all jobs, including 2,524 tests (one skipped), build, bundle verification and documentation checks. [Production deployment and acceptance](https://github.com/anderskhv/tinct/actions/runs/35583181920) passed the approved deploy path, exact served-bundle check, smoke test and all eight reader browser cases. Served bundle: `/assets/index-CktdYZkp.js`.

Cloud Chromium and WebKit exercised Matthew 6 through its actual final page, full-height fold geometry in Read/Compare, unchanged character rectangles with decoration toggled, chapter/position retention, and book/light/dark screenshots. Existing phone acceptance at 390×844 also passed. Screenshots were visually inspected; the fold spans the complete 784px sheet interior, including the top and bottom margins, even when the chapter-end leaf has little or no text.

[Production screenshots and report](https://github.com/anderskhv/tinct/actions/runs/35583181920/artifacts/10630792961) are the durable evidence; inspected temporary copies are in `/tmp/tinct-fold-production`. This is a CSS paint-only change. It adds no page-turn animation, content, position writer or mobile decoration. Browser fixtures and physical-device verification limits above still apply. No further implementation work remains for this visual follow-up; the linked production run records the broader release checks.


## Selection, centre divider and Design 1 contents — September 21 follow-up

Approved scope: saved-highlight controls on every desktop word, Ctrl/Cmd+C for custom selections, retained phone selection paint, a headword-only Define heading, a visible dark fold, distinct ruled Compare divider, and the final Design 1 TOC. The [approved reference](verification/reader-design1-2026-09-21/chapter-picker-approved.html) is preserved unchanged from the Design 1 task, including its explicitly illustrative data.

Failure classes traced: selection paint inferred the physical column from edition-key equality (wrong when primary and comparison share an edition); custom pointer ranges clear the native browser selection, leaving keyboard Copy with no range; multi-paragraph saved ranges incorrectly clamped their end word against the first paragraph's start. The existing saved-highlight lookup already gives controls precedence; browser acceptance now exercises first/middle/last words and projected comparison marks rather than assuming that protection works.

Implementation: explicit physical selection side, scoped keyboard/browser Copy without overriding editable or native selections, headword in the draggable definition header, full-height dark fold and separate labelled Compare rules. Contents follows the approved compact tree, single-line expandable title, Search then Highlights, continuous vector progress, gold current ancestry, rounded branch ends and opaque pinned breadcrumbs. Real manifest sections, progress, book-scoped conversations and highlights drive the UI. Unknown progress is not fabricated. Chapter/passage actions retain existing navigation writers.

[PR 128](https://github.com/anderskhv/tinct/pull/128) merged as `6c536d9eb1300484dc9b9a41ae6cfc4a122e3e0b`. [Final candidate verification](https://github.com/anderskhv/tinct/actions/runs/35588972232) passed all jobs: **2,533 tests passed, one skipped**, build, bundle verification, documentation checks and all **12** muted Chromium/WebKit reader cases. Library/preparation, hyphenation, responsive entry surfaces and the isolated featured preview also passed.

[Production deployment and reader acceptance](https://github.com/anderskhv/tinct/actions/runs/35589828795) used the approved `npm run deploy` path. The served bundle **`/assets/index-DIuP-7hv.js`** matched the built bytes; the smoke test and all 12 reader cases passed on tinct.app, including `/lab/phone` at 390×844. The exact served bundle was asserted in both browser engines. [Production screenshots and report](https://github.com/anderskhv/tinct/actions/runs/35589828795/artifacts/10633799741) are durable evidence; inspected temporary copies are under `/tmp/tinct-design1-production`.

Screenshots were inspected against the preserved reference, including Bible ancestry and Psalm 119 scroll position, Notes parts, Frederick Douglass's long title and Chapters branch, same-edition phone selection paint, definitions, and the dark fold/ruled comparison divider. Actual book metadata, reading progress and saved records replace the prototype's clearly illustrative data. Font metrics may determine whether a title fits or ellipsizes; its single-line bounds and full-title reveal are checked in both engines.

Phone viewport checks do not establish physical iPhone touch or Safari browser-chrome behaviour. Clipboard API calls are captured in the silent browser tests; unit tests also cover native Copy events and preserve editable/native selections. Search/definition replies remain fixtures; no paid Anthropic calls were made. No unresolved implementation cases remain in this follow-up; physical-device differences would require a fresh reproducible report.

Integration detail: the existing Cover/preparation shortcut moves to the book-title switcher, keeping the approved TOC header and tree unchanged. The same Talk/Chat preparation flows retain regression coverage. Inter is self-hosted from rsms/inter commit `353b61b9f4430d5f420d56605a6e7993e0941470` with its SIL OFL license; no runtime font-service dependency is added.
