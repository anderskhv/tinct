# Reader transitions and chat composer — 9 September 2026

## Report and root causes

Anders supplied iPhone Safari screenshots of Jeremiah 43–44 after play/pause, page turns and Compare: interior pages with two lines, chapter-load line flicker, wasted space, and an unusable single-line chat field. He requested reproduction, root-cause fixes and deployment.

Reproduced on production in Playwright WebKit at 393×664 (the available reading area with Safari's browser chrome). After play/pause, the next page contained only “Hoshaiah, and Johanan.” The native chapter map was split at saved/audio/Compare anchors without reflowing the rest of the chapter. Each leftover fragment became a separate page. September 8's removal of expensive per-page growth exposed these fragments; its Republic forward/backward test did not cover audio or Compare transitions.

Instrumentation additionally identified a paused page turn hiding the transport and changing the available height, stale transport anchors overriding navigation, and audio notices changing passage bottom padding. The initial estimated map could paint before the incoming chapter's native measurement was ready.

## Changes and rationale

- Keep the browser's full chapter map authoritative. Locate the natural page containing the saved word or mapped Compare verse; do not split measured pages at anchors. Exact primary reading/audio tuples remain separate from page boundaries and are preserved.
- Keep the paused transport visible during page turns. A small close button explicitly dismisses it, preserving the reading word within the newly sized page. Audio and notice states use consistent passage padding.
- Ignore native results for outgoing chapter/edition content. Hold incoming estimated text invisible until its native map is ready. While browsing away from playing audio, accept new geometry using the browsing anchor, not the audio word.
- Reduce phone top/headline padding and keep modest bottom clearance. Retain the overflow guard and the fast page-turn path; no restored word-by-word growth loop.
- V2 uses a full-width growing textarea above grouped 44px dictation, voice and Send controls. Enter inserts a line; Ctrl/Cmd+Enter or Send submits. Voice remains reachable while writing. Small copy buttons copy complete user and assistant message contents.
- V1 chat rendering and CSS remain unchanged. No database, dependencies, voice models, or reader-position persistence schema changes.

## Microphone audit

VoiceSessionController calls getUserMedia once per session start, after the auth gate, and stops tracks on session end/cancellation. It does not request access at reader boot or when opening/closing the transcript. Added a regression covering call → transcript → multiline drafting → call → end with one request. No microphone is kept open to suppress prompts.

Safari owns persistent permissions. Apple documents per-site exceptions through Page Menu → More → Website Settings For → Microphone → Allow: https://support.apple.com/guide/iphone/browse-the-web-privately-iphb01fc3c85/ios . Headless WebKit does not reproduce the physical iPhone OS permission sheet; API call behavior is tested, not OS permission persistence.

## Local verification

- 141 test files, 1,558 tests passed. Build and verify-bundle passed; bundle `index-CyQEYe5M.js`.
- New `app/scripts/check-reader-transitions.cjs` uses real chapter text and actual audiobook playback, verifies every word exactly once through each chapter, backward page identity, stable post-paint boundaries, no tiny interior pages, Compare/Read position preservation and explicit transport close. WebKit and Chromium passed Jeremiah 43 (473 tokens) and 44 (1,258 tokens). WebKit also passed browsing while audio continues, viewport resize and Back to audio.
- WebKit post-pause pages: Jeremiah 43, 9 pages, 35–63 words; Jeremiah 44, 23 pages, 23–65 words. Compare pages: 64 and 51 words. Chromium: 10 and 24 pages (engine-dependent font layout), no missing/repeated words.
- Existing Republic page-turn regression passes at 4× CPU throttle: median 150ms, no animation, stable forward/backward pages.
- WebKit composer at 393×390 simulated keyboard viewport: multiline text visible, controls visible, composer within viewport. Clipboard content covered by unit tests. This is not a physical iPhone keyboard test.

## Release

Deployed code commit `9600aa76` using `npm run deploy` from the clean shipping worktree with Node 24. Deploy succeeded: Worker `391d12cc-a7d8-45a2-b1ff-96dd59eef9b5`.

Production entry bundle: `index-D-CDcviP.js`; live/local SHA256 both `f74b217cb5f10ef42c191025b9d01e10d8557a87d59e8b959a6f2c017b605afe`. The production HTML points to that bundle.

The full transition regression passed on **tinct.app** in WebKit and Chromium, including complete chapters, forward/backward stability, Compare return, paused transport close, browsing during playback, resize and Back to audio. Live composer verification passed with the simulated keyboard viewport. Additional visual smoke checks passed at 390×844 on `/lab/phone?chrome=v2` and 1440×900 on `/reader` in dark theme.

All 15 production smoke checks passed. The smoke script had stale expectations for the old landing title and `/app` SPA route (now a redirect to `/library`), and assumed auth configuration lived in the entry bundle. Updated it to check `/reader`, accept the current JS prefix and inspect the reachable static import graph just as verify-bundle does. These are QA script updates only; the deployed reader code is unchanged.

Artifacts: `/Users/andershvelplund/.codex/visualizations/2026/09/09/tinct-reader-stability/` — `webkit-788-compare.png`, `webkit-789-closed.png`, `phone-844.png`, `desktop.png`, `production-composer-empty.png`, `production-composer-typing.png`, and both browser result JSON files. Physical iPhone permission sheets/keyboard remain a stated test limitation, not a claimed reproduction.
