# vindication-rights-of-woman — A Vindication of the Rights of Woman, Mary Wollstonecraft

**Scope:** public. Audited 2026-09-11. **8 passages inspected** (plus a whole-book mechanical diff).

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | label in registry |
|---|---|---|---|---|---|
| original-en | `3e168f00ba7901f8` | 15 | 778 | 84,393 | "Wollstonecraft (1792)", year `1792` |
| modern-en | `4e7e6143670a4ca2` | 15 | 778 | 83,951 | "Modern English" |
| modern-da | `41ec7c251015ca80` | 15 | 778 | 84,072 | "Moderne Dansk" |

Mechanical comparison (original-en → modern-en): mean weighted similarity **0.9316**, identical
long paragraphs **33.4%**, 0 truncation flags, 0 empty paragraphs, 0 paragraph-count mismatches,
`en_editions_aligned: true`. Flagged in Phase 1's 33-book watch list, and specifically called out in
`mechanical/README.md` as one of the strongest identical-paragraph signals in the whole inventory.

Provenance: English original, Mary Wollstonecraft, 1792 (2nd edition text). Complete — Dedication,
Introduction and all 13 chapters, mapped to 15 registry "chapters". Public domain. No translator.

## HEADLINE FINDING: three entire chapters — 28% of the book — are byte-identical copies

The 33.4% identical-paragraph figure is **not** spread evenly as "some sentences needed no change".
It is concentrated. Per-chapter, counting paragraphs that are identical byte-for-byte and word
tokens that differ at all:

| registry ch | chapter | words | identical paragraphs | changed tokens |
|---|---|---:|---|---:|
| 1 | Dedication (to Talleyrand) | 1,676 | 3 / 21 | 19.7% |
| 2 | Introduction | 1,923 | 0 / 17 | 15.6% |
| 3 | Ch. 1 Rights and Involved Duties of Mankind | 2,850 | 1 / 31 | 7.6% |
| 4 | Ch. 2 The Prevailing Opinion of a Sexual Character | 8,333 | 0 / 76 | 16.1% |
| 5 | Ch. 3 The Same Subject Continued | 6,000 | 3 / 52 | 12.3% |
| 6 | Ch. 4 Observations on the State of Degradation | 11,399 | 4 / 86 | 9.4% |
| **7** | **Ch. 5 Animadversions on Some of the Writers…** | **16,418** | **172 / 172 (100%)** | **0.0%** |
| **8** | **Ch. 6 The Effect Which an Early Association…** | **2,592** | **20 / 20 (100%)** | **0.0%** |
| **9** | **Ch. 7 Modesty…** | **4,382** | **42 / 42 (100%)** | **0.0%** |
| 10 | Ch. 8 Morality Undermined by Sexual Notions | 4,149 | 1 / 33 | 14.7% |
| 11 | Ch. 9 Of the Pernicious Effects… | 4,510 | 0 / 33 | 9.3% |
| 12 | Ch. 10 Parental Affection | 1,030 | 0 / 8 | 7.0% |
| 13 | Ch. 11 Duty to Parents | 2,176 | 1 / 20 | 6.2% |
| 14 | Ch. 12 On National Education | 9,798 | 6 / 84 | 4.6% |
| 15 | Ch. 13 Some Instances of the Folly… | 7,157 | 20 / 83 | 3.7% |

**Registry chapters 7, 8 and 9 — Wollstonecraft's Chapters 5, 6 and 7 — are 234 paragraphs and
23,392 words of 1792 text reproduced with zero changed tokens.** That is **27.7% of the book**. Not
"lightly edited": literally copied. The modernization pass stopped at Chapter 4 and resumed at
Chapter 8.

This is the most serious single defect found in this five-book batch, and — unlike don-quixote and
essays-montaigne, whose historical failures turned out to be genuinely repaired — this one is live
today.

The affected block is not incidental material. Chapter 5 ("Animadversions on Some of the Writers Who
Have Rendered Women Objects of Pity, Bordering on Contempt") is the longest chapter in the book and
its polemical core: the sustained demolition of Rousseau's *Émile*, plus Dr. Fordyce, Dr. Gregory,
Mme de Genlis and Mrs. Piozzi. Chapter 7 ("Modesty") is one of the two most anthologised chapters.

## Samples inspected (8)

### 1. Introduction ¶0 (modernized region)

SRC: *"…and that women in particular, are rendered weak and wretched by a variety of concurring
causes, originating from one hasty conclusion… and the understanding of the sex has been so bubbled
by this specious homage…"*
MOD: *"…and that women in particular are made weak and wretched by a variety of converging causes,
all originating from one hasty conclusion… and the understanding of the sex has been so taken in by
this specious flattery…"*

**Finding — a real, competent, light modernization.** "Rendered"→"made", "concurring"→"converging",
"bubbled"→"taken in", "homage"→"flattery", periodic sentences unwound. The flower-in-rich-soil image
is preserved as an image. Nothing dropped. This is the quality the rest of the book should have.

### 2. Introduction ¶1 — a restraint problem

SRC: *"…and that, in the true style of **Mahometanism**, they are only considered as females, and
not as a part of the human species…"*
MOD: *"…and that, in the true style of **Islam**, women are only considered as females and not as
part of the human species…"*

**Finding — substantive term change.** "Mahometanism" in 1792 English names a specific European
polemical construct (the trope that Muslims denied women souls), which Wollstonecraft is invoking
*as a trope*. Rendering it "Islam" converts an 18th-century rhetorical figure into what reads as a
present-tense factual claim about a living religion. The right handling is to keep
"Mahometanism" and gloss it, not to silently update the referent. Local, but consequential.

### 3. Introduction ¶2 (0.852)

SRC: *"The male pursues, the female yields--this is the law of nature; and it does not appear to be
suspended or abrogated in favour of woman."*
MOD: *"The male pursues, the female yields — this is the law of nature, and it does not appear to be
suspended or abrogated in favor of woman."*

**Finding — strong.** Wollstonecraft's awkward and much-argued-over concession is preserved exactly,
not softened, not explained, not hedged. Correct: the standard requires preserving contradiction and
ambiguity, and this passage is one of the book's real ones.

### 4. Chapter 5 / registry ch 7, ¶2 — **the copied block**

SRC = MOD, byte-identical: *"I shall begin with Rousseau, and give a sketch of the character of women
in his own words, interspersing comments and reflections. My comments, it is true, will all spring
from a few simple principles, and might have been deduced from what I have already said; but the
artificial structure has been raised with so much ingenuity, that it seems necessary to attack it in
a more circumstantial manner, and make the application myself."*

**Finding — confirmed copy.** 172 of 172 paragraphs in this 16,418-word chapter are identical.

### 5. Chapter 5 / registry ch 7, ¶40–41 — the copied block, showing what the reader is left with

SRC = MOD: *"'Every daughter ought to be of the same religion as her mother, and every wife to be of
the same religion as her husband: for, though such religion should be false, that docility which
induces the mother and daughter to submit to the order of nature, takes away, in the sight of God,
the criminality of their error'.\* As they are not in a capacity to judge for themselves, they ought
to abide by the decision of their fathers and husbands as confidently as by that of the church."*

…followed by ¶41, also identical: *"(\*Footnote. What is to be the consequence, if the mother's and
husband's opinion should chance not to agree?…)"*

**Finding.** This is Wollstonecraft quoting Rousseau and then answering him in a footnote — dense,
heavily nested 18th-century prose with an inline asterisked footnote apparatus, exactly the material
a modern edition exists to handle. It is untouched.

### 6. Chapter 7 / registry ch 9, ¶3 — the copied block

SRC = MOD: *"Thus discriminating modesty from humility in one case, I do not mean to confound it with
bashfulness in the other. Bashfulness, in fact, is so distinct from modesty, that the most bashful
lass, or raw country lout, often becomes the most impudent; for their bashfulness being merely the
instinctive timidity of ignorance, custom soon changes it into assurance.\*"*

**Finding — confirmed copy, and a clarity cost.** "Impudent" and "assurance" both carry their
18th-century senses here (shameless / brazen self-confidence). A modern reader will take "assurance"
as reassurance and miss the argument. Unglossed, unchanged.

### 7. Chapter 13 / registry ch 15, ¶4–6 — the flagged tail of identical paragraphs

SRC = MOD ¶4: *"Do you believe that there is but one God, and that he is powerful, wise, and good?"*
SRC = MOD ¶5: *"Do you believe that all things were created by him, and that all beings are dependent
on him?"*

**Finding — identical, and legitimately so.** Chapter 13 shows 20 identical long paragraphs, which
looks alarming in the aggregate, but on inspection most are short catechism questions already in
plain modern English (17, 18, 16, 28, 34 words…). This chapter's overall changed-token rate is 3.7%,
i.e. light — but it *is* edited, unlike chapters 5–7. **I therefore treat ch 13 as light-but-real,
and only chapters 5–7 as the defect.**

### 8. Chapter 2 / registry ch 4 (16.1% tokens changed) — spot check of the most heavily edited long chapter

**Finding — no omission.** 8,333 words, 76 paragraphs, no identical paragraphs, no paragraph-count
drift, every paragraph a genuine light rewrite in the manner of sample 1.

## Phase 1 flags: confirmed vs. disconfirmed

| Flag | Verdict |
|---|---|
| identical long paragraphs 33.4% — "strongest mechanical signal of unmodernized passages" | **CONFIRMED, and it is the worst case of its class in this batch.** But the shape matters: it is not diffuse, it is three whole chapters at 100% plus a benign tail in ch 13. |
| mean similarity 0.9316 | **Confirmed, and misleading if read as a single number.** Excluding the three copied chapters, the edited chapters change 3.7%–19.7% of tokens — light, but real. The copied 28% drags the mean into the mechanical band. |
| 0 truncation / 0 empty / 0 paragraph-count mismatches | **Confirmed.** Nothing is missing from the book; the problem is that part of it was never processed. |
| Possible fill-from-unrelated-source | **Disconfirmed** — proper-noun retention median 0.982; the text is Wollstonecraft's throughout. |

## Phase 3 — accessibility of the English original

For an English original the first question is whether the source already meets the standard.

**Partly, and less than Walden does.** Wollstonecraft's 1792 prose is genuinely harder than Thoreau's
1854: long periodic sentences with multiple subordinate clauses, heavy use of the colon-and-semicolon
architecture of 18th-century argument, an inline asterisked footnote apparatus that interrupts the
argument mid-paragraph, and a vocabulary whose *senses* have drifted while the words survived —
"animadversions", "docility", "impudent", "assurance", "sensibility", "condescension", "want" (=lack),
"prejudice", "obtrude". The last category is the dangerous one: a modern reader does not know they are
misreading.

So unlike Walden, **a modern edition is justified here** — and the pass that was actually done
(samples 1, 3, 8) does the right thing: it untangles syntax, updates drifted senses, preserves the
images and preserves the contradictions. It simply was not finished.

**Human-edition research: not applicable in the usual sense** — there is no translation to replace,
so there is no rights question about the core text. Rights-clear clean source texts are freely
available (Project Gutenberg #3420; Standard Ebooks). I did not research modern annotated scholarly
editions (Norton Critical, Broadview, Oxford World's Classics) — all in copyright, and out of scope
for this pass, though their *annotation* models would be the reference if a gloss layer is preferred
to a rewrite.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | **5** — nothing omitted, added, or shifted; 0 truncation, 0 empty, 0 paragraph-count drift; the copied chapters are complete Wollstonecraft |
| first-read clarity | 25% | **2** — 27.7% of the book, including its polemical core and one of its two most-read chapters, is unmodernized 1792 prose with its drifted-sense vocabulary unglossed |
| literary voice | 20% | **5** — Wollstonecraft's voice, indignation, contradictions and images survive everywhere, including the concession at Introduction ¶2 |
| restraint / no invention | 10% | **4** — "Mahometanism"→"Islam" changes the referent of an 18th-century polemical figure |
| naturalness | 5% | **4** — the edited chapters read well; the book as a whole is internally inconsistent, jumping from modernized ch 4 to raw 1792 ch 5 with no signal to the reader |

**Weighted score: 4.1 — band: Good with fixes.**

As with walden in this batch, read the band with care: fidelity and voice carry 60% of the weight
and both score high *because* a quarter of the file is a verbatim copy. The actionable signal is the
clarity score of 2.

## Recommendation

**LIGHT EDIT.** Confidence: **high**. Estimated correction scope: **substantial**.

"Light edit" in the sense that the existing work is sound and the fix is scoped and precisely
located — not in the sense that it is small. Specifically:

1. **Run the existing modernization pass over registry chapters 7, 8 and 9** (Wollstonecraft's
   Chapters 5, 6, 7) — 234 paragraphs, 23,392 words, currently 0.0% changed. Match the style of the
   chapters that were done (target ~10–16% changed tokens, preserve images, preserve the inline
   asterisked footnotes, gloss drifted senses like "impudent"/"assurance"/"animadversions"). This
   is the whole recommendation; everything else is minor.
2. **Revert "Islam" to "Mahometanism"** (Introduction ¶1) with a brief in-place gloss, and sweep the
   book for other silently updated period terms.
3. **Leave chapter 13's short catechism paragraphs alone** — they are correctly unchanged and should
   not be "fixed" by a pass that chases the identical-paragraph metric.

Do **not** retranslate the whole book: chapters 1–4 and 8–13 are good work and a full redo would
risk them. Do **not** treat this as SOURCE + GLOSSES either — unlike Walden, this source has a real
syntactic barrier that the completed chapters demonstrably remove.

**Re-run the mechanical check after the fix.** The expected post-fix numbers are roughly: mean
similarity ~0.88, identical long paragraphs well under 10%.

## Limitations of this review

- 8 read passages out of 778 paragraphs; the *reading* verdict on the modernized chapters is
  sample-based and rests mainly on the Introduction and Chapter 2.
- The **copied-chapter finding is not sample-based** — it is a complete byte-comparison of all 778
  paragraphs, and it is certain.
- I did check modern-da for the matching gap and found something worse — see the section below. I
  did **not** read the Danish prose for quality in the three chapters that are actually translated.
- I did not research annotated scholarly editions or their rights.
- I did not verify our `original-en` against a specific 1792/1796 printing beyond confirming it is
  Wollstonecraft's text.

---

## P0 — OUT-OF-SCOPE BUT URGENT: `modern-da` is 72% raw English

While checking whether the Danish edition shared the three-chapter gap, I found the **mirror image**
of it, and it is worse.

`vindication-rights-of-woman-modern-da.json` — label "Moderne Dansk", 84,072 words — was compared
paragraph-by-paragraph against `original-en`:

| registry ch | Danish paragraphs byte-identical to the English source |
|---|---|
| 1 Dedication | 19 / 21 |
| 2 Introduction | **17 / 17** |
| 3 Ch. 1 | 30 / 31 |
| 4 Ch. 2 | **76 / 76** |
| 5 Ch. 3 | 49 / 52 |
| 6 Ch. 4 | 82 / 86 |
| **7 Ch. 5** | **2 / 172** ← actually Danish |
| **8 Ch. 6** | **0 / 20** ← actually Danish |
| **9 Ch. 7** | **0 / 42** ← actually Danish |
| 10 Ch. 8 | 32 / 33 |
| 11 Ch. 9 | **33 / 33** |
| 12 Ch. 10 | **8 / 8** |
| 13 Ch. 11 | 19 / 20 |
| 14 Ch. 12 | 78 / 84 |
| 15 Ch. 13 | 63 / 83 |

**61,001 of 84,393 words (72.3%) of the "Moderne Dansk" edition are the unaltered 1792 English
text.** Verbatim from the file, `modern-da` chapter 2 ¶0:

> *"After considering the historic page, and viewing the living world with anxious solicitude, the
> most melancholy emotions of sorrowful indignation have depressed my spirits…"*

…while `modern-da` chapter 9 ¶3 is genuine Danish:

> *"Idet jeg således adskiller blufærdigheden fra ydmygheden i det ene tilfælde, mener jeg ikke at
> sammenblande den med generthed i det andet…"*

**The two gaps are exactly complementary.** `modern-en` is missing precisely the three chapters that
`modern-da` has, and `modern-da` is missing precisely the twelve chapters that `modern-en` has. That
is not two independent failures; it is one run whose two outputs landed in the wrong files, or a
merge that took each chapter from only one of the two products.

A Danish reader who opens this book today gets 18th-century English for twelve of its fifteen
chapters, silently, under a "Moderne Dansk" label. Recommend triaging this ahead of the modern-en
repair — and checking `books/scan-report.md` and the other books from the same generation run for
the same complementary-gap signature.

**Scope note:** this audit is a review, and I have modified nothing. I checked the same
English-identical measure on the other four books in my batch and they are clean: walden 1/484
paragraphs, imitation-of-christ 0/574, don-quixote 0/3560, essays-montaigne 42/3853 (and all 42 of
Montaigne's are Latin verse quotations, which are correctly identical in every edition).
