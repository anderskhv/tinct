# Cross-device library and resume — 9 September 2026

Anders reported five Reading-now books on mobile but only two on desktop, with desktop resuming Proverbs 17 instead of Democracy in America. A read-only inspection of the active account's server position record found all five books and Democracy in America as the latest settled book. No real account record was modified.

## Traced paths and changes

- The library painted local positions first, then preserved that automatically focused cover after cloud reconciliation. Only a deliberately selected cover now survives the update; the default Continue follows the latest confirmed account book.
- Continue could open while a local preview was visible and the position request was still pending. It now waits for that request's verdict, independently of optional recap generation. Explicit book selection remains explicit.
- Existing library tabs did not refresh on focus/visibility return. They now do. Repeated auth/catalogue/focus refreshes also replayed an older local list over a newer confirmed list; the local preview is now used only for initial/account-change rendering.
- A reader library handoff disabled the account GET completely. It now merges the account's inventory without redirecting the explicitly chosen book or page. Ordinary reader reconciliation retains other books' pins while preserving chapter validation for the resume destination.
- Continue omitted the saved word within a paragraph. The optional validated word index now passes through the existing handoff and reader restore. No database schema or dependency changes.
- Desktop side navigation retains its glass pills and placement, with centered SVG chevrons replacing font glyphs. Mobile navigation and pagination are unchanged.

## Verification

Full suite: 146 files / 1,584 tests passed. Focused library refresh regression also holds the cloud request to ensure a confirmed list is not replaced by the older local preview. Build and bundle verification passed before commit.

`app/scripts/check-library-cross-device.cjs` exercises real library/reader code and book data with isolated fixture accounts. All account, AI and audio API calls are intercepted; no model call or real account write is made. Chrome desktop and WebKit mobile checks cover a stale two-book local record against five cloud books, Continue during a pending cloud request, returning to an open library, direct reader restore, and deliberately choosing the Bible while the account's latest book is Democracy in America. Both resume paths retain the saved paragraph/word. The desktop SVG centers are measured against their button centers. Five repeated mobile library-return runs passed after tracing and removing the stale local repaint.

Existing WebKit reader-return regression passed: delayed supporting data, a four-second position response, and a different-book resume all paint the correct saved position first.

## Production release

Shipped from clean code commit `8d47a85b` using Node 24 and the approved `npm run deploy` path, which repeated build and bundle verification successfully. This was a direct deployment; no GitHub Actions run was created for it.

- Worker version: `7a239b79-1a30-45e9-a719-84305962911a`.
- Live bundle: `index-DfSjHtrX.js`.
- SHA256: `808b4dbf5955ac1cda25e2d65182d052db9db3ce7855aa80be2e815eb55ede87`.
- Downloaded production reader bundle, `lab/reading-memory.js`, and `lab/catalogue-runtime.js` match the deployed build byte for byte.
- All four cross-device scenarios passed on **tinct.app** in Chrome 1440×1000 and WebKit 390×844: five books, latest-book restore, exact paragraph/word, explicit Bible selection, and continued account synchronization after handoff. Desktop SVG centering passed.
- **15/15 production smoke checks passed**. The legacy `/lab/phone` entry was opened and captured in addition to the current `/reader` checks.

Walkthrough screenshots, fixture results and deployment/smoke logs:
`/Users/andershvelplund/.codex/visualizations/2026/09/09/tinct-library-sync/`

These are real production frontend/browser checks with intercepted account records, plus the earlier read-only real-account server inspection. The user's actual desktop browser state and a physical iPhone were not inspected; no claim is made that every historical client state was recovered. Existing server-side position records were left intact.
