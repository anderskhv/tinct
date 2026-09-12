# Meditations (Marcus Aurelius) — staged modern-English replacement

Content-only staged work. Nothing here is registered, live, merged or deployed.
No app code, registry entries, served editions, audio or database records are
touched by this package.

Start with `00-progress-ledger.md` (state, decisions, what needs Anders), then
`WORKFLOW.md` (the eight-step process and the rules), then `PROVENANCE.md`
(what the served file actually is, the edition assessment, rights, and the
staged corrected `original-en`).

- `meditations-original-en.staged.json` — George Long 1862, 12 books, 487
  paragraphs, one per numbered section. Built from `source/pg15877-long-1862.txt`
  by `scripts/build_original_en_from_pg15877.py`.
- `GLOSSARY.md` — stable renderings fixed before drafting.
- `bookN/` — per-book drafting, review-packet, correction and acceptance files.

**Books I–XI are accepted** (each `bookN/ACCEPTANCE.md` names the accepted file
and its hash). **Book XII, the last book, is drafted and frozen** at
`book12/candidate-v1.json` (sha256 `8665adc8…`), waiting on its independent
review. There is no thirteenth book.

## What remains when Book XII is accepted

Recorded here so the coordinator and any later editor can see the whole shape of
what is left. None of it is in this task's scope to do unilaterally.

1. **Book XII steps 6–8** — the round-1 findings applied to
   `book12/candidate-v2.json`, a changes log, a flow read and
   `book12/ACCEPTANCE.md`. Five decisions are flagged in
   `book12/review-instructions.md` for an explicit ruling.
2. **A cross-book consistency pass over all twelve accepted candidates.** The
   package has been drafted book by book, and every book's decisions were made
   with the accepted books in view, but **no single pass has ever read the twelve
   together**. Five known items are already logged in `00-progress-ledger.md`
   under "Open, not blocking" and would be the pass's starting list: the three
   third-person "shall" plain futures in III.9, VII.8 and VII.24, which diverge
   from the rule as widened at Book IX; II.5's dangling relative; XI.12's "nor
   sinks down"; IX.1's "such like", where Books XI and XII render the same phrase
   "of that kind"; and V.1's plural distributive "several", where Books XI and XII
   render it "separate". A sixth thing the pass should do is mechanical: build a
   frequency table of every glossary term across the twelve accepted candidates
   and check each against its row, since a row extended at Book X or XI cannot
   have been applied in Books I–IX.
3. **An assembled `modern-en` file.** Twelve accepted `candidate-v2.json` files
   exist; **no assembled edition does**. Assembling them into one file in the
   served schema, and asserting 487 paragraphs in the profile 17, 17, 16, 51, 36,
   59, 75, 61, 42, 38, 39, 36 with each paragraph numbered and aligned 1:1 to
   `meditations-original-en.staged.json`, is the last mechanical step and has not
   been done.
4. **Anders's two standing decisions**, unchanged since Book II and recorded under
   "Needs Anders": **A1**, the 412 → 487 paragraph re-basing, which every part of
   this package assumes; and **A2**, the registry's false attribution of a
   Casaubon text to Long. Nothing here can be integrated until A1 is answered.
5. **Out of this package's scope entirely**: `modern-da`, the R2 audio for all
   three editions, the static chapter pages under `app/public/read/meditations/`,
   and saved reading positions, all of which key on the served 412-paragraph
   structure. `PROVENANCE.md` §5 lists the consequences.
