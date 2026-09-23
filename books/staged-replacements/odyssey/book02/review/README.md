# Book 2 — independent review, round 1

Round 1 of the step-4 independent review of `book02/candidate-v1.json`.
Findings are in `findings-v1.md`, one entry per paragraph, `B02-P001` …
`B02-P035`.

**Verdict: Accept after corrections.** 0 substantive, 16 minor (14
paragraph-level, 2 records), 11 optional (9 paragraph-level, 2 records), 19
paragraphs with no material issue. Nothing in the candidate must be fixed
before acceptance; the findings are worth applying, and one of them (11.1)
binds accepted Book 1 as well.

The reviewer did not draft the candidate, did not consult the drafter, and
read Butler 1900 only. Fagles, Lattimore, Wilson and Fitzgerald were not read
for this review.

## What was checked

- **Hashes, all three, recomputed locally and matched**: `candidate-v1.json`
  `2b5a0280719312bbabb214f0bcbf400cde62541ab7e9c892ce2c2b65bb4273ea`;
  `source-book2.json`
  `3cc4f38c171e0e1d72ad741e75c745b31c7f330dfb3ed79910832ae4d04714c7`;
  served `odyssey-original-en.json`
  `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07`. The PG
  base `source-texts/pg1727-butler-1900.txt` also matches `PROVENANCE.md`
  (`ffbdb29c…`).
- **The README's mechanical-check block, extracted and run verbatim.** It
  printed `OK — 35 paragraphs, coverage exact, packets verbatim, names and
  hazards held, ratio 0.9993` and the three expected hashes, exactly as the
  README states.
- **All twelve packets, in order**, three paragraphs at a time (packet 12 two)
  with the `CONTEXT ONLY` neighbours, source beside candidate; then the whole
  candidate read continuously for voice, pacing, repetition and transitions.
- **Five checks of the reviewer's own**, beyond the README's: per-paragraph
  word ratios (min 0.951 at P005, max 1.059 at P003, both as recorded); a
  capitalized-token census of both files; the possessive and case hazards
  checked *for vacuity* rather than assumed (Butler's Book 2 has no
  `Ulysses’` possessive and no `Same`, so glossary hazards 3 and 4 do not
  fire here at all); a quantity and negation census paragraph by paragraph;
  and a full word-level opcode diff of all 35 paragraphs, read in full, which
  is what every paragraph entry in `findings-v1.md` is built from.
- **A measurement the package did not have**, added because the ratio of
  0.9993 needed an answer better than the two counter-checks in
  `continuity.md`: the share of Butler's word tokens carried over **unchanged
  and in sequence**. Book 2 v1 scores **0.889**; accepted Book 1 v2 scores
  **0.721**. See the ruling in `findings-v1.md` §6 — the conclusion is that
  the lightness is the source's and not the drafter's, but the measurement is
  real and should replace the two weaker checks for later Books.

## How the source was verified, by a different rule, and whether it agreed

**It agreed, exactly: 35 of 35 paragraphs byte-identical, zero diffs, 4,184
words compared word-for-word.**

`scripts/verify_source_book2.py` was **not** re-run. Its rule identifies the
apparatus first (bare-digit runs, verified positionally against PG's numbered
footnote list) and then strips it. A second reconstruction that also began by
deciding what the apparatus is would share its blind spot, so the rule here is
inverted rather than varied:

1. **Boundaries structurally** — `BOOK II` occurs once in the file (line 741)
   and `BOOK III` once (line 1117); the range is what lies between. No
   dependence on digits, on footnote numbering, or on `FOOTNOTES:`.
2. **Paragraphs mechanically** — maximal runs of non-blank lines joined with a
   newline, the first block asserted to be the all-caps chapter heading and
   dropped. **35 blocks remain: the count is an output, not an input.**
3. **Audit of the range first** — 0 indented lines, 0 illustration markers, 0
   Greek spans, 0 daggers, 0 underscores, 1 square bracket (`[do not]`), and
   digit runs `17 18 19 20 21 22 23`.
4. **Diff with the apparatus still in** — character-level opcodes against the
   staged file, every difference printed with context and classified before
   anything was removed. Result: **7 differences in 5 paragraphs, every one a
   pure deletion of a bare digit run**, and nothing else of any kind.
5. **Removal last**, by the one rule the diff had itself justified, then a
   re-diff: byte-identical in all 35, plus an independent word-token
   comparison over all 4,184 words with zero mismatches.

**Both of the drafter's audit catches are confirmed from this run.**
`FOOTNOTES:` does occur twice — line **75** (table of contents) and line
**10843** (the real section) — and anchoring on the first would make a marker
relation vacuously true; this method never touches `FOOTNOTES:` at all, which
is a second, structural way of reaching the same assurance. And Book 2's seven
markers are **never preceded by a space** (preceding characters `.`, `d`, `”`,
`r`, `,`, `,`, `s`), so the whitespace clause is a genuine no-op for this Book
and its silence carries no evidence.

**What this method adds that the drafter's cannot:** because it derives the
differences instead of stripping a class, it also establishes the absence of
everything nobody thought to look for — a dropped word, a normalized quotation
mark, a line joined with a space, a silent repair of Butler's bracket would all
have appeared in the opcode list as a non-digit difference. None did.

## Rulings on the five decisions put to the reviewer

All five are ruled on in full in `findings-v1.md`; in short:

1. **The `[do not]` bracket (B02-P004)** — **disposition upheld** (mark
   dropped, words kept, colon supplied), but the stated reason is wrong and
   Butler's own footnote 18 supplies a better one: *“The authoress has bungled
   … without prefixing the necessary ‘do not,’ which I have supplied.”* It is a
   translator's supplement, not a textual mark. **Yes, it needs its own
   decision row**, written **by class** — Butler uses brackets for three
   different things, and Book 3 (PG 1129, `[on the embers]`) and Book 4 (PG
   1551, a passage he brackets as an afterthought, footnote 36) each hit a
   different one. Class C is where "drop the mark, keep the words" goes wrong
   silently.
2. **The Erinyes gloss (B02-P008)** — **upheld** at three words. `odyssey-threads.json`
   has no entry for Erinyes or Furies, so D8 is silent; the served `modern-en`
   being replaced uses *Furies*, and departing from it is right.
3. **`Ilius` beside `Troy`** — **upheld, unglossed.** Butler's two forms answer
   to Homer's two; the served `modern-en` flattens them and should not be
   followed.
4. **`Mycene` the woman** — **upheld for Book 2**, but see records finding
   **R1**: Butler spells the **city** `Mycene` too (Book 3, PG 1377; Book 21,
   PG 9326), and the glossary row as written will mislead the Book 3 drafter.
   The city has a live D8 claim (`“Murdered King of Mycenae”`) that the woman
   does not.
5. **The four Book-1 formulas** — three confirmed word-for-word identical
   against `book01/candidate-v2.json`. The fourth, **“a beloved daughter
   deserves”**, is **answered rather than deferred: it should become “a beloved
   daughter may expect”** — Butler's verb, no archaism, and it removes a moral
   judgement from Eurymachus's mouth mid-threat. **This changes both Books.**

## Next steps for the drafter

1. **Apply or decline each finding, one by one**, in the established pattern:
   `book02/candidate-v2.json` via a change script that asserts v1's frozen
   hash before and after, `book02/changes-v1-to-v2.md` listing every change by
   paragraph ID against the finding it answers, and an explicit note on any
   finding not applied and why. `candidate-v1.json`, its readable copy and its
   packets are **not** regenerated (decision D10).
2. **Settle records finding R1 before Book 3 is drafted** — the `Mycene`
   row, split by referent, and the D8 question about the city. This is the one
   item with a deadline attached.
3. **Write the bracket rule into `GLOSSARY.md` and the ledger**, by class, with
   class C flagged for the coordinator before Book 4.
4. **Put finding 11.1 to the coordinator as a decision**, since it reopens
   accepted Book 1 (`candidate-v3.json` at B01-P019, an `ACCEPTANCE.md`
   amendment, and the glossary row). Whichever way it goes, it should be
   recorded rather than deferred a third time.
5. **Fix the records findings R2–R4** in `continuity.md` and `README.md`, and
   consider replacing the two ratio counter-checks with the token-retention
   measure, which can actually fail.
6. **Then steps 7–8**: continuous flow read of the corrected Book, and
   `book02/ACCEPTANCE.md` with the accepted file's hash, the rounds applied,
   and what remains open.

Nothing in this review requires a second review round before acceptance; a
round 2 is warranted only if the corrections turn out to be more than the
one-line substitutions proposed.
