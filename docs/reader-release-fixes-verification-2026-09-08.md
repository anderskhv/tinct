# Reader release fixes — production verification, 8 September 2026

Source commit: `7ccf81aa`.

## Release

- Approved `npm run deploy` completed successfully.
- Worker version: `020ded52-4345-4dbc-8082-73160826f211`.
- Production bundle: `assets/index-BiWwjcDC.js`.
- SHA256: `facb0cce43c17439bb1536b3b275a9cf185bae7796d875155455b41a6db42f7f`.
- Live HTML references this bundle; downloaded production bytes match the local build.
- Full suite: 140 files, 1,537 tests passed, including the V1 DOM snapshot. Build and bundle verification passed. Generated sitemap restored.
- Changes remain behind the new-reader flag; this does not promote lab to the default experience.

## Production checks

Playwright checks ran on tinct.app at a mobile viewport, including `/lab/phone?chrome=v2`, signed-in library restoration and the full-voice reader navigation link.

- Chapter chat entries collapse behind counts and open directly in normal chat with user questions. The intermediate conversation screen is removed. The library edition-selection page remains.
- Bible book navigation has Old/New Testament tabs, reading/interactions counts and the current-book marker.
- The erroneous Bible chapter 5 conversation was a verified duplicate of an assistant message from War and Peace. The parser rejects only that known misplaced copy. The complete original conversation, including both questions, remains in War and Peace. No cloud records were deleted or rewritten.
- Reading Now paints before the generated recap; first visible shelf measured 691 ms in the final production run. The Finished section includes Symposium. This is one run, not a performance benchmark.
- Both selected edition samples are visible on the page. Changing the primary edition changes its sample. Both button width equals the two-column container width (358 px).
- Ulysses uses the cover artwork and fills the mobile frontispiece without the bottom strip.
- Audio controls: zero before Play, one after Play, both anonymous and signed-in initial reader checks.
- Margin setting changed horizontal padding from 24.8 to 35.2 px; line spacing changed from 40.7296 to 44.5824 px. Three-value preferences use labelled selects.
- Library navigation preserves `chrome=v2&voiceTrial=full`.

## Limits and artifacts

Browser checks blocked account-data writes and paid AI/recap calls. Voice quality was user-verified separately; this pass did not repeat a paid voice call or physical iOS testing. Temporary test authentication was revoked after the signed-in browser run.

Production screenshots are saved locally at:

`/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/reader-release-fixes/`

Files: edition-before.png, cover.png, reader-page.png, settings.png, playing.png, library-signed.png, contents.png, bible-books.png, direct-chat.png.
