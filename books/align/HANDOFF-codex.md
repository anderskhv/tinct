# Handoff to Codex — precise mobile compare flip

Status: **draft for Anders' approval.** Two separate release decisions:
(1) shipping the reader infrastructure with fallback behaviour (can proceed:
with no approved alignment files it behaves as today, plus full-page
start/end mapping from verse markers and proportional fallback), and
(2) enabling alignment data for any book, which stays gated on an agreed
release standard and a per-book `approved` record. Data is in pilot; nothing here is
scheduled yet. All preparation lives under `books/align/`; app integration is
Codex's. No app files were changed.

## Revised recommendation (2026-09-24, after the human sample): smallest robust change

Mobile compare is not a separate view: `handleMobileCompare`
(`app/src/lab/LabApp.tsx` ~2960) swaps the whole paginated reader to the other
edition at a mapped start word, and flipping back uses the same mapping
(`mapLabCompareAnchor`). Selection, highlights, bookmarks, position and audio
therefore already work in compare. Keep that. **This supersedes the scrolling
passage view described below**; the data contract and fallback rules still
apply.

1. **Better start mapping, one function.** `mapLabCompareAnchor` first looks
   the anchor up in the paragraph's alignment segments (approved, fingerprint-
   matched files only) and returns the counterpart segment's start; `u` blocks
   map to the block start; otherwise today's verse/proportional logic. Used in
   both directions, so flipping back is symmetric.
2. **Map the page end too.** Map the main page's last word the same way and
   draw one quiet marker in the compare edition where the corresponding
   passage ends ("end of your page"). If start-to-end fits on one compare
   page, also split the compare pages at that end (`splitLabPagesAtAnchor`
   already exists), so the page shows exactly the passage. If it does not fit,
   the reader's normal pagination continues it on the next page and the marker
   shows where to stop. No shrinking, no new scroll surface, font size
   untouched.
3. **Long units (e.g. Douglass 11/5, 217 words).** A long correct unit is
   shown whole; the marker sits at its true end. Never mark positions inside a
   unit that the data cannot support. Finer clause units are a data change
   (below), not a display trick.
4. Alignment never crosses paragraphs, so speaker changes, stage directions
   and verse lines (each their own paragraph, `-lines.json` for verse) are
   never merged.

Data follow-up for long units: allow a split point inside a whitespace token,
because em-dash-joined words ("prey!—I say", "subsist,—I say") make the correct
clause boundary unreachable with word offsets. Proposed: a boundary may be
`[wordIndex, utf16Offset]` instead of a bare word index (format version 2).
Only reviewer-verified clause correspondences; never split mechanically at
punctuation or divide each edition independently.

## Problem

The mobile compare flip maps only the main page's *first word*, then fills a
normal page of the compare edition from there
(`app/src/lab/labCompare.ts` → `mapLabCompareAnchor`, `splitLabPagesAtAnchor`).

1. The end is unmapped: the compare page ends wherever the screen fills.
   Proverbs 15 in KJV runs out at verse 15 while the WEB page reached verse 16,
   so a reader who flips while reading the bottom of the page loses that text.
2. Inside a long paragraph the start is a proportional guess. Hamlet 1.3:
   the main page starts at "goes withal", the compare page starts about five
   verse lines earlier.

## Behaviour to build

**Main page is always the source of truth.** Compare shows *the passage
equivalent to one main page*; it never becomes an independent position.

1. **Map both ends.** Map the main page's first and last word into the compare
   edition. The compare view shows everything from the mapped start to the
   mapped end.
2. **Keep the reader's font size.** Never shrink type to fit. If the passage is
   taller than the viewport, the compare view scrolls vertically (subtle
   bottom fade as a scroll hint). If it's shorter, leave white space below.
3. **Fade only extra context.** Text that corresponds to the main page is
   full strength, always. Anything shown beyond it (e.g. the remainder of a
   verse or segment before the mapped start, kept for orientation) is dimmed.
   Never dim text that belongs to the requested passage.
4. **Swipe in compare** advances/retreats the *main* page cursor and shows
   that page's equivalent passage. Flipping back shows the main page that
   matches the passage on screen.
5. **Position.** Viewing compare never changes what is persisted as the
   reading position beyond the main-page cursor movement in (4). Follow the
   Invariants in `CLAUDE.md` (ReaderSession tuple, `writeSuspended`, etc.).

### How to map an endpoint

Given a main-edition word `(chapter, paragraph, word)`:

- **Paragraph has an alignment entry** (file valid, see below). Find the
  segment containing the word on the main side (use the source columns if the
  main edition is the file's `source`, the target columns if it is the file's
  `target`: the data is symmetric).
  - `"m"`: the counterpart span. A start endpoint takes the counterpart's
    start; an end endpoint takes the counterpart's end.
  - **Edge segments.** The main page often starts or ends partway through a
    segment. If the main page covers at least half of that segment's words,
    its counterpart is part of the passage (full strength). If it covers less,
    the counterpart is shown as faded context, and the passage starts at the
    next segment (or ends at the previous one).
  - `"u"` (unresolved block): take the whole counterpart block (start → its
    start, end → its end). Optionally mark it "approximate". Never
    interpolate inside it as if it were exact.
  - `"s"` / `"t"` one-sided material on the *main* side: no counterpart.
    Snap: start endpoint → next segment's counterpart start; end endpoint →
    previous segment's counterpart end. One-sided material on the *compare*
    side that falls between the mapped ends is shown full strength.
- **No entry** (paragraph under 100 words, or no valid file): today's
  behaviour: verse markers when present, else proportional position within
  the paragraph. Apply the same function to the end endpoint.

## Data contract (format version 1)

Pilot files: `books/align/data/{bookId}-align.json`. On integration Codex decides
the served location (suggested: `app/public/data/editions/{bookId}-align.json`,
fetched lazily like `{bookId}-lines.json` and cached for offline).

```json
{
  "format": "tinct-edition-align",
  "version": 1,
  "bookId": "hamlet",
  "source": {"edition": "original-en", "sha256": "<sha256 of served file>"},
  "target": {"edition": "modern-en",   "sha256": "<sha256 of served file>"},
  "offsets": "word index into a whitespace split of the served paragraph; segments are half-open [from, to)",
  "location": "chapters[chapter.number][0-based paragraph index]",
  "minWords": 100,
  "reviewState": "first-pass | reviewed",
  "counts": {"auto": 44, "auto-flagged": 1, "model": 20, "human": 0},
  "approved": null,
  "chapters": {
    "3": {
      "5": {
        "status": "model",
        "segments": [["m",0,1,0,1], ["m",1,5,1,7], ["u",5,32,7,25], ["s",32,40], ["t",25,29]]
      }
    }
  }
}
```

- **Offsets:** word index = position in `text.split(/\s+/)` of the served
  paragraph string (the same token space as `tokenizeHearingWords`; underscore
  emphasis stripping never changes token count).
- **Segments** tile both paragraphs exactly, in order: `m` = match,
  `u` = unresolved block, `s` = source-only, `t` = target-only.
- **Paragraph status:** `auto` (first pass, unreviewed), `auto-flagged`
  (first pass with `u` blocks), `model` (model-reviewed), `human`.

### Fallback rules (must all hold, else use today's behaviour)

1. `format` and `version` recognised.
2. Both `sha256` values equal the sha256 of the served edition files the
   reader has loaded. Any editorial correction therefore disables the file
   until it is regenerated: it degrades to today's behaviour, never to wrong
   matches. (Paragraph-level fingerprints may come later.)
3. `approved` is non-null. Unapproved pilot data must never reach readers.
   When set it is an object recording the evidence (`by`, `date`, `basis`,
   `sampleFile`), e.g. a human sample plus model review. It never means every
   passage was verified, so the runtime checks below still apply.
4. The paragraph has an entry, and its segments tile the live paragraph's
   word counts (cheap runtime check; on mismatch, fall back for that paragraph).

## Later: "Show in [edition]" (selection menu)

Not in the first build; listed so the data model supports it.

- Phrase selection menu gains **"Show in [edition name]"**, naming the other
  edition ("Show in Modern English", "Show in King James"). Never "main" or
  "compare".
- A small card above the selection shows the counterpart of the segments the
  selection overlaps, labelled as the *corresponding passage*, not a
  phrase-exact equivalent. `u` → show block, labelled approximate.
  `s` → "Not in [edition]".
- Card link **"Open here in [edition]"** switches to compare for the main page
  containing the selection, scrolls the counterpart segment into view and
  highlights it briefly. Return rule: flipping back lands on that same main
  page; if the reader swiped in compare meanwhile, rule (4) above applies.

## Test cases

- Proverbs 15, WEB main page from mid-verse 11 to start of verse 16 → KJV
  compare shows verses 11–16 complete (verse-level fallback, no file needed),
  scrolling if taller than the viewport, font size unchanged.
- Hamlet 1.3 (chapter 3, paragraph 5), original main page "goes withal. …
  The chariest maid is prodigal". The page starts on the last word of segment
  `["m",114,155,82,118]` ("Then if he says he loves you … goes withal." ↔
  "So when he says he loves you … what Denmark itself allows."), so that
  sentence is faded context; the passage starts at "Think about what you could
  lose …". The page ends 5 of 14 words into `["m",210,224,162,179]` ("The
  chariest maid is prodigal enough …" ↔ "Even the most careful young woman
  …"), so that sentence is faded context and the passage ends at "Stay back,
  out of the firing range of desire."
- Edition file changed (sha mismatch) → today's behaviour, no errors.
- File with `approved: null` → today's behaviour.
