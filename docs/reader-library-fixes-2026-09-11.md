# Library and reader fixes — implementation and verification (2026-09-11)

Branch: `claude/reader-library-fixes-20260911`. Plan: `docs/library-reader-fixes-plan-2026-09-11.md`
(brought onto this branch, with its DECISIONS row). Screenshots and measurement
JSON: `docs/verification/reader-library-fixes-2026-09-11/`.

Status: **Part A (the six issues) done and verified.** Part B (tablet layout) is
recorded in its own section below as it lands.

Gates at the Part A push: `npm test` 153 files / 1683 tests green; `npm run build`
and `npm run verify-bundle` pass. (The sandbox has no `.env`; the local build
used placeholder `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` /
`VITE_AUDIO_BASE_URL` values so the bundle verifier's checks have something
to find. Nothing was deployed; the coordinator deploys from a real `.env`.)

Before/after screenshots were taken against two local builds served by a
small static server that mirrors the Worker's lab routing: `main`
(`before-*`) and this branch (`after-*`). The library was seeded as a
signed-out returning reader with five books in progress (the Bible at
Proverbs 18 plus four novels), a boot snapshot, and the poisoned
`tinct:progress:bible` record from the plan (`highestCompletedChapter: 1146`).

## Order of work and commits

Implemented in the plan's order: 6 → 4 → 5 → 2 → 3 → 1, one commit each.

| Issue | Commit |
|---|---|
| 6 KJV audio hold | `test: pin the KJV audio hold release against the census` |
| 4 Bible "97% read" | `library: retire the progress high-water mark; the Bible counts finished chapters` |
| 5 t. button dot / spin | `lab: drop the super button's teal dot; spin once per reader load` |
| 2 title under description | `library: lead the recap caption with the book's title` |
| 3 desktop width | `library: two-column Reading-now section from 1280px` |
| 1 cover flicker | `library: reconcile the recap instead of rebuilding it; boot paints the whole row` |

---

## 6. Audio "temporarily unavailable" for the King James Bible

**Already fixed on `main` before this branch started.** The Bible withdrawal
commit (`19cc4f74`, "Withdraw the Bible modern-en and modern-da editions")
released `bible/kjv-en` and `bible/web-en` from the `missing_audio` hold:
`app/src/data/audioAvailability.json:29-30` lists both under
`eligible_editions`, and `audioAvailability.test.ts` already asserted the
Bible is selectable through KJV and WEB.

What this branch adds is the plan's regression tests, so the hold cannot
come back silently:

- `app/src/data/audioAvailability.test.ts:49` — `isAudioHeld(LAB_AUDIO.bookId,
  LAB_AUDIO.editionKey)` is false: the lab's own default audio source is never
  held.
- `app/src/data/audioAvailability.test.ts:55` — no held edition may have
  ≥90% of its chapters timed in the production census
  (`artifacts/audio-highlight-census-2026-09-11/edition-summary.json`), and
  the census must record the KJV above 99%.

**Decision (deviation from the plan).** The plan's second test was "no
`missing_audio` hold for any edition the census records with `timed > 0`".
That test would fail today for 34 held editions that have *partial*
recordings (1 of 18 chapters, 5 of 41…), where a hold is legitimate. The bug
was a hold on a *nearly complete* edition, so the bar is coverage, not any
timing at all. The best-covered held edition today is ~80%.

`app/scripts/check-audio-availability.cjs:4-5` still asserts the Bible's default
primary edition is `modern-en` and expects the held notice on Play. It is a
one-off Playwright script from the 2026-09-10 hold, referenced nowhere; it is
stale and should be deleted or rewritten by whoever next touches audio
availability. Out of scope here.

Verification: `after-reader-after-play-390x844.png` — `/reader` (Bible, KJV),
Play pressed: no "Audio is temporarily unavailable" status anywhere
(`after-reader-results.json` `notice: []`). Playback itself cannot start in
the sandbox (no R2 access), so `data-playing` stays false in both builds; the
held-edition notice is what the fix is about, and it is absent.

## 4. "97% read" for the Bible at Proverbs 18

Rule (DECISIONS.md, 2026-09-11): position for every book except the Bible;
the Bible uses the paragraph-weighted set of finished chapters plus the
current chapter's fraction. The high-water override is retired.

- `app/public/lab/library-2-model.js:45` `NONLINEAR_BOOK_IDS = {bible}`;
  `:52` `chapterFraction()` (the viewport-independent fraction the old code
  computed inline); `:82` `wholeBookProgress(book, resume, { completed,
  finishedChapters })`. The `progressRecord` parameter and the
  `highestCompletedChapter` branch are gone. Linear: prior chapters +
  fraction. Bible: paragraphs of every finished chapter + fraction of the
  current chapter when it is not itself finished.
- `app/public/lab/catalogue-runtime.js:344` `finishedChaptersFor(bookId)`
  reads the reader's `tinct-lab-position` `finished[bookId]`; `:350`
  `progressFor()` and `:1266` `bookProgress(bookId, place, finishedChapters?)`
  pass it (the recap passes a richer set, below).
- `app/src/preReader/libraryRecap.ts:276` `finishedChaptersForBook()` — the
  position record's list united with completed reading-memory sessions
  visible to the viewer, the same evidence the reader's chapter picker marks
  Finished with (`labChapterStatus.ts`). Every `ReadingListRow` now carries
  `finishedChapters` (`:80`, set at `:377`).
- `app/src/labReadingMemory.ts:232` `progressNote(row)` hands that set to
  `bookProgress`.

Not changed: `app/public/lab/library-2-runtime.js` (the `/lab/library-2/`
prototype). The plan lists its line 221, but that page reads the legacy
record's own `positionPercent ?? percent` and never used the high-water
branch; it is also a classic (non-module) script that cannot import the
model. Left as is.

Tests: `app/src/preReader/library2Model.test.ts` — linear book with a
poisoned record no longer inflates (10%, not 60%); the Bible's shape as a
linear book reads 54.3% at chapter 646 (asserted < 60); the Bible counts
finished chapters paragraph-weighted (Psalm 117 ≠ Psalm 119), does not count
the current chapter twice, and reads <1% for a reader who only jumped to
Hebrews 13 once; an explicit completion mark is still 100.
`app/src/labReadingMemory.recap.test.ts` "N% read under Continue" — end to
end over the real module: finished chapters from the position record *and*
a completed memory session both reach the runtime (`[1, 631, 644]`) and the
note reads "83% read"; with nothing finished it reads "9% read".

Verification: `before-library-*.png` show "97% READ" under Continue for the
seeded reader; `after-library-*.png` show "<1% READ" (the seeded record has
six short finished chapters, ~60 of 6,704 paragraphs — the number the rule
gives, and it can only read low).

## 5. The "t." button's blue dot; spin once per load

- Dot removed: `superHint` state, its effect and the clear in
  `openSuperMenu` (`app/src/lab/LabApp.tsx:3257`) are gone; `hint` prop,
  `has-hint`, `data-hint` and the `.lab-super-stop` span are gone from
  `app/src/lab/LabSuperButton.tsx`; both `.lab-super-stop` CSS blocks are
  gone from `app/src/lab/lab.css`.
- Spin once per reader load: the first-view effect (`LabApp.tsx:3287`
  onward) no longer consults `labSeenOnce(LAB_SUPER_FIRST_VIEW)` and no
  longer persists on end (`:3310` `handleFirstViewEnd`). `superFirstViewRef`
  stays as the per-mount latch; `accountId` left the effect's deps so a late
  auth resolve cannot re-arm it. The audio-playing guard and the 400 ms delay
  are unchanged. `onFirstViewEnd` no longer carries a `seen` argument.
- `LAB_SUPER_FIRST_VIEW` and `LAB_SUPER_MENU_OPENED` are retired
  (`app/src/lab/labPrefs.ts:102`); stale keys in stored prefs are ignored by
  `readLabStoredPrefs`.

Tests: `app/src/lab/LabApp.chromeV2.test.tsx` "the first view" — spins once
per load and again on the next load; does not re-arm when the account
resolves after the spin on the same mount (rerender with an auth token);
reduced motion fades; the teal full stop never renders.
`app/src/lab/LabSuperButton.test.tsx` — ends on first pointerdown and on its
own clock; the mid-morph re-render case now toggles `label` instead of
`hint`.

Verification: `before-reader-super-rest-390x844.png` (teal dot beside the
mark, `data-hint="true"`, stop opacity 1) vs `after-reader-super-rest-390x844.png`
(no dot; `after-reader-results.json` `stop: null`);
`after-reader-super-spin-390x844.png` caught mid-spin (`is-spinning` at 60,
150 and 250 ms after the reader reported ready).

## 2. Recap hero: book title under the description

The title now leads the caption: title → chapter eyebrow → headline → "so
far" block → Continue. `app/src/labReadingMemory.ts:655` `nowCaptionMarkup`;
`app/public/lab/library-boot.js:327` (snapshot paint) and the skeleton paint
below it, in the same order; `app/public/lab/index.html:1288` and `:1294`
size the caption's title as one quiet serif line (17 px / 19 px from 601 px)
rather than the page's 22 px lede. `library-boot.js` cache-buster bumped.

Tests: `labLibraryIndexBoot.test.ts` and `labReadingMemory.recap.test.ts`
assert the caption's child order. The e2e assertions the plan lists
(`e2e/lab-onboarding.spec.ts:473-476, 539, 800-801`) check text by test id,
not order, and still hold.

Verification: `before-library-390x844.png` vs `after-library-390x844.png`
(phone) and the 1440/1920 pairs.

## 3. Desktop: Reading-now row and hero use only the left ~700px

`app/public/lab/index.html:1310` — `@media (min-width:1280px)`: the section
is a `3fr / 2fr` grid; the head spans both columns; the shelf wraps
(`flex-wrap: wrap`, no bleed margins, no snap, 176 px covers); the caption
sits in the right column (h1 42 px, summary `max-width: 60ch`).
`app/src/labReadingMemory.ts:779` `fitNowShelf()` reads the computed
`flexWrap` and marks the shelf `is-grid` + `is-flush` so `observeNowShelf`
and `centreNowItem` stay off (focus comes from clicks); `:801`
`refitNowShelfOnResize` re-measures on `resize` so crossing 1280 px either
way attaches or detaches the scroll-driven focus.

Verification (`*-library-results.json`): at 1440 the shelf was
`x:-10 w:1460` over the caption `y:424 w:1364`; now shelf `x:38 w:780`
beside caption `x:882 w:520`, same `y:200`. At 1920: shelf `w:1068`, caption
`x:1170 w:712`. Phone (390): shelf and caption rectangles identical before
and after (`y:150 h:196` / `y:356`). No horizontal document overflow at any
width.

## 1. Library covers flicker for a returning reader

Measured with a `MutationObserver` on `[data-reading-memory-recap]` installed
before any script runs (`flicker.cjs`, five-book library, boot snapshot
present):

| | cover `<img>` created | cards added | cards removed | shelf rebuilt |
|---|---|---|---|---|
| before (main) | 25 | 25 | 21 | 5 |
| after, reconciler only | 4 | 4 | 0 | 0 |
| after, + boot row | **0** | **0** | **0** | **0** |

Same numbers at 390×844 and 1440×900.

- `app/src/labReadingMemory.ts:871` `renderSections` reconciles instead of
  assigning `innerHTML`: `:566` `reconcileNowShelf` keys `.lib-now-item` by
  `data-now-book`, keeps and moves existing cards, creates only new ones,
  removes only departed ones; `:513` `updateNowItem` writes an attribute only
  when it differs and assigns `img.src`/`srcset` only when the string
  differs; `:590` `reconcileFinishedRows` does the same for Finished; head
  counts are updated in place.
- `:714` the caption is rebuilt only when its markup changes (the boot
  caption never matches, so the first confirmed render replaces it in the
  same shape).
- `:960` the first paint no longer wipes the section: only a viewer
  *change* (`renderedViewer !== undefined`) clears it. The boot DOM stays
  until the local list reconciles into it.
- Boot snapshot paints the whole row: `app/src/lab/labLibraryBoot.ts:41`
  `LabLibraryBootCard`, `:49` cap of 12, `:64` `row` on the snapshot, parsed
  with the same checks as the hero; `snapshotWithReaderPlace` (`:178`) keeps
  the row when the reader leaves, moving an old hero to its front and
  lifting a row book's cover into the hero when the reader steps into it.
  `app/src/labReadingMemory.ts:1044` writes it; `app/public/lab/library-boot.js:288`
  parses and `:295` paints one card per entry, in the confirmed shape.

**Decision (deviation from the plan's step 4).** The plan asked to freeze
the previously rendered order so cloud sync "never reshuffles covers". Not
done. The merge (`accountLabPositionRecord`) only changes order when another
device has a *newer* read, and the existing test "cross-device library
refresh" pins that the hero must switch to that book. Freezing the order
would show yesterday's book as the hero over the one read an hour ago on the
phone. With reconciliation the reorder is one move of existing cards, not a
rebuild — no image reload, no blank frame — and the row stays truthful.

Tests: `labReadingMemory.recap.test.ts` "recap covers do not flicker" — the
boot-painted hero card and its `<img>` are the confirmed card (same node,
`src` untouched), the section is never hidden, only the unpainted card is
added; a repaint with the same data adds/removes nothing; a cloud reorder
moves the Bible's card (same node, new index) rather than recreating it.
`labLibraryBoot.test.ts` — row parsing (no hero, no duplicates, no unsafe
covers, capped at 12; older snapshots parse to an empty row) and the
reader-place fold. `labLibraryIndexBoot.test.ts` — the boot paints both
cards with covers and the right focus.

## Not done / caveats

- No deploy; no `main` merge (coordinator lands the branch).
- e2e Playwright specs were not run (they need the Vite dev server and
  network; the screenshots above were taken with Playwright against static
  builds instead).
- `app/scripts/check-audio-availability.cjs` is stale (see issue 6).
