# Faust, Part I — source decision and scoping (not a repair yet)

**Status: decision/scoping packet only. No edition JSON produced or staged
here. This is deliberately smaller than a repair package** — Faust needs a
full-book parse and full-book `modern-en`, which is a new-book-scale task
(comparable to onboarding a new title from scratch), not a bounded repair
like the Macbeth/As You Like It/Jerusalem packages alongside it. Attempting
it in the same pass at the same quality bar as those would have meant
either rushing ~900–1,200 verse paragraphs or leaving the queue's earlier,
higher-priority items under-reviewed. This packet exists so a follow-up
session (or Codex, for the input-file question) can move immediately
without re-deriving the source question.

## What the audit found

`claude/laughing-maxwell-3d7f5l` `e24c16e8`, `reports/G07-novels-b.md`
G07-faust-part-1-01…17, `CONFIRMED-DEFECTS.md` item 5, `NEEDS-INVESTIGATION.md`
A4:

- The served `original-en` is labelled "Bayard Taylor (1870)" but is
  actually Abraham Hayward's prose translation as revised by C. A. Buchheim
  (Bell, 1892), OCR'd from a bilingual (German/English facing-page) scan.
- About 1,873 words across 9 passages are missing from that OCR (whole
  skipped pages), including the end of the Prologue in Heaven, the Easter
  sequence, the "In the beginning was the Word... the Deed" passage, and
  parts of the Walpurgis Night scenes.
- About 2,500 words of German facing-page text bled into the English
  edition as body paragraphs (55 positions across 15 chapters).
- `modern-en`/`modern-da` silently bridge the OCR gaps and, at the
  German-bleed positions, either duplicate adjacent English or invent lines
  with no source counterpart at all (e.g. "I will not falter! Forward—I
  must save her!", present in modern-en with no original-en or German
  counterpart).
- `original-de` (PG #21000, sound) needs only a small fix: remove the
  transcriber's note appended to the final line (28.69).

Anders's assignment (2026-09-26): "establish the correct human English
source and translator attribution; reconstruct missing passages and remove
accidental German facing-page contamination. **Do not merely relabel the
existing defective text.** Then repair modern-en and modern-da from the
accepted complete original. Preserve the sound original-de."

## What this session found, checking the audit's open question

The audit's open question #1 was "which English source is intended?" —
the label says Taylor, and Taylor's complete translation is already in the
repo, unused.

**Confirmed this session:**

- `books/raw/faust-part-1/raw-en.txt` (9,022 lines) is Bayard Taylor's
  complete 1870/71 translation (the 1918 World Publishing "Illustrated
  Edition," Harry Clarke illustrations) — sha256
  `840e94c5694ce6b66ad6e2ebd2ffabea845297bc0cd50604d2587b5c6079791b`.
  Re-downloaded independently from Project Gutenberg
  (`https://www.gutenberg.org/files/14591/14591-0.txt`) this session and
  confirmed byte-identical to the local raw file.
- It runs from "*** START OF THE PROJECT GUTENBERG EBOOK 14591 ***" through
  the correct ending — "VOICE (from within, dying away) Henry! Henry!" —
  matching the German original's ending exactly. It is complete: no missing
  scenes, no OCR gaps, no German-bleed (it's an English-only edition, not a
  bilingual scan).
- `books/raw/faust-part-1/SOURCE.md` documents an **earlier, correct parse**
  of this exact file: "Parsed Into: `/app/public/data/editions/faust-part-1-original-en.json`,
  28 chapters, 1246 paragraphs, Parsed: 2026-04-23." The **currently served**
  file has only 895 paragraphs and is the Hayward/Buchheim OCR content per
  the audit — meaning the served edition was overwritten by a different
  (broken) pipeline at some point after 2026-04-23, without SOURCE.md being
  updated to match. `books/parse-faust.py`'s current `--en` mode reads
  `raw-en-hayward.txt`, which does not exist in the repo — so the tool that
  produced the currently served defective text isn't fully reconstructable
  from what's checked in either.

**Recommendation: re-parse `raw-en.txt` (Taylor) fresh, and serve that as
`original-en`, replacing the Hayward/Buchheim-OCR content entirely.** This
directly satisfies Anders's "establish the correct... source" instruction
without relying on an OCR reconstruction of a different, damaged translation:

- It matches the existing registry label ("Bayard Taylor (1870)") without
  a lie — no relabeling decision needed at all, and no rights/edition
  question the way As You Like It has.
- It is complete — no missing-passage reconstruction needed, since Taylor's
  translation has no gaps.
- It has no German-bleed risk — it's a monolingual English edition.
- It avoids re-deriving ~1,873 words of missing English prose from a second
  scan (the Cornell bilingual djvu OCR) that would still need heavy manual
  cleanup even after being fetched.
- `modern-en`/`modern-da` need a full fresh render from the Taylor text
  either way, since the current ones are built on the wrong original and
  inherit its gaps/inventions — so there is no "keep the current modern-en
  and just patch it" option regardless of which English source is chosen.

**Trade-off to flag:** this is a full re-parse and full re-translation, not
a patch — bigger than "reconstruct 9 passages," but smaller and much safer
than fixing the OCR. If Anders instead wants the *Hayward/Buchheim* text
specifically preserved (properly labelled, with its 9 gaps reconstructed
and German-bleed removed) rather than replaced with Taylor, that is a
different and larger task requiring the Cornell scan
(`https://archive.org/download/cu31924026191910/cu31924026191910_djvu.txt`)
and manual OCR correction; this packet does not attempt that path. **Needs
Anders' confirmation** if the Taylor-replacement recommendation isn't what
he wants, since either path is legitimate but they are not the same job.

## Scope estimate for the follow-up task (if the Taylor recommendation is approved)

1. Parse `raw-en.txt` into 28 scenes (canonical scene list is already in
   `books/parse-faust.py`'s `SCENES` constant) — expect ~1,200 paragraphs
   per the prior SOURCE.md record. Validate against the 28 scenes and the
   correct opening/closing lines.
2. Render a fresh `modern-en` for the whole play (~1,200 paragraphs of
   verse drama) — this is comparable in size to a full new-book modern-en
   pass, not a batch of gap-fills.
3. Fix `original-de`: remove the transcriber's note at 28.69 (small,
   independent of the English-source decision — could be done immediately
   in its own tiny package if useful).
4. Re-render `modern-da` is out of scope per the current Danish-scope
   freeze (same conflict flagged in the Macbeth/AYLI/Jerusalem packages);
   flag the same D-9 concern once the new paragraph structure exists.
5. Independent review, following the same pattern as the three packages in
   this queue: a second agent re-derives the parse from `raw-en.txt`
   independently and spot-checks `modern-en` for fidelity across the whole
   play, not just a sample.
6. Character-card/threads/onboarding impact: `faust-part-1` should be
   checked for existing character cards/threads before starting (not
   checked in this packet).

This is realistically a multi-session content assignment on its own scale,
not a continuation of this session's Macbeth/As You Like It/Jerusalem work.
