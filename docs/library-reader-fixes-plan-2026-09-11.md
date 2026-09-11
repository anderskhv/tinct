# Library and reader fixes — investigation and implementation plan (2026-09-11)

Status: **investigation only, nothing implemented.** Anders flagged six issues from
production screenshots (library on phone and desktop, reader top-right corner).
Each was traced to a concrete cause in the code. This document is the handoff so
the fixes can be implemented in a quiet window without re-investigating.

Baseline at time of writing: `npm test` in `app/` passes 1670/1670 on rerun.
One test in `src/preReader/catalogue.test.ts` ("offers only registered editions
backed by chapter assets…") failed once on a cold first run and passed on two
reruns. Treat it as slow/flaky under cold import, not as a regression.

Where the code lives (correction to first assumptions): the library screen is
**not** React `src/lab/LabApp.tsx`. It is the static pre-reader page:

| Piece | File |
|---|---|
| Markup shell + all library CSS | `app/public/lab/index.html` (CSS at ~893–1100 and ~1235–1300) |
| Pre-React boot snapshot painter | `app/public/lab/library-boot.js` (blocking script) |
| Snapshot contract | `app/src/lab/labLibraryBoot.ts` |
| Confirmed render | `app/src/labReadingMemory.ts` |
| List model / sorting | `app/src/preReader/libraryRecap.ts` |
| Progress math (runtime) | `app/public/lab/library-2-model.js`, `library-2-runtime.js`, `catalogue-runtime.js` |

The reader "t." button lives in `app/src/lab/LabSuperButton.tsx` with state in
`app/src/lab/LabApp.tsx`.

Suggested order: **6 (audio) → 4 (progress) → 5 (t. button) → 2 (title) → 3 (desktop width) → 1 (flicker).**
The first three are small, isolated, and high-value. Flicker is the largest change.

---

## 1. Library covers flicker on load for a returning reader

### Root cause
The recap section is rebuilt with `innerHTML` up to five or six times per load,
and each rebuild destroys and recreates every cover `<img>`.

- `src/labReadingMemory.ts:727` — `section.innerHTML = readingNow + finished` in
  `renderSections()`. Every call re-creates all `.lib-cover img` nodes.
- `src/labReadingMemory.ts:747-755` — on **every first load** (`renderedViewer`
  starts `undefined`), `performRender()` does `section.innerHTML = ''` and
  `section.hidden = true`, wiping the boot-painted hero from `library-boot.js`
  before painting the local list. This is the snapshot-to-blank flash.
- Further repaints: `:757-759` after cloud positions load, `:768-773` after the
  Supabase completions query, `:789` on `onMemoryReady`, `:819` after `loadRecap`.
- Order instability: `src/preReader/libraryRecap.ts:353` sorts Reading-now by
  `lastActiveAt`. When the cloud record merges in, times change and covers
  reorder. `nowFocus` and `centreNowItem` (`:719-733`) rerun too, so the shelf
  scroll jumps.
- Boot vs confirmed mismatch: `library-boot.js:272-295` always paints exactly one
  card with `is-single`; the confirmed render paints N cards. Row goes 1 → N →
  possibly reordered N.
- Opacity transitions re-trigger on recreated nodes: `index.html:1276-1277`
  (`.lib-now-item` opacity .55 → 1) and `:1023` (summary text fade).
- Cover source can differ between boot (`coverSrc` from snapshot,
  `labLibraryBoot.ts:88-90` nulls unsafe srcsets) and confirmed render
  (`coverFor()` at `labReadingMemory.ts:216-220`).

### Fix (all in `src/labReadingMemory.ts` unless noted)
1. **Stop wiping on first paint.** At `:747-755`, only clear the section when a
   previously rendered viewer actually changes
   (`renderedViewer !== undefined && renderedViewer !== auth.userId`). Leave the
   boot DOM in place until the first real `renderSections`.
2. **Reconcile instead of `innerHTML`.** In `renderSections` (`:697-733`), key
   `.lib-now-item` nodes by `data-now-book` and `.lib-recap-row` by book id.
   Reuse existing nodes (and their `<img>`), only append/remove/reorder wrappers,
   and only assign `img.src` / `srcset` when the string differs.
3. **Collapse the repaint storm.** Skip `paintList` when the new list is
   equal to `lastList` on (`bookId`, `chapterLabel`, `progress`) sequence.
4. **Stabilise order.** Keep the previously rendered order for books present in
   both lists; only insert genuinely new books. Cloud sync must never reshuffle
   covers under the reader.
5. Optional: boot snapshot paints N cards (not one) so the row count does not
   change on hydration. Requires extending the snapshot in `labLibraryBoot.ts`.

### Verification
- Reproduce first: signed-in account with 3+ Reading-now books, throttled
  network, record a screen capture of `/lab/` load. Count repaints via a
  `MutationObserver` on `[data-reading-memory-recap]` in DevTools.
- After: same capture shows one paint, no reorder, no blank frame.
- Tests: `src/labReadingMemory.recap.test.ts`, `src/lab/labLibraryBoot*.test.ts`,
  `src/preReader/libraryRecap.test.ts`, e2e `e2e/lab-onboarding.spec.ts`.

---

## 2. Recap hero shows the book title under the description

### Root cause
Pure source order. `nowCaptionMarkup` at `src/labReadingMemory.ts:528-532`
renders: eyebrow ("Last time you read · Proverbs 18") → h1 → summary + MORE →
`<p class="lib-lede">The Bible</p>` → Continue button. The boot painter mirrors
it at `library-boot.js:300-316`. `.lib-now-caption` is a flex column
(`index.html:1285`), so moving the node is enough.

### Fix
Recommended: move the title **above the headline** as a small line, keep the
chapter eyebrow. This keeps the `lab-recap-book` test hook and avoids a long
eyebrow wrapping on phones.

- `src/labReadingMemory.ts:528-531` — move the `lib-lede` paragraph to before
  the eyebrow (or render the title as the first eyebrow line and the chapter as
  the second).
- `public/lab/library-boot.js:300, :309` — same reorder so boot paint and
  confirmed paint stay identical (invariant documented in comments at
  `library-boot.js:302-308`).
- `public/lab/library-boot.js:324` and `index.html:49` — skeleton bar order must
  match, otherwise the skeleton reserves a line in the wrong place and the
  hydration jumps (which would add to issue 1).
- Alternative considered: fold the title into the eyebrow
  (`recapEyebrow` at `src/preReader/libraryRecap.ts:104-106`) as
  "LAST TIME YOU READ · THE BIBLE · PROVERBS 18". Rejected as default because
  11px uppercase mono with .16em tracking will wrap at 390px.

### Tests to update
`src/preReader/libraryRecap.test.ts:62`, `src/lab/labLibraryIndexBoot.test.ts:115`,
`e2e/lab-onboarding.spec.ts:473,476,539,800,801`.

---

## 3. Desktop: Reading-now row and hero use only the left ~700px

### Root cause
No page max-width; the constraint is per-element and nothing responds above
1100px:

- `index.html:1276` `.lib-now-item { flex:0 0 124px }` → `148px` at ≥900px
  (`:1295`). No step above that. Three books ≈ 480px on a 1904px row.
- `index.html:1287/:1291` `.lib-now-caption .lib-recap-summary { max-width:52ch → 66ch }`
  (≈700px). This is the width the hero measures.
- `index.html:1061` `.lib-lede { max-width:680px }`.
- Finished and All books scale because of `:1079-1082` (`@media (min-width:1100px)`,
  3-column grids). The library has no breakpoint beyond 1100px.

### Fix
Add a `@media (min-width:1280px)` block beside `index.html:1290-1297` that turns
`.lib-reading-now` into a two-column grid: covers left (wrapping, larger,
~176px), recap caption right (`max-width:60ch`, larger h1). Header spans both
columns. This lines the hero up with the 3-column Finished grid.

Caveats to handle in the same change:
- `.lib-now-shelf` has negative bleed margins (`:1264`) for horizontal scroll;
  zero them in the grid layout or covers bleed under the caption.
- `fitNowShelf()` (`src/labReadingMemory.ts:636-644`) toggles `is-flush` from
  `clientWidth`; `observeNowShelf` (`:652-695`) drives focus from horizontal
  scroll and already bails when `is-flush`. In the wrapped layout give the shelf
  `is-flush` (or a new `is-grid` class) so the IntersectionObserver stays off, and
  make `centreNowItem` (`:731-733`) a no-op there. Focus then comes from clicks.

### Verification
Chromium at 1440, 1920, and 2000px wide plus 390px phone. Screenshots before and
after; phone must be pixel-identical.

---

## 4. "97% read" for the Bible at Proverbs 18

### Root cause (reproduced numerically)
`wholeBookProgress` in `public/lab/library-2-model.js:39-62` takes the **max** of
two candidates: the position-derived paragraph count and a high-water candidate
built from `progressRecord.highestCompletedChapter` (lines 56-60), which counts
*every chapter before the high-water mark* as read.

`tinct:progress:bible` on this account carries `highestCompletedChapter: 1146`
(Hebrews 13). The captured device fixture in
`src/preReader/libraryCompletion.test.ts:13` shows exactly this record
(`highestCompletedChapter: 1146, percent: 96, positionPercent: 72`).

Against `public/data/editions-chapters/bible-modern-en/manifest.json`
(1189 chapters, 6704 paragraphs, Proverbs 18 = chapter 646):

| Candidate | Paragraphs | Percent |
|---|---|---|
| Position at start of Proverbs 18 | 3640 / 6704 | 54.3% |
| High-water chapter 1146 | 6519 / 6704 | 97.2% → "97% read" |

The high-water record is written monotonically by the old reader
(`src/hooks/useReadingPosition.guards.ts:219-258`, `buildReadingProgressUpdate`)
with no per-chapter evidence. One visit to Hebrews claims Genesis→Philemon as
read forever. For a jump-around book like the Bible this is simply false.

The existing repair (`shouldCleanupProgress`, `guards.ts:198-210`) would fire here
but only runs in the old `App.tsx` one-shot behind `tinct:progress-cleanup-v1-done`;
the lab library never runs it, and `supabaseStorage.ts:207` /
`labReadingMemory.ts:768` re-hydrate the poisoned record from the cloud.

### Fix
1. `public/lab/library-2-model.js:56-60` — ignore the high-water override when it
   is not corroborated by the position: skip it when
   `highestCompletedChapter > resume.chapterNumber + 3` and no completion record
   exists. Proverbs 18 then reads 54%; a linear reader (high-water within a
   chapter or two of position) is unchanged.
2. Same guard in `public/lab/library-2-runtime.js:221` (shelf rows).
3. Better follow-up: for books read non-linearly, compute completed units from
   the set of finished chapters (`labFinishedChapterSet`,
   `src/lab/labChapterStatus.ts:56-100`) instead of a prefix slice.
4. Separate follow-up: make the progress cleanup apply to the cloud copy, or
   poisoned records keep returning.

### Regression tests
Extend `src/preReader/library2Model.test.ts`:
- Bible-shaped structure (or scaled 100-chapter analogue), resume at chapter
  646, record `{ highestCompletedChapter: 1146, percent: 96, positionPercent: 72 }`
  → expect ≈54, assert `< 60`.
- Existing linear case at line 34 (`highestCompletedChapter: 3`, resume in
  chapter 2 → 60) must still pass.
- Existing completed case at line 35 (`completed === true` → 100) must still pass.
- Add a `labReadingMemory.recap.test.ts` case asserting the `lab-recap-progress`
  testid reads "54% read" for that stored pair.

---

## 5. The "t." button's blue dot promises something that isn't there; spin once on load instead

### Root cause
The dot is not a notification. It is a **discovery flag**: "you have never
opened this menu on this identity."

- Dot element: `src/lab/LabSuperButton.tsx:186` (`.lab-super-stop`), shown by
  `has-hint` at `:124`; CSS `lab.css:4772-4788` (4.5px teal circle).
- Only writer: `src/lab/LabApp.tsx:3262-3267` sets
  `superHint = !labSeenOnce(LAB_SUPER_MENU_OPENED, accountId)`. Cleared in
  `openSuperMenu` at `:3272-3273`. No wiring to chat, insights, voice, or
  anything book-scoped; `LabSuperMenu.tsx` has no "new" row at all.
- Why it comes back: persistence is identity-keyed (`labPrefs.ts:112-123`).
  `accountId` starts `null` and flips when auth resolves, re-running the effect;
  `super-menu-opened:device` was set but `…:account:<id>` was not, so the dot
  reappears after sign-in or after opening the reader before auth resolved.

The spin already exists and is well built:
- Geometry and timings `src/lab/labSuperGlyph.ts:38-61` (440ms, 405° overshoot,
  400ms first-view delay, reduced-motion fade).
- Keyframes `lab.css:4794-4847`; trigger `LabSuperButton.tsx:94-117` via the
  `firstView` prop; ends on timer or first `pointerdown`.
- Gate `LabApp.tsx:3298-3310`: runs 400ms after layout, skipped while audio
  plays, **and skipped forever once `labSeenOnce(LAB_SUPER_FIRST_VIEW, accountId)`**.
  So today it is once-ever per identity, with the same accountId-flip bug.

### Fix
1. **Remove the dot.** Delete `superHint` state (`LabApp.tsx:418`), the effect
   at `:3262-3267`, the clear in `openSuperMenu` (`:3272-3273`), and the
   `hint={superHint}` prop (`:3536`). Remove the `hint` prop, `has-hint` class,
   `data-hint`, and `.lab-super-stop` span from `LabSuperButton.tsx`
   (`:13-14, :124, :132, :186`) and CSS `lab.css:4772-4788`.
   `LAB_SUPER_MENU_OPENED` in `labPrefs.ts:105` becomes dead. Stale keys in
   stored prefs are ignored by `readLabStoredPrefs`.
2. **Spin once per reader load.** In `LabApp.tsx:3298-3310` drop the
   `labSeenOnce(LAB_SUPER_FIRST_VIEW, …)` guard and the persistence in
   `handleFirstViewEnd` (`:3323-3326`). Keep `superFirstViewRef` as the
   per-mount latch, the audio-playing guard, and the 400ms delay. **Remove
   `accountId` from the effect deps** so a late auth resolve cannot re-arm it.
   `LAB_SUPER_FIRST_VIEW` in `labPrefs.ts:103` becomes dead. The `seen` boolean
   from `onFirstViewEnd` loses its consumer; keep the callback (it clears
   `spinning`) and ignore the argument.

### Tests to update
- `src/lab/LabApp.chromeV2.test.tsx:445-453` "clears the teal full stop…" →
  delete or invert (assert `.lab-super-stop` never renders).
- `src/lab/LabApp.chromeV2.test.tsx:408-429` "spins once … and never again" →
  rewrite as "spins once per reader load": one load spins exactly once, a fresh
  render spins again.
- `src/lab/LabApp.chromeV2.test.tsx:431-444` reduced-motion case → re-scope to
  one load.
- `src/lab/LabSuperButton.test.tsx:79-87` (`seen` semantics) → shrink to
  "ends on first pointerdown".
- `src/lab/LabSuperButton.test.tsx:37-49` uses `hint` toggling to force a
  re-render mid-morph; swap to another prop (e.g. `label`).
- Add: render signed-out, resolve an account, assert the spin does not re-arm.

---

## 6. Audio "temporarily unavailable" for the King James Bible

### Root cause
Not a manifest, R2, or key mismatch at runtime. A **hand-committed hold list**
wrongly marks the KJV as missing audio.

- `src/data/audioAvailability.json:213,219` — `bible/kjv-en` and `bible/web-en`
  held with `missing_audio`; only `bible/modern-en` is eligible (`:29`). The
  file's `basis` cites a "September 10 structural audio audit". No generator
  script for this file exists in the repo; it was produced out-of-tree and
  committed in `b9706eff`.
- The next day's production census (commit `7e101adc`,
  `artifacts/audio-highlight-census-2026-09-11/edition-summary.json`) measures
  KJV at **1178 of 1189 chapters timed, 68.5 audio hours** — the best-covered
  edition in the corpus, better than the `modern-en` edition that was left
  eligible. The most plausible mechanism for the false positive is the audit
  walker's `MISS_RUN_LIMIT = 3` (`tools/audio-highlight/audit_production.py:34`)
  giving up after three scattered gaps.
- Chain: `src/data/audioAvailability.ts:5` `isAudioHeld` →
  `src/lab/LabApp.tsx:388-389` `audioHeld` → `:2903` `startHearing` shows the
  notice → string at `:4136-4137` ("Audio is temporarily unavailable for this
  edition. You can keep reading.") → `:850` `playbackUnavailable` into
  `useLabListen` (hard returns at `useLabListen.ts:216,391,399,421`) →
  settings sheet disables the option (`:4147-4149`, `LabSettingsSheet.tsx:54`) →
  library catalogue flags (`src/preReader/catalogue.ts:294`).
- Edition key is `kjv-en` (`bookRegistry.ts:120-160`), and the lab's own
  hardcoded default audio source is `bible/kjv-en` (`src/lab/labListen.ts:13-17`).
  The hold list contradicts the app's own default.

### Fix
1. In `src/data/audioAvailability.json`: remove the two Bible entries from
   `held_editions`, add `bible/kjv-en` and `bible/web-en` to
   `eligible_editions`, update `basis` to cite the Sept 11 census.
   Counts: held 54 → 52, eligible 147 → 149, total 201 unchanged.
2. Update tests that encode the bug:
   `src/data/audioAvailability.test.ts:13-15` (hardcoded 147/54) and `:35-39`
   ("retains Bible modern while excluding held English…" asserts Bible yields
   exactly `['modern-en']`); `scripts/check-audio-availability.cjs:4` asserts
   the Bible default primary edition is `modern-en`.
3. Add regression tests in `audioAvailability.test.ts`:
   - `isAudioHeld(LAB_AUDIO.bookId, LAB_AUDIO.editionKey)` is `false` (the lab
     default audio source is never held).
   - No `missing_audio` hold for any edition the census file records with
     `timed > 0`.

### Separate finding (not in scope, worth a backlog entry)
The census commit notes that 30 of the 32 English editions without `hasAudio`
in `bookRegistry.ts` do have recordings in production. The registry flag is
stale in the opposite direction and suppresses audio on ~30 editions. That is a
larger reconciliation and should be its own task.

---

## Implementation checklist (when the window opens)

1. Branch from `main`; one commit per issue in the order above.
2. `npm test` after each; run `npm run build` and `npm run verify-bundle` from `app/`.
3. Visual verification per `AGENTS.md`: `/lab/` at 390×844 and at 1920 wide,
   plus the Bible reader with audio started on `kjv-en`.
4. Deploy via `npm run deploy`, then production check on tinct.app.
