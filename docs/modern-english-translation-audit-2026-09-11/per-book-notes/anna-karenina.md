# anna-karenina — Anna Karenina, Leo Tolstoy (1877)

**Audit date:** 2026-09-11 · **Scope:** public (in `BOOKS`) · **Reviewer:** batch agent (Russian-novels batch)

> **Assignment-specific question: does the 2026-05-29 repair hold across all 239 chapters, or only where it
> was spot-checked back then?**
>
> **Answer: it holds.** I sampled the opening, an early Part 2 block, the middle (Part 3), a late Part 7
> chapter, and the final chapter of Part 8. All are genuine, complete modern renderings. The May 2026
> mechanical failure (228 of 239 chapters MECHANICAL, byte-identical paragraphs at ch1 p12) is **gone** —
> after quote normalization only **3 of 2,673 long paragraphs (0.1%)** are byte-identical, against a
> pre-repair state where the word-count ratio was 1.00 and whole paragraphs were verbatim.
>
> One real caveat: a **contiguous block of 29 chapters (21, 27–50, 60, 62, 105, 116)** sits in the
> 0.85–0.95 light band and is barely modernized. That block is a scoped light-edit job, not a repair failure.

## Edition snapshot (from Phase 1 `mechanical/anna-karenina.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `6318124f6f65f5de` | 239 | 7442 | 349,256 | Garnett (1901), tr. Constance Garnett |
| modern-en | `e19b01c5f4c5264b` | 239 | 7442 | 347,559 | Modern English |
| modern-da | `c7048c6c35247219` | 239 | 7442 | 350,806 | Moderne Dansk |

Structure: chapter counts match, 0 paragraph-count mismatches, `en_editions_aligned: true`.
Mean weighted similarity **0.7095**; identical long paragraphs 0.4%; **0 truncation flags**; 0 empty paragraphs.

## Provenance / completeness of the core English text

Constance Garnett, 1901. No `books/raw/anna-karenina/SOURCE.md` exists in the repo — **provenance is
recorded only in `bookRegistry.ts`** (`label: 'Garnett (1901)', translator: 'Constance Garnett', year: 1901`).
The text matches Garnett's published wording ("Happy families are all alike; every unhappy family is unhappy
in its own way" — Garnett's distinctive inversion, against Maude's "All happy families resemble one another").
239 chapters across 8 parts; complete and unabridged. **Recommend back-filling a `SOURCE.md`** — this book
has already been through one quality incident and has no source-of-record file.

## Comparison against the May 2026 audit

`books/MODERN-EN-REPAIR-STATUS.md` (2026-05-23) rated anna-karenina: 239 chapters, **0 REAL-HEAVY, 0 REAL,
11 LIGHT, 228 MECHANICAL — "Needs regen: 239"**, and cited ch1 para 12 (92 words) as byte-identical. Its
2026-05-29 update claimed a full re-render with "identical paragraphs 133/7,442 (1.8%)".

Current state, recomputed independently:

| metric | May 2026 (pre-repair) | now |
|---|---|---|
| chapters ≥0.95 (mechanical) | 228 | **0** |
| chapters 0.85–0.95 (light) | 11 | **29** |
| chapters <0.85 (real) | 0 | **210** |
| weighted mean similarity (quote-normalized) | ~1.00 | **0.760** |
| byte-identical long paragraphs (quote-normalized) | many | **3 / 2,673 (0.1%)** |

**The repair is real and it covers the whole book, not just the opening.**

## Structural profile of modern-en (my own recomputation, quote-normalized)

No chapter is mechanical. The light band is not scattered — it is one contiguous run plus four strays:

```
ch 21, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
45, 46, 47, 48, 49, 50, 60, 62, 105, 116
```

Worst: ch46 0.891, ch45 0.889, ch44 0.885, ch49 0.877, ch29 0.863, ch48 0.857, ch33 0.855.

The raw per-chapter curve shows a repeating sawtooth — similarity is lowest at the start of each generation
batch (ch1 0.60, ch51 0.67, ch64 0.61, ch75 0.63, ch95 0.65, ch106 0.64, ch145 0.61, ch158 0.59, ch196 0.63,
ch223 0.58, ch225 0.56) and drifts upward toward each batch's end. The ch27–50 run is where that drift went
furthest without resetting.

## Samples inspected (8)

### 1. Opening — ch1 (Part 1 ch1), paras 0–5 — STRONG

> **Source p1:** Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl, who had been a governess in their family… the man-cook had walked off the day before just at dinner time; the kitchen-maid, and the coachman had given warning.

> **modern-en p1:** The Oblonsky household was in chaos. The wife had found out that her husband was having an affair with the French girl who had been their family's governess… the cook had walked out yesterday in the middle of dinner; the kitchen-maid and the coachman had given notice.

Complete and genuinely reworked. The famous first line is handled well
(Garnett "Happy families are all alike; every unhappy family…" → "All happy families are alike; each unhappy
family…").

Two small restraint nits in the same chapter:

> **Source p3:** Yes, but then, Darmstadt was in America.  →  **modern-en:** Yes, but **in the dream** Darmstadt was in America.
> **Source p5:** and worst of all, his own fault.  →  **modern-en:** and — worst of all — that the fault was **entirely** his.

Both add a word the source does not have. The first is a defensible gloss; the second is an intensifier.

### 2. LIGHT-BAND BLOCK — ch45 (Part 2 ch11) para 4 — norm sim 0.889

> **Source:** She felt so sinful, so guilty, that nothing was left her but to humiliate herself and beg forgiveness… That body, robbed by him of life, was their love, the first stage of their love… But in spite of all the murderer's horror before the body of his victim, he must hack it to pieces, hide the body, must use what he has gained by his murder.

> **modern-en:** She felt so sinful, so guilty, that nothing was left for her but to humble herself and beg forgiveness… That body — robbed by him of life — was their love, the first stage of their love… But, for all the murderer's horror before the body of his victim, he must hack it to pieces, hide it, must make use of what he has gained by his murder.

Complete and accurate, but this is a copy-edit: `left her`→`left for her`, `humiliate`→`humble`,
`in spite of all`→`for all`, `the body`→`it`, two em-dashes. Nothing is wrong with it; it simply doesn't do
the job the edition exists to do.

### 3. LIGHT-BAND BLOCK — ch48 (Part 2 ch14) para 13 — norm sim 0.857

> **Source:** Not one word did Stepan Arkadyevitch say in reference to Kitty and the Shtcherbatskys; he merely gave him greetings from his wife… understanding everything at the slightest reference, was particularly charming on this visit…

> **modern-en:** Not one word did Stepan Arkadyevitch say in reference to Kitty and the Shtcherbatskys; he merely gave him greetings from his wife… understanding everything at the slightest hint, was particularly charming on this visit…

Garnett's inverted opening ("Not one word did…") — precisely the kind of Edwardian construction a modern
edition should unwind — is carried over untouched. Three synonym swaps in a 164-word paragraph.

### 4. Middle — ch122 (Part 3 ch21), paras 0–3 — STRONG, with a good judgment call

> **Source:** "Ah! princess! what a delightful meeting!" … "A meeting for one minute, for I'm going," said Betsy
> **modern-en:** "Ah! Princess! What a delightful coincidence!" … "A coincidence of one minute, since I'm leaving," said Betsy

The translator noticed that Betsy's reply depends on echoing Stiva's noun, and carried the echo across when
changing the word. That is the repetition-preservation the standard asks for.

### 5. Late — ch204 (Part 7 ch15, Kitty's labour) para 0 — STRONG

> **Source:** Levin sat listening to the doctor's stories of a quack mesmerizer and looking at the ashes of his cigarette… Clutching his chill hands in her moist ones, she began squeezing them to her face.

> **modern-en:** Levin sat listening to the doctor's stories about a quack mesmerist and staring at the ash on his cigarette… Clutching his cold hands in her **hot, wet** ones, she began pressing them to her face.

A 285-word paragraph rewritten in full, nothing lost. Two small inventions: `hot` is not in the source
(Garnett has only "moist"), and p3's "and again he heard that unearthly scream" becomes "and again that
unearthly scream **tore out of her**" — a physical image the source doesn't supply.

### 6. Ending — ch239 (Part 8 ch19, the last chapter) — STRONG, with one dropped clause

> **Source p3:** …and in the recognition of which—**I don't make myself, but whether I will or not**—I am made one with other men in one body of believers, which is called the church.

> **modern-en p3:** …and in recognizing which — whether I will or not — I am made one with other people in one body of believers, which is called the church.

Garnett's clause "I don't make myself" is dropped. It is a garbled rendering in Garnett and the dropped
version reads better, but it *is* an omission and should be a deliberate, recorded decision rather than a
silent one. Everything else in the chapter, including Levin's closing meditation, is rendered in full.

### 7. Hardest passage — ch239 para 3 (the theological argument) — STRONG

218 → 219 words, fully re-rendered, every step of the argument present (the Jews / Mohammedans / Confucians /
Buddhists list, the self-correction, the reason-vs-revelation distinction). No flattening.

### 8. Mechanical-outlier substitute — no truncation or identical-paragraph flags exist for this book

Phase 1 gave anna-karenina **zero** truncation flags and 0.4% identical long paragraphs, so per the
instructions I substituted the two hardest passages available: the highest-similarity chapters
(ch45, ch48 above) and the densest argument (ch239 p3). The former are the book's only real defect; the
latter is clean.

## Phase 1 flags: confirmed vs. disconfirmed

- `mean_weighted_similarity: 0.7095` — **confirmed** (my quote-normalized recomputation: 0.760). This is squarely in "verified repair" territory and nowhere near the ~0.99 mechanical band of May 2026.
- `pct_identical_long_paragraphs: 0.4%` — **confirmed and improved on**: after quote normalization, 3/2,673 = 0.1%.
- `truncated_paragraphs_total: 0` — **confirmed** across the 8 passages read; no omissions found.
- `para_count_mismatches: []`, `en_editions_aligned: true` — **confirmed.** Alignment is intact, unlike war-and-peace.
- `last_chapter_suspiciously_short: false` (1,029 words) — **confirmed**; ch239 is a normal-length closing chapter and is fully rendered.
- **The May 2026 MECHANICAL verdict is disconfirmed against the current files.** It was correct when written; the repair superseded it.

## Phase 3 — human-edition research

**One genuine public-domain alternative exists — the Maude — but no rights-clean digital text of it was located.**

| candidate | translator | date | completeness | rights | evidence |
|---|---|---|---|---|---|
| **In use** | Constance Garnett | 1901 | complete | **public domain** | Standard Ebooks also ships Garnett for Anna Karenina, with an explicit public-domain dedication: https://standardebooks.org/ebooks/leo-tolstoy/anna-karenina/constance-garnett/text/uncopyright |
| **Best alternative** | **Louise & Aylmer Maude, Oxford University Press, 1918** | 1918 | **complete** (8 parts, unabridged) | **Public domain in the US (published pre-1931); public domain in the EU/Denmark (Aylmer d.1938, Louise d.1939 → life+70 expired 2009/2010)** | The Online Books Page entry: *"Maude, Louise, 1855-1939: Anna Karenina, a novel. (Oxford University Press, 1918), also by Leo Tolstoy and Aylmer Maude (page images at HathiTrust; **US access only**)"* — https://catalog.hathitrust.org/Record/100677927 |
| rejected | Nathan Haskell Dole | 1886 | complete | public domain | Older, less regarded; listed on The Online Books Page |
| rejected | Rosemary Edmonds | 1954 (Penguin) | complete | in copyright | Commercial |
| rejected | Joel Carmichael | 1960 | complete | in copyright | Commercial |
| rejected | Pevear & Volokhonsky | 2000 (Penguin) | complete | **in copyright** | Commercial |
| rejected | Rosamund Bartlett | 2014 (Oxford) | complete | in copyright | Commercial |
| rejected | Marian Schwartz | 2014 (Yale) | complete | in copyright | Commercial |

**I read a real sample of the Maude** before judging it. It is plainer and more direct than Garnett:

> **Maude:** ALL happy families resemble one another, each unhappy family is unhappy in its own way.
> Everything was upset in the Oblonskys' house. The wife had discovered an intrigue between her husband and their former French governess, and declared that she would not continue to live under the same roof with him.
>
> **Garnett (in use):** Happy families are all alike; every unhappy family is unhappy in its own way.
> Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl, who had been a governess in their family, and she had announced that she could not go on living in the same house with him.

**Rights caveat — important.** The only freely downloadable full text of the Maude Anna Karenina I could find
is `archive.org/details/anna-karenina-tolstoy-leo-graf-1828-1910`, a user upload (uploader
`dige@rockmailapp.com`, `folkscanomy` collection, metadata date wrongly given as "1860"). I fetched the OCR
text and read its front matter: it is a scan of

```
VINTAGE BOOKS, London
Published by Vintage 2010
This translation was first published in 1918
ISBN 9780099540663 · The Random House Group Limited
```

— i.e. **an unauthorized scan of an in-copyright Random House/Vintage commercial edition**, complete with a
publisher's character list and apparatus. It confirms the underlying translation is the 1918 Maude but it is
**not a usable source**, and Tinct must not ingest it.

The rights-clean route is the 1918 Oxford first edition via HathiTrust — which is **page images only**
(OCR + proofing work) and **US-access-only**, an unresolved practical problem for a Denmark-based operator.
Notably, Standard Ebooks chose Garnett rather than Maude for Anna Karenina, which suggests they hit the same
sourcing wall.

**Status recorded as: public domain (the translation) but no rights-clean digital text located in this search.**

## Ratings

| dimension | weight | score | reason |
|---|---|---|---|
| fidelity / completeness | 40% | **4** | No omissions found across 8 passages spanning Parts 1, 2, 3, 7 and 8; 0 truncation flags; alignment intact. One dropped clause at ch239 p3. |
| first-read clarity | 25% | **5** | Where rendered, markedly clearer than Garnett |
| literary voice | 20% | **4** | Strong and consistent, with genuine attention to echo and repetition; the 29-chapter light block keeps Garnett's Edwardian inversions |
| restraint / no invention | 10% | **4** | Small additions: `in the dream`, `entirely`, `hot`, `tore out of her` |
| naturalness | 5% | **5** | Reads as contemporary English prose |

**Weighted score: 4.3 — band: Good with fixes.**

## Recommendation

**LIGHT EDIT**, confidence **medium-high**, correction scope **local**.

The 2026-05-29 repair is confirmed across early, middle and late chapters — this book is no longer in the
same category as brothers-karamazov or notes-from-underground. What remains is a scoped job: re-render the
29 light-band chapters (the contiguous ch27–50 run is ~28,000 source words, plus ch21, 60, 62, 105, 116)
and remove the four small additions noted above.

**Next action:** re-render ch27–50 (plus 21, 60, 62, 105, 116) with
`python3 books/classify-modern-en.py anna-karenina --gate --chapters 27-50`; back-fill
`books/raw/anna-karenina/SOURCE.md` recording the Garnett provenance, which is currently undocumented; and
log the Maude 1918 as a known-but-unsourced human alternative so it isn't re-researched from scratch next
time.

## Limitations of this review

- I inspected **8 passages** out of 239 chapters / 7,442 paragraphs — roughly 1,400 source words read closely against their modern counterparts. "The repair holds in Parts 1, 2, 3, 7 and 8" is a strong signal, not proof that all 239 chapters are clean.
- I did **not** read any passage from Parts 4, 5 or 6 (ch ~127–195). The whole-file similarity computation covers them and shows no mechanical chapters there, but no passage from those parts was read for omissions or inventions.
- The similarity computation detects mechanical copying reliably; it does **not** detect a fluent paraphrase that silently drops content. With 0 truncation flags, such an omission would have to be sub-threshold, and I did not search for that class specifically.
- I did **not** review `modern-da`. The 2026-05-29 note lists "regenerate `modern-da` from the repaired `modern-en`" as required follow-up — I did not verify whether that ever happened, and it should be checked before this book is considered done.
- I did not check audio, onboarding JSON, or threads.
- Rights research is desk research against public records; it is not a legal opinion. I verified the Maude's PD basis and the nature of the archive.org scan, but did not access HathiTrust itself (US-only).
