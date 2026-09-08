# V2 contents — implementation and production verification

The approved contents design is live behind `?chrome=v2`. Implementation commit: `d2357bf2`.

Mobile keeps the book chooser, numeric chapter jump, filters and actual reading-location footer fixed around a scrolling list. Desktop uses a compact left panel with no background blur. Ordinary books retain their own chapter titles.

Search retrieves the whole selected edition through the existing edition loader and searches passage text, chapter references, conversations and scoped highlights. Pending or unavailable text/history is explicit. Opening a result restores its paragraph and word; reopening contents restores the prior search/filter/list position. Continuing an older conversation restores its source chapter, reveals that exact conversation in chat, and appends future turns to the selected stored thread.

New V2 highlights record their book and edition. Older source-less marks and notes remain preserved separately, as Anders requested; no book or edition has been inferred for them.

## Verification

- Full Vitest suite: **138 files, 1,520 tests passed**, including the V1 DOM snapshot.
- `CI=1 npm run build` and `npm run verify-bundle`: passed.
- Clean committed checkout deployed with `CI=1 npm run deploy` using Node 24. Sitemap restored afterwards.
- Worker version: `300bb2b7-5149-476f-be60-cabcb0516402`.
- Live bundle: `assets/index-B7fyK7gw.js`; downloaded bytes exactly match the deployed local artifact.
- SHA-256: `cf47e84d2548f4ae6f8eaede3f7f1b4f1bf8e47040802c7e3ba8ddab85afa580`.
- The optional whole-repo TypeScript check still reports the known baseline errors; no new contents, highlight-hook, chat-history or ask-pane errors were reported.

Real Chromium checks passed on both localhost and `https://tinct.app/lab/phone?chrome=v2`, plus the desktop route:

1. Numeric Genesis 44 jump; book and chapter-range browsing leave persisted position unchanged and the footer at the actual reading location.
2. An older conversation beyond the initial 40-message window opens at its correct Genesis 42 source and shows the selected question.
3. Returning from chat restores the same contents query; returning from a conversation preview restores list scroll.
4. Whole-edition “firmament” search opens Genesis 1 paragraph 1, word 8, rather than chapter start.
5. A saved highlight opens Genesis 44 paragraph 6, word 0.
6. Unknown older highlight notes remain in their separate view.
7. No horizontal overflow at 320px; dark appearance inspected; Escape closes and restores focus to the chapter pill.
8. Desktop panel is compact and left aligned, with the underlying text visible. No browser page errors.

The browser checks use a fresh, isolated profile seeded with clearly synthetic local chat/highlight records. They do not modify the user's browser storage or send chat requests. Authenticated cloud history and actual typed follow-up requests were not exercised live; storage continuation, cloud-failure preservation and wrong-book rejection have regression coverage.

## Artifacts and repeatability

Artifacts directory:
`/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/contents-v2/`

- `production/report.json`: browser assertions and errors.
- `production/contents.png`, `chats.png`, `conversation.png`, `continued-chat.png`, `search.png`, `search-320.png`, `older-dark-320.png`, `desktop.png`.
- `deployment.json`: live bundle identity and digest.
- `browser-check.cjs`: repeatable browser scenario, run from `app/` with Node 24: `node /absolute/path/browser-check.cjs https://tinct.app /absolute/output/directory`.

The voice trial remains optional and the main reader is unchanged. See `voice-direct-trial-2026-09-08.md` for the full/Mini comparison and remaining physical-microphone/mobile checks.
