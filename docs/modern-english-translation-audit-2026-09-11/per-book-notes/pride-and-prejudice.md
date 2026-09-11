# pride-and-prejudice — Pride and Prejudice (Jane Austen, 1813)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (English-originals batch)

## Edition snapshot (from Phase 1 `mechanical/pride-and-prejudice.json`)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en (Original (1813)) | `5a44024668550ab8` | 61 | 2060 | 121,546 |
| modern-en (Modern English) | `d914bb2dc33dfb52` | 61 | 2060 | 114,090 |
| modern-da (Moderne Dansk) | `3c84f6b06dd8258d` | 61 | 2060 | 117,600 |

`en_editions_aligned: true`, no count mismatches, mean weighted similarity **0.6722**,
**0.0 % identical long paragraphs**, **1 truncation candidate** (ch 45 p0), 0 empty paragraphs,
last chapter not flagged short (1,117 words).

## Provenance / completeness of the core English text

- `original-en` is Austen's own 1813 English. No translator. Registry (`bookRegistry.ts`,
  `PRIDE_AND_PREJUDICE`) records `label: 'Original (1813)'`, `year: 1813`, no source attribution.
- 61 chapters, complete, running-numbered (not Volume I–III). No missing chapters, no Gutenberg
  boilerplate observed in the sampled text.

## Shape of the modern-en edition

The most **uniform** edition in this batch. Per-chapter word overlap with the source sits in a very
narrow 0.71–0.79 band across all 61 chapters; length ratios run 0.89–0.99. There is no chapter that
was skipped and no chapter that was compressed. **Zero** identical long paragraphs, and **zero**
intra-chapter duplicate paragraphs.

My own truncation scan (src ≥ 50 w, ratio < 0.70) finds exactly **one** paragraph in the whole
book — ch 45 p0, which is also the single mechanical flag.

## Samples inspected (6)

### 1. Opening — Chapter 1, paras 0–4 — STRONG, with one voice quibble

- SRC p0: `It is a truth universally acknowledged, that a single man in possession of a good
  fortune, must be in want of a wife.`
- MOD p0: `It is a truth universally acknowledged that a single man with a large fortune must be
  looking for a wife.`

`in possession of a good fortune` → `with a large fortune` and `must be in want of a wife` → `must
be looking for a wife` are both defensible, but together they soften the sentence's irony. `in want
of` is the neighbourhood's *presumption* stated as necessity — it is not a claim about what the man
is doing. `looking for` makes it a claim about him, which is the one thing Austen's sentence
carefully does not say. On the single most famous sentence in the language this is worth a second
pass; elsewhere in the chapter (`"But it has," she returned.`) the comic rhythm of the Bennets'
exchange is preserved exactly.

### 2. Chapter 6, paras 0–1 (free indirect discourse + Charlotte Lucas) — STRONG

- SRC p0: `she considered with pleasure that it was not likely to be discovered by the world in
  general, since Jane united with great strength of feeling, a composure of temper and an uniform
  cheerfulness of manner, which would guard her from the suspicions of the impertinent.`
- MOD p0: `she reflected with satisfaction that the world at large was unlikely to notice, since
  Jane combined deep feeling with an even temperament and a steady cheerfulness that would shield
  her from nosy speculation.`

The free indirect discourse — the narrator reporting Elizabeth's judgement in Elizabeth's terms —
survives, which is the main thing at risk in an Austen modernization. Charlotte's marriage-market
realism in p1 is fully intact, including `In nine cases out of ten, a woman had better show _more_
affection than she feels.`

**One fidelity slip, p1:** `there are very few of us who have heart enough to be really in love
without encouragement` → `very few of us have the courage to truly fall in love without
encouragement`. "Heart enough" is capacity for feeling; "courage" is bravery. Charlotte's point is
about how little feeling most people can sustain unprompted, not about nerve.

### 3. Chapter 19, paras 4–10 (Mr. Collins's proposal) — STRONG

Collins's register is the load-bearing comic voice of the book's first half, and it is fully intact
across a 490-word speech: `Allow me, by the way, to observe, my fair cousin, that I do not consider
the notice and kindness of Lady Catherine de Bourgh as the least of the advantages I can offer you`,
the three numbered reasons, Lady Catherine's quoted instruction, the actuarial aside about the
entail, and the closing assurance about the one thousand pounds. Nothing is cut; the obsequiousness
is not "clarified" into plain statement.

Small items: `between our pools at quadrille` → `between hands at cards` (an acceptable familiar
equivalent under our standard, though it loses a period specific a gloss would have kept);
`which perhaps I ought to have mentioned earlier` → `which perhaps I should have mentioned first`
(harmless drift).

**Two minor slips nearby:** p4 `"Dear ma'am, do not go."` → `"Dear Mama, please don't go."` changes
Elizabeth's form of address to her mother — our standard asks that meaningful differences in address
and formality be preserved, and "ma'am" is one. p6 `to conceal, by incessant employment, the
feelings` → `to hide, behind constant busyness with her needlework, feelings` **adds** the
needlework, which Austen does not specify.

### 4. Chapter 34, paras 6–12 (Darcy's first proposal, Elizabeth's refusal) — STRONG, one logical slip

- SRC p9: `Was not this some excuse for incivility, if I _was_ uncivil? But I have other
  provocations. You know I have.`
- MOD p9: `Was that not some excuse for rudeness, if I _was_ rude? But I have other reasons. You
  know I do.`

The scene is complete and the escalation is well-paced. Darcy's stiffness (`And this is the entire
reply I am to have the honor of receiving!`) and Elizabeth's controlled fury both hold.

**Fidelity slip, p6 — a collapsed logical distinction.** SRC: `it is, I believe, the established
mode to express a sense of **obligation** for the sentiments avowed… It is natural that
**obligation** should be felt, and if I could _feel_ **gratitude**, I would now thank you.` MOD
renders *all three* as gratitude: `express a sense of **gratitude** for the feelings declared… It is
natural that **gratitude** should be felt, and if I _could_ feel **grateful**, I would now thank
you.` Austen is distinguishing the social *obligation* one is supposed to acknowledge from the
*feeling* Elizabeth does not have; collapsing them makes the sentence circular and blunts the
insult.

### 5. Chapter 45, para 0 (50 → 29 words, ratio 0.58) — the only mechanical flag — MINOR OMISSION

- SRC: `Convinced as Elizabeth now was that Miss Bingley's dislike of her had originated in jealousy,
  she could not help feeling how very unwelcome her appearance at Pemberley must be to her, and was
  curious to know with how much civility on that lady's side the acquaintance would now be renewed.`
- MOD: `Convinced as Elizabeth now was that Miss Bingley's dislike of her had originated in
  jealousy, she couldn't help wondering how coldly or civilly that lady would treat her now.`

Two distinct ideas (how unwelcome Elizabeth's appearance at Pemberley must be; curiosity about the
degree of civility) are merged into one, losing the first. Real, but genuinely local — this is the
worst single paragraph in the book by ratio and it is a one-clause loss, not a scene.

### 6. Chapter 61 (ending), paras 0–2 — STRONG

- SRC p0: `though, perhaps, it was lucky for her husband, who might not have relished domestic
  felicity in so unusual a form, that she still was occasionally nervous and invariably silly.`
- MOD p0: `though perhaps it was fortunate for her husband, who might not have enjoyed domestic
  happiness in so unfamiliar a form, that she remained occasionally nervous and permanently foolish.`

The narrator's closing irony lands. `invariably silly` → `permanently foolish` keeps the joke.
Only addition: `her earnest desire` → `her lifelong ambition` inserts "lifelong".

## Phase 1 flags: confirmed / disconfirmed

| flag | verdict |
|---|---|
| 1 truncation candidate (ch 45 p0) | **CONFIRMED, minor.** See sample 5. My own scan at the same threshold returns the same single paragraph — nothing else in 2,060 paragraph pairs. |
| mean similarity 0.6722 | **Confirmed** — real-rewrite range, applied evenly. |
| 0.0 % identical long paragraphs | **Confirmed** — no unmodernized chapters, no copy-through. |
| alignment / no count mismatch | **Confirmed clean.** |
| last chapter short | **Disconfirmed** — 1,117 words is Austen's own short conclusion, complete. |

## Human-edition research (Phase 3)

English original; no translation-rights question.

- **Original, public domain.** 1813; Austen died 1817. Public domain in the US and the EU/Denmark.
  Standard Ebooks publishes a proofed edition dedicated to the public domain under **CC0 1.0**
  (https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice); Project Gutenberg #1342 is
  the common transcription.
- **Is the original already accessible enough to stand alone?** **Yes — more clearly than for any
  other book in this batch.** Austen's sentences are shorter and less periodic than Brontë's,
  Dickens's or Melville's; her vocabulary is largely current; the genuinely opaque items are a
  small, enumerable set of social and legal terms (entail, living, chaise and four, the four per
  cents, quadrille, "accomplished", coming out, ma'am/madam usage, militia quarters). That is a
  glossary, not a rewrite.
- **Human modern-English editions: none rights-clear found**, and none needed. The market offering
  is commercial "plain English"/learner editions and modern retellings, all in copyright.
  Recording as "none found in this search", not "none exists".

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40 % | **4** |
| first-read clarity | 25 % | **5** |
| literary voice | 20 % | **4** |
| restraint / no invention | 10 % | **4** |
| naturalness | 5 % | **5** |

**Weighted score 4.3 — band: Good with fixes.**

Fidelity is 4 rather than 5 because of the obligation/gratitude collapse (ch 34 p6), the
`heart enough` → `courage` shift (ch 6 p1) and the ch 45 p0 merge — three small but real losses of
logical distinction in six samples. Restraint is 4 for the two added specifics (`needlework`,
`lifelong`). Voice is 4 for the softened opening sentence and `ma'am` → `Mama`; the character
registers themselves (Collins, Mrs. Bennet, Darcy, Elizabeth, Charlotte) are well differentiated
and Austen's free indirect discourse is not converted into direct statement anywhere I looked.

## Recommendation

**SOURCE + GLOSSES** — confidence **medium**, correction scope **local**.

This is not a verdict on the quality of the modern edition, which is the best in this batch. It is a
verdict on whether the edition is worth maintaining. Austen's 1813 English already meets our reading
standard for a thoughtful modern adult; the modern-en's measurable contribution is a ~6 % length
reduction and some sentence-splitting. Against that, every one of the defects found is a place where
an Austen distinction got slightly blunted — the ironic opening, obligation vs. gratitude, heart vs.
courage. The cost/benefit points at glossing the original rather than shipping a parallel text that
can only lose ground on the thing the book is valued for.

**If Tinct keeps the modern edition** (entirely reasonable — it is good, and it is the safest of the
five to keep), this becomes **LIGHT EDIT** with four scoped fixes: ch 1 p0 (`in want of a wife`),
ch 6 p1 (`heart enough`), ch 34 p6 (obligation vs. gratitude), ch 45 p0 (restore the dropped
clause), plus removing the `needlework` addition at ch 19 p6.

## Limitations of this review

- 6 sampled locations out of 61 chapters; ~20 paragraph pairs read in full. Length-ratio,
  word-overlap, identical-paragraph and duplicate-paragraph statistics were computed across all
  2,060 paragraph pairs and are uniformly clean, which gives me reasonable confidence there is no
  hidden chapter-scale failure — but equal-length inventions are invisible to all of those checks,
  and I found one such invention in this batch's *Great Expectations*, so I cannot rule them out
  here.
- Chapters I specifically did **not** read: the Lady Catherine confrontation (ch 56) and Darcy's
  explanatory letter (chs 35–36), both of which are register-sensitive and would be my next samples.
- I did not inspect `modern-da`.
- I did not verify the transcription source of `original-en`.
