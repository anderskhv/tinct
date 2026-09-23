# Book 8 — every change from `candidate-v1.json` to `candidate-v2.json`

Written by `../scripts/build_book08_v2.py`, which is the only thing
that produced them: `candidate-v1.json` is frozen and was not edited
(**D10**). Each row is one substitution, in the order the build
applies them, with the finding it answers. Every `old` string is
asserted to occur exactly once in its paragraph, and every `new`
string is asserted to have landed.

**16 substitutions in 12 of the 50 paragraphs.**

| # | paragraph | finding | from | to |
|---|---|---|---|---|
| 1 | B08-P007 | M-4 — `the playing that goes with it` misdescribes a bard who sings | `the playing that goes with it` | `the song that goes with it` |
| 2 | B08-P009 | S-2 [10] — Butler's specifying semicolon restored at P009 | `He seems very powerfully built. His thighs, calves, hands, and neck` | `He seems very powerfully built; his thighs, calves, hands, and neck` |
| 3 | B08-P009 | O-7 — `making havoc of a man` -> Butler's living `havoc with` | `making havoc of a man` | `making havoc with a man` |
| 4 | B08-P019 | O-4 — `and the sun … told` -> Butler's consequential `so` | `marriage bed, and the sun, who saw what they were about` | `marriage bed, so the sun, who saw what they were about` |
| 5 | B08-P020 | O-3 — Butler's explanatory colon at P020, restored under the new §6 rule | `the couch of Hephaestus. He is not at home` | `the couch of Hephaestus: he is not at home` |
| 6 | B08-P021 | O-6 — `entrance` is a loss with no gain; `vestibule` is current English | `stood in the entrance making` | `stood in the vestibule making` |
| 7 | B08-P034 | S-2 [26] — the *therefore* of `counting myself there are thirteen` | `there are thirteen. Contribute, each of you` | `there are thirteen; contribute, each of you` |
| 8 | B08-P039 | S-2 [30] — `heat some water; our guest will take a warm bath` | `heat some water. Our guest will take a warm bath.` | `heat some water; our guest will take a warm bath.` |
| 9 | B08-P039 | M-7 — `follow all the more` read as a unit before reversing onto `enjoy` | `He will then enjoy both his supper and the singing that will follow all the more.` | `He will then enjoy his supper, and the singing that follows, all the more.` |
| 10 | B08-P042 | M-3 — `hardly` supplied to Butler's text, inverting the sense | `He had hardly done so before` | `He had done so before` |
| 11 | B08-P043 | S-2 [34] — a period severing a conditional at P043 | `reach my home. So shall I bless you` | `reach my home; so shall I bless you` |
| 12 | B08-P044 | M-2 [35] — the concessive `For all the pain…` garden path | `tell him to eat it. For all the pain his singing may cause me, I will salute him none the less.` | `tell him to eat it; for all the pain his singing may cause me, I will salute him none the less.` |
| 13 | B08-P046 | S-2 [37] — the first seam of the three counsels | `then and there. Others would have it dragged` | `then and there; others would have it dragged` |
| 14 | B08-P046 | S-2 [38] — the third counsel, with Butler's `while` restored | `thrown down the precipice. Others again were for letting` | `thrown down the precipice; while others again were for letting` |
| 15 | B08-P047 | S-2 / M-1 — the simile's dash, and the wrong first reading it cost | `the beauty fades from her cheeks. Even so piteously` | `the beauty fades from her cheeks—even so piteously` |
| 16 | B08-P039 | flow read — `See too to` is a stutter; Butler's own `also` is doubled twelve words earlier | `See too to the careful packing` | `And see to the careful packing` |

## The marks — substantive findings S-1 and S-2, answered

| | v1 | v2 |
|---|---|---|
| semicolons, Butler → candidate | 42 → 0 | 42 → 7 |
| of Butler's own, kept | **0** | **7** |
| the draft's own, added | 0 | 0 |
| **dividing marks** (D27: `;` `:` internal `—`) | 62 → 22 | 62 → 31 |
| of which kept / added | 15 + 7 | 24 + 7 |
| NORM RATE as published (D20) | +4.3% | +3.4% |
| NORM RATE on Butler's pointing (D21) | +4.3% | +3.4% |
| NORM RATE, every dividing mark (D27) | +4.7% | +4.7% |
| **NORM RATE, D27 on Butler's pointing — the compared figure** | **+2.0%** | **+2.0%** |

**Zero survivors was the shape of a decision made once for a whole
category.** Seven of Butler's semicolons now stand, in six
paragraphs, and the build asserts the set exactly, so an eighth
appearing anywhere fails the build. Six are S-2's; the seventh is
[35] at P044, ruled at M-2. **And the eighth mark restored is not a
semicolon at all** — the em dash at B08-P047 that closes the
weeping-woman simile, which no measure in this package could see and
which is the argument D27 was decided on.

**The figure fell and that is the point.** The +27.1% raw rate was
85% cashed pointing; on the D27 basis v1 was **+2.0%** and v2 is
**+2.0%**, and what is left is division of Butler's own prose.

## Findings not applied, and why

Each is asserted **still present** in the built file, so a decline
cannot be a silent application (**D11**).

| finding | paragraph | reason |
|---|---|---|
| O-2 — `guardian angel` | B08-P043 | **Kept, on the review's own ruling and for its reasons.** The package's rule is that Butler's images are kept and nothing is added, and this is Butler's image; removing it substitutes the reviewer's Homer for Butler's. The clause already ends *“for it was you who saved me”*, so `my deliverer` and `the one who saved me` are tautologies in place, and what `guardian angel` supplies that neither does is the CONTINUING relation, which is the point of `all my days`. In current English it is a dead metaphor for a protector. **The flag is made permanent rather than raised**: `butlerism` is now a named class in `continuity.md` §6, and this Book has five. |
| O-5 — `an offering to appease the gods` | B08-P046 | **Kept, and recorded, which is what O-5 asks for.** Butler's *“an offering and propitiation for the gods”* is a hendiadys and the merge loses the second noun's force. But *propitiate* is not current English in the way *appease* is, `to appease the gods` carries exactly the sense the Trojans' third counsel needs — buying off divine anger — and the review rules either acceptable and asks only that the choice be written down. It is written down here. |
| §5.2 [41] — the optional seventh restoration | B08-P049 | **Declined.** §5.2 upholds the draft on all seven of the defensible marks and adds that **if** the coordinator wants a seventh restoration it should be [41]. Six plus [35] is already 17% of the 42, against Book 7's 27% kept, and the case for [41] is that *“have no pilots”* is an odd claim the next clause makes intelligible — which is an argument for the two clauses being adjacent, not for their being one sentence. The period does not obscure it. Recorded so the record shows it was read, not skipped. |
| M-3 (ii) — the supplied `enough` | B08-P045 | **Kept, and now recorded under D16 clause (b).** A word is missing in PG and in Butler; the candidate supplies it from Butler's own parallel eleven paragraphs earlier — B08-P006 reads *“as soon as they had had enough to eat and drink”*, the identical formula. Emendation from the author's own repetition is the strongest kind. |
| M-3 (iii) — the supplied `There were` | B08-P008 | **Kept, and now recorded under D16 clause (b).** Butler's sentence is a verbless fragment; the next sentence begins *“There was also Euryalus”*, so the supplied words are drawn from his own next clause. |
| O-1 — `Heracles` | B08-P016 | **Upheld, and D5 is widened rather than stretched.** The candidate's B08-P016 already reads `Ares`, `Aphrodite` and `Hephaestus` within a few hundred words, and the sentence itself continues *“…or Eurytus the Oechalian”* — a Greek name in the same list, in apposition. `Hercules` beside `Eurytus` is not a rule observed, it is a visible inconsistency. D5 now reads *any figure Butler names in a Roman form*, so Book 11 inherits a rule instead of re-arguing it for Persephone, Hades, Dionysus and Eos. |

## Paragraphs differing v1 → v2

B08-P007, B08-P009, B08-P019, B08-P020, B08-P021, B08-P034, B08-P039, B08-P042, B08-P043, B08-P044, B08-P046, B08-P047
