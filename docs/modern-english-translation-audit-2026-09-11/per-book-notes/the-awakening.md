# the-awakening — The Awakening, Kate Chopin (1899)

Batch B14. Reviewer: audit subagent, 2026-09-11.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en "Original (1899)" | `78824e511ea979f2` | 39 | 1044 | 49,605 |
| modern-en "Modern English" | `06a1d8570cba2c31` | 39 | 1044 | 47,867 |
| modern-da "Moderne Dansk" | `9afc197ea21772a6` | 39 | 1044 | 48,308 |

`en_editions_aligned: true`; no chapter/paragraph count mismatch; 0 truncated
paragraphs; 0 empty paragraphs; mean weighted similarity 0.8659;
`pct_identical_long_paragraphs` 36.9.

## Provenance of the core English text

English original. Chopin published *The Awakening* in 1899; it is public domain
worldwide. Our `original-en` is a 39-chapter text matching the standard
Project Gutenberg / Standard Ebooks chapter division. No translator involved.
Typography is consistent curly-quote throughout both English editions.

## Phase 1 flags: confirmed / disconfirmed

**Confirmed, and worse than the headline number suggests.** The 36.9%
identical-long-paragraph rate is *not* evenly distributed and is *not* the
"source was already plain" case. It is a tapering / abandoned modernization
pass. Measured per chapter (share of source **words** sitting in byte-identical
paragraphs; normalizing curly quotes and dashes changes nothing here):

```
ch 1–9    0–10%      (fully modernized)
ch 10–15  10–35%
ch 16–20  0.6–5%     (modernized again)
ch 21–25  4–39%
ch 26     55%
ch 27     81%
ch 28     100%
ch 29     19%
ch 30     47%
ch 31     87%
ch 32     57%
ch 33     80%
ch 34     73%
ch 35     84%
ch 36     82%
ch 37     67%
ch 38     100%   (18/18 paragraphs, 912 words verbatim)
ch 39     84%    (31/32 paragraphs verbatim, including the entire drowning scene)
```

Book-wide, **14,357 of 49,605 source words (28.9%) appear verbatim in the
"Modern English" edition**, essentially all of it in chapters 26–39.

Disconfirmed / not found: no truncation, no empty paragraphs, no content
shifted between chapters, no last-chapter shortfall, no invented material. A
length-ratio scan over every paragraph ≥40 source words found exactly **one**
outlier (ch18 p10, ratio 0.71) in the whole book — so there is no concealed
omission anywhere.

## Samples inspected (6)

### 1. Opening — Chapter 1, paras 0–9 (modernized; representative of chs 1–25)

Source (ch1 p5): "He stopped before the door of his own cottage, which was the
fourth one from the main building and next to the last. Seating himself in a
wicker rocker which was there, he once more applied himself to the task of
reading the newspaper."

Modern-en: "He stopped at the door of his own cottage — the fourth from the
main building and second to last. He settled into a wicker rocker on the porch
and tried again to read the paper."

Finding: **strong.** Light, accurate, idiomatic. Nothing is added ("on the
porch" is implied by the source's established setting and is the one small
liberty). Period racial terminology is preserved, not sanitized — ch1 p7 keeps
"A quadroon nurse followed them about" as "A quadroon nurse followed them at a
distance."

### 2. Chapter 17, paras 0–7 (middle; modernized)

Source (p1): "…derived genuine pleasure from contemplating a painting, a
statuette, a rare lace curtain—no matter what—after he had bought it and placed
it among his **household gods**."

Modern-en: "…after he had bought it and placed it among his **household
treasures**."

Finding: **borderline.** The only real loss in this sample. "Household gods"
(*lares et penates*) is the passage's ironic point — Léonce worships his
possessions. "Treasures" is an explanation that kills the image. This is the
"images replaced by explanations" failure mode, but it is a one-word, local
instance, not a pattern: the rest of the sample is faithful and clear
("A light-colored mulatto boy, in dress coat" → "A light-skinned mulatto boy in
a dress coat" — again not sanitized).

### 3. Chapter 18, para 10 (the single length-ratio outlier, 85w → 60w)

Source: "And she summoned a young **black** woman, whom she instructed, in
French, to be very careful in checking off the list which she handed her. She
told her to notice particularly if a fine linen handkerchief of Monsieur
Ratignolle's, which was missing last week, had been returned; and to be sure to
set to one side such pieces as required **mending and darning**."

Modern-en: "She summoned a young **Black** woman and gave her instructions in
French: be very careful checking the list, look particularly for a fine linen
handkerchief of Monsieur Ratignolle's that had gone missing the week before,
and set aside anything that needed **mending**."

Finding: **borderline.** (a) The word-count drop is legitimate compression of a
three-clause reporting sentence into a colon list; no substance is lost except
(b) "and darning" is folded into "mending" — trivial. (c) The capitalization
"Black" is a 2020s editorial convention imported into 1899 third-person
narration. It is defensible house style, but it is an intervention the source
does not make and is inconsistent with the same paragraph-set's untouched
"quadroon" and "mulatto". Flagging under restraint.

### 4. Chapter 26, paras 0–9 (mechanical outlier — 55% identical by word; first
chapter where the pass visibly starts to fail)

Modernized here (p0: "it appeared to her absurd" → "it seemed absurd"; "She was
provoked at his having written" → "She was annoyed that he had bothered to
write"), but p2, p6, p7, p9 and 33 of 44 paragraphs are verbatim. Finding:
**the pass is running out mid-chapter.** The treated sentences are fine; the
untreated ones sit beside them.

### 5. Chapter 38 (mechanical outlier — 18/18 paragraphs, 912 words, 100%
byte-identical)

Source and modern-en p0 are the same string, character for character:
"Edna still felt dazed when she got outside in the open air. The Doctor's coupé
had returned for him and stood before the porte cochère…"

Finding: **failing.** An entire chapter of the "Modern English" edition is the
1899 text. This is not a judgement call about whether Chopin needed
modernizing — chapters 1–25 answer that question in the affirmative, and this
chapter simply never received the treatment they did.

### 6. Ending — Chapter 39, paras 20–31 (31 of 32 paragraphs verbatim)

Source and modern-en both read, identically: "How strange and awful it seemed
to stand naked under the sky! how delicious! She felt like some new-born
creature…" — including the lowercase "how" after the exclamation mark, the
1899 hyphenation "new-born" / "bath-house", and "Good-by".

Finding: **failing.** The novel's climax — the most-quoted passage in Chopin —
is untouched in the modern edition.

## Editorial judgement on the identical-paragraph question

The brief asked whether the high identity rate is legitimate (Chopin's prose is
already plain) or a false modernization. The answer is neither, exactly: it is
**a real and good modernization that stops**. Chopin's 1899 prose *is* clear
enough that a source-plus-glosses edition would be defensible; but this edition
is not that. It applies a careful, consistent treatment for 25 chapters,
establishing a modern narrative voice and register, and then reverts to the
1899 voice without warning for the last third — including the ending. Two
concrete harms: (a) a readable voice discontinuity mid-novel; (b) Tinct's
paragraph-aligned split-pane compare degenerates to two identical panes for
chapters 31–39, which is a visible product defect, not just an editorial one.

## Human-edition research

Not applicable in the usual sense — English original, public domain worldwide,
no translation involved. For a cleaner base text than our current
`original-en` if ever needed, Standard Ebooks produces CC0-dedicated
transcriptions of Chopin (their production work is dedicated to the public
domain via CC0 1.0; the underlying 1899 text is PD). Our current `original-en`
has no evident defect — typography is consistent and no PG boilerplate remains
— so no replacement is indicated.

**Status: not researched further (English original already accessible).**

## Ratings

| dimension | weight | rating |
|---|---|---|
| fidelity / completeness | 40% | 4 |
| first-read clarity | 25% | 3 |
| literary voice | 20% | 3 |
| restraint / no invention | 10% | 4 |
| naturalness | 5% | 4 |

Weighted score **3.6** — band **Mixed**.

Fidelity is 4 not 5 because of the "household gods" gloss, the dropped
"darning", and the anachronistic "Black" capitalization — nothing substantive
is missing or invented. Clarity and voice take the hit for the untreated back
third and the mid-book register break.

## Recommendation

**RETRANSLATE** — but scoped: the defect is recurring and covers 14 chapters
(~29% of the book), which is not local, yet chapters 1–25 are good work that
should be preserved verbatim, not redone. The correct action is to run the
same modernization pass that produced chapters 1–25 over chapters 26–39 and
re-QA the seam at chapter 26.

- **Confidence: high** on the mechanical finding (measured across all 39
  chapters, not sampled) and on the quality of the treated chapters
  (6 passages read in full).
- **Correction scope: substantial.**
- A defensible alternative, if the team would rather not maintain a modern
  English Chopin at all: **SOURCE + GLOSSES**. The 1899 text is genuinely
  readable and the modernization's value-add is modest. That is a product
  decision, not an editorial one.

## Limitations of this review

- 6 passages read closely out of 39 chapters; the per-chapter identity
  measurement is exhaustive but the *quality* judgement of chapters 1–25 rests
  on chapters 1, 17, 18 and 26 only.
- I did not check `modern-da` at all.
- I did not check the onboarding JSON, threads/cast JSON, or audio manifests.
- I did not verify our `original-en` against a scanned 1899 first edition; I
  accepted it as the core text.
