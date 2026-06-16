# Session Handoff — 2026-06-16 (for Codex review)

Context: Anders switched this session from Codex to Claude. Goal of the session was (1) verify/deploy the in-flight architecture work, (2) fix three reported bugs, then (3) continue the architecture stabilization (slice 4). This doc brings Codex up to speed and lists explicit review asks.

**Prod now:** Worker version `7c31df3e`, all work committed + pushed to `main`. Tests **241 passing** (was 208 at session start). `npm run build` + `verify-bundle` + `smoke-test.sh` (15/15) green.

---

## 1. Starting situation we found

- The reader-controller + worker-split work was **uncommitted in the working tree** and, critically, **not deployed** — prod was running an older bundle (`index-QXN4cukH.js`) that predated all of it. The architecture doc's "deployed version" claim was stale.
- First action: committed the green working tree as logical slices, then deployed. This is what put the reader-controller (focus/visibility adoption, READER_LAYOUT_READY, Read/Compare sync) live for the first time — relevant because several "new" bugs were actually that code reaching prod.

## 2. Bugs fixed (all pre-existing, all deployed)

1. **Reader reloaded on every tab-focus** (`ea27ed49`) — a newly added service-worker `controllerchange → window.location.reload()` in `useOffline.ts`. Removed the forced reload; SW updates apply silently.
2. **Chat re-asked stale questions** — already fixed at API layer (`selectChatRequestHistory` + system prompt). **Chat pane blank while Feed showed history** (`ea27ed49`) — the chat load had been changed to filter to `currentChapter`; reverted to one continuous per-book conversation.
3. **Refresh → chapter start (desktop)** — fixed by the reader-controller restore going live. **Mobile blink/scroll-loop** (`29003878`) — root cause: app shell used `100dvh`, which tracks mobile Safari's collapsing toolbar; every toolbar move re-paginated. Switched `body/#root/.app` to `100svh`.
4. **Existing-highlight popup flashed away on tap** (`85519bd2`) — OS native word-selection after the tap fired `handleMouseUp`, dismissing the just-opened popup. `handleMouseUp` now bails for 600ms after an existing-highlight popup opens.

## 3. Architecture slices

- **Slice 3 — readerSession is the single persisted-tuple source** (`cd96d416`, `4befa64d`, `2dff4b10`, `fef4973a`). Audit found it was ~90% done (position/progress/reading-log already derived from `readerSession.location`). Finished it:
  - New `commitReadingProgress` in `readerSession/positionSync.ts` — single progress-write point; monotonic-only (no dedup/regression guards, those are position semantics).
  - Routed `useReadingPosition` (steady-state) + `useReaderController` (chapter-advance, explicit pre-advance chapter) through it.
  - Guarded `handleBookComplete` by `readerSession.location.bookId` (NOT gated on status — completion must not drop at end-of-book).
  - Documented two intentional bypasses (terminal completion write; fresh-start chapter-1 reset — would be regression-blocked if routed through commit) and two intentionally-excluded paths (sign-in migration writes; `tinct-current-book` pointer writes).
  - New `positionSync.test.ts` pins `commitReadingPosition` + `commitReadingProgress`.

- **Slice 4 — split `Reader.tsx` by behavior** (in progress). Reader.tsx **2,004 → 1,613 lines**. New `app/src/components/reader/` module:
  - `selectionGeometry.ts` (+test) — pure text-geometry helpers + `TextPoint`/`SelectionSegment` types (`420443ab`, `a9f31f43`).
  - `useDefine.ts` (+test) — dictionary popup state/lookups (`ffb80500`).
  - `issueReport.ts` (+test) — issue-report POST + poll (`a362bbfd`).
  - `SelectionPopup.tsx` — the ~230-line selection/highlight popup JSX, now a typed presentational component (`fc8e5dc4`).
  - Removed dead `expandToWord`.

## 4. Mobile Read/Compare sync — the hard area (REVIEW FOCUS)

This area (CLAUDE.md flags it "avoid unless scheduled") produced the session's trickiest bugs. Root architectural issue: **Read and Compare are different editions, paginated differently, but share one saved position** (`savedPos.current` + persisted `position:{bookId}`), stored as `scrollFraction` (edition-specific) + `lastParagraphIndex` (edition-independent). The fraction is wrong for the other edition; the paragraph is the correct cross-edition anchor.

Fixes shipped:
- **Compare-tab flutter** (`4e01da4b`) — when a compare sync signal is present, the Compare reader anchors on the synced paragraph and drops `initialPage=scrollFraction`. Added a `?debug=1` on-screen overlay (`NavDebugOverlay.tsx`) tailing `window.__tinctNavDebug` — needed because mobile has no console.
- **Compare→Read flutter** (`9f83a2b4`) — symmetric fix on the Read reader for `readSyncSignal`.
- **Mobile refresh → chapter start, intermittent** (`ce857383`) — `?debug=1` trace confirmed the scroll-fraction restore (`layout-restore`/`frac-reapply` →page 0) was fighting the paragraph restore (`totalPages-restore` →correct page). The `frac-reapply` effect was the one restore effect not gated on a pending `targetParagraphRef`; added that guard (its two sibling effects already had it). On mobile the paragraph resolve is briefly flaky (`offsetLeft===0` mid-layout), which let the fraction grab page 0.

**Review asks for Codex:**
1. Is anchoring restore on the **paragraph** (and treating `scrollFraction` as a same-edition refinement only) the right long-term model? Should we stop persisting/relying on cross-edition fraction entirely?
2. The `frac-reapply` guard (`ce857383`) — does deferring to `targetParagraphRef` risk a case where the paragraph never resolves (e.g., `tryScrollToParagraph` keeps returning false on `offsetLeft===0`) and we get stuck at page 0? Should there be a timeout fallback to the fraction?
3. The 600ms `handleMouseUp` suppression after a highlight popup (`85519bd2`) — is the window robust across slow devices (Boox)?
4. Verify these fixes didn't regress desktop (desktop reader path was deliberately left untouched).

## 5. Open items

- **Werther is staged-uncommitted in the working tree** (added to `BOOKS` in `bookRegistry.ts` + `libraryTaxonomy.ts`), **not live**. A build-from-working-tree deploy accidentally published it mid-session; reverted prod to committed state and preserved the staging. **Decision needed:** publish properly (commit + deploy) once Werther audio/visual-QA are confirmed, or keep staged. Backup patch at `/tmp/werther-staged-registry.patch`.
  - Gotcha: `npm run deploy` builds from the working tree, so uncommitted staged books get published. The pre-deploy `git stash` check targets untracked imports, not staged content. Worth a guard.
- **Slice 4 remaining:** the two fragile, device-tested chunks of Reader.tsx — the **selection engine** (custom drag/touch handlers, `handleMouseUp`, `handleReaderClick`) → a `useTextSelection` hook, and **pagination** (`recalcPages`, layout effects, `goToPage`, ResizeObserver) → a `usePagination` hook. Both need on-device verification per step.
- **Slice 6 (CSS split)** — not started, optional.
- `?debug=1` overlay (`NavDebugOverlay`) is shipped (gated, invisible to normal users) — remove or keep as a dev tool.

## 6. Verification baseline
```
cd app
npm test -- --run    # 241 passing
npm run build && npm run verify-bundle
./scripts/smoke-test.sh   # 15/15
```
