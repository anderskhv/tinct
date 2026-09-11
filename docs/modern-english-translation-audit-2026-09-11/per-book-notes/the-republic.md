# the-republic — The Republic (Plato)

**Reviewer:** batch agent, 2026-09-11 · **Scope:** public

## Edition snapshot (from Phase 1 mechanical data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `338cc5908ed34b10` | 10 | 4308 | 118,264 | Jowett Translation (1871) |
| modern-en | `02082bbef9bf9026` | 10 | 4308 | 108,521 | Modern English |
| modern-da | `9de2ff16ca374bdb` | 10 | 4308 | 93,266 | Moderne Dansk |

`en_editions_aligned: true`. No paragraph-count mismatches, no truncated paragraphs,
no empty paragraphs, last chapter not short. Mean weighted similarity 0.6545;
`pct_identical_long_paragraphs` 10.0 (the highest in this batch).

### Core English text — provenance

Benjamin Jowett, *The Dialogues of Plato*. Registry labels it "Jowett Translation
(1871)". The file carries Jowett's own parenthetical glosses (e.g. Book 1 ¶0
"(Bendis, the Thracian Artemis.)"), which are characteristic of the Project
Gutenberg Jowett text; PG's Republic is generally the **third edition (1892)**, not
the 1871 first. I did **not** verify which Jowett edition this file actually is —
flagging as an unresolved provenance detail (low impact on this review, relevant if
the label is ever cited publicly). Text is complete: all ten Books, 4308 paragraphs.

## Phase 1 flags — confirmed / disconfirmed

**CONFIRMED, and worse than the headline number suggests.** The 10% identical figure
is not evenly spread; it is a degradation curve across the ten Books. Recomputed
per Book over paragraphs of ≥30 source words:

| Book | byte-identical | ≥0.95 word-sim | ≥0.90 word-sim | cosmetic-only¹ | archaic-word reduction² |
|---|---|---|---|---|---|
| 1 | 0% | 0% | 1% | 0% | 100% |
| 2 | 0% | 1% | 3% | 2% | 79% |
| 3 | 2.3% | 8% | 22% | 3% | 87% |
| 4 | 6.6% | 22% | 45% | 22% | 100% |
| 5 | 24.0% | 48% | 61% | 45% | 68% |
| 6 | 11.5% | 33% | 38% | 24% | 52% |
| 7 | 8.5% | 31% | 34% | 30% | 100% |
| 8 | 14.4% | 24% | 37% | 22% | 100% |
| 9 | 18.8% | 34% | 38% | 35% | 75% |
| 10 | 12.2% | 58% | 60% | 53% | 76% |

¹ identical after normalising curly quotes, em-dashes, and British→American spellings.
² reduction in density of a fixed archaic-word list (thee/thou/hath/whither/thence/
divers/nought/…) per 10k words, source vs modern.

Overall, **23.7% of long-paragraph words (20,722 of 87,475) are literally unchanged
Jowett** once punctuation and spelling are normalised, and **34% sit at ≥0.90 word
similarity**. Books 1–2 are a genuine, good modernisation. From Book 4 onward the
edition progressively stops modernising and passes Jowett through.

No truncation/omission flags were raised and none were found: word ratio is a steady
0.90–0.94 per Book. Completeness is not the problem here; *modernisation* is.

## Samples inspected (9 passages across 7 of the 10 Books)

### 1. Book 1 ¶0 — opening (Piraeus) — **GOOD**
- SRC: "I went down yesterday to the Piraeus with Glaucon the son of Ariston, that I might offer up my prayers to the goddess…"
- MOD: "Yesterday I went down to the Piraeus with Glaucon, the son of Ariston, to offer my prayers to the goddess…"
- Clean, complete, adds quotation marks for the servant's speech. Fine.

### 2. Book 1 ¶181–189 — Thrasymachus bursts in — **GOOD, with one small alteration**
- SRC ¶181: "he came at us like a wild beast, seeking to devour us. **We** were quite panic-stricken at the sight of him."
- MOD ¶181: "he sprang at us like a wild beast looking to devour us. **The whole company was** panic-stricken at the sight of him."
- Referent changed from the narrator-inclusive "we" to "the whole company". Trivial in isolation, but ¶183 then says "I was panic-stricken", so the modern reads slightly less coherently than the source. Otherwise this stretch is excellent: Thrasymachus's aggression ("What nonsense, Socrates, has got hold of you all?"), Socrates's trembling irony, and the twelve-arithmetic parry all survive intact and read well. Jowett's "sillybillies" is sensibly replaced.

### 3. Book 2 ¶16 — Ring of Gyges — **GOOD** (655 → 587 words)
- Every element survives: the storm, the chasm, the bronze horse with doors, the more-than-human corpse, the gold ring, the collet turned inward/outward, the messenger, the queen, the regicide, the two rings, "a god among men", the closing point that the man who stayed just would be thought "a most pitiable fool". No omissions found.

### 4. Book 2 ¶17 — the isolated just and unjust man — **GOOD**
- "wishing, as Aeschylus says, to be and not **merely** to seem good" — the Aeschylus attribution and the Glaucon thought-experiment structure are preserved exactly.

### 5. Book 4 ¶257 / ¶285 / ¶287 — the principle of opposites, spinning tops — **FAIL (pass-through)**
- SRC ¶287: "And suppose the objector to refine still further, and to draw the nice distinction that not only parts of tops, but whole tops, when they spin round with their pegs fixed on the spot, are at rest and in motion at the same time…"
- MOD ¶287: "And suppose the objector to refine still further, and to draw the nice distinction that not only parts of tops, but whole tops, when they spin round with their pegs fixed on the spot, are at rest and in motion at the same time…"
- Identical apart from a comma and an inserted em-dash, plus "can they be **said to** be at rest". ¶257 ("The friction of the two when rubbed together may possibly strike a light…") and ¶285 are likewise verbatim. This is the single hardest stretch of argument in Book 4 — the passage that establishes the tripartite soul — and it is exactly where the modern edition does nothing.
- Adjacent local flattening: SRC ¶258 "That will be in regular course; let us do as you say." → MOD "Good method. Let's do it." — a mechanically short two-sentence reduction of the kind the standard warns against.

### 6. Book 5 ¶47, ¶87, ¶89, ¶191 — **FAIL (pass-through), highest-density chapter**
- 37 long paragraphs in Book 5 are byte-identical to Jowett. Examples left completely untouched:
  - ¶47: "But when experience showed that to let all things be uncovered was far better than to cover them up, and the ludicrous effect to the outward eye vanished before the better principle which reason asserted, then the man was perceived to be a fool who directs the shafts of his ridicule at any other sight but that of folly and vice…"
  - ¶87: "…the art of weaving, and the management of pancakes and preserves, in which womankind does really appear to be great…"
  - ¶191: "…the mothers will have no getting up at night or other trouble, but will hand over all this sort of thing to the nurses and attendants."
- ¶47 in particular is the tangled Victorian period that most needs the modern edition. Untouched.

### 7. Book 6 ¶394–396 — the Divided Line — **MIXED: good rewrite, one invention**
- SRC ¶396: "…but proceeding only in and through the ideas themselves."
- MOD ¶396: "…proceeding through Forms alone — **by means of Forms, through Forms, and ending in Forms**."
- The tricolon is not in the source paragraph. It corresponds to Plato's Greek, so a classicist would call it a correction — but by our standard (modern-en derives from original-en) it is an addition of content not in the source. Recording it as a restraint issue, not a fidelity win. Elsewhere in this stretch the rendering is good, and "ideas" → "Forms" is a sensible terminological modernisation.

### 8. Book 7 ¶18–34 — the Allegory of the Cave — **FAIL (alternating pass-through)**
This is the most damaging finding, because it happens inside the single most famous passage in the book, paragraph by paragraph:
- ¶18 — **modernised**: SRC "And suppose once more, that he is reluctantly dragged up a steep and rugged ascent…" → MOD "And if he were dragged by force up the steep, rough passage and held in the sunlight — wouldn't he be in pain and furious about it?"
- ¶20 — **verbatim**: "He will require to grow accustomed to the sight of the upper world. And first he will see the shadows best, next the reflections of men and other objects in the water…" (identical in both files)
- ¶32 — **verbatim but for one word**: "such **an** one" → "such **a** one".
- ¶34 — **verbatim**: "And if there were a contest, and he had to compete in measuring the shadows with the prisoners who had never moved out of the den, while his sight was still weak… they would put him to death." (identical in both files)
- A reader toggling to "Modern English" gets modern prose and 1870s prose alternating within one continuous argument. That is worse than either edition alone.

### 9. Book 8 ¶3–5 and Book 10 ¶94–96 — **FAIL (pass-through)**
- Book 8 ¶5 (184 words, the recapitulation of the four defective constitutions) is verbatim: "There is no difficulty in returning; you implied, then as now, that you had finished the description of the State…" — only a comma differs.
- Book 10 ¶96 (202 words, the attack on Homer as educator, with Protagoras and Prodicus) is verbatim apart from em-dash substitutions and a curly-quote conversion.
- Book 10 is the worst Book in the book: 58% of long-paragraph words at ≥0.95 similarity, 53% literally unchanged. The Myth of Er sits in this Book.

**Socratic irony / characterisation:** where the edition actually rewrites (Books 1–3),
voice is well handled — Thrasymachus stays aggressive and contemptuous, Socrates stays
mock-deferential, Glaucon stays brisk. Where it passes through, Jowett's own
homogenising register is inherited unchanged. No homogenisation *introduced* by the
modernisation was found.

## Phase 3 — human-edition research

Plato is Greek; the "core" English is an old translation, so this is a translated-work
case and an alternative human English edition is squarely on the table.

**Candidate A — A. D. Lindsay, *The Republic of Plato* (Everyman's Library no. 64,
J. M. Dent, 1906). RECOMMENDED CANDIDATE.**
- Translator: Alexander Dunlop Lindsay (1879–1952), later Master of Balliol.
- Completeness: complete, all ten Books, 367 pp. in the 1906 first edition.
- Rights: **public domain.** US — published 1906, i.e. before 1 Jan 1931, so PD by
  publication date; Wikimedia Commons carries the first-edition scan under Public
  Domain Mark 1.0. EU/Denmark — author died 1952, life+70 expired 1 Jan 2023. Clear in
  both jurisdictions Tinct cares about.
- URL (first edition, clean rights): https://commons.wikimedia.org/wiki/File:The_Republic_of_Plato_(1st_ed.)_(Lindsay,_1906).pdf
- Working full text I actually read: https://archive.org/details/the-republic-of-plato-Lindsay (a later Everyman reprint; OCR is poor — "thir:k", "frend" — and it may incorporate Lindsay's 1935 revision, whose US term runs to 2031. **Use the 1906 first edition, not this scan, if this route is taken.**)
- Sample read (Book 1, Thrasymachus's entrance): "he sprang at us like a wild beast to make us his prey. Polemarchus and I shrank aside in fear. Then, speaking so that all could hear, he said: 'What nonsense has possessed you two all this time, Socrates? What do you mean by all your polite bowing and scraping to one another? … don't dare to tell me that it is the obligatory, or the expedient, or the profitable, or the lucrative, or the advantageous, but make your answer precise and accurate, for I will not have any rubbish of that kind from you.'"
- Sample read (Book 8 opening, the passage our modern-en leaves verbatim): "'That is not difficult,' he said. 'You were practically at the point at which you are now…'"
- Assessment: clearly more readable than Jowett — quoted dialogue with speaker breaks,
  shorter periods, plainer diction. Still Edwardian, not contemporary; it would not by
  itself satisfy "clear, natural English for a thoughtful modern adult" as well as
  Tinct's own Books 1–2 do. Paragraph structure differs from ours — **alignment work
  required**, noted separately and not counted as a quality strike.

**Candidate B — Paul Shorey, *Plato: The Republic* (Loeb Classical Library, vol. 1
1930, vol. 2 1935).**
- Completeness: complete across two volumes.
- Rights: **split by jurisdiction.** EU/Denmark — Shorey died 1934, PD since 2005.
  US — vol. 1 (1930) entered PD 1 Jan 2026; **vol. 2 (1935) does not until 1 Jan 2031**
  unless it was never renewed, which I did not check. A US-facing product would be
  shipping Books 6–10 under unresolved status.
- Quality: I could not extract a continuous translation sample — the archive.org
  full-text I fetched (`republicshorey02platuoft`) returned only front matter. **Text
  quality therefore UNVERIFIED.** Loeb facing-page translations of this period are
  generally literal and dense rather than accessible, so I would not expect a
  readability win over Lindsay.
- URL: https://archive.org/details/republicshorey02platuoft

**Not researched / rejected:** Davies & Vaughan (1852) and Jowett's own later editions
are same-era or same-translator and offer no readability gain.

**Perseus caveat:** Perseus Digital Library hosts PD Plato translations but applies
CC BY-SA 3.0 US to its own digitised texts. That is a share-alike obligation on the
Perseus edition, not on the underlying PD translation — source from Internet
Archive/Wikimedia scans to avoid inheriting it.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 4 |
| first-read clarity | 25% | 2 |
| literary voice | 20% | 3 |
| restraint / no invention | 10% | 4 |
| naturalness (for a contemporary reader) | 5% | 2 |

**Weighted score: 3.2 — Band: Mixed**

Rating notes: fidelity scores well partly *because* a quarter of the book is a copy —
a pass-through paragraph is trivially faithful. The weighted score is therefore
flattering for this failure mode; clarity (2) is the dimension that reflects what a
reader actually gets. The single restraint deduction is the Book 6 Divided Line
addition.

## Recommendation

**RETRANSLATE** — confidence **high**. Correction scope: **substantial**.

The defect is recurring and structural, not local: Books 4–10 (roughly 70% of the
work) are substantially unmodernised, with the pass-through landing on precisely the
passages a modern edition exists to serve (the tripartite-soul argument, the Cave, the
decline of the regimes, the critique of Homer). Books 1–3 are good and should be kept
as the quality target and, where already clean, reused verbatim.

**Next action:** re-modernise Books 4–10 against the Books 1–2 standard, then re-run
the byte-identical and ≥0.90-similarity checks per Book as an acceptance gate
(target: <2% near-verbatim per Book). Keep Lindsay 1906 on file as a rights-clear
human fallback and as a cross-check when a Jowett period is ambiguous.

## Limitations of this review

- 9 passages across Books 1, 2, 4, 6, 7, 8, 10. **Books 3, 5 (prose read only via the
  identical-paragraph dump), and 9 were not read as connected prose.** The Myth of Er
  (Book 10) was not read closely; it sits in the worst-scoring Book.
- I checked completeness mechanically (word ratios, paragraph counts) rather than
  clause-by-clause; a small omission inside a rewritten paragraph could have escaped.
- modern-da was not reviewed at all.
- Rights conclusions are a reading of publication dates and death dates, not legal
  advice; the Shorey US renewal question is explicitly unresolved.
- The Jowett edition-year provenance (1871 vs 1892 third edition) is unresolved.
