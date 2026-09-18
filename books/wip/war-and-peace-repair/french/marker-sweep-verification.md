Model: opus

# Marker sweep — independent verification (2026-09-18)

Scope: the editor sweep that removed Maude's trailing footnote marker `*` from the
dialogue paragraph in ch150 (idx 6, 11), ch277 (idx 17), ch278 (idx 12),
ch300-r2 (idx 3), plus the `* ` slot-prefix normalisation at ch150 idx 12.

## Baseline note

The sweep is already committed as `84dc94319` ("content: W&P French marker sweep
(ch150, 277, 278, 300), re-assembled"), so `HEAD` is the *post*-edit state and the
working tree is byte-identical to `HEAD` (no uncommitted changes in this
directory). The previous accepted content is therefore `HEAD~1` (`259889394`), and
every diff below is `HEAD~1` vs the working file, compared as parsed JSON.

## Method

- `git show HEAD~1:...` piped into `json.loads`, compared paragraph-by-paragraph
  against `json.load` of the working file. Top-level keys, `number`, `title` and
  paragraph count compared explicitly.
- Each changed paragraph read against `chN-source.json` (Maude) for rules 3, 4, 5.
- `python3 books/edition_checks.py war-and-peace --candidate <file>` run per file;
  output grepped for `BLOCK`, `inline-marker-with-slot`, `footnote-orphan-marker`,
  `bracket-tag`, `footnote-slot-bare`. All four flag names are present in
  `edition_checks.py` (lines 120-123), so the grep is meaningful rather than
  vacuous.

## ch150-french.json

- Shape: keys `number`/`title`/`paragraphs` unchanged; `number` 150; title
  "Book Eight (1811 - 12) — Chapter 5" unchanged; 27 paragraphs before and after
  (source also 27).
- Changed indices: **exactly 6, 11, 12** — the three logged. Nothing else.
- idx 6, 11: Boris's album verse. Trailing ` *` removed; the French is otherwise
  byte-identical to before. Foreign wording inline is justified by rule 3 (verse).
  English follows in the adjacent slot (idx 7, idx 12) per rule 5. No cue is
  required: these are written album lines, not reported speech, so rule 2 does not
  bite.
- idx 12: prefix `*Poisonous` → `* Poisonous`. Body untouched.
- Slots vs Maude: idx 7 and idx 12, with the `*` prefix and curly/straight
  punctuation normalised, are **character-exact** against source paragraphs 7 and
  12. Maude's English, not a paraphrase.
- Checker: `blocks: 0`, and none of the four flag classes fire for ch150.
  Remaining flags are edition-wide (`title-sequence`, `title-duplicate`,
  `name-variant`) or pre-existing chapter flags (`long-sentence` p2/p17/p19); none
  are new and none are in scope for this sweep.

## ch277-french.json

- Shape: keys unchanged; `number` 277; title "Book Twelve (1812) — Chapter 14"
  unchanged; 49 paragraphs before and after (source 49).
- Changed indices: **exactly 17**. Nothing else.
- idx 17: trailing ` *` removed from
  `"My child!" she murmured (in French), "I love you and have known you a long time."`
  This is a `french-kept` paragraph: the English is inline with the rule-2 cue
  placed after the speech verb, and the French lives in the slot. Rule 3 does not
  apply here and no foreign wording is left inline — correct.
- Slot idx 18 (`* Mon enfant! Je vous aime et vous connais depuis longtemps.`) is
  unchanged by this sweep. Confirmed against source idx 17: it carries the quoted
  French only, with Maude's English narration ("she muttered") correctly excluded,
  and `je` capitalised after the sentence-final `!`. Rule 4 satisfied.
- Checker: `blocks: 0`; none of the four flag classes fire for ch277. The
  `near-verbatim ch277: 13/25` flag is pre-existing and unrelated to the sweep.

## ch278-french.json

- Shape: keys unchanged; `number` 278; title "Book Twelve (1812) — Chapter 15"
  unchanged; 45 paragraphs before and after (source 45).
- Changed indices: **exactly 12**. Nothing else.
- idx 12: trailing ` *` removed from `"Thank you for coming, my dear." (in French)`.
  `french-kept`; the paragraph has no speech verb, so rule 2's cue sits directly
  after the closing quotation mark — correct placement.
- Slot idx 13 (`* Merci, chère amie, d'être venue.`) unchanged by this sweep and
  an exact match for the source's quoted French (source idx 12) modulo the
  straight-apostrophe normalisation used throughout this file. Rule 4 satisfied.
- Checker: `blocks: 0`; none of the four flag classes fire for ch278.
  `near-verbatim ch278: 10/15` is pre-existing.

## ch300-french-r2.json

- Shape: keys unchanged; `number` 300; title "Book Fourteen (1812) — Chapter 2"
  unchanged; 16 paragraphs before and after (source 16).
- Changed indices: **exactly 3**. Nothing else.
- idx 3: trailing ` *` removed. The maxim `Les gros bataillons ont toujours raison`
  stays inline — justified by rule 3 (a quoted maxim) — with the English
  immediately following inline (`— big battalions are always right`).
- Slot idx 4 is `* Large battalions are always victorious.`, **character-exact**
  against source idx 4: Maude's English footnote, kept as-is per rule 5, so the
  French is not printed twice. The inline gloss plus Maude's slot English is the
  combination rules 3 and 5 together prescribe.
- Checker: `blocks: 0`; none of the four flag classes fire for ch300.

## Logs

- `ch150-french-log.md`, `ch277-french-log.md`, `ch278-french-log.md`: the
  "## Marker sweep" section is a pure append; nothing above it was altered
  (verified via `git diff HEAD~1 HEAD` — additions only, no deletions).
- Before/after text in every log entry matches the actual JSON byte-for-byte,
  including ch150 p12's slot-prefix entry.
- `ch300-french-r2-log.md` is a **new file** rather than an append. Two minor,
  non-blocking observations:
  1. ch300's earlier round-2 log lives at `ch300-french-log-r2.md`, so the sweep
     log for the same chapter now sits under a differently-ordered name
     (`ch300-french-r2-log.md`). The sweep record is complete and accurate; only
     the filename convention is inconsistent.
  2. ch150's older "Reviewed, no change needed" section still says the orphan
     asterisk was "already resolved by the slot". The appended sweep section
     supersedes it, and the supersession is legible in context, so this is a
     cosmetic staleness rather than a wrong record.

Neither observation affects the text, the rules, or the checker, and neither
warrants another editing round.

## Conclusion

All four files changed exactly and only the logged paragraphs. Counts, numbers and
titles are untouched. Every swept paragraph is free of Maude's `*` marker; the one
`*` that remains at ch150 idx 12 is the footnote slot's own rule-4 prefix, now
correctly spaced. The foreign wording left inline is justified in both places it
occurs (rule 3: verse in ch150, the "gros bataillons" maxim in ch300), with the
English immediately following — in the slot for the verse, inline plus slot for
ch300 — and the ch150/ch300 slots reproduce Maude's English exactly. All four
files return 0 BLOCK with no `inline-marker-with-slot`, `footnote-orphan-marker`,
`bracket-tag` or `footnote-slot-bare` flag for their chapter.

Verification: ACCEPT
sha256: ch150-french.json 6a69d01cf7fb4be248cce2212105d792518c872c379abdef2548035d1c4acf7f
sha256: ch277-french.json 04fa37918f049cfa54b5313cece12a4fe5f9ebbb3fff41de3c3eea66a3fb44ae
sha256: ch278-french.json b328528b6446cf997b8599986258a2d8ff9eb734bf497c6740655dcb6f3d0fa5
sha256: ch300-french-r2.json 6743580289a88bd4d5a818d7eb33892c47796dc72e1c6556358a98d13b0de34d
