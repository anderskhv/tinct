# second-treatise — *Second Treatise of Government*, John Locke (1689)

Reviewer: batch agent, Enlightenment/liberal political philosophy batch, 2026-09-11.
Scope: `public`.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en "Original (1689)" | `efbd7cabd14ed99f` | 19 | 301 | 54,832 |
| modern-en "Modern English" | `177b364414c437af` | 19 | 301 | 55,556 |
| modern-da "Moderne Dansk" | `7f5a7c98a4b9fe1a` | 19 | 301 | 53,431 |

`en_editions_aligned: true`; no count mismatches, no truncation, no empty paragraphs;
`pct_identical_long_paragraphs: 1.0`, `mean_weighted_similarity: 0.8645`;
`last_chapter_suspiciously_short: false` (ch. 19 = 7,942 words).

## Core English text — provenance and completeness

English original, 1689 (the text is Locke's own; no translator). All 19 chapters present with
correct titles and the correct shape — ch. 1 is the short bridging essay from the *First
Treatise*, ch. 5 (Of Property, 30 paras), ch. 8 (Of the Beginning of Political Societies,
34 paras) and ch. 19 (Of the Dissolution of Government, 48 paras) are the long ones, as they
should be. Locke's marginal section numbering (§) is not carried, and there is 1 dangling
`[n]` marker, but I found no missing text. Curly apostrophes are used throughout, which is a
plausible sign of a well-prepared source.

## Phase 1 flags — confirmed / disconfirmed

- `mean_weighted_similarity: 0.8645`, `pct_identical_long_paragraphs: 1.0` — the raw numbers
  look healthy, but the word-level measurement tells a different story: **64 of 258** long
  paragraphs (25%, 24% of words) are ≥0.97 identical to Locke's 1689 text, and the **median
  word-similarity is 0.946** — i.e. even the "modernised" paragraphs are only lightly touched.
- Per-chapter median word-similarity: `ch1 = 0.81 · ch2 = 0.84 · ch3 = 0.90 · ch4 = 0.92 ·
  ch5 = 0.91 · ch6 = 0.94 · ch7 = 0.94 · ch8 = 0.95 · ch9 = 0.96 · ch11 = 0.96 · ch13 = 0.97 ·
  ch14 = 0.97 · ch16 = 0.95 · ch18 = 0.97 · ch19 = 0.97`. Cosmetic-only counts are concentrated
  late: ch. 19 17/36, ch. 18 8/14, ch. 11 6/13, ch. 13 6/10, ch. 8 6/30.
- **Direct answer to the batch question "does Locke show more transformation than Mill?" — No,
  and that is backwards.** Locke's 1689 prose is the hardest source in this batch; its median
  transformation (0.946) is *lighter* than Mill's *Utilitarianism* (0.890), Hume (0.921),
  Rousseau's *Social Contract* (0.882) and *Discourse on Inequality* (0.869). Only *On Liberty*
  (0.989) got less work, and that edition is effectively unmodernised.
- **Objective corroboration:** the source carries 270 archaic forms (`hath` ×102, `wherein` ×33,
  `whereby` ×23, `shew` ×16, `unto` ×14, `doth` ×14, …) = 492 per 100k words. `modern-en` still
  carries **65** of them (`unto` ×13, `hath` ×8, `whereby` ×8, `doth` ×7, `wherein` ×5,
  `thereof` ×4, …) = 117 per 100k. **24% of Locke's archaisms survive into the "Modern English"
  edition**, essentially all of them in chapters 11–19.
- `truncated_paragraphs_total: 0` / `empty_paragraphs_total: 0` / short-final-chapter —
  **disconfirmed**; the long ch. 19 tail is intact.

## Samples inspected (6 passages, ~1,300 source words)

### 1. Ch. 1, para 0. *Genuine.*
- source: "It having been shewn in the foregoing discourse," → modern: "I have shown in the
  previous discourse:" — correct, and the archaic *shewn* is handled here (but not later).

### 2. Ch. 2 (Of the State of Nature), para 4 (286 words) — **the law of nature. Argument-chain check: passes.** *Genuine, good.*
- source: "But though this be a state of liberty, yet it is not a state of licence: though man
  in that state have an uncontroulable liberty to dispose of his person or possessions, yet he
  has not liberty to destroy himself, or so much as any creature in his possession, but where
  some nobler use than its bare preservation calls for it."
- modern: "But although this is a state of liberty, it is not a state of license. Even though a
  man in that state has uncontrollable liberty to dispose of his person or possessions, he does
  not have liberty to destroy himself, or even any creature in his possession, except where some
  nobler use than its bare preservation calls for it."
- Finding: the concessive/exceptive structure ("though… yet… but where…") is preserved exactly,
  as is the theological grounding ("they are his property, whose workmanship they are, made to
  last during his pleasure, not one another's") and the inference from like faculties to no
  subordination. **One clarity nit:** *uncontroulable* is merely respelled as *uncontrollable*.
  In Locke it means "not subject to another's control"; in current English "uncontrollable"
  means "impossible to control", which is close to the opposite of what Locke asserts. This is
  exactly the kind of false friend a modern edition exists to gloss.

### 3. Ch. 5 (Of Property), para 5 (203 words) — the labour-mixing argument. *Genuine, good.*
- source: "Thus this law of reason makes the deer that Indian's who hath killed it; it is
  allowed to be his goods, who hath bestowed his labour upon it… or what ambergrise any one
  takes up here, is by the labour that removes it out of that common state nature left it in,
  made his property, who takes that pains about it."
- modern: "Thus this law of reason makes the deer that Indian's who has killed it; it is
  acknowledged to be the goods of him who has bestowed his labour upon it… or whatever ambergris
  anyone takes up there, becomes the property of him who takes the trouble — by the labour that
  removes it out of that common state nature left it in."
- Finding: faithful, and a real gain — Locke's tangled "made his property, who takes that pains
  about it" is untangled without adding anything. The hare-chase example is kept whole.
  ("labour" is kept in British spelling here while *On Liberty*'s edition Americanises —
  cross-book inconsistency, not a defect in this book.)

### 4. Ch. 8 (Of the Beginning of Political Societies), para 24 (192 words) — the *reductio* against natural-subjection monarchism. *Light but real; argument intact.*
- source: "…it being demonstration, that if any one, born under the dominion of another, may be
  so free as to have a right to command others in a new and distinct empire, every one that is
  born under the dominion of another may be so free too… And so by this their own principle,
  either all men, however born, are free, or else there is but one lawful prince, one lawful
  government in the world."
- modern: "…It is demonstration that, if any one born under the dominion of another may be so
  free as to have a right to command others in a new and distinct empire, every one born under
  the dominion of another may be so free too… And so, by this their own principle, either all
  men, however born, are free, or else there is but one lawful prince, one lawful government in
  the world."
- Finding: the conditional, the universal quantifier ("every one"), and the exclusive
  disjunction all survive precisely. `shew`→`show` handled here.

### 5. Ch. 16 (Of Conquest), para 9 (339 words). *Light; useful disambiguation.*
- source: "he has no right to seize more than the vanquished could forfeit: **his** life is at
  the victor's mercy; and **his** service and goods **he** may appropriate"
- modern: "he has no right to seize more than the vanquished could forfeit. **The vanquished's**
  life is at the victor's mercy, and his service and goods **the victor** may appropriate"
- Finding: good editorial work — Locke's ambiguous pronoun chain is resolved, and resolved
  correctly. Nothing added beyond the antecedents.

### 6. Ch. 19 (Of the Dissolution of Government), paras 24 and 29. *Verbatim / near-verbatim.*
- p24 (65 words), word-similarity 1.000 — the only differences are one full stop for a
  semicolon and one added comma.
- **p29 (359 words) — word-similarity 1.000.** This is Locke quoting Barclay in translation,
  and it is shipped completely untouched in the "Modern English" edition, archaisms and all:
  "Wherefore if the king shall **shew** an hatred, not only to some particular persons, but sets
  himself against the body of the commonwealth, **whereof** he is the head…" The modern edition
  adds only an opening quotation mark.
- Finding: the single clearest failure in the book. This is 17th-century legal-political prose
  with `shew`, `whereof`, `wherefore`, `debarred` intact — precisely the material the edition
  exists to render.

## What I did NOT find

No omissions, no inventions, no content moved between chapters, no altered quantifiers or
logical relations, no invented glosses, no term inconsistency. Where the edition works, it is
careful and disciplined. **The defect is uneven coverage, not bad translation.**

## Phase 3 — human-edition research

Locke's 1689 English does **not** meet the reading standard unaided — long periodic sentences,
`hath`/`doth`/`shew`, and now-shifted legal vocabulary (`uncontroulable`, `federative`,
`prerogative`, `property` in Locke's wide sense). A modern edition is genuinely warranted here,
more than for any other book in this batch.

1. **Jonathan Bennett, *Early Modern Texts* — "Second Treatise of Government (1689)"**.
   Complete, plain-English, made by a distinguished Locke scholar, and by reputation the best
   accessible English *Second Treatise* available free.
   Catalogue: https://www.earlymoderntexts.com/texts
   **Rights: NOT usable — this is the decisive finding.**
   https://www.earlymoderntexts.com/faqs/rights states plainly: *"Permission is not and will
   not be given for the texts to be put to any commercial use."* Cost-recovery classroom copies
   are allowed; commercial use is forbidden, permanently and by the rights-holder's explicit
   statement. Tinct sells a Premium tier, so this is **noncommercial restriction / permission
   required**, and the FAQ's wording ("will not be given") means asking is not a live path.
   Status: rights-blocked, not merely unverified.
2. **Project Gutenberg / Standard Ebooks** carry Locke's own 1689 text (PD). Useful for an
   `original-en` typography upgrade; not a modernisation.
3. No other complete, rights-clear, human modern-English *Second Treatise* was found in this
   search. I mean "none found in this search", not "none exists".

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 3 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 4 |

Weighted score **4.3** — band: **Good with fixes**.

Fidelity 5: complete, no omissions or inventions found in any sample. Clarity 3: the
modernisation decays steadily and by chapters 11–19 the reader is back in 1689; 65 archaic
forms survive; false friends like *uncontrollable* are not glossed.

## Recommendation

**LIGHT EDIT** — but with a *substantial* scope: finish the modernisation pass over chapters
11–19 (and the untouched paragraphs in chs. 6–8) to the standard already achieved in chapters
1–5. Do **not** redo chapters 1–5; they are good. Specific targets:

1. Ch. 19 para 29 (the Barclay quotation, 359 words, word-similarity 1.000) and the other 16
   cosmetic-only paragraphs in ch. 19.
2. Eliminate the surviving 65 archaisms (`hath`, `doth`, `shew`, `unto`, `whereof`, `whereby`,
   `wherein`, `thereof`).
3. Gloss *uncontroulable* / *uncontrollable* (ch. 2 para 4) and check for the same class of
   false friend elsewhere.

- Confidence: **medium-high**. Six passages (~1,300 source words of 54,832) is thin, but the
  coverage claim is mechanical and covers all 258 long paragraphs.
- Correction scope: **substantial** (roughly chapters 11–19, ~25,000 words).

## Limitations of this review

Six passages closely read; ~2.4% of the book by word count. Quality judgements about chapters
4, 6, 7, 9–15, 17–18 rest on the similarity profile, not on close reading. I did not check
`modern-da`. I did not establish which printing/edition the `original-en` text derives from
(the registry says "Original (1689)"; the curly punctuation suggests a prepared digital source
rather than a raw Gutenberg dump, but I did not confirm it). I did not read Bennett's Locke
(the rights finding made it moot).
