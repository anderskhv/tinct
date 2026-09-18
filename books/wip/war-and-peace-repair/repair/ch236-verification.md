Model: opus

# Chapter 236 (Book Eleven (1812) — Chapter 7) — independent verification

Verifier did not draft, review or correct this chapter. Diff computed directly from
`ch236-candidate.json` vs `ch236-corrected.json`; every change re-derived from
`ch236-source.json` (Maude), not from the log.

## 1. Diff list vs log

Paragraphs changed (0-based): **0, 1, 2, 3, 5, 10, 11, 13, 14, 15, 17, 24, 25, 28, 29, 30, 31, 32, 35** — 19 paragraphs.
Log entries: **0, 1, 2, 3, 5, 10, 11, 13, 14, 15, 17, 24, 25, 28, 29, 30, 31, 32, 35** — 19 entries.

**Exact match. No unlogged change, no logged change missing.** Every `Before:` and `After:`
string in the log was compared byte-for-byte against the corresponding paragraph in
`ch236-candidate.json` and `ch236-corrected.json` respectively: **all 19 match exactly.**

## 2. Per-change verdicts (re-derived from source)

| ¶ (1-based) | Change | Source check | Verdict |
|---|---|---|---|
| 1 | "quite simple" → "very simple and easy" | "very simple and easy from the ecclesiastical point of view" | OK — both losses restored; "Church's" kept for "ecclesiastical" is a fair modernisation |
| 2 | "single woman" → "maiden"; "openness" → "naïveté" | "as simple and natural as marrying a maiden"; "with good-natured naïveté" | OK — MODERATE answered; the affected-innocence motif restored |
| 3 | "fascinating"→"interesting", "torn over which…to marry"→"in doubt which…she should marry", "permissible"→"possible", "could not rise to such heights"→"unable to rise to the height of such a question", "the whole scheme"→"the scheme", "inability to function in society"→"incapacity to live in society" | all six verbatim in source | OK — no over-correction; the candidate's sentence split into four sentences is retained, so readability is not lost |
| 4 | "allowed herself plainly to express"; "marched"→"moved" | "allowed herself plainly to express"; "moved across the room" | OK — invented manner removed |
| 6 | Vasily → Vasili | source "Prince Vasíli"; CONVENTIONS name table | OK — chapter now has one occurrence, and it is correct. (The fidelity review's "¶6, 18" was a slip: ¶18 contains no Vasili. Nothing left to fix.) |
| 11 | "widow of a Grand Seigneur — a great lord" → "widow of the Grand..."; "a poor match" → "a mésalliance" | "and as widow of the Grand... the prince would no longer be making a mésalliance by marrying you" | OK — **MAJOR answered**. Invented completion, invented gloss and definite→indefinite all reversed; the three-dot break matches the source's punctuation exactly (not an ellipsis character). See §6 for the author-intrinsic ruling |
| 12 | "That's what a true friend sounds like!" → "That's a true friend!" | "'That's a true friend!' said Hélène" | OK |
| 14 | slot convention + "having it all figured out" → "putting things squarely" | "Une maîtresse-femme! * That's what is called putting things squarely. She would like to be married to all three at the same time," thought he. | OK on both counts — MODERATE answered; see §5 for the cue placement and §6 for "thought he" |
| 15 | slot ← `* Une maîtresse-femme!` | source dialogue ¶14 | OK — §5 |
| 16 | "blunt" → "naïve" | "so naïve a question" | OK — MODERATE answered; matches the ¶2 restoration, so the doubled joke survives |
| 18 | "pursed his lips" → "puckered his skin" | "Bilíbin puckered his skin in preparation for something witty." | OK — MODERATE answered; the face motif (¶10 wrinkled / ¶11 smoothed out / ¶17 brow smooth again) is now continuous, and matches ch 264 ¶13/¶17 |
| 25 | cue added; "right"→"clear"; "in which"→"in which language" | "changing from Russian, in which language she always felt that her case did not sound quite clear, into French" | OK — MODERATE + MINOR answered |
| 26 | slot ← the French | source dialogue ¶25 | OK — §5 |
| 29 | "the companion" → "the lady companion" | "the lady companion who lived with Hélène" | OK |
| 30, 31 | cue added; slot ← the French | source ¶30 | OK — §5; the ¶30/¶31 word-for-word duplication the review flagged is gone |
| 32, 33 | cue added after the speech verb; slot ← the French | source ¶32 | OK — §5; duplication gone |
| 36 | "plans"→"affairs"; "the formalities"→"all the formalities" | "Hélène's affairs were clearly defined"; "carry out all the formalities" | OK |

No correction split, merged, lengthened or shortened a paragraph beyond the wording listed.
No new meaning drift found in any of the 19.

## 3. Readability of changed paragraphs

Re-read as a new reader. Seventeen of the nineteen are unambiguously clear. Two carry a
residue, both recorded as non-blocking in §6: ¶11 (the source's own broken-off phrase) and
¶14 (the split quotation and the inverted "thought he"). Neither obscures what happens.
"Mésalliance" is a current English dictionary word and its sense — marrying beneath rank —
is carried by the sentence it sits in.

## 4. Structure and punctuation

- Paragraph count 38 = 38 = 38 (source / candidate / corrected). Order unchanged.
- `number` 236 and `title` "Book Eleven (1812) — Chapter 7" identical to source.
- No empty paragraphs. JSON valid.
- Per-paragraph `?` parity with source: **clean across all 38**.
- Per-paragraph `!` parity: two deltas, **both explained by the French convention and neither
  a defect**: ¶15 gains one `!` (the slot now carries "Une maîtresse-femme!" from the source's
  dialogue paragraph, where the `!` belongs) and ¶26 loses one (Maude's English footnote read
  "…don't talk nonsense!"; the French it replaces reads "…de bêtises."). Chapter totals are
  unchanged. All 36 other paragraphs match exactly.
- No curly quotes, no `[Speaking in …]` tags, 4 asterisk slots, 4 `(in French)` cues.

## 5. French slots, ¶14–15 / ¶25–26 / ¶30–31 / ¶32–33 — all four re-checked, all conform

Each slot was compared character-by-character against the *source's dialogue paragraph*
(french-pass rule 4), not against Maude's English footnote:

- `* Une maîtresse-femme!`
- `* Ah, Maman, ne dites pas de bêtises. Vous ne comprenez rien. Dans ma position j'ai des devoirs.`
- `* Non, dites-lui que je ne veux pas le voir, que je suis furieuse contre lui, parce qu'il m'a manqué parole.`
- `* Comtesse, à tout péché miséricorde.`

All accents intact (`î`, `ê`, `à`, `é`); curly apostrophes normalised to straight per
CONVENTIONS §Typography; the trailing comma of a quoted fragment closed as a period. No slot
deleted or merged; paragraph count preserved. Cue placement: ¶25 after the speech verb
("Helene said (in French)"), ¶33 after the speech verb ("said (in French) a fair-haired young
man"), ¶31 directly after the closing quotation mark (no speech verb) — rule 2 satisfied in
each case, once per paragraph. Nothing is printed twice anywhere.

¶14 is the one that required judgement and it was made correctly: only the opening
exclamation is French in Maude, so the cue is placed at the switch point rather than after
the closing verb, which would have mislabelled the whole thought. Marking a mid-quotation
switch necessarily breaks the quoted span in two; the convention sanctions the switch-point
placement (french-pass, `tag-no-slot`) and no alternative avoids the break.

## 6. New findings

None blocking. **No MAJOR or MODERATE finding remains** — the MAJOR (¶11) and all six
MODERATEs (¶2, ¶14 ×2, ¶16, ¶18, and the four-passage slot defect) are fully answered, and
every MINOR in the fidelity review was also applied.

- **Non-blocking, new, MINOR — ¶14 "thought he".** The corrector imported Maude's inversion
  along with the restored wording. No finding asked for it; the MODERATE was about "putting
  things squarely" only. In a modern-en edition the inversion is an archaism the repair is
  meant to remove, and the candidate's "he thought" was correct. One-token fix in a later
  round; it costs no meaning, so it does not block.
- **Author-intrinsic ruling, ¶11 (protocol step 9).** "as widow of the Grand..." breaks off in
  Maude exactly as it does here. Bilibin is declining to name the old magnate's title, and the
  aposiopesis is the joke; a chapter-isolated reader cannot complete it and neither can a
  reader of the book. The source withholds it. Kept, and the candidate's completion
  ("Seigneur") and gloss ("a great lord") correctly deleted.
- **Author-intrinsic ruling, ¶32–33 (carried from the candidate notes, confirmed).** The
  fair-haired young man is never named in the scene; Tolstoy withholds the identity. Kept.
- **Non-blocking, carry-forward — em-dash spacing.** 15 spaced em dashes remain (was 17; two
  disappeared incidentally with the ¶11 and ¶14 edits). Chapters 264, 265 and 267 of this
  batch are unspaced. The fidelity review graded this COSMETIC, and CONVENTIONS already
  schedules it as a repo-wide scripted normalisation ("Em-dash spacing alternates by chapter…
  Scripted normalisation after the diacritics decision"), not a chapter-level repair. Flagged
  so it is not lost.
- **Non-blocking, style — ¶25.** "Helene said (in French), switching from Russian … to French"
  states the switch twice: once as the cue, once in Maude's own narration. The cue is
  mandatory under CONVENTIONS §Foreign language rule 2 and the fidelity review required it, so
  the corrector was right to add it. Raised for the convention's owner, not against this file.

Verification: ACCEPT
sha256: ec4c3bddfc197ac66e57e8e880eae95e24667623a6419f97b918b6e81548cec9
