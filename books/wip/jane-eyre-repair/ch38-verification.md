# Jane Eyre — Chapter 38 (Conclusion), modern-en repair — INDEPENDENT VERIFICATION

Reviewer: independent (did not draft the repair). Adversarial fidelity check.
Files compared: `ch38-source.json` (ground truth), `ch38-current-modern-en.json` (pre-repair),
`ch38-corrected.json` (candidate).

## 1. Independently confirmed diff set

Re-ran a byte-level paragraph-by-paragraph comparison myself (not the drafter's script).

- Paragraph counts: source 24, current 24, corrected 24. Alignment intact.
- Changed (0-based): **1, 10, 12, 13** — exactly the four claimed, nothing else.
- Unchanged and byte-identical: 0, 2–9, 11, 14–23.
- Top-level JSON shape preserved (`number: 38`, `title: "Chapter 38 — Conclusion"`, `paragraphs`); both files parse cleanly.

Word-count ratios vs source for the repaired paragraphs (was → now):

| idx | source | pre-repair | corrected | ratio to source |
|-----|--------|-----------|-----------|-----------------|
| 1  | 119 | 94  | 99  | 0.83 |
| 10 | 232 | 145 | 231 | 1.00 |
| 12 | 170 | 157 | 169 | 0.99 |
| 13 | 196 | 102 | 189 | 0.96 |

All four now clear the 75% floor; 10 and 13 move from clear truncation (0.63, 0.52) to full restoration.

## 2. Per-paragraph verification against source

| idx | Claim | Verdict | Source evidence |
|-----|-------|---------|-----------------|
| 1 | John's knives detail restored | **CONFIRMED** | Source: "and for the same space of time John's knives also had rest from the polishing process". Corrected: "and for that same span John's knives also went still, resting from their polishing." Parallel pause of both servants restored. |
| 1 | Staging fixed — Mary speaks while bending over the roast | **CONFIRMED** | Source: "but Mary, bending again over the roast, said only—". Corrected: "But Mary, bending again over the roast, said only—". The invented "When she had finished and put the ladle down" is gone. Ladle now "hung suspended in midair for about three minutes" (source: "did for some three minutes hang suspended in air"). |
| 10 | Jane's stated reason for the school | **CONFIRMED** | Source: "my time and cares were now required by another—my husband needed them all." Corrected: "my time and care were now required by another; my husband needed them all." |
| 10 | Proximity for visits | **CONFIRMED** | Source: "near enough to permit of my visiting her often, and bringing her home sometimes" → "near enough that I could visit her often and bring her home sometimes." Also "a more indulgent system" → "a gentler system". |
| 10 | "never want for anything" | **CONFIRMED** | Source: "I took care she should never want for anything that could contribute to her comfort" → "I made sure she never lacked for anything that could add to her comfort." |
| 10 | Character description | **CONFIRMED** | Source: "docile, good-tempered, and well-principled" — restored verbatim, attached to "a pleasant and obliging companion" (source: "a pleasing and obliging companion"). |
| 10 | Closing gratitude line | **CONFIRMED** | Source: "By her grateful attention to me and mine, she has long since well repaid any little kindness I ever had it in my power to offer her." → "Through her grateful attentiveness to me and mine, she has long since more than repaid whatever small kindness I was ever able to show her." Also restored: "She soon settled into her new home, grew very happy there, and made good progress in her studies" (source has all three clauses). Accent on "Adèle" also restored. |
| 12 | True ending restored | **CONFIRMED** | Source: "All my confidence is bestowed on him, all his confidence is devoted to me; we are precisely suited in character—perfect concord is the result." Corrected: "All my confidence is given to him; all his confidence is given to me. We are exactly suited in character—perfect harmony is the result." The invented "His presence is all I need. Mine, he says, is all he needs." is gone. Also restored: "We talk all day long, I believe" (source's "I believe"), and "as gay as in company" now "as lighthearted" rather than the weaker "as content". |
| 12 | Pronoun-agreement fix | **CONFIRMED** | Source: "No woman was ever nearer to her mate than I am: ever more absolutely bone of his bone and flesh of his flesh." The source's colon is elliptical — the subject carried forward is *no woman … than I am*, i.e. Jane herself, not a plural "we". Corrected: "No woman was ever nearer to her husband than I am—never was any woman more truly bone of his bone and flesh of his flesh." This resolves the ellipsis correctly and keeps the comparative-superlative claim structure of the source. See §4 below for the read-aloud check. |
| 13 | Second half restored, not still truncated | **CONFIRMED** | Source's full tail is present in order: "Never did I weary of reading to him; never did I weary of conducting him where he wished to go: of doing for him what he wished to be done." → "Never did I tire of reading to him; never did I tire of leading him wherever he wished to go, of doing for him whatever he wished done." |
| 13 | Full "mutual services without shame or humiliation" argument | **CONFIRMED** | Source: "And there was a pleasure in my services, most full, most exquisite, even though sad—because he claimed these services without painful shame or damping humiliation. He loved me so truly, that he knew no reluctance in profiting by my attendance: he felt I loved him so fondly, that to yield that attendance was to indulge my sweetest wishes." Corrected carries all three moves — the pleasure, the reason (no shame/humiliation in his claiming), and the reciprocity clinch ("he knew I loved him so fondly that to give that care was to indulge my dearest wishes"). Also restored in the first half: "For I was **then** his eyes" (source "I was then his vision"), which the pre-repair text had dropped. |

No restored clause was found that is absent from the source. No invented content was introduced in the four repaired paragraphs.

### Minor, non-blocking observations inside the repaired paragraphs

1. **Para 12** — source's asymmetric verbs "bestowed on him" / "devoted to me" both collapse to "given". Meaning intact, a touch of Brontë's rhetorical texture lost. "Concord" → "harmony" is acceptable modernization.
2. **Para 13** — the source pairs "he **knew** no reluctance … he **felt** I loved him"; the corrected text swaps them ("he **felt** no reluctance … he **knew** I loved him"). Modern idiom is better served this way, but "he knew I loved him" asserts slightly more certainty than the source's intuitive "he felt". Defensible; flagging for the record only.
3. **Para 13** — "damping humiliation" → "crushing humiliation". "Damping" means dispiriting; "crushing" is stronger. Acceptable.
4. **Para 1** — the source's chickens are "roasting at the fire"; the corrected text keeps the pre-repair "a pair of roasting chickens", dropping the hearth. Inherited, not newly introduced.
5. **Para 10** — "her French defects" rendered "the faults of her French upbringing" (interpretive but fair); "when she left school" → "by the time she left school". Inherited/minor.

None of these changes a claim, drops a clause, or flattens a thought. None blocks acceptance.

## 3. Continuous read of paragraphs 0–13 as the novel's ending

Read straight through, the ending now lands as Brontë's resolution rather than a précis of it.

- The kitchen scene (0–6) works as comedy again: both servants freeze — ladle in air, knives idle — and Mary's flat "Have you, Miss?" now comes *out of* that suspended tableau, mid-baste, which is the joke. The pre-repair staging (finish basting, set down ladle, then speak) neutered it.
- 7–9 (Diana, Rochester's "our honeymoon will last our whole lives", St. John's silence) carry through cleanly; untouched and sound.
- 10 is restored to a full epilogue: Adèle's unhappiness, Jane's *reason* for not resuming as governess (the husband claims all her time — which is the point, and which the gutted version deleted), the nearer school, the visits, the character verdict, the repayment. Without those the paragraph was a shrug; it now closes Adèle's arc.
- 11 is the hinge sentence and sets up the two-paragraph coda.
- 12 now ends where Brontë ends it — on mutual confidence and perfect concord — instead of on the invented, thinner "His presence is all I need." The "bone of his bone" line reads as Jane's own superlative claim, which is what the source asserts.
- 13 is the thematic payoff and is whole again: service given without shame claimed, love that feels no reluctance in being cared for, care that is itself the carer's dearest wish. This is the novel's answer to St. John's proposal and to Rochester's earlier mastery, and the pre-repair text had cut it off mid-thought at "what light could no longer stamp upon his eyes."

No flattening detected in 0–13. Register is consistent — plain modern English, Brontë's sentence order and claim sequence preserved, no anachronism, no editorializing.

## 4. Para 12 mixed-pronoun check (read aloud)

> "No woman was ever nearer to her husband than I am—never was any woman more truly bone of his bone and flesh of his flesh."

Clean. Subject of both clauses is *no woman / any woman*; "his" refers unambiguously to the husband; "I am" anchors the comparison. No "we … his" collision anywhere in the paragraph — the surrounding plurals ("We are always together", "We are exactly suited in character") are self-contained with plural referents. Grammatically coherent on read-aloud. The defective "We are truly bone of his bone and flesh of his flesh" is fully gone.

## 5. New errors introduced

**None found.** All four edits are additive restorations plus the two targeted rewrites; the other 20 paragraphs are byte-identical; JSON is valid; paragraph count and alignment unchanged; no duplicated or dropped sentences inside the edited paragraphs; punctuation/quote style (straight quotes, em dashes) matches the rest of the file.

## 6. Pre-existing defects found OUTSIDE the repair scope (not introduced here — flag for a follow-up pass)

These were already present in `ch38-current-modern-en.json`, were correctly left untouched by this scoped repair, but they are as serious as the four that were fixed and they sit in the same ending.

1. **Paragraph 19 — invented quotation.** Source ends: "he again, with a full heart, acknowledged that God had tempered judgment with mercy." The modern-en substitutes a fabricated direct quote: *"God is merciful! He sees that I have earned the right to a little happiness, and He grants it."* This is not in Brontë's Chapter 38 (and it inverts the theology — "tempered judgment with mercy" is not "I have earned the right"). Should be corrected.
2. **Paragraph 21 — St. John's peroration gutted and partly invented.** 188 source words → 123 (ratio 0.65, below the 75% floor). Dropped: "the warrior **Greatheart**, who guards his **pilgrim convoy** from the onslaught of **Apollyon**" (Pilgrim's Progress allusion) replaced by the invented "the warrior who guards his captain's tent"; the entire Christ quotation "Whosoever will come after me, let him deny himself, and take up his cross and follow me" is deleted; "the ambition of the high master-spirit … redeemed from the earth … the last mighty victories of the Lamb … called, and chosen, and faithful" (Revelation) replaced by the invented "the servant laboring in his Master's vineyard" and "a man willing to lay down his life for the truth". Also lost: "he labours for his race". This is the last full paragraph of the novel and currently misrepresents it.
3. **Source-extract defect: paragraphs 16 and 17 are duplicates** — `"And have you a pale blue dress on?"` appears twice in `ch38-source.json` (once quoted, once bare), and the modern-en mirrors both. Alignment is therefore preserved, but the upstream `original-en` chapter should be checked: the second occurrence looks like a parsing artifact and may need removal across all three editions in lockstep.

## Final verdict

**READY TO ACCEPT — for the four paragraphs in scope.** All four repairs are confirmed faithful and complete against the 1847 source; the diff is exactly 1, 10, 12, 13; the para 12 pronoun fix is grammatical and matches the source's claim structure; para 13 is fully restored, not still truncated; no new error was introduced anywhere. `ch38-corrected.json` can replace the current modern-en Chapter 38.

**The chapter as a whole is NOT yet clean.** Paragraphs 19 and 21 carry invented text and, in 21's case, a substantial truncation of the novel's final movement. Recommend a second scoped repair pass on 19 and 21 (plus an upstream check of the duplicated source paragraph 16/17) before Chapter 38 is called done.
