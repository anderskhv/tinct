# Odyssey Book 9 — ACCEPTED

**Accepted file:** `book09/candidate-v2.json`
**sha256:** `f762b7a33e3517af11fe6113908e16318fbe26ad30dc17e6534854b643d36485`
**Date:** 2026-09-13. **Round 1:** `book09/review/findings-v1.md` — 7
substantive, 9 minor, 8 records, 3 optional, all 44 paragraphs ruled.
**Built by:** `../scripts/build_book09_v2.py`, the only thing that produces
v2. `candidate-v1.json` is untouched (**D10**).

## The figures, all 44 paragraphs, on the corrected basis

| | v1 (frozen draft) | **v2 (accepted)** |
|---|---|---|
| Butler token retention | 0.92181 | **0.92284** |
| bag retention | 0.93447 | 0.93516 |
| MOVE-GAP / displaced runs | 0.01266 / 2 | **0.01232 / 2** |
| Sentences, source → candidate | 171 → 207 | **171 → 203** |
| Splitting rate, raw (D17) | +21.1% | **+18.7%** |
| Sixty-word sentences | 16 → 0 | **16 → 1** |
| Semicolons, Butler → candidate (D19) | 54 → 24 | **54 → 26** |
| — kept / added | 24 + 0 | **26 + 0** |
| Dividing marks (D27) | 71 → 41 | **71 → 45** |
| — kept / added (D27, membership) | 41 + 0 | **45 + 0** |
| **— kept / class-changed / added (D28, IDENTITY)** | **39 + 2 + 0** | **43 + 2 + 0** |
| NORM RATE on Butler's pointing (D21) | +2.7% | **+1.8%** |
| NORM RATE, D27 | +2.5% | **+2.5%** |
| **NORM RATE, D28 — THE COMPARED FIGURE** | **+1.7%** | **+1.7%** |
| Word ratio | 0.99138 | **0.99103** |
| Declared gate exceptions | none | **two growths, both Butler's own sentences handed back** |

**Every figure above is `scripts/checks.py`'s, and `--prose` now asserts that
they are.** v1's four prose copies published retention as **0.92164** — a
figure no file in the package produces, one matched token away from the frozen
candidate, i.e. computed over a pre-freeze draft — while `checks-v1.md` and
`manifest.json` printed the true 0.92181 and nothing compared the two. Records
finding R-1. `scripts/draft_book09_v1.py`'s docstring published a **third**
value, 0.91976, and the word ratio was published as 0.993 where 0.99138 rounds
to 0.991. **All four are corrected, and `checks.py --prose` — folded into
`--all` — now fails on a figure in a prose table that no candidate of that
Book produces at the precision it is written.** 327 numbers checked.

**And the compared figure changed for a reason, not by a correction.** v1's
+2.5% and v2's +1.7% are the same measure on the same two class changes:
**D28** is what can see them. D27 asked whether Butler's mark in the span was
a member of `{; : —}`, never whether it was the same mark, so v1 could cash
two of his colons and write two of its own over his semicolons with the census
reading `41 kept + 0 added` and the colon class reading `7 → 7`. The compared
figure did not move because the text improved; **it moved because the
measure stopped being wrong.**

## What was corrected — 19 changes in 15 paragraphs

### S-3 — six rendering collisions the check could not see

All six on words under arrow B's rarity gate (`RARE_MAX = 3` paragraphs,
`MIN_LEN = 5` letters), which is to say: **the words a narrative uses as
discriminators are its common words, and those are the ones the gate
excludes.** Four appear nowhere in the 110-row report; two were reported and
dismissed by dispositions that answer a different question.

| ¶ | Butler | v1 | v2 |
|---|---|---|---|
| P018 | `sent my ship on to the rocks` | `drove` | **`sent`** |
| P019 | `vouchsafed me not one word of answer` | `gave` | **`did not answer me with one word`** |
| P019 | `with a sudden clutch` | `snatch` | **`clutch`** |
| P019 | `supped upon them` | `made his supper of them` | **`devoured them`** |
| P037 | `they exclaimed` | `cried` | **`exclaimed`** |
| P033 | `lead the mob with a run` | `the flock` | **`them`** |

### S-4 — `humane`, and a rationale that cited the draft's own word as Butler's

`civilized` → **`humane`**, Butler's word. `continuity.md` §6 had justified
dropping `uncivilised` on the ground that the contrast is with *"a hospitable
and **civilized** race, which keeps the root"* — and the root was kept by a
word the draft wrote. The substitution also cost the sentence its point:
`humane` is *merciful, kind*, the quality the Cyclops is about to be shown not
to have, in an episode about what a host owes a guest.

### Four of Butler's MARKS restored

| ¶ | Butler | v1 | finding |
|---|---|---|---|
| P012 | `one housekeeper:` | `one housekeeper.` | question 2 — the colon makes the mixing of the wine the explanation of the secrecy |
| P021 | `to do as follows:` | `the best plan.` | **M-1** — `this` pointed forward across a full stop |
| P031 | `the best;` | `the best.` | **M-1**, second instance |
| P034 | `freed my comrades;` | `freed my comrades.` | **F-1**, found by the flow read — two consecutive sentences opening `As` |

### M-2 … M-8, and O-1

`So did he pray` → `So he prayed` (the inversion read first as *he prayed
too*); `were fools` → `very foolishly` (Butler grades an action, not the men);
`bad to deal with` → `hard`; `and by the will of Zeus` → `but`; the imperative
`Fear the wrath of heaven` → `We beg you to fear` (Odysseus gives the Cyclops
no order until P035); `besmeared` → `besmirched`; `and he turns out` →
`whereas he turns out`; and Butler's word order restored at P019's
`sobbing and sighing`.

## What was DECLINED, and asserted still present in the built file

`build_book09_v2.py` asserts each of these survives, so a decline cannot be a
silent application.

| finding | ¶ | why |
|---|---|---|
| **S-5 (P035)** | 35 | `eat up` → `to eat up` is a restructuring of a verbless exclamation, not a word supplied to Butler's sense. **Recorded** in §5; reverting it prints a sentence that is not English. |
| **S-5 (P044)** | 44 | `bade my men on board` → `told my men to go on board`: `go` is supplied by the grammar of the verb that replaced `bade`. **Recorded** in §5. |
| **M-9** | 2 | the `all highest up in the sea` crux, which Butler footnotes at four hundred words and declines to settle. A modern edition must choose; the finding is that the choice was not recorded, and it is recorded now. |
| **O-2** | 22 | `drink-offering` → `drink offering`. Recorded in §H.1 rather than changed: changing a reading for a check's convenience is the wrong direction. |
| **question 2 (P029)** | 29 | the reviewer would cash this semicolon; I would not. It is the Cyclopes shouting through a door, and three sentences is how a narrator *reports* a shout, not how one sounds. |
| **question 2 (P039)** | 39 | marginal and declined: the semicolon is the sentence's hinge between the prophet's career and the prophecy. |

## The three things this Book put into the package

1. **D29 — a repair RESTORES; it does not paraphrase.** Of the fifteen
   pre-freeze collision repairs, eleven restore Butler's own word verbatim,
   two keep his phrasing, two are forced by words that are not current
   English, and **none invents a paraphrase of the referent** — which is the
   general form of Book 8's `minstrelsy` → *the playing that goes with it*, a
   repair that described a bard instead of naming what he does, and described
   him wrongly. Arrow C's constraint says what a repair may not be; D29 says
   what it should be, and it is free. Six of this round's eight word
   corrections are literally Butler's word put back.
2. **D28 — the dividing marks by identity**, above.
3. **A11 — the source is pinned.** Round 1 showed that nothing in the package
   held `source-bookN.json`: twelve of Butler's full stops rewritten as
   semicolons moved this Book's published rate from 21.1% to 30.2% with every
   instrument exiting 0 and no declaration written. `scripts/pg_source.py`
   re-derives every chapter from PG #1727, whose own bytes are hashed and
   whose hash is reproducible from gutenberg.org by anyone.

## And the claim that was wrong about the shape of the text

`continuity.md` §4 and question 1 of `review-instructions.md` both said *"every
paragraph from P001 to P044 opens with `“` and none but the last closes one."*
**Wrong at both ends** (S-2). B09-P001 opens with the poet's frame — `And
Odysseus answered, “King Alcinous, …` — and B09-P044 closes nothing: all 44
paragraphs end at quote balance +1. Butler opens the quotation at B09-P001 and
closes it at the end of **chapter 12**; **177 paragraphs across chapters 9-12
open a quotation nobody closes**, over a span of 186. Chapter 13's balance is
zero.

This Book is not the largest instance the edition will ever have; **it is the
first quarter of it**, and the reader who meets it worst is the one who opens
chapter 11 directly and gets 54 paragraphs of unattributed speech. In the text
Butler's convention is preserved exactly. In the app it wants an affordance —
a persistent *"Odysseus is speaking"* attribution across chapters 9-12 — and
not a punctuation change, because any punctuation change here is a change to
Butler. `../PUNCTUATION.md` §2.
