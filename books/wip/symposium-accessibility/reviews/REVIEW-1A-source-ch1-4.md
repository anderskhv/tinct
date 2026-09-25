# Review 1A — Source fidelity, Symposium modern-en accessibility pass, chapters 1–4

- **Reviewer role:** independent source-fidelity reviewer. I did not write the text under review.
- **Packet reviewed:** `source-packet-A.md`, covering chapters 1–4 (46 changed paragraphs).
- **Candidate sha256 (packet header):** `46fa34ea4821eb2fa5e713915acb40bbf10fe224d79682adde9f68feb2b0113e`. Verified against `cand/symposium-modern-en.json`.
- **Source / baseline:** `base-original-en.json` (sha256 `3521a12d…95a6`) and `base-modern-en.json` (sha256 `1e970b7b…374f`). Both match STYLE.md §1.
- **Standard applied:** `books/wip/symposium-accessibility/STYLE.md`, read in full.
- **Date:** 2026-09-25

## Method

- I compared every CANDIDATE paragraph with the SOURCE sentence by sentence. I used BEFORE only to separate new wording from wording carried over from the accepted baseline.
- I also read the unchanged neighbors: the verse lines, 1.13–1.31, 3.0, 3.2, 3.4 and 3.9. This checked quotation levels and cross-references.
- **Mechanical checks:**
  - The 46 packet coordinates are exactly the changed paragraphs in chapters 1–4.
  - The candidate has 226 paragraphs, with chapter titles and paragraph counts identical to source and baseline.
  - Verse paragraphs 1.16, 1.18, 1.21, 1.23, 1.45, 2.1 and 2.3 are untouched.
  - In the 46 paragraphs:
    - the spaced em-dash is the only non-ASCII character;
    - there are no curly quotes and no `--`;
    - there are no British spellings;
    - contractions appear only in conversation, apart from the pre-existing "isn't" in 3.6 (#16).
- Findings marked **pre-existing** were already in the accepted baseline and were carried into the candidate unchanged. I list them because the pass re-rendered those paragraphs, STYLE.md governs them, and each is a local fix.
- I used no external sources. The one reference to the Greek (#8) only backs up a point that already follows from the text's own argument.

## Overall verdict: ACCEPT WITH CHANGES

The pass's own rewrites in chapters 1–4 are faithful in substance:

- **Nothing dropped.** No step of argument, example, image, proper name, number or hedge is missing. "I think", "I suppose", "I believe", "perhaps", "so people say", "as far as we can", "I dare say" and "I seem to have" all survive.
- **No new reversals or misattributions.** The lover/beloved roles and the Heavenly/Common and love/Love distinctions hold, and 2.7 now states the roles plainly.
- **Glossary applied consistently:** Sparta, Greece/Greeks, Heraclitus, of the deme of Myrrhinus, hiccups, dinner/dine, self-control (persons) vs moderation (seasons, 4.4), beautiful, a god, and "to sing his praises".
- **Speaker tags are correct.**
- **Quotation conventions are now right.** The set-speech convention covers Eryximachus (4.0–4.5). The conversational quotes and the reopening after verse lines are correct in 1.17–1.24, 3.10–3.11 and 4.6–4.9.
- **Glosses are accurate, minimal and neutral.**

Several items stand in the way of an unconditional accept:

1. **One BLOCKING item, pre-existing (#1).** It sits in a paragraph this pass re-rendered. In 3.3, Jowett's "loves of youths" is still rendered "love between males", which breaks STYLE §2.
2. **Four problems introduced by this pass:**
   - #2: 1.33 is left with an orphaned "the fit";
   - #3: "badly" is misplaced in 1.36;
   - #4: 1.46 now says "in his honor" instead of offering Phaedrus a contribution;
   - #9: 4.3 softens "licentiousness" to "excess".
3. **One inherited ambiguity sharpened (#8).** In 4.1 a new sentence break makes "his rule" point at Asclepius rather than Love.
4. **Three pre-existing clarity or glossary problems in chapter 3:** #5 in 3.5, and #6 and #7 in 3.8.

Every one of these is a phrase-level fix with no structural change. Once #1–#9 are fixed, packet A can be accepted. The OPTIONAL items are at the editor's discretion.

## Findings

| # | Coordinate | Severity | Finding | Source wording | Candidate wording | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | 3.3 | BLOCKING (pre-existing) | Age-specific (pederastic) term generalized. "Loves of youths" becomes "love between males", so the youth/age element that STYLE §2 says must "stay as the source states" is lost, and the phrase now reads as a modern category. This is not the pass's own error, but the paragraph was re-rendered in this pass | "loves of youths share the evil repute in which philosophy and gymnastics are held" | "There, love between males shares the evil reputation attached to philosophy and gymnastics" | "There, the love of youths shares the evil reputation…" (cf. 3.1 "the love that is directed toward youths") |
| 2 | 1.33 | SHOULD-FIX | Orphaned reference, new. 1.25's "in a fit of abstraction" became "lost in thought", so "the fit" now has no antecedent. A first-time reader meets it out of nowhere, and "fit" suggests a seizure or a tantrum | "for the fit, as usual, was not of long duration" (antecedent 1.25: "in a fit of abstraction") | "for the fit, as usual, did not last long" | "for, as usual, his spell of thought did not last long" |
| 3 | 1.36 | SHOULD-FIX | Misplaced adverb, new. Heard aloud, "badly" attaches to "drinking" ("yesterday's drinking badly") | "I feel severely the effect of yesterday's potations" | "I am still feeling the effects of yesterday's drinking badly" | "I am still suffering badly from yesterday's drinking" |
| 4 | 1.46 | SHOULD-FIX | Meaning drift, new. Eryximachus offers Phaedrus a contribution to his cause; the candidate has him contribute "in his honor", making Phaedrus the one honored, just before the clause about honoring Love. It also breaks the echo with 3.9, "To you, Phaedrus, I offer this contribution of mine" | "and therefore I want to offer him a contribution" | "and so I want to make a contribution in his honor;" | "and so I want to offer him a contribution;" |
| 5 | 3.5 | SHOULD-FIX (pre-existing) | Pronoun can reverse the sense. The last "them" before this is the sons ("taunt them"), so "rebuke them" reads as the elders not rebuking the sons. The source says the elders do not rebuke the reprovers | "and their elders refuse to silence the reprovers and do not rebuke them" | "and their elders refuse to silence these reproaches or rebuke them" | "and their elders neither silence nor rebuke those who taunt them" |
| 6 | 3.8 | SHOULD-FIX (pre-existing) | "The love of youth" now reads as "youthful love". Jowett means the custom of loving youths (the lover/beloved custom of 3.1–3.7). A milder form of #1 | "one the love of youth" | "These two customs — the love of youth, and the practice of philosophy and virtue generally" | "the love of youths" |
| 7 | 3.8 | SHOULD-FIX (pre-existing) | Glossary §4 (the person loved is "beloved") and clarity. "Gracious" now reads as "courteous". Jowett means the beloved who has granted the lover favors; later in the same paragraph, "gracious to his lover" is rendered "yields to a lover" | "to his gracious loving one" | "for his gracious loved one" | "for the beloved who has yielded to him" |
| 8 | 4.1 | SHOULD-FIX | Argument step obscured. Jowett's "his dominion" is ambiguous, and the candidate's new sentence break makes "his rule" read as Asclepius's. Eryximachus's thesis is that Love rules these arts: 4.0 says "his rule extends over all things", the Greek has "governed by this god" (Love), and the next step, to music, depends on it | "was the creator of our art, as our friends the poets here tell us, and I believe them; and not only medicine in every branch but the arts of gymnastic and husbandry are under his dominion." | "and so he founded our art, as our poets here tell us — and I believe them. Not only medicine in all its branches, but physical training and farming as well, are under his rule." | "…physical training and farming as well, are under Love's rule." |
| 9 | 4.3 | SHOULD-FIX | Softening, new (STYLE §1). "Licentiousness", the vice opposed to self-control, becomes "excess", which reads as mere quantity | "that the pleasure be enjoyed, but may not generate licentiousness" | "so that its pleasure can be enjoyed without breeding excess" | "without breeding licentiousness" (or "without leading to debauchery") |
| 10 | 1.12 | OPTIONAL | Causal link ("as the sight … was unusual, he asked") weakened to "and", and the trailing participle "looking so fine" is loosely attached | "and as the sight of the sandals was unusual, he asked him whither he was going that he had been converted into such a beau" | "wearing sandals — an unusual sight — and asked him where he was going, looking so fine." | "wearing sandals — an unusual sight — so he asked him where he was going, looking so fine." |
| 11 | 1.19 | OPTIONAL | (a) Superlative weakened. (b) The paragraph continues a sentence after a verse line ending in ";", but it opens with a capital "'And", whereas 1.17 in the same pattern keeps "'and" | "after picturing Agamemnon as the most valiant of men"; "and this alteration may be supported" | "He portrays Agamemnon as an outstanding warrior"; "'And we can support this change" | "as the bravest of warriors"; "'and we can support this change" |
| 12 | 1.26 | OPTIONAL | The final clause chains "he … his" straight after "Socrates had been with him". This is the kind of ambiguity §3.5 targets in this very paragraph; context resolves it, but a listener has to work it out | "and that I came by his invitation to the supper" | "and that he had come to the dinner at his invitation." | "and that it was Socrates who had invited him to the dinner." |
| 13 | 1.32 | OPTIONAL | The §3.5 tag is correct, but Apollodorus's framing marker "my informant" has gone | "Let him alone, said my informant" | "'Leave him alone,' said Aristodemus." | "'Leave him alone,' said Aristodemus, my informant." |
| 14 | 2.0 | OPTIONAL | Indefinite "a proof" becomes definite "The proof", implying a single decisive proof | "and a proof of his claim to this honour is, that of his parents there is no memorial" | "The proof of his claim to this honor is that there is no record of his parents" | "One proof of his claim to this honor is that…" |
| 15 | 2.4 | OPTIONAL | "Cowardly" used as an adverb is awkward to hear | "or submitting through cowardice when any dishonour is done to him by another" | "or cowardly submitting to dishonor at someone else's hands" | "or submitting through cowardice to dishonor at someone else's hands" |
| 16 | 3.6 | OPTIONAL (pre-existing) | (a) Jowett's "both of them" means the two sorts of lover just described. The candidate names "lover and beloved" here, anticipating the paragraph's last clause, and the "— have us yield" continuation is hard to parse. (b) "isn't" is a contraction in a set speech (§6 fuller register); 3.0 and 3.4 also contract, so decide this chapter-wide | "The custom of our country would have both of them proven well and truly, and would have us yield to the one sort of lover and avoid the other"; "inasmuch as he is not even stable" | "The custom of our country would have both lover and beloved thoroughly tested — have us yield to the one sort of lover and avoid the other"; "he isn't even stable" | "…would have both kinds of lover thoroughly tested, and would have us yield to the one sort and avoid the other"; "he is not even stable" |
| 17 | 3.7 | OPTIONAL (pre-existing) | Actual loss becomes feared loss, and "frightened … by the fear" is redundant. This is outside the confirmed corrected sentence | "whether a man is frightened into surrender by the loss of them" | "whether a man is frightened into surrender by the fear of losing them" | "whether a man is frightened into surrender by losing them" |
| 18 | 4.0 | OPTIONAL | "The healthy" and "the diseased" are conditions within one body (the next sentence says "elements"), but the candidate turns them into two different bodies | "the desire of the healthy is one, and the desire of the diseased is another" | "what the healthy body desires is one thing, and what the diseased body desires is another." | "what is healthy in the body desires one thing, and what is diseased desires another." |
| 19 | 4.2 | OPTIONAL | (a) Dropping "latter" loses the point that only the second item (performing existing works) is called education. (b) "Did" turns a general truth into a past event | "which latter is called education"; "as in the former instance, medicine, so in all these other cases, music implants" | "which is called education"; "as medicine did in the body" | "the latter of which is called education"; "as medicine does in the body" |
| 20 | 4.3 | OPTIONAL | (a) Urania's epithet "fair" (glossary: "beautiful") is dropped. (b) "Overindulgence" is added; the source says only "the attendant evil of disease" | "the love of Urania the fair and heavenly muse"; "without the attendant evil of disease" | "the love that belongs to Urania, the heavenly Muse"; "without the illness that comes with overindulgence" | "Urania, the beautiful and heavenly Muse"; "without the illness that would otherwise follow" |
| 21 | 4.4 | OPTIONAL | "Feelings" (inner attitude) becomes "conduct" (outward behavior) | "whether in his feelings towards gods or parents, towards the living or the dead" | "whether in his conduct toward gods or parents, the living or the dead" | "whether in his feelings toward gods or parents, the living or the dead" |
| 22 | 4.5 | OPTIONAL | "Is fulfilled with" can be heard as "is filled with" | "which is perfected in company with temperance and justice" | "and is fulfilled with self-control and justice" | "and is perfected in company with self-control and justice" |
| 23 | 4.1, 4.3 | OPTIONAL (glossary note) | (a) "Fair" in the moral sense becomes "noble" ("foul" becomes "base", which §4 allows by context). This suits the context, but §4 gives only "beautiful" for "fair". (b) 4.3's "heavenly love" and "the common love" are lowercase. §4 says both "capitalized as names" and "'Vulgar' becomes 'common'", which conflict, so the rule is unclear | "separate fair love from foul"; "fair and heavenly love"; "the vulgar Polyhymnia" | "tell the noble love from the base"; "the noble, heavenly love"; "the common love, which belongs to the Muse Polyhymnia" | No text change needed. Record "fair (moral sense) → noble" in STYLE §4 and state whether descriptive "heavenly"/"common" stay lowercase |

**Counts:**

- **BLOCKING: 1**, pre-existing.
- **SHOULD-FIX: 8.**
  - 4 introduced by this pass: #2, #3, #4, #9.
  - 1 inherited ambiguity sharpened by this pass: #8.
  - 3 pre-existing: #5, #6, #7.
- **OPTIONAL: 14.**

## Glosses and added speaker tags

| Where | Addition | Judgment |
|---|---|---|
| 1.17 | "— since Agathon's name means "good" —" | **Accept.** Accurate: it explains the pun on Agathon, which Jowett's English hides. Minimal and neutral. It sits inside Socrates's quotation but states a fact about the name, not an opinion. |
| 1.34 | "along a thread of wool" | **Accept.** An accurate plain-English version of the image (§5). |
| 1.36 | "libations of wine" | **Accept.** Accurate and minimal. |
| 2.2 | "Generation, the power that brings things to birth" | **Accept.** It gives the subject of the next verse ("he fashioned Love"), matches Jowett's personification, and is neutral. |
| 4.1 | "whose parts pull against each other" | **Accept.** Explains Heraclitus's bow-and-lyre image. Neutral: Eryximachus's objection follows intact. |
| 4.8 | "my comic Muse" | **Accept.** A minimal gloss on "our muse". |
| 1.14, 1.26, 1.28, 1.32 | "Aristodemus" named for the narrator's "I"/"my informant" | **Correct** (§3.5). |
| 3.10 | "Aristophanes said" | **Correct.** Jowett's "he" is Aristophanes but could be read as Aristodemus or Eryximachus. |
| 4.9 | "said Eryximachus" | **Correct.** The line is untagged in Jowett but is Eryximachus's; the tag is within the spirit of §3.5. |
| 1.47 | "told Phaedrus" | **Correct.** Resolves Jowett's "desired him". |

## Coverage

| Coordinate | Result |
|---|---|
| 1.12 | #10 |
| 1.14 | OK (tag per §3.5) |
| 1.17 | OK (gloss accepted; quotation reopened after verse per §3.4) |
| 1.19 | #11 |
| 1.20 | OK (stray comma after the closing quote removed) |
| 1.22 | OK |
| 1.24 | OK |
| 1.25 | OK (its rewording orphans "the fit" in 1.33; see #2) |
| 1.26 | #12 |
| 1.28 | OK (tag per §3.5) |
| 1.30 | OK |
| 1.32 | #13 |
| 1.33 | #2 (also fixes the doubled quotation marks in the baseline) |
| 1.34 | OK (gloss accepted) |
| 1.35 | OK |
| 1.36 | #3 |
| 1.40 | OK |
| 1.41 | OK |
| 1.43 | OK |
| 1.44 | OK |
| 1.46 | #4 |
| 1.47 | OK |
| 2.0 | #14 |
| 2.2 | OK (gloss accepted) |
| 2.4 | #15 |
| 2.5 | OK |
| 2.6 | OK ("the one they love" for "their beloved" is right: the sentence covers Alcestis and her husband, where the technical "beloved" would mislead) |
| 2.7 | OK (roles stated plainly per §4) |
| 3.1 | OK |
| 3.3 | #1 (confirmation present) |
| 3.5 | #5 |
| 3.6 | #16 |
| 3.7 | #17 (confirmation present) |
| 3.8 | #6, #7 (confirmation present) |
| 3.10 | OK |
| 3.11 | OK |
| 4.0 | #18 |
| 4.1 | #8, #23 |
| 4.2 | #19 |
| 4.3 | #9, #20, #23 |
| 4.4 | #21 |
| 4.5 | #22 |
| 4.6 | OK |
| 4.7 | OK |
| 4.8 | OK |
| 4.9 | OK (added tag correct) |

## Chapter 3 confirmations

- **3.3:** "For Aristogeiton's love and Harmodius's constancy proved strong enough to bring down their power." Present verbatim, once.
- **3.7:** "There remains, then, only one honorable way, allowed by custom, for the beloved to yield — the way of virtue." Present verbatim, once.
- **3.8:** "because he has done his best to show that he would give himself up to anyone's 'uses base' for the sake of money". Present verbatim, once.

## Note outside the packet

3.0 is unchanged and outside this packet. It has "the heavenly Aphrodite" in lowercase, while the next paragraph, 3.1, has "the Heavenly Aphrodite". Consider aligning them when #23 is settled.
