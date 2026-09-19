# Leviathan Batch C — Independent Adversarial Review

**Scope reviewed:** `lev-batchC-source.json`, `lev-batchC-current-modern-en.json`,
`lev-batchC-corrected.json`, `lev-batchC-notes.md` — chapters 21–30 (source
`number` fields 21–30), 283 paragraphs total. Every paragraph in every chapter was
read side-by-side against the locked source as part of this review (not sampled).

## Verdict: **ACCEPT WITH ONE FIX REQUIRED**

The batch is genuinely a careful, high-fidelity modernization, and the two
claimed fixes (Bible citation verse numbers in ch21 para 15) check out exactly
as described. However, this review found **one additional, uncorrected defect
in the same paragraph, of the same class as the two the drafter did catch and
fix** — a quoted passage silently replaced with the more familiar/"correct"
real-Bible wording instead of the source's own (different) phrasing. The
drafter's self-report is therefore incomplete, not wrong about what it checked.

## 1. Corrected file vs. current file

`diff lev-batchC-corrected.json lev-batchC-current-modern-en.json` → **no
differences**. Confirmed identical byte-for-byte.

## 2. The two claimed fixes — verified correct

Checked directly against `lev-batchC-source.json`, chapter 21 (array index 0),
paragraph index 15 (the "Let us now consider what the Scripture teacheth..."
paragraph):

- **Colossians citation:** source cites `(Coll. 3. 20)` for "Servants obey your
  masters in All things" and `(Verse. 22)` for "Children obey your Parents in
  All things." Current file reads `(Colossians 3:20): 'Servants, obey your
  masters in all things,' and (verse 22): 'Children, obey your parents in all
  things.'` — **matches source exactly.** Confirmed correct.
- **Titus citation:** source cites `(Tit. 3. 2)`. Current file reads `And St Paul
  (Titus 3:2): ...` — **matches source exactly.** Confirmed correct.

Both fixes are verified accurate and were not present in this reviewer's own
independent scan of citation numbers across the batch (a separate
regex-based pass over every `(Book chapter.verse)` citation in the whole batch
found citation numbers matching source in every other instance too — see §4).

## 3. Defect found, NOT caught by the drafter

**Location:** Chapter 21 (array index 0), paragraph index 15 — the same
paragraph as the two fixed defects, a few sentences after the Titus citation.

- **Source:** `...our Saviour himselfe acknowledges, that men ought to pay
  such taxes as are by Kings imposed, where he sayes, "Give to Caesar that
  which is Caesars;" and payed such taxes himselfe.`
- **Current (uncorrected) text:** `...our Saviour himself acknowledges that
  men ought to pay such taxes as kings impose, when he says, 'Render unto
  Caesar the things which are Caesar's' — and paid such taxes himself.`

The source quotes Hobbes's own (non-KJV) paraphrase, "Give to Caesar that
which is Caesars." The modern-en rendering silently substitutes the far more
familiar King James wording, "Render unto Caesar the things which are
Caesar's" — a different form of words for the same underlying reference, not
a modernization of the source's actual quoted text. This is exactly the
failure mode the drafter identified and fixed for the Colossians/Titus verse
numbers ("this happens to match the real Bible's actual wording, but the task
is fidelity to the source text as given") — except here the same silent
"correction to the well-known original" happened to the quotation itself, and
it was missed.

**Recommended fix:** replace `'Render unto Caesar the things which are
Caesar's'` with a modernization that preserves the source's actual phrasing,
e.g. `'Give to Caesar what is Caesar's'` (or as close a modernization of
"Give to Caesar that which is Caesars" as the house style prefers) — not the
KJV "Render unto..." wording.

No other paragraph in the batch exhibits this pattern. All other biblical
quotations checked (Exodus 20:19, 1 Samuel 8, 1 Kings 3:9, 1 Samuel 24:9,
Genesis 3:5/3:11, Matthew 23:2-3, Matthew 21:2-3, the Ten Commandments list
and "Sell all thou hast..." / "Repent, and be Baptized..." in ch26, Acts
19:40 in ch23, Genesis 17:10 and the Deuteronomy/Proverbs citations in ch27)
preserve Hobbes's exact quoted wording rather than being "corrected" toward
the real/famous biblical phrasing — this "Render unto Caesar" instance is the
sole exception found.

## 4. Full paragraph-by-paragraph read — findings

All 283 paragraphs across all 10 chapters were read against source. Aside
from the one defect in §3, no other content-fidelity problems were found:

- **Ch. 21 (Dominion Paternal and Despotic), 19 paragraphs:** Faithful except
  the citation defects above (2 fixed correctly, 1 quote-substitution missed).
  Amazons example, despotic-dominion definitions, Bible catalogue all intact.
- **Ch. 22 (Liberty of Subjects), 27 paragraphs:** Faithful. Liberty/necessity
  argument, fear-and-liberty, the enumerated liberties a subject retains, the
  Jephthah/Uriah/Athenian-ostracism examples (para 6), soldier-substitution
  and press-money passages (para 17) all check out clause-for-clause,
  including the "To thee only have I sinned" quote kept in the source's own
  (non-KJV) wording rather than "corrected."
- **Ch. 23 (Systems Subject, Political, and Private), 38 paragraphs:**
  Faithful, including the Acts 19:40 Ephesus/Demetrius quotation and the
  full Merchant-corporation/double-monopoly argument.
- **Ch. 24 (Public Ministers of Sovereign Power), 13 paragraphs:** Faithful.
- **Ch. 25 (Nutrition and Procreation of a Commonwealth), 16 paragraphs:**
  Faithful, including both Cicero quotations reproduced verbatim in sense.
- **Ch. 26 (Of Counsel), 15 paragraphs:** Faithful, including all scriptural
  command/counsel examples (Ten Commandments, "Sell all thou hast...",
  "Repent, and be Baptized...") kept in source's exact phrasing.
- **Ch. 27 (Civil Laws), 48 paragraphs:** Faithful, including the full
  enumerated list of 8 deductions from the definition of civil law, the
  7-part division of Roman civil law from Justinian, the flight/forfeiture
  case study with Coke's quotation reproduced verbatim, and the
  Abraham/Sinai scriptural citations (Gen. 17:10, and the repeated Exodus
  20:19 quote — also matches source, not "corrected").
- **Ch. 28 (Crimes, Excuses, and Extenuations), 55 paragraphs:** Faithful,
  including the full enumerated list of crime-aggravating factors (paras
  41–52) and the three sources of criminal error.
- **Ch. 29 (Punishments and Rewards), 29 paragraphs:** Faithful, including
  the full ten-point enumeration of what is/is not punishment and the Job
  41 Leviathan quotation.
- **Ch. 30 (Dissolution of a Commonwealth), 23 paragraphs:** Faithful,
  including all six named seditious doctrines and the full set of disease
  metaphors (defective procreation, ague, pleurisy, epilepsy/falling-sickness,
  bulimia, witchcraft, wens, ascarides/worms, lethargy).

No dropped/invented clauses, negation or conditional inversions, silently
compressed argument steps, or skipped premises/examples were found anywhere
in the batch.

## 5. Paragraph counts

Verified programmatically: all 10 chapters' paragraph counts and `number`
fields match `lev-batchC-source.json` exactly (19, 27, 38, 13, 16, 15, 48,
55, 29, 23 — sum 283), matching the drafter's claim.

Chapter *titles* differ from source by spelling modernization only (e.g.
"Common-wealth" → "Commonwealth", "Souveraign" → "Sovereign") — this is
consistent, cosmetic, and applied identically in both files. Note: both
source and current share a pre-existing off-by-one quirk where the `number`
field (21–30) is one higher than the number embedded in the chapter's own
title text (e.g. `number: 21` has title text "Chapter 20..."). This is
present in the source itself and is not something introduced by this batch;
not a defect.

## Summary

- Corrected file ≡ current file: confirmed identical.
- Two claimed fixes: both verified correct against source.
- One additional defect of the same class (source-quote fidelity) was found
  in the same paragraph and was not caught or fixed: the "Give to Caesar
  that which is Caesars" → "Render unto Caesar the things which are Caesar's"
  substitution in ch21 para 15.
- No other defects found across all 283 paragraphs in 10 chapters.

**Recommendation:** Do not accept as-is. Apply the one additional fix
identified in §3, then re-verify that single paragraph. Everything else in
the batch is ready to ship.
