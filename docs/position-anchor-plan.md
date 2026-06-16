# Plan — Paragraph-first position anchoring (with content-local intra-paragraph offset)

Status: proposed, for Codex review. Author: Claude. Date: 2026-06-16.

## Context / problem

A book renders in two editions at once (Read = primary, Compare = secondary). The editions are different translations: **different text, different paragraph lengths, different page counts**. Today a single position per book is persisted as a **chapter-level `scrollFraction`** (`currentPage / (totalPages-1)`). That fraction is *layout-specific* — "33% through edition A's pages" ≠ the same spot in edition B, and ≠ the same spot at a different mobile pagination. This was the root cause of the mobile flutter / Compare-fight / chapter-start bugs fought on 2026-06-16.

Already shipped (interim): restore now prefers the **paragraph** anchor (`lastParagraphIndex`) with a timed retry, and the fraction-reapply effect defers to a pending paragraph. That stopped the flutter and the chapter-start loop. This plan makes the model **official and precise**, replacing the half-paragraph/half-fraction patchwork.

Review conclusion we're building on (Codex + Claude agree): **paragraph is the coarse, cross-edition-safe anchor; cross-edition global `scrollFraction` must not be authoritative.** Open refinement Codex raised: paragraph alone is too coarse for **very long paragraphs** (a paragraph can span several pages) → add a **content-local intra-paragraph offset**.

Key distinction (Codex): *global `scrollFraction` is layout-specific; an intra-paragraph offset is content-local.* The error of a content-local anchor is bounded to **one paragraph** instead of the whole chapter.

## The model

Persisted position becomes:

```
chapterNumber + paragraphIndex + charOffset   (+ scrollFraction, demoted to fallback)
```

- **`paragraphIndex`** — coarse anchor. Same paragraph number = same content in any edition. Primary cross-edition anchor.
- **`charOffset`** — integer character offset *within that paragraph's normalized text*. Content-local. Exact within the **same** edition; the basis for the cross-edition fraction.
- **`paragraphFraction`** (derived, not separately stored) — `charOffset / paragraphTextLength`, 0..1. Used for **cross-edition** restore where absolute char offsets don't transfer.
- **`scrollFraction`** — kept, but **demoted**: used only for (a) reading-progress %, (b) the chapter-level regression guards, and (c) a last-resort restore fallback for legacy positions with no paragraph anchor. No longer authoritative for restore.

### Restore decision (in priority order)
1. **Same edition** (`savedPos.editionKey === reader.editionKey`) and `charOffset != null`: resolve `charOffset` → page via the rendered text position. Exact.
2. **Cross edition** (Read↔Compare sync, or restoring into a different edition) and a paragraph anchor exists: `charOffset' = round(paragraphFraction × thisEditionParagraphTextLength)` → resolve → page. Approximate but **bounded to the paragraph**.
3. **Legacy / no intra-paragraph anchor**: scroll to **paragraph start**; if there's no paragraph anchor at all, fall back to the old `scrollFraction`. (Backward compatibility for positions saved before this change.)

In all cases the resolved page is clamped to `[paragraphStartPage, paragraphEndPage]` so the intra-paragraph offset can never escape the paragraph (defense in depth).

## Capture (save side)

Today `Reader.tsx:500-525` reports `onFirstVisibleParagraph(visible[0])` by finding paragraph elements intersecting the current page column. Extend this to also capture the char offset at the **top-left of the visible page**:

- Use `document.caretRangeFromPoint(containerRect.left + pad, containerRect.top + pad)` (viewport coords — the current page is translated to the container's left edge) → `{node, offset}`.
- Map node → its `[data-paragraph-index]` element → `getOffsetWithinParagraph(paragraphEl, node, offset)` (already in `reader/selectionGeometry.ts`) → `charOffset`.
- Report `{ paragraphIndex, charOffset }` instead of just `paragraphIndex` (new callback shape, e.g. `onFirstVisiblePosition`).
- If `caretRangeFromPoint` is unavailable/returns nothing (layout not settled), report `charOffset: undefined` → restore uses the legacy paragraph-start path. Graceful.

`paragraphFraction` is derived at write time: `charOffset / normalizedParagraph(paragraphIndex).length`, stored on the position so the reader doesn't need the source edition's text to do a cross-edition restore.

## Restore (read side)

Extend `tryScrollToParagraph()` in `Reader.tsx` (currently resolves paragraph **start** page) to accept an intra-paragraph target:
- Reader receives new props: `targetCharOffset?` (same-edition exact) and `targetParagraphFraction?` (cross-edition).
- Compute the effective char offset: `targetCharOffset ?? round((targetParagraphFraction ?? 0) × thisParagraphTextLength)`.
- Resolve to a DOM point with `getDomPointForOffset(paragraphEl, effectiveCharOffset)` (already in `selectionGeometry.ts`) → create a `Range` → `getClientRects()` → x → `page = floor(x / (colWidth + gap))`.
- Clamp to the paragraph's `[startPage, endPage]`. Keep the existing `offsetLeft===0` "not-ready" guard + the timed retry shipped in `ce857383`/`253ff037`.

App/`useReaderController` decides which intra-paragraph hint to pass:
- Refresh / same-edition restore from `savedPos`: pass `targetCharOffset` (and editionKey matches).
- Read↔Compare sync (`compareSyncSignal`/`readSyncSignal`): carry `paragraphFraction` (not the global chapter fraction) and pass `targetParagraphFraction`.

## Data-shape changes

- `ReadingPosition` (`src/types/index.ts`): add `charOffset?: number`, `paragraphFraction?: number`. Keep `scrollFraction`, `lastParagraphIndex`. (Cloud value is a JSON blob via `commit_user_data` → **no schema migration**; old rows simply lack the new fields.)
- `ReaderLocation` (`src/readerSession/types.ts`): add `charOffset?: number`, `paragraphFraction?: number` alongside `paragraphIndex`.
- `writer.ts` `positionFromLocation`: pass through `charOffset`/`paragraphFraction`; derive `paragraphFraction` if only `charOffset` present and paragraph length is available.
- `ReaderSyncSignal` (App): carry `paragraphFraction` in addition to `paragraph`.

## Files touched

- `src/components/Reader.tsx` — capture (`~500-525`) + restore (`tryScrollToParagraph` + the timed-retry effect + new target props).
- `src/components/reader/selectionGeometry.ts` — no change expected (reuse `getOffsetWithinParagraph`, `getDomPointForOffset`); add a small pure helper `pageForCharOffset(...)` if it cleans up the Reader.
- `src/types/index.ts`, `src/readerSession/types.ts` — shape additions.
- `src/readerSession/writer.ts`, `src/readerSession/positionSync.ts` — carry new fields.
- `src/App.tsx` — pass `targetCharOffset`/`targetParagraphFraction` to Read + Compare readers; sync signals carry `paragraphFraction`.
- `src/hooks/useReaderController.ts` — seed targets from `savedPos` (charOffset for same edition).

## Tests (write before changing logic)

- `selectionGeometry.test.ts`: a `pageForCharOffset`-style pure resolver (offset → page given a fake layout) — including a long-paragraph-spanning-pages case and clamp-to-span.
- `readerSession` writer/positionSync: `charOffset`/`paragraphFraction` round-trip through `positionFromLocation`; derivation `paragraphFraction = charOffset/len`; legacy position (no charOffset) preserved.
- Restore-decision unit (pure helper): same-edition→charOffset, cross-edition→fraction, legacy→paragraph-start→scrollFraction. Pin the priority order and the paragraph clamp.
- Existing guard suites (`useReadingPosition.guards.test.ts`, `useReaderController.test.ts`, `positionSync.test.ts`) must stay green — progress % and regression guards are unchanged (still chapter-level).

## Verification (device)

After each step, with `?debug=1`:
1. **Mobile refresh** mid-long-paragraph → lands on the right page (not paragraph start, not chapter start); trace shows `paragraph-target →N` (not `frac-*`).
2. **Read↔Compare** both directions, mid-chapter → lands within the same paragraph in the other edition, no flutter.
3. **Desktop** → unchanged (10/31 stays 10/31).
4. **Legacy position** (clear `charOffset` from a stored value) → still restores to paragraph start, no crash.
5. **Cross-device** (desktop → mobile) → mobile lands within the correct paragraph.

## Risks & rollout

- Invariant-heavy + fragile core (the area just stabilized). Mitigate: keep the shipped timed-retry + frac guard; land in small commits, each deployed + device-verified; keep `scrollFraction` as the fallback so a charOffset-resolution failure degrades to today's behavior, never worse.
- `caretRangeFromPoint` differences across engines (Safari/Boox WebView). Capture failures degrade to paragraph-start. Restore never depends on the capture API (uses `getDomPointForOffset`, layout-only).
- No DB migration (JSON blob). Backward + forward compatible (optional fields).

## Open questions for Codex

1. Store **both** `charOffset` and `paragraphFraction`, or store only `charOffset` + paragraph length and derive fraction at read time? (Plan stores `charOffset`, derives + persists `paragraphFraction` for cross-edition convenience.)
2. Is page-granular restore within the correct paragraph sufficient, or do we ever need sub-page scroll precision (continuous scroll mode is not in play; reader is paginated)?
3. Should the chapter-level `scrollFraction` eventually be dropped from the persisted shape once enough clients have re-saved with `charOffset`, or kept indefinitely as the legacy fallback?
4. Capture cadence: compute `charOffset` on every position write (heartbeat/page-change), or only on settled layout to avoid `caretRangeFromPoint` noise? (Plan: only when layout is settled; else omit.)
