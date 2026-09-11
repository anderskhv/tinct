# utilitarianism — *Utilitarianism*, John Stuart Mill (1861/1863)

Reviewer: batch agent, Enlightenment/liberal political philosophy batch, 2026-09-11.
Scope: `public`.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en "Mill (1863)" | `29360c7dbdc7de58` | 5 | 94 | 27,499 |
| modern-en "Modern English" | `7457e909ce911b50` | 5 | 94 | 27,074 |
| modern-da "Moderne Dansk" | `46ed443acf9c23bb` | 5 | 94 | 26,249 |

`en_editions_aligned: true`; no count mismatches, no truncation, no empty paragraphs;
`pct_identical_long_paragraphs: 1.1`, `mean_weighted_similarity: 0.8159`;
`last_chapter_suspiciously_short: false` (ch. 5 = 10,164 words).

## Core English text — provenance and completeness

English original; no translator. 5 chapters, correct titles, matching Mill's structure
(General Remarks / What Utilitarianism Is / Ultimate Sanction / Of What Sort of Proof /
Justice and Utility). **Mill's four long footnotes (A–D) are present** as paragraphs in both
`original-en` and `modern-en`, including the Herbert Spencer exchange at the end of ch. 5 —
this is the most complete of the seven books in this batch. No truncation.

## Phase 1 flags — confirmed / disconfirmed

- `mean_weighted_similarity: 0.8159` — this is a *genuinely* modernised edition, and my
  independent word-level measurement agrees: only **2 of 89** long paragraphs are ≥0.97
  identical to the source (1% of words), median word-similarity **0.890**.
- Per-chapter median word-similarity: `ch1 = 0.69 · ch2 = 0.80 · ch3 = 0.85 · ch4 = 0.91 ·
  ch5 = 0.93`. A clear front-loaded effort curve: chapter 1 heavily rewritten, chapter 5
  barely touched.
- `truncated_paragraphs_total: 0` / `empty_paragraphs_total: 0` / short-final-chapter — all
  **disconfirmed**, verified by reading ch. 5's tail (paras 30, 34, 38).
- **New defect found mechanically, not flagged in Phase 1:** the source carries 138 `_..._`
  italic markers; `modern-en` carries **zero**. All of Mill's emphasis is silently dropped.

## Samples inspected (6 passages, ~1,300 source words)

### 1. Ch. 1 (General Remarks), para 0 (181 → 162 words) — the opening. *Strong.*
- source: "There are few circumstances among those which make up the present condition of
  human knowledge, more unlike what might have been expected, or more significant of the
  backward state in which speculation on the most important subjects still lingers, than the
  little progress which has been made in the decision of the controversy respecting the
  criterion of right and wrong."
- modern: "Few features of our current knowledge are more surprising, or more telling of how
  little progress we have made in thinking about the most important subjects, than the lack of
  resolution in the long debate over the criterion of right and wrong."
- Finding: real and good. The Socrates/Protagoras allusion, the "(if Plato's dialogue is based
  on a real conversation)" qualification and the *summum bonum* gloss ("the highest good —
  which is the same as asking what morality is grounded in") all survive.

### 2. Ch. 2 (What Utilitarianism Is), para 0 (385 → 370 words). *Strong.*
- The quoted jibe is preserved verbatim, correctly: "as impracticably dry when the word utility
  precedes the word pleasure, and as too practicably voluptuous when the word pleasure precedes
  the word utility." Attribution ("as an able writer has pointedly remarked") kept.

### 3. Ch. 2, para 2 (98 → 88 words) — the "doctrine worthy only of swine" objection. *Strong.*
- source: "as a doctrine worthy only of swine, to whom the followers of Epicurus were, at a
  very early period, contemptuously likened"
- modern: "a doctrine fit only for swine. The followers of Epicurus were compared to swine from
  very early on"
- Finding: faithful; the image is kept, not explained away. One source sentence correctly
  becomes two. "contemptuously" is dropped from the second clause — a hair of colour lost.

### 4. Ch. 4, para 2 (198 → 196 words) — **the proof of the principle of utility.** *Argument-chain check: passes.*
- source: "The only proof capable of being given that an object is visible, is that people
  actually see it… No reason can be given why the general happiness is desirable, except that
  each person, so far as he believes it to be attainable, desires his own happiness… that each
  person's happiness is a good to that person, and the general happiness, therefore, a good to
  the aggregate of all persons. Happiness has made out its title as _one_ of the ends of
  conduct."
- modern: "The only proof that can be given that an object is visible is that people actually
  see it… No reason can be given why the general happiness is desirable, except that each
  person, so far as he believes it to be attainable, desires his own happiness… that each
  person's happiness is a good to that person, and the general happiness, therefore, a good to
  the aggregate of all persons. Happiness has made out its title as one of the ends of conduct."
- Finding: the famously contested inference — including its exact scope quantifiers ("each
  person", "the aggregate of all persons") and the "so far as he believes it to be attainable"
  restriction — is transmitted intact. **The one loss is the italic on _one_**, which is
  load-bearing: Mill italicises it precisely to forestall the reading that happiness is the
  *sole* end. This is the clearest instance of the systematic italic-stripping.

### 5. Ch. 5 (Justice and Utility), para 30 (212 words) — Just vs. Expedient. *Very light.*
- Word-similarity 0.983. Whole-paragraph diff: "exposition"→"account", "which"→"that" ×3,
  "the justice which is grounded"→"the justice grounded", two comma pairs → em-dashes.
- Finding: no error, but ch. 5 is materially less modernised than chs. 1–2.

### 6. Ch. 5, para 38 (404 words) — Footnote D, the Herbert Spencer note. *Light, complete.*
- source: "…is regarded by Mr. Herbert Spencer (in his _Social Statics_) as a disproof of the
  pretentions of utility to be a sufficient guide to right"
- modern: "…is regarded by Mr. Herbert Spencer (in his Social Statics) as a disproof of the
  claims of utility to be a sufficient guide to right"
- Finding: complete, including Spencer's private-communication postscript. Title italics lost.

## Phase 3 — human-edition research

English original, already quite accessible; researched anyway because the modern edition here
is good and the question is whether anything better exists.

1. **Jonathan Bennett, *Early Modern Texts* — "Utilitarianism (1863)"**. Complete plain-English
   version, catalogued at https://www.earlymoderntexts.com/texts.
   **Rights: not usable.** https://www.earlymoderntexts.com/faqs/rights states *"Permission is
   not and will not be given for the texts to be put to any commercial use."* → noncommercial
   restriction; Tinct's Premium tier is commercial use.
2. **Standard Ebooks / Project Gutenberg** carry Mill's own text (PD; Standard Ebooks'
   production work is CC0). Useful for restoring italics into `original-en`, not a
   modernisation.
3. No rights-clear human modern-English *Utilitarianism* found in this search.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 4 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 5 |

Weighted score **4.6** — band: **Strong**.

Clarity is 4 rather than 5 only because chapter 5 (37% of the book) is much less modernised
than chapters 1–2; voice is 4 because of the wholesale italic loss.

## Recommendation

**LIGHT EDIT**

1. Restore Mill's italics (138 markers in the source, 0 in `modern-en`). At minimum restore
   ch. 4 para 2's *one*, where the emphasis carries philosophical weight.
2. Deepen the modernisation of chapter 5 to match chapters 1–2 (currently median
   word-similarity 0.93 vs 0.69/0.80).

- Confidence: **medium-high**. Six passages across all five chapters; no omission, invention or
  altered logical relation found anywhere.
- Correction scope: **local**.

## Limitations of this review

Six passages (~1,300 of 27,499 source words). The 1%-cosmetic / 0.890-median figures cover all
89 long paragraphs, so the "this is a real modernisation" claim is book-wide; the quality claims
are sample-based. I did not check `modern-da`. I did not verify whether the source is the 1863
first book edition or a later lifetime printing (the registry says "Mill (1863)"). I did not
read Bennett's version (rights ruled it out first).
