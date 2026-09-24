# Resolution of v1 findings → candidate v2

Inputs:
- `fidelity-review-v1.md`: an independent reviewer checked candidate v1 against the Danish only. Result: 0 BLOCKER, 3 MAJOR, 32 MINOR.
- `accessibility-read-v1.md`: an independent reader saw the candidate text only. Result: 2 SEVERE, 30 MODERATE, about 30 LIGHT.

Rules for resolving them:
- Fidelity findings that were confirmed against the Danish were fixed.
- A comprehension failure was fixed only when the obstacle lay in the wording: sentence order, an unclear referent, a misleading gloss, or a word collision.
- Where the difficulty belongs to the source itself (its order, its paradoxes, or references it leaves unexplained), nothing was added. The difficulty is recorded instead.

27 of the 61 slots changed between v1 and v2. The slot-level diff is in `comparison/v1-to-v2-diff.md`.

## Fidelity MAJOR — all fixed

| # | Slot | Finding | v2 |
|---|---|---|---|
| F1 | P-I 0 | The immediacy clause had become the *definition* of "the single individual". That collapsed the distinction between the immediate individual and the individual of faith. | "Taken immediately — as a being of senses and soul — the single individual is the individual who has his telos in the universal." |
| F2 | P-I 0 | The gloss "an inner assault he must resist" added a verdict, which P-II 6, 20 and 23 contradict. | "a spiritual trial — an inner assault on him —" |
| F3 | P-I 16 | *det Paradoxe* had been rendered as "the paradox … can be mediated", which contradicts the fixed term. The added words "for him" relativized the claim. | "the ethical is the divine, and therefore whatever is paradoxical in his situation can be mediated in the universal" |

## Fidelity MINOR — disposition

| Slot | Finding | Disposition |
|---|---|---|
| P-I 0 | "immanent" dropped | Fixed: "rests immanently in itself" |
| P-I 1 | The ethical-life gloss imported Hegel's family/society/state | Fixed: "the morality lived out in a people's shared customs and institutions" |
| P-I 1 | *udvises* is "expelled", not "exposed" | Fixed |
| P-I 2 | *isolerer sig* | Fixed: "isolates himself" |
| P-I 4 | Absolute-relation clause detached from the definition; extra gloss idea ("and explained there") | Fixed: the clause is rejoined with a dash, and the gloss is cut to "cannot be brought under the universal" |
| P-I 13 | Interpretive gloss of "dialectic" | Fixed: gloss removed |
| P-I 16 | "for him" | Fixed (with F3) |
| P-I 18 | *forstyrret* is "deranged" | Fixed |
| P-I 18 | "fig leaf" makes the image explicit | **Kept.** The reviewer calls it defensible, and the nakedness image in the same sentence supports it. "The leaf of the word" was confusing for a newcomer. |
| P-I 22 | Second, different gloss of "dialectic" | Fixed: gloss removed |
| P-I 23 | "Secler" rendered "thirty pieces of silver" | **Kept.** This is the standard English form of the Judas reference (Matt. 26:15). "Thirty shekels" would send a newcomer looking for a different allusion. |
| P-I 24 | *forsøgte*: "tested" vs "tried" | Fixed: "put to the proof" (see the terminology change below) |
| P-I 24 | ophøie/ophæve pun lost; *ophæve* rendered "abolish" | The verb is fixed ("cancel") and the construction is fixed ("wanting to exalt it and to cancel it by exalting it in a servile way"). The *pun* itself has no English equivalent and is not reproduced. |
| P-I 24 | "they destroy themselves" is ambiguous | Fixed: "people themselves destroy it" |
| P-I 26 | *krænket* is "wronged" | Fixed |
| P-I 31 | Footnote marker placement | Fixed: the marker now follows "passion," |
| P-I note | "Lessing has somewhere said" | Fixed |
| P-II 0 | "far-off" | Lightened to "a distant African people". The content decision stands (TERMINOLOGY.md). |
| P-II 1 | "the latter" resolves the ambiguity of *det Andet* | Fixed: "by the other" |
| P-II 3 | *allerede*: "already … human powers" | Fixed |
| P-II 4 | *dogmatisk* | Fixed: "a distinction from dogmatics" |
| P-II 7 | "for its own sake" | Fixed: "for one's own sake" |
| P-II 7 | Hedge *vel* lost | Fixed: "People no doubt imagine" |
| P-II 10 | Normative *skal* | Fixed: "need not shut himself out" |
| P-II 12 | "could" | Fixed: "does" |
| P-II 16 | *som det Ethiske* | Fixed: "(such as the ethical)" |
| P-II 18 | Normative *skal* | Fixed: "should not be afraid" |
| P-II 22 | The Du gloss is longer than a definition | **Kept.** The reviewer rates it acceptable and non-interpretive. The proposed "thou" reads as *more* formal to a modern reader, which inverts the point. |
| P-II 24 | Misparse "breaking into a single moment" | Fixed: the object is reordered |
| P-II 27 | "far more" | Fixed: "rather more" |
| P-II 27 | *paanøde sig* is "force himself on him" | Fixed |

## Accessibility SEVERE

| # | Slot | Failure | Disposition |
|---|---|---|---|
| A1 | P-I 2 / 4, P-II 28 | "faith has never existed … precisely because it has always existed" is unexplained until P-II 3 | **Not changed. The difficulty belongs to the source.** Johannes states the formula three times and explains it only by implication in P-II 3. Adding an explanation earlier would put interpretation into his mouth, and the task forbids that. Recorded as a known residual difficulty. It is the first candidate for an optional reader aid outside the text (see README). |
| A2 | P-II 1 | The child/man sentence could not be parsed | Fixed: each German term is glossed where it stands, and the sentence is split: "The child is das Innere, the inner; the man is das Äussere, the outer. That is why the child is determined precisely by what is outer — and why, conversely, the man, being das Äussere, is determined precisely by das Innere." The reversal itself is Hegel's, as reported, and is kept. |

## Accessibility MODERATE — wording fixes made

- **P-I 0, title-term definition.** The blessedness sentence is split so that the steps are visible: "given up (that is, teleologically suspended). The moment eternal blessedness was suspended, it would be forfeited — whereas whatever is teleologically suspended is not forfeited, but is preserved …"
- **P-I 0, circular "the single individual … is the single individual who".** Resolved by F1.
- **P-I 1, "under 'the Good and Conscience'".** Now "under the heading 'The Good and Conscience'". The words tell the reader it is a section title, and nothing is added about its content.
- **P-I 2, "the movement repeats itself" with no referent.** Now "the movement is repeated", followed at once by the colon-led explanation already in the source.
- **P-I 6 / P-II 7, "middle term" vs "intermediate term".** Unified as "middle term". The source's gloss "that is, the universal" in P-II 7 now attaches to the same English words as in P-I 6.
- **P-I 11, P-I 24, P-II 17, P-II 20, collision of "spiritual trial" with "tried".** *forsøges* is now "put to the proof" throughout. Anfægtelse / Prøvelse / Fristelse / forsøges are therefore spiritual trial / test / temptation / put to the proof, with no shared stem between the first and the last.
- **P-I 0 gloss vs P-II 26 ("dares not flee").** Resolved by F2.
- **P-I 18, unclear referent in "the single individual was mistaken"; nested "suppose"s in the Moriah sentence.** Now "chose wrongly". The Moriah sentence is split into "Think, then, of the solitary man … Suppose he is not a sleepwalker … Suppose he becomes deranged in himself; suppose he had made a mistake!" The broken-off exclamation is kept.
- **P-I 19, the child sentence and "this form".** The sentence is restructured. "This form" now carries the apposition "— the single individual standing against the universal —". That content comes from the paragraph's own previous sentence ("He exists as the single individual in opposition to the universal").
- **P-I 22, "dialectic" gloss.** Removed. See the terminology note.
- **P-I 24, "they destroy themselves".** Fixed.
- **P-I 25/26, "them" separated from its antecedent by the slot break.** Now "these images".
- **P-II 6, "resist it".** Now "resist the spiritual trial".
- **P-II 7, "correspond … in ordinary speech"; garden path about "Isaac".** Now "match each other in ordinary speech: when …", which leads straight into the example. The garden path is reordered: "The single individual can only ever give himself any more precise explanation of what is to be understood by 'Isaac.'"
- **P-II 17, "Such an ecclesiastical hero".** A referent is supplied from P-II 16: "— the member whose sacrifice the Church demands —".
- **P-II 24, garden path.** Fixed (same fix as the fidelity finding).

## Accessibility MODERATE — not changed (the difficulty belongs to the source)

- **P-I 0, "applies to everyone … at every moment".** This is Johannes's own equation. It is kept.
- **"The absolute" never glossed as God in P-I.** The policy decision stands. P-II 4 makes the identification itself.
- **P-I 2 vs P-I 14, "the ethical — that is, ethical life" vs "the ethical in the sense of ethical life".** Both render the source faithfully (*ɔ:* vs *i Betydning af*).
- **P-I 4, four "single individual"s in one clause.** This is the formula of the paradox (Rule 3 of the policy).
- **P-I 6, "except a later one".** The ambiguity is deliberate.
- **P-I 8–11, heroes described before being named; "that messenger"; "line 687".** This is the source's rhetorical order. Naming the play would add a reference the source withholds.
- **P-I 15, why "a test, a temptation" expresses the unity.** The source asserts it without explanation.
- **P-I 20, the Pythagoras detour.** This is the source's own digression.
- **P-I 21, "So …" skipping to "the lecturers".** This is the source's satirical leap. The connective was kept.
- **P-II 11, "literally" argued only by exclusion.** This is the source's order. The link closes at P-II 13–14.
- **P-II 15, "either love or hate" called egoistic.** The source asserts it without explanation.
- **P-II 26, "dares not flee … because it would be more terrible".** This is the source's logic.

LIGHT items were reviewed. Where the fix was a harmless reordering it was folded into the edits above. Otherwise they were left as they are.

## Re-verification

The changed slots were sent to a **fresh** fidelity verifier, who had not seen v1's reviews, and a **fresh** comprehension reader, who saw only the v2 text. Their reports are in `reverification-v2.md` and `accessibility-read-v2.md`.
