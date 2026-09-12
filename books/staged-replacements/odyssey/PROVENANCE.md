# The Odyssey — provenance, edition assessment, and rights

**Prepared:** 2026-09-11, content-only staging work. Nothing here is
published, merged, registered, or deployed. All source texts were fetched
directly and read; nothing below is asserted from memory alone.

## 1. What the served `original-en` actually is

`app/public/data/editions/odyssey-original-en.json`
(sha256 `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07`)
is **Samuel Butler's 1900 public-domain prose translation of the Odyssey**.
This matches the registry's existing attribution
(`app/src/data/bookRegistry.ts`: `label: 'Butler (Prose, 1900)'`,
`translator: 'Samuel Butler'`) — unlike Meditations, no misattribution was
found here.

**Identification, verified against the actual Gutenberg text**, not from
memory or from the registry label alone: fetched Project Gutenberg ebook
#1727 (`https://www.gutenberg.org/cache/epub/1727/pg1727.txt`, fetched
2026-09-11; header credits "Translator: Samuel Butler"; sha256
`ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9`, saved at
`source-texts/pg1727-butler-1900.txt`). Evidence:

- Served Book 1's title, "The gods in council—Minerva's visit to Ithaca—the
  challenge from Telemachus to the suitors", is byte-identical to PG #1727's
  Book I heading (line 378, `THE GODS IN COUNCIL—MINERVA'S VISIT TO
  ITHACA—THE CHALLENGE FROM TELEMACHUS TO THE SUITORS.`, case aside).
- Served Book 1, paragraph 0 ("Tell me, O Muse, of that ingenious hero who
  travelled far and wide...") and paragraph 1 ("So now all who escaped death
  in battle or by shipwreck...") are word-for-word identical to PG #1727's
  opening two paragraphs of Book I.
- All 24 served chapter titles match Butler's own chapter summaries
  (Roman-form names throughout: Ulysses, Minerva, Jove, Neptune, Mercury,
  Diana), which are distinctive to this translation and not shared by any
  other public-domain Odyssey prose translation.
- The served file ends its final paragraph ("...made a covenant of peace
  between the two contending parties.") at exactly the point PG #1727's
  translation body ends, immediately before its `FOOTNOTES:` section — the
  served file is the translation body only, with Gutenberg's preface,
  header, footer, and footnotes all correctly stripped, and no boilerplate
  (`Gutenberg`, `PREFACE`, `ILLUSTRATION`) found anywhere in its 1,027
  paragraphs.

### Completeness of the served file

24 chapters (Books), 1,027 paragraphs total, chapter paragraph counts:
32, 35, 38, 81, 37, 26, 29, 50, 44, 49, 54, 39, 38, 35, 48, 45, 63, 41, 39,
36, 42, 52, 29, 45 (Books 1–24). Titles, order, and Book count all match
Butler's translation structure (24 Books, matching Homer's standard
division, which Butler's translation follows exactly — unlike the Casaubon
Meditations case, there is no non-standard numbering issue here).

### Public domain status

Samuel Butler (the novelist and translator, 1835–1902) died in 1902;
first published 1900. Public domain in the US (pre-1930 publication) and in
Denmark/EU (life plus 70 years, expired 1972). Project Gutenberg's own
header, footer, and license are not reproduced in the served file and are
not reproduced here; the translation text itself is public domain and
carries no attribution obligation, though the registry credits Butler
correctly already.

## 2. The served `modern-en` — being replaced

`app/public/data/editions/odyssey-modern-en.json`
(sha256 `813127d77b4041f613a11b46e50890f46519252782188a6a1156ebc050898cdc`)
is structurally sound: 24 chapters, 1,027 paragraphs, one-to-one aligned
with the served `original-en` (verified by paragraph count per chapter).

**It is being replaced, per this task's brief, not because it is broken.**
Two observations recorded for the coordinator, not acted on further here:

- It silently remaps Butler's Roman name-forms to Greek forms (Minerva →
  Athena, Ulysses → Odysseus, Jove → Zeus are visible in Book 1 alone). That
  is a legitimate translation choice on its own, but it is a choice, made
  without being recorded anywhere as a decision.
  > **Updated 2026-09-12, Book 1 step 6.** The *choice* is now this
  > package's choice too — the coordinator adopted the Greek forms at round
  > 1 of Book 1's review (standing finding **S1**), on the product's
  > evidence rather than the translation's: the Cast data and the Book
  > Onboarding the reader meets beside and before the text use Odysseus,
  > Athena, Zeus, Poseidon and Hermes almost exclusively. What stands from
  > the observation above is the second half of it: the served file made the
  > choice **without recording it**, and this package records it explicitly,
  > with a closed mapping table, the six hazards it must not trip, and a
  > build that asserts each one (`GLOSSARY.md`). No wording is reused from
  > the served file either way.
- It is a wholesale prose rewrite rather than a paragraph-by-paragraph
  modernization with a recorded per-paragraph continuity trail, so there is
  no way to audit it against Butler paragraph-by-paragraph the way this
  package's `continuity.md` will allow for the replacement.

This package does not reuse any wording from the served `modern-en`. The
Book 1 candidate drafted here is built from Butler's original-en only.

## 3. The Odyssey Book 10 pilot — status, not "accepted"

The task brief that opened this thread describes Book 10 as having "accepted
text" that "exists and can be adopted as-is." Checked directly: this is
**not accurate as recorded on the repository**, and the correct status is
recorded here instead of repeating the assumption.

- Branch `claude/wizardly-allen-ra9p0k`, commit
  `25d36f36b0ee7dad1a10ff956415dcb3204bb15d`, single commit, message
  "Draft-only stage of the Book 9-style two-step review workflow."
- Its own `README.md`, verbatim: *"This pilot only covers drafting and
  review-packet preparation (steps 1–2 of the four-step workflow being
  tested). No independent review has been run against `candidate-v1.json`."*
- No `ACCEPTANCE.md`, no `candidate-v2.json`, no `review/` directory exists
  in that directory on that branch, and the directory does not exist on
  `main` at all (checked: `git ls-tree origin/main -- books/staged-replacements`
  does not list it).
- Its own `provenance.json` records the Butler attribution as a **recorded
  uncertainty**, not a verified citation ("no Gutenberg header or SOURCE.md
  for this edition file was located" — at the time of that pilot). This
  package's step 1 (above) now supplies that verification directly against
  PG #1727, so that particular gap is closed if Book 10 is later drafted or
  adopted under this package.
- Its candidate uses the Greek name mapping (Ulysses → Odysseus, etc.),
  which conflicted with this package's original name decision.
  > **Updated 2026-09-12, Book 1 step 6: this conflict is gone.** Standing
  > finding **S1** moved this package onto the Greek forms, so the pilot and
  > this package now agree on names. **Book 10's disposition is therefore a
  > question about its unreviewed status alone** — see ledger A2.

**Recorded, not decided:** if Book 10 is drafted under this package, the
pilot's `candidate-v1.json` (sha256
`6a5e9ef63ca6f80e020a089a94072de28c925302c0d233adb0a13a20b63d6a4f` per its
own `provenance.json`) is available as a starting point. As of 2026-09-12 it
would need **one** thing rather than two: its own independent review round
from scratch under this package's eight-step process, which it has had none
of. The name-form condition is discharged — the coordinator's standing
finding S1 moved this package to the Greek forms the pilot already uses. It
would still be checked against this package's glossary rows, punctuation
standard and continuity conventions, which the pilot predates. Nothing from
the pilot is copied into this package at this time.

## 4. The served `original-en` against PG #1727 — the whole file, scanned

**Added 2026-09-12 at Book 3's step 1**, because that Book's own verification
turned up a paragraph in the served original that is **not in the base text at
all**. One Book's defect might be one Book's defect or the first of many, and
the answer matters to every later Book, so it is settled once, here, instead of
being rediscovered at Book 12. `scripts/scan_staged_original_vs_pg.py`
reconstructs all 24 Books from raw PG by Book 3's rule and diffs each against
the served file. Read-only; it modifies nothing.

**Result: 1,027 paragraphs, 117,228 words. Paragraph counts match in all 24
Books, and the served file is Butler's translation body, complete, everywhere
except one paragraph.**

Three classes of difference, and only three:

1. **PG footnote markers, stripped.** As already established for Books 1–2.
   Recorded here for a reason that bites any later reconstruction: **PG
   separates some markers from the preceding word with a space** — in **Books
   1, 4, 5, 8, 15, 17, 21 and 22** — so a removal rule that only strips a digit
   run *glued* to a preceding non-space character leaves part of the marker
   behind in those Books (`others 10` loses the `0` and keeps the ` 1`).
   **Books 2 and 3 have no space-separated marker**, which is why the
   glued-only rule is safe in both, and both Books' verification scripts
   *assert* that rather than assuming it. A later Book's verifier must handle
   the whitespace case.
2. **Book-opening capitalization**, at **Book 3 ¶1 and Book 4 ¶1** only. PG
   prints `but as the sun was rising…` and `they reached the low lying city…`
   in lower case, because Butler's Book openings run on from the previous
   Book's printing; the served file capitalizes. No word changes.
3. **One paragraph whose text differs: Book 3 ¶38, +1,147 characters.** This
   is the single text-level defect in the served original, and it is
   substantial. PG's Book III ends on a bare half-sentence — `Now when the sun
   had set and darkness was over the land,` (PG line 1539) — whose other half
   opens PG's Book IV (`they reached the low lying city of Lacedaemon…`, line
   1549). The served `original-en` **completes that half-sentence with 196
   words taken verbatim from the served `odyssey-modern-en.json`'s own
   paragraph 38**, and the text it supplies **duplicates the served paragraph
   37** — the same chariot, housekeeper, Pherae, Diocles, Dawn and corn lands,
   told twice in succession.

   So the served "original" carries, in that one place, the modern rewrite it
   is supposed to be the original *of*. It is recorded in
   `book03/continuity.md` as Book 3's one base-text defect, flagged for the
   coordinator, and handled in the candidate by rendering **Butler's
   half-sentence and nothing else** — see that file for the decision and the
   alternatives. **Nothing in this package modifies the served file**; a repair
   to `app/public/data/editions/` is outside this package's scope and is a
   coordinator's call.

## 5. Reproduction

```bash
cd books/staged-replacements/odyssey
sha256sum source-texts/pg1727-butler-1900.txt
# ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9
sha256sum ../../../app/public/data/editions/odyssey-original-en.json
# da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07
sha256sum ../../../app/public/data/editions/odyssey-modern-en.json
# 813127d77b4041f613a11b46e50890f46519252782188a6a1156ebc050898cdc
```
