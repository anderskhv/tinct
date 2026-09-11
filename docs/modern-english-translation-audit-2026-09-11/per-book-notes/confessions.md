# Confessions — Augustine

- **Book ID:** `confessions`
- **Scope:** public
- **Core English text:** `original-en` = **Edward Bouverie Pusey, 1838** (registry records translator and year). Translated from Latin (written c. 397–400 AD). Complete: 13 Books, 462 paragraphs.

## Edition snapshot (Phase 1)

| Edition | sha256_16 | Chapters | Paragraphs | Words |
|---|---|---|---|---|
| original-en | `64b39a8ae77d7175` | 13 | 462 | 111,775 |
| modern-en | `420b17153b6cb46f` | 13 | 462 | 112,709 |
| modern-da | `4935d43ca05f87da` | 13 | 462 | 63,389 |

Phase 1 mechanical: mean weighted similarity **0.9258**; **identical long paragraphs 74.1%** — the highest byte-identical rate of any book in the 101-book inventory; truncated 0; empty 0; alignment clean.

## Headline result: FLAG CONFIRMED. 9 of 13 Books are verbatim Pusey.

This is not a partial or marginal failure. I computed per-chapter character-level similarity between `original-en` and `modern-en` over every paragraph ≥30 words:

| Book | Char-similarity | Identical long paragraphs | Status |
|---|---|---|---|
| 1 | 0.250 | 0 / 33 | genuinely modernised |
| 2 | 0.168 | 0 / 18 | genuinely modernised |
| **3** | **1.000** | **21 / 21 (100%)** | **verbatim Pusey** |
| **4** | **1.000** | **31 / 31 (100%)** | **verbatim Pusey** |
| **5** | **1.000** | **25 / 25 (100%)** | **verbatim Pusey** |
| **6** | **1.000** | **27 / 27 (100%)** | **verbatim Pusey** |
| 7 | 0.163 | 0 / 27 | genuinely modernised |
| **8** | **1.000** | **30 / 30 (100%)** | **verbatim Pusey** |
| **9** | **1.000** | **38 / 38 (100%)** | **verbatim Pusey** |
| **10** | **1.000** | **70 / 70 (100%)** | **verbatim Pusey** |
| 11 | 0.243 | 0 / 41 | genuinely modernised |
| **12** | **1.000** | **42 / 42 (100%)** | **verbatim Pusey** |
| **13** | **1.000** | **52 / 52 (100%)** | **verbatim Pusey** |

The project's own gate, `python3 books/classify-modern-en.py confessions`:

```
confessions original-en -> modern-en  (13 chapters)
  weighted similarity : 0.926   (gate: <= 0.75)          FAIL
  light+mechanical    : 9/13 = 69.2%   (gate: <= 5%)     FAIL
  identical long paras: 340/459 = 74.1%   (gate: <= 5%)  FAIL
  buckets: REAL-HEAVY 0  REAL 4  LIGHT 0  MECHANICAL 9
```

Only Books **1, 2, 7 and 11** were ever rendered. The other nine were shipped as Pusey's 1838 text under the label "Modern English". There is no gradient here — the modernised books are at ~0.2 similarity and the rest are at exactly 1.000. It is a job that was started and abandoned, not a job done badly.

**This includes the book's three most famous passages**, all of which a reader selecting "Modern English" currently receives as unmodified 1838 Pusey:
- **Book 8** — the garden conversion and the *tolle lege* scene
- **Book 9** — the death of Monica and the vision at Ostia
- **Book 10** — "What then do I love when I love my God?" and the meditation on memory

## Samples inspected (7)

### 1. Book 1, para 0 — opening ("our heart is restless") — a MODERNISED book

> **SOURCE (Pusey):** "Great art Thou, O Lord, and greatly to be praised; great is Thy power, and Thy wisdom infinite. And Thee would man praise; man, but a particle of Thy creation; man, that bears about him his mortality, the witness of his sin, the witness that Thou resistest the proud: yet would man praise Thee; he, but a particle of Thy creation. Thou awakest us to delight in Thy praise; for Thou madest us for Thyself, and our heart is restless, until it repose in Thee."

> **MODERN:** "You are great, O Lord, and greatly to be praised; great is Your power, and Your wisdom is infinite. And man wants to praise You — man, who is only a small particle of Your creation, who carries around with him his own mortality, the evidence of his sin, the evidence that You resist the proud. Yet man still wants to praise You; he, only a particle of Your creation. You stir us up to take delight in praising You, for You made us for Yourself, and our heart is restless until it rests in You."

**Finding:** Good. Thee/Thou → You, "bears about him" → "carries around with him", and the closing cadence preserved. The doubled "witness… witness" repetition is kept as "evidence… evidence" — correct, since the repetition is Augustine's. This is the standard the whole book should meet. **It is a light-to-moderate modernisation, not a deep one** ("scourges", "alloy", "besprinkling"→"sprinkling" survive), but it is genuine and it reads.

### 2. Book 2, paras 3–4 — a MODERNISED book

> **SOURCE (Pusey):** "…Who did not extol my father, for that beyond the ability of his means, he would furnish his son with all necessaries for a far journey for his studies' sake? For many far abler citizens did no such thing for their children."

> **MODERN:** "…Who did not praise my father for providing his son with everything necessary for a far journey for the sake of his studies, beyond the capacity of his means? For many far wealthier citizens did no such thing for their children."

**Finding:** Good. "abler" correctly disambiguated to "wealthier" (Pusey's sense, now misleading). The whole bitter close — the father caring for eloquence and not chastity, "O God, the only true and good Lord of Your field, my heart" — survives.

### 3. Book 5, paras 0–2 — **FLAG SAMPLE: byte-identical**

> **SOURCE (Pusey):** "Accept the sacrifice of my confessions from the ministry of my tongue, which Thou hast formed and stirred up to confess unto Thy name. Heal Thou all my bones, and let them say, O Lord, who is like unto Thee? For he who confesses to Thee doth not teach Thee what takes place within him; seeing a closed heart closes not out Thy eye, nor can man's hard-heartedness thrust back Thy hand…"

> **MODERN:** "Accept the sacrifice of my confessions from the ministry of my tongue, which Thou hast formed and stirred up to confess unto Thy name. Heal Thou all my bones, and let them say, O Lord, who is like unto Thee? For he who confesses to Thee doth not teach Thee what takes place within him; seeing a closed heart closes not out Thy eye, nor can man's hard-heartedness thrust back Thy hand…"

**Finding: CONFIRMED IDENTICAL — character for character.** I pulled paragraphs 0, 1 and 2 of Book 5 and all three are byte-identical, including the Faustus of Carthage passage ("a great snare of the Devil… that lure of his smooth language"). Not a single archaism touched: `Thou hast`, `doth not`, `Thee`, `bespoken`, `nine-and-twentieth year of mine age`.

### 4. Book 8, paras 28–29 — **FLAG SAMPLE: the conversion scene, byte-identical**

> **SOURCE (Pusey):** "So was I speaking and weeping in the most bitter contrition of my heart, when, lo! I heard from a neighbouring house a voice, as of boy or girl, I know not, chanting, and oft repeating, "Take up and read; Take up and read." Instantly, my countenance altered, I began to think most intently whether children were wont in any kind of play to sing such words: nor could I remember ever to have heard the like. So checking the torrent of my tears, I arose…"

> **MODERN:** "So was I speaking and weeping in the most bitter contrition of my heart, when, lo! I heard from a neighbouring house a voice, as of boy or girl, I know not, chanting, and oft repeating, "Take up and read; Take up and read." Instantly, my countenance altered, I began to think most intently whether children were wont in any kind of play to sing such words: nor could I remember ever to have heard the like. So checking the torrent of my tears, I arose…"

**Finding: CONFIRMED IDENTICAL.** The single most famous scene in Western spiritual autobiography is delivered to "Modern English" readers as `were wont`, `nor needed I`, `I seized, opened, and in silence read`, `Not in rioting and drunkenness, not in chambering and wantonness`. The preceding paragraph (the fig tree, "how long, how long, 'tomorrow, and tomorrow?'") is likewise identical.

### 5. Book 10, para 5 — **FLAG SAMPLE: byte-identical**

> **SOURCE (Pusey) = MODERN, verbatim:** "This is the fruit of my confessions of what I am, not of what I have been, to confess this, not before Thee only, in a secret exultation with trembling, and a secret sorrow with hope; but in the ears also of the believing sons of men, sharers of my joy, and partners in my mortality, my fellow-citizens, and fellow-pilgrims, who are gone before, or are to follow on, companions of my way. … But this Thy Word were little did it only command by speaking, and not go before in performing."

**Finding: CONFIRMED IDENTICAL.** Note "But this Thy Word were little did it only command by speaking" — a subjunctive inversion that is close to unparseable for a modern reader without training. Book 10 is the longest chapter in the file (70 paragraphs) and is 100% untouched.

### 6. Book 11, paras 13–14 — the time/creation argument — a MODERNISED book

> **SOURCE (Pusey):** "I answer not as one is said to have done merrily (eluding the pressure of the question), "He was preparing hell (saith he) for pryers into mysteries." It is one thing to answer enquiries, another to make sport of enquirers."

> **MODERN:** "I do not answer as someone is said to have done jokingly, dodging the pressure of the question: "He was preparing hell (he said) for people who pry into mysteries." It is one thing to answer questions, another to make sport of questioners."

**Finding:** Strong — the best sample in the book. Augustine's joke survives as a joke, the enquiries/enquirers wordplay is reproduced as questions/questioners, and the following paragraph keeps the whole "there was no 'then,' when there was no time" argument with its logical steps intact. Proof that the modernisation approach works when applied.

### 7. Book 13, para 0 — the opening of the final Book — **byte-identical**

> **SOURCE (Pusey) = MODERN, verbatim:** "I call upon Thee, O my God, my mercy, Who createdst me, and forgottest not me, forgetting Thee. … for Thou, Lord, blottedst out all my evil deservings, so as not to repay into my hands, wherewith I fell from Thee; and Thou hast prevented all my well deservings…"

**Finding: CONFIRMED IDENTICAL.** Note `createdst`, `forgottest`, `blottedst`, and `prevented` used in its obsolete sense of "went before / anticipated" — a false friend that will actively mislead a modern reader into the opposite meaning. The book ends as it fails: unmodernised.

## Phase 1 flags: confirmed vs. disconfirmed

| Flag | Verdict |
|---|---|
| `pct_identical_long_paragraphs: 74.1` | **CONFIRMED, emphatically.** I pulled identical-flagged paragraphs from Books 5, 8, 10 and 13 and all were byte-identical to Pusey. Nine complete Books (3, 4, 5, 6, 8, 9, 10, 12, 13) are at exactly 1.000 similarity. |
| `mean_weighted_similarity: 0.9258` | Confirmed — consistent with 9/13 books untouched and 4/13 at ~0.2. |
| `truncated_paragraphs_total: 0` | **Confirmed.** My independent scan for source-terminated/modern-unterminated paragraphs found zero hits, and no paragraph shrinks below 0.70× source length. Nothing is *lost* — the problem is that nothing was *done*. |
| `empty_paragraphs_total: 0` | Confirmed. |
| `para_count_mismatches: 0` / `en_editions_aligned: true` | Confirmed — trivially, since most paragraphs are copies. |
| `last_chapter_suspiciously_short: false` | Confirmed on length (12,597 words) — but Book 13 is 100% unmodernised, which the length check cannot see. |
| Bracketed editorial insertions | 0 in both editions. Clean. |

**Note on `modern-da`:** at 63,389 words against 111,775 for the English, the Danish edition is **57% of the source length**. I did not audit Danish and it is outside my brief, but a 43% shortfall is a strong signal of abridgement or systematic omission and should be checked independently. Flagging it because the Phase 1 data makes it visible.

## Phase 3 — human-edition research

Pusey (1838) is genuinely dated in ways that go beyond archaic pronouns: obsolete word senses that invert meaning (*prevented* = anticipated; *abler* = wealthier), subjunctive inversions ("this Thy Word were little did it only command"), and Latinate periodic syntax. It does **not** meet the reading standard, so "SOURCE + GLOSSES" is not available here.

**Candidate A — Albert C. Outler (1955), *Augustine: Confessions and Enchiridion*, Library of Christian Classics vol. VII (Westminster Press).**
- **Completeness:** complete (all 13 Books), scholarly, with introduction and notes.
- **Readability: clearly superior to Pusey.** I fetched Outler's *tolle lege* passage and compared it directly:
  > **Outler:** "I was saying these things and weeping in the most bitter contrition of my heart, when suddenly I heard the voice of a boy or a girl I know not which — coming from the neighboring house, chanting over and over again, 'Pick it up, read it; pick it up, read it.' Immediately I ceased weeping and began most earnestly to think whether it was usual for children in some kind of game to sing such a song…"
  > **Pusey (current):** "…chanting, and oft repeating, 'Take up and read; Take up and read.' Instantly, my countenance altered, I began to think most intently whether children were wont in any kind of play to sing such words…"

  Outler is plainly readable modern English while keeping the dignity of the scene.
- **URLs:** https://en.wikisource.org/wiki/The_Confessions_of_Saint_Augustine_(Outler) ; https://ccel.org/ccel/augustine/confessions ; https://www.ccel.org/ccel/a/augustine/confessions/cache/confessions.pdf
- **Rights: UNCLEAR — CONFLICTING EVIDENCE. Do not use without resolving.**
  - **Wikisource** carries a `PD-release` template stating verbatim: *"This work is in the public domain worldwide because it has been so released by the copyright holder."* It does not name the copyright holder or cite the release instrument.
  - **CCEL** states the work *"may be freely copied for non-commercial purposes as long as it is not modified,"* and that *"written permission is required for commercial use."*
  - These cannot both be right. A 1955 US publication is not PD by expiry (it would need non-renewal to be PD, which is plausible but unverified). Tinct is a commercial product, so the CCEL terms alone would rule it out.
  - **Unresolved and material:** (i) was the 1955 copyright renewed in 1982–83? (ii) who made the claimed PD release and where is it documented? (iii) rights holder is presumably Westminster John Knox Press — a direct written enquiry is the only way to settle this.
  - Jurisdiction adds a second unresolved layer: Outler died in 1989, so under EU/Danish life+70 rules the *translation* would be in copyright until 2060 regardless of any US-side analysis. Tinct operates from Denmark and serves globally. I am not in a position to assert a legal conclusion here, only to say this is not clear and would need counsel.

**Candidate B — J. G. Pilkington (1886/87), in *Nicene and Post-Nicene Fathers* series 1 vol. 1, ed. Philip Schaff.**
- **Completeness:** complete, all 13 Books.
- **Rights: PUBLIC DOMAIN, unambiguously** — published well before 1929, editor and translator long dead; hosted openly at New Advent, CCEL and Wikisource.
- **URL:** https://www.newadvent.org/fathers/110108.htm (Book 8) ; https://en.wikisource.org/wiki/Confessions_(Augustine)
- **Readability: only marginally better than Pusey.** I fetched Pilkington's *tolle lege* passage: *"I heard the voice as of a boy or girl, I know not which, coming from a neighbouring house, chanting, and oft repeating, Take up and read; take up and read."* That is essentially Pusey's phrasing, including "oft repeating" and "I know not which". Pilkington is a contemporary of Pusey working in the same Victorian register.
- **Verdict: rights-clear but does not solve the problem.** Swapping Pusey for Pilkington would move the book from one dated Victorian translation to another.

**Candidate C — William Watts (1631), Loeb Classical Library.** The Loeb Confessions uses Watts's 1631 English, which is *older and harder* than Pusey. Rejected on readability; the underlying Watts text is PD but the modern Loeb apparatus is not.

**Candidate D — F. J. Sheed (1942), Henry Chadwick (1991), Maria Boulding (1997), Sarah Ruden (2017)** — all excellent and all firmly in copyright. Not available.

**Conclusion of Phase 3:** there is **no complete, readable, rights-clear human English Confessions**. The one candidate that would genuinely serve readers (Outler) has unresolved and conflicting rights; the one candidate with clean rights (Pilkington) does not meaningfully improve on Pusey. This is a real finding, not a failure to search: the gap between "pre-1929 and therefore free" and "readable" is exactly where Confessions falls.

## Ratings

These rate the `modern-en` **edition as delivered to a reader**, which is what the audit is for.

| Dimension | Weight | Score | Note |
|---|---|---|---|
| Fidelity / completeness | 40% | **3** | No content is *lost* — verbatim Pusey is perfectly faithful, and the 4 rendered books are faithful too. But 69% of chapters fail to deliver the edition's stated function, so the modernisation is substantially incomplete. |
| First-read clarity | 25% | **1** | In 5 of my 7 samples the reader receives unmodified 1838 prose, including obsolete senses that invert meaning (*prevented*, *abler*). Unusable as a modern edition in those passages. |
| Literary voice | 20% | **2** | Pusey's voice is intact but it is a Victorian voice, not a modern one; the 4 rendered books do preserve voice well |
| Restraint / no invention | 10% | **5** | Nothing invented anywhere — necessarily so for the copied chapters, and genuinely so in Books 1, 2, 7, 11 |
| Naturalness | 5% | **2** | Pusey's periodic syntax is not natural modern English |

**Weighted score: 2.5 — band: Poor.**

## Recommendation

**RETRANSLATE.** Confidence: **high**. Correction scope: **substantial**.

Specifically: render Books **3, 4, 5, 6, 8, 9, 10, 12, 13** — roughly **336 paragraphs / ~82,000 words**, about 73% of the book. Books 1, 2, 7 and 11 already meet the standard and should be left alone; they also supply a calibrated in-house style target, so the work does not need fresh voice calibration.

Sequencing note: if the whole job cannot be done at once, **Books 8, 9 and 10 first**. They carry the conversion, Monica's death and the memory meditation — the passages readers actually come for, and the ones most likely to be sampled by anyone evaluating the product.

Do **not** treat Outler as an available shortcut unless and until the rights conflict above is resolved in writing. Pilkington is available and rights-clear but is not worth the swap.

Finally: `modern-da` is 57% of the English word count and should be audited separately.

## Limitations of this review

- I read **7 of 462 paragraphs** in detail (~1.5%), plus targeted pulls of identical-flagged paragraphs from four different Books.
- The byte-identity finding, however, is **whole-book and exact**, not sampled: I compared all 462 paragraph pairs programmatically, and the nine Books at similarity 1.000 are identical by computation, not inference. That part of this report carries high confidence.
- I did **not** assess the *quality of Pusey's translation against the Latin* — only its readability as modern English. Pusey is a respected scholarly translation; the objection is register, not accuracy.
- I did **not** audit `modern-da` beyond noting its word-count shortfall.
- I did not resolve the Outler rights question; I established that it is genuinely contested and identified who would need to answer it. That is a finding, not a conclusion.
- I did not check audio, onboarding content, or reader rendering.
