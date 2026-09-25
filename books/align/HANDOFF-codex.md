# Handoff to Codex — precise mobile compare flip

Status: **draft for Anders' approval.** Nothing here is scheduled yet. All
preparation lives under `books/align/`; app integration is Codex's. No app
files were changed.

Revised 2026-09-25: this file now describes one design only. The earlier
scrolling passage view (fade hint, swipe-moves-main-cursor, faded edge
context) is **dropped** and has been removed; see git history if needed.

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

## Design: keep the existing compare reader

Mobile compare is not a separate view: `handleMobileCompare`
(`app/src/lab/LabApp.tsx` ~2960) swaps the whole paginated reader to the other
edition at a mapped start word, and flipping back uses the same mapping
(`mapLabCompareAnchor`). Selection, highlights, bookmarks, position and audio
therefore already work in compare. **Keep that.** No new view, no scroll
surface, no fading, font size untouched. Follow the Invariants in `CLAUDE.md`
(ReaderSession tuple, `writeSuspended`, etc.) exactly as today's compare does.

The work is two independent releases.

### Release A — map the page end (no alignment data)

Ships on its own; needs no files from `books/align/`.

1. Map the main page's **last** word with the same logic used for the first
   word today (verse markers when present, else proportional position in the
   paragraph).
2. In the compare edition, draw one quiet marker where the mapped end falls
   ("end of your page").
3. If mapped start → mapped end fits on one compare page, also split the
   compare pages at the end (`splitLabPagesAtAnchor`), so that page shows
   exactly the passage. If it does not fit, normal pagination continues it on
   the next page and the marker shows where to stop.
4. Swiping in compare behaves as today (it moves through the compare
   edition); flipping back maps from the compare position as today. The
   marker belongs to the page the flip started from and is not redrawn for
   later pages.

### Release B — alignment lookup (gated)

Only after at least one book's alignment file has a non-null `approved`
record (see [Release standard](#release-standard)). With no approved file the
code path is inert and behaviour equals Release A.

1. `mapLabCompareAnchor` first looks the anchor up in the paragraph's
   alignment segments (valid, approved, fingerprint-matched files only, see
   [Fallback rules](#fallback-rules-must-all-hold-else-use-release-a-behaviour))
   and otherwise falls back to Release A logic. Used for both start and end,
   and in both directions, so flipping back is symmetric.
2. Alignment never crosses paragraphs, so speaker changes, stage directions
   and verse lines (each their own paragraph, `-lines.json` for verse) are
   never merged.
3. First candidates: `hamlet` and `macbeth` (drama, loose paraphrase, where
   proportional mapping is worst). Books whose editions track closely (Walden,
   On Liberty: word overlap ≈0.9) gain little and are not planned.

### How to map an endpoint (Release B)

Given a main-edition word `(chapter, paragraph, word)` in a paragraph with a
valid alignment entry, find the segment containing the word on the main side
(source columns if the main edition is the file's `source`, target columns if
it is the file's `target`: the data is symmetric).

- `"m"`: start endpoint → counterpart start; end endpoint → counterpart end.
  **Partial segments:** if the main page covers at least half of the
  segment's words, the whole counterpart belongs to the passage; otherwise the
  passage starts at the next segment (start endpoint) or ends at the previous
  one (end endpoint). Never interpolate inside a segment.
- `"u"` (unresolved block): the whole counterpart block (start → its start,
  end → its end). A long correct unit (e.g. Douglass 11/5, 217 words) is
  shown whole and the end marker sits at its true end.
- `"s"` / `"t"` one-sided material on the *main* side: no counterpart. Start
  endpoint → next segment's counterpart start; end endpoint → previous
  segment's counterpart end.
- No entry for the paragraph (under 100 words, or file invalid): Release A
  logic.

### Release standard

The bar for approving a book's file is **better than proportional mapping,
with no shift across a speaker or paragraph boundary**, not "every sentence
verified". The worst case of a residual one-sentence shift is a compare page
that starts one sentence off; no position or data is at risk. Approval still
needs a person's sign-off recorded in `approved` (see `EVAL-PLAN.md`), and
the error estimate must come from a fresh sample: the 2026-09-24 sample's
neighbourhoods were corrected, so it is a regression check, not an estimate.

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

### Fallback rules (must all hold, else use Release A behaviour)

1. `format` and `version` recognised.
2. Both `sha256` values equal the sha256 of the served edition files the
   reader has loaded. Any editorial correction therefore disables the file
   until it is regenerated: it degrades to Release A behaviour, never to wrong
   matches. (Paragraph-level fingerprints may come later.)
3. `approved` is non-null. Unapproved pilot data must never reach readers.
   When set it is an object recording the evidence (`by`, `date`, `basis`,
   `sampleFile`), e.g. a human sample plus model review. It never means every
   passage was verified, so the runtime checks below still apply.
4. The paragraph has an entry, and its segments tile the live paragraph's
   word counts (cheap runtime check; on mismatch, fall back for that paragraph).

## Deferred: format version 2 (sub-token boundaries)

Not planned now; long units are shown whole. If ever needed: em-dash-joined
words ("prey!—I say", "subsist,—I say") make some clause boundaries
unreachable with word offsets, so a boundary could be `[wordIndex,
utf16Offset]` instead of a bare word index. Only reviewer-verified clause
correspondences; never split mechanically at punctuation.

## Later: "Show in [edition]" (selection menu)

Not in either release; listed so the data model supports it.

- Phrase selection menu gains **"Show in [edition name]"**, naming the other
  edition ("Show in Modern English", "Show in King James"). Never "main" or
  "compare".
- A small card above the selection shows the counterpart of the segments the
  selection overlaps, labelled as the *corresponding passage*, not a
  phrase-exact equivalent. `u` → show block, labelled approximate.
  `s` → "Not in [edition]".
- Card link **"Open here in [edition]"** flips to compare at the counterpart
  segment's start, as a normal compare flip.

## Test cases

Release A:

- Proverbs 15, WEB main page from mid-verse 11 to start of verse 16 → KJV
  compare starts at verse 11 and the end marker sits after the start of verse
  16 (verse-level mapping, no file needed); if verses 11–16 do not fit one
  page, they continue on the next compare page. Font size unchanged.
- Flip, swipe forward in compare, flip back → lands on the main page matching
  the compare position (today's behaviour); reading position rules unchanged.

Release B:

- Hamlet 1.3 (chapter 3, paragraph 5), original main page "goes withal. …
  The chariest maid is prodigal". The page starts on the last word of segment
  `["m",114,155,82,118]` (covers < half), so the compare page starts at the
  next segment, "Think about what you could lose …". The page ends 5 of 14
  words into `["m",210,224,162,179]` (covers < half), so the end marker sits
  after "Stay back, out of the firing range of desire."
- Edition file changed (sha mismatch) → Release A behaviour, no errors.
- File with `approved: null` → Release A behaviour.
- Segments that don't tile the live paragraph → Release A for that paragraph.
