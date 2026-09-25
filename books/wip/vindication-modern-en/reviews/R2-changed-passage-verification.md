# R2 — Changed-passage verification

- **Verifier:** independent changed-passage verifier (Claude, fresh context; no prior authorship or review of this text)
- **Scope:** the 38 paragraphs changed between `candidate-r0.json` (pre-fix) and `candidate.json` (post-fix), checked against `source-original-en.json` under `STYLE-NOTE.md`; plus whole-file structural and byte-identity checks
- **Date:** 2026-09-25

## Programmatic checks

| Check | Result |
|---|---|
| Chapter count source / pre / post | 15 / 15 / 15 |
| Chapter `number` and `title` post vs source | All 15 identical |
| Paragraph count per chapter (source = pre = post) | Identical in all 15 chapters |
| Paragraphs differing pre vs post | Exactly 38, and they are exactly the listed set (no extra, none missing) |
| All other paragraphs pre vs post | Byte-identical |
| Non-chapter top-level keys (`sections`) | Identical pre vs post |

## Per-paragraph verification

Word-level diffs were computed with the whitespace-token SequenceMatcher. "Diff-exact" means that only the intended phrase changed and nothing else in the paragraph moved.

| coord | diff-exact? | faithful? | notes / required fix |
|---|---|---|---|
| ch1 p6 | Yes | Yes | "far more widely" → "more widely" (src "more universally prevail"). Over-sharpening removed. |
| ch1 p15 | Yes | Yes | "ruin his health" → "weaken his health" (src "weaken his constitution"). |
| ch2 p3 | Yes | Yes | "I can foresee an obvious objection" → "I am aware of an obvious inference", now matching the source's wording. |
| ch3 p9 | Yes | Yes | "crush" → "overwhelm" (src "overwhelm"). |
| ch3 p13 | Yes | Yes | "unfolded" → "developed" (src "passions should unfold our reason"). Reads naturally. |
| ch3 p26 | Yes | Yes | "corps" → "professional body" (src "the body", meaning the professional corporation). The gloss is apt. |
| ch4 p3 | Yes | Yes | "thoroughly" → "very" (src "very unphilosophical"). |
| ch4 p15 | Yes | Yes | "trained" → "broken in" (src "broken into method"). This keeps her coercive image, and "broken in to method" is grammatical. |
| ch4 p24 | Yes | Yes | "cultivated only within" → "cultivated within" (src "with certain restrictions"); "must" → "ought to" (src "ought"). |
| ch4 p51 | Yes | Yes | "Rousseau quite fittingly makes" → "Rousseau, with perfect propriety, makes" (src "With perfect propriety"). Commas are correct. |
| ch5 p15 | Yes | Yes | "insulting to" → "detracting from" (src "derogatory to"). |
| ch5 p18 | Yes | Yes | "would put it." → "would insinuate." (src "insinuate"). This restores her sneer. |
| ch6 p14 | Yes | Yes | "plausible" → "specious" (src "specious"). |
| ch6 p18 | Yes | Yes | "regret" → "lament" (src "lament"). |
| ch7 p59 | Yes | Yes | "My quarrel is not…/I quarrel only" → "I am at war not…/I am at war only" (src "I war"). Grammatical, and the parallelism is intact. |
| ch7 p94 | Yes | Yes | "can certainly be excused" → "are certainly very excusable" (src "certainly very excusable"). The irony is preserved. |
| ch7 p123 | Yes | Yes | "wrote" → "spoke" (src "talked with passion"). |
| ch7 p138 | Yes | Yes | "how can habits fortify them, when example proves those habits to be deceptive?" → "how can principles be fortified by habits, when example proves them to be deceptive?" This corrects a reversed referent: in the source it is the principles that are proved fallacious. |
| ch8 p1 | Yes | Yes | "arrange themselves of their own accord" → "arrange themselves". The source has no "of their own accord" and qualifies with "in some degree", which the post keeps. |
| ch8 p6 | Yes | Yes | "every book written expressly to instruct them" → "every book that professes to be written for their instruction" (src "professedly written"). The slight irony is restored. |
| ch8 p9 | Yes | Yes | "awareness of her own humility" → "awareness of humility". The addition is removed. |
| ch8 p13 | Yes | Yes | "among women… and by the wanton airs" → "in the ways of women… and in the wanton airs" (src "in the ways of women… and allurement's wanton airs"). |
| ch9 p3 | Yes | Yes | "habit" → "custom" (src "custom"). |
| ch9 p21 | Yes | Yes | "though sensibility had its share" → "though she had her share of sensibility" (src "though she had her share"). The referent is corrected. |
| ch10 p26 | Yes | Yes | "cultivates an ever more refined taste for female softness" → "refines upon female softness" (src "refines on"). The addition is removed. The phrase is slightly archaic but faithful and intelligible. |
| ch11 p6 | Yes | Yes | "equally independent," → "equally independent of each other," (src "of each other"). |
| ch11 p17 | Yes | Yes | Inserted "necessarily" (src "must necessarily fulfil"). |
| ch11 p30 | Yes | Yes | "sex! Yet" → "sex; yet" (src has a semicolon). The over-exclamation is removed. |
| ch12 p0 | Yes | Yes | "every duty they owe to others" → "every duty that arises from their family relationships" (src "every relative duty"). The period sense is now correct. |
| ch14 p12 | Yes | Yes | "presumed to" → "presumptuously tried to" (src "presumptuously endeavoured"). |
| ch14 p21 | Yes | Yes | "their own selfish sakes" → "their own sakes". The added "selfish" is removed. |
| ch14 p31 | Yes | Yes | "knows not what" → "cannot say what" (src "it cannot tell what"). This is modern and faithful. |
| ch14 p57 | Yes | Yes | "artist" → "painter" (src "painter"). The later "artist" matches the source's "artist". |
| ch14 p58 | Yes | Yes | "Meanwhile grace" → "And grace" (src "whilst in every motion…"). A neutral connective, grammatical. |
| ch14 p61 | Yes | Yes | "struck at him" → "reproached him" (src "smote him"). This is the correct idiom. |
| ch14 p70 | Yes | Yes | "even to sensual pleasures" → "to sensual pleasures". The added "even" is removed. |
| ch15 p3 | Yes | Yes | Restored "to use the technical phrase —" before the gloss "that is, to draw up horoscopes"; "never" → "not" (src "have not been led"). Punctuation is well-formed. |
| ch15 p27 | Yes | Yes | "sink" → "plunge" (src "plunge"). |

No collateral edits were found. In every paragraph the diff is confined to the reported phrase, and the surrounding text, quotations, CAPITALS, footnote markers and typography are unchanged. All 38 post-fix paragraphs read as grammatical formal modern English with no contractions.

## Declined suggestions

- **ch7 p138 "reason" vs "season":** I agree with keeping "reason" in the candidate, because the fidelity anchor is the served source, which prints "reason". The Ecclesiastes allusion ("To every thing there is a season") and the autumn/spring sentence that follows make "season" almost certainly the intended reading, and the served text probably carries a transcription error. The issue should be settled at the source level for both editions together, not in modern-en alone. Keeping it logged as open is correct.
- **ch5 p36 "viceregents" → "deputies":** I agree. A vicegerent is a deputy ruler, and "deputies… allowed to rule over a small domain and answerable… to a higher tribunal" keeps the sense completely. "Viceroys" would bring in a colonial-governor sense that the source does not have.

## Verdict

**VERIFIED CLEAN**
