# brothers-karamazov — The Brothers Karamazov, Fyodor Dostoevsky (1880)

**Audit date:** 2026-09-11 · **Scope:** public (in `BOOKS`) · **Reviewer:** batch agent (Russian-novels batch)

> **Headline finding: this is a half-mechanical edition.** 48 of 96 chapters are Garnett's text with
> typographic normalization and a handful of synonym swaps. 434 of 2,182 long paragraphs (19.9%) are
> byte-identical to `original-en` once curly quotes are normalized. The Phase 1 mean similarity of 0.897
> is not a false alarm.

## Edition snapshot (from Phase 1 `mechanical/brothers-karamazov.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `b8ada3e43c6f997a` | 96 | 5836 | 349,373 | Garnett (1912), tr. Constance Garnett |
| modern-en | `5b2d957d5fdca2f1` | 96 | 5836 | 349,146 | Modern English |
| modern-da | `9dc6d62c74ef9097` | 96 | 5836 | 349,484 | Moderne Dansk |

Structure: chapter counts match, 0 paragraph-count mismatches, 13 sections, `en_editions_aligned: true`.
Mean weighted similarity **0.8971**; identical long paragraphs **8.1%**; 0 truncation flags; 0 empty paragraphs.

**The word-count ratio is 1.00** (349,146 / 349,373). The May 2026 audit called this out explicitly:
"Word-count ratio is 1.00 across the board — the strongest single signal that most 'modern' output is the
original text with cosmetic tweaks."

## Provenance / completeness of the core English text

Constance Garnett, 1912. Source confirmed in-repo: `books/raw/brothers-karamazov/raw.txt` carries the
Project Gutenberg header —

```
Title: The Brothers Karamazov
Author: Fyodor Dostoyevsky
Translator: Constance Garnett
Release date: February 12, 2009 [eBook #28054]
```

Complete, unabridged: 13 books + Epilogue, 96 chapters. (https://www.gutenberg.org/ebooks/28054)

## Structural profile of modern-en (my own recomputation, quote-normalized)

I recomputed per-chapter weighted token similarity after normalizing curly→straight quotes and apostrophes,
dash spacing, and `every one`→`everyone`, so that pure typographic changes do not count as modernization.

- Mean weighted similarity: **0.932**
- **48 chapters at ≥0.95 (mechanical):** 7–32, 41, 42, 45–51, 83–91, 93–96
- **38 chapters at 0.85–0.95 (light):** 3–6, 35–40, 43, 44, 52–60, 62–64, 69, 71–82, 92
- **10 chapters below 0.85 (genuine rewrite):** 1, 2, 33, 34, 61, 65, 66, 67, 68, 70
- **Byte-identical long paragraphs (≥40 words) after normalization: 434 / 2,182 = 19.9%**

The mechanical run covers Book 2 (ch 7–13), Book 3 (ch 14–24), Book 4 (ch 25–31), Book 6 (ch 41 — Zossima),
Book 7 (ch 42, 45 — Cana of Galilee), Book 8 (ch 46–51), and almost the whole of Book 12 and the Epilogue
(ch 83–96). Most of the book's best-known set pieces fall inside it.

## Samples inspected (10)

### 1. Opening — ch1 (Book 1, "I. Fyodor Pavlovitch Karamazov"), paras 0–3 — STRONG

> **Source p2:** Immediately after the elopement Adelaïda Ivanovna discerned in a flash that she had no feeling for her husband but contempt. The marriage accordingly showed itself in its true colors with extraordinary rapidity.

> **modern-en p2:** Right after the elopement Adelaïda Ivanovna realized in a flash that she felt nothing for her husband but contempt. So the marriage showed its true colors with extraordinary speed.

This is what the edition should look like everywhere: a real sentence-by-sentence rendering that keeps every
claim. One restraint nit — `a peculiar national form of it` → `a peculiarly Russian brand of it` supplies
"Russian", which Garnett leaves implicit.

### 2. MECHANICAL — ch15 (Book 3, "II. Lizaveta") — weighted sim 0.978

Word-level diff of para 0 (690 words) produced **13 change-ops, of which 10 are curly-quote or apostrophe
substitutions**. The only lexical changes in 690 words:

```
barefooted, → barefoot,
as          → since
every one   → everyone   (×3)
strange     → strangers'
```

Every other word is Garnett verbatim. Whole-chapter change budget for 1,646 words: essentially nil.

### 3. MECHANICAL — ch25 (Book 4, "I. Father Ferapont") — weighted sim 0.956, 5 identical long paragraphs

Para 2 (86 words) is **byte-identical** to `original-en`:

> Alyosha remembered afterwards something of what he said to them. But though he spoke out distinctly and his voice was fairly steady, his speech was somewhat disconnected. He spoke of many things, he seemed anxious before the moment of death to say everything he had not said in his life…

Para 14 (92 words) is **byte-identical**:

> Father Ferapont never went to see the elder. Though he lived in the hermitage they did not worry him to keep its regulations, and this too because he behaved as though he were crazy. He was seventy-five or more…

Para 3 (456 words — Zossima's "Love one another, Fathers" exhortation) has **5 change-ops, all of them
curly-quote substitutions**. Not one word is modernized.

### 4. MECHANICAL — ch41 (Book 6, "III. Conversations And Exhortations Of Father Zossima") — sim 0.958

Longest paragraph (353 words), 5 change-ops total:

```
it → it,     lightened → lit     for → because     times, → times —     ecstasy, → ecstasy —
```

Zossima's teaching — arguably the moral centre of the novel — is unmodernized.

### 5. MECHANICAL — ch45 (Book 7, "IV. Cana Of Galilee") — sim 0.957

Longest paragraph (235 words), 8 change-ops: `overflowing`→`overflowing,`, `heart`→`heart,`,
`yet`→`still`, two em-dash respacings, `ardently,`→`ardently;`, and one `to him` moved. Nothing else.

### 6. MECHANICAL — ch89 (Book 12, "X. The Speech For The Defense") — sim 0.970, 2 identical paragraphs

Longest paragraph (326 words), 5 change-ops:

```
round, → around,     clew → clue     handkerchief, → handkerchief     pestle → pestle,     (+ one inserted "moment")
```

### 7. MECHANICAL — ch96 (Epilogue, "III. Ilusha's Funeral. The Speech At The Stone") — sim 0.943, 4 identical paragraphs

Alyosha's speech at the stone — the closing pages of the novel. Longest paragraph (556 words), 19 change-ops,
of which 12 are em-dash respacing or punctuation: `afterwards`→`afterward` (×2), `kind-hearted`→`kindhearted`,
`which`→`that`, plus commas and semicolons. No sentence is rewritten.

### 8. BORDERLINE — ch36 (Book 5, "V. The Grand Inquisitor") — sim 0.906

The Grand Inquisitor is the most-edited of the famous chapters, but the edits are still shallow. The
1,793-word central paragraph has 91 change-ops, overwhelmingly `for`→`because` (×5 in the sampled window),
`for ever`→`forever`, em-dash respacing, comma insertion. Real clause-level rewrites appear only a handful
of times (`for himself, his own` → `his own,`; `heretic` → `a heretic,`).

### 9. BORDERLINE — ch78 (Book 11, "IX. The Devil. Ivan's Nightmare") — sim 0.874

683-word paragraph, 43 change-ops. Almost all are contraction (`You are`→`You're`, `I am`→`I'm`,
`there is`→`there's`, `we shall`→`we'll`), spelling (`esthetic`→`aesthetic`), and `for`→`because`. This is
a contraction pass, not a rendering. This chapter still contains 2 byte-identical long paragraphs.

### 10. GENUINE REWRITE — ch34 (Book 5, "III. The Brothers Make Friends") — sim 0.773

One of only ten chapters below 0.85. Real sentence-level rewriting throughout, comparable to ch1.

## Phase 1 flags: confirmed vs. disconfirmed

- `mean_weighted_similarity: 0.8971` — **confirmed, and understated.** After removing typographic noise it is 0.932, i.e. half the book is mechanically unchanged.
- `pct_identical_long_paragraphs: 8.1%` — **confirmed and badly understated.** That figure counts exact byte matches including curly quotes. Normalizing quotes raises it to **19.9% (434/2,182)**.
- `truncated_paragraphs_total: 0` — **confirmed.** There are no omissions. Nothing is missing, because in half the book nothing was changed.
- `empty_paragraphs_total: 0`, `chapter_count_mismatch: false`, `en_editions_aligned: true` — **all confirmed.** Structure is sound.
- `last_chapter_suspiciously_short: false` — **confirmed**; ch96 is 4,178 words.

## Phase 3 — human-edition research

**Conclusion: Garnett is the only rights-clear option. This is a real finding, not a failure to search.**

| candidate | translator | date | completeness | rights | evidence |
|---|---|---|---|---|---|
| **In use** | Constance Garnett | 1912 | complete | **public domain** | PG #28054 header in `books/raw/brothers-karamazov/raw.txt`; https://www.gutenberg.org/ebooks/28054 |
| corroboration | Constance Garnett (Standard Ebooks re-typeset) | — | complete | **public domain / CC0 dedication** | https://standardebooks.org/ebooks/fyodor-dostoevsky/the-brothers-karamazov/constance-garnett — Standard Ebooks lists Garnett as its only Brothers Karamazov source |
| rejected | David Magarshack | 1958 (Penguin) | complete | in copyright | Commercial |
| rejected | Andrew R. MacAndrew | 1970 (Bantam) | complete | in copyright | Commercial |
| rejected | Pevear & Volokhonsky | 1990 (North Point) | complete | **in copyright** | Commercial; P&V are on live copyright |
| rejected | David McDuff | 1993 (Penguin) | complete | in copyright | Commercial |
| rejected | Ignat Avsey | 1994 (Oxford) | complete | in copyright | Commercial |
| unverified | anonymous "1909" scan on archive.org | 1909? | unknown | **unclear** | archive.org item `the-brothers-karamazov-1909`; translator not identified in the metadata; I did not open it. Recorded as **unverified**, not rejected. |

Standard Ebooks holds nine Dostoevsky titles and uses Garnett for six of them (House of the Dead, Demons,
Notes from Underground, The Brothers Karamazov, Crime and Punishment, Short Fiction) — strong corroboration
that no better public-domain Dostoevsky translation exists in English.

**So: there is no human upgrade path.** If readers are to get a more accessible Brothers Karamazov than
Garnett, a real modern rendering is the only route — which is exactly what `modern-en` is supposed to be and
currently is not, for half the book.

## Ratings

| dimension | weight | score | reason |
|---|---|---|---|
| fidelity / completeness | 40% | **5** | Nothing is omitted, nothing is invented, alignment is perfect — because half the text is unaltered Garnett |
| first-read clarity | 25% | **2** | For 48 of 96 chapters the edition removes no reader barrier whatsoever; a reader who switches to "Modern English" gets the same page back |
| literary voice | 20% | **2** | The edition has no consistent voice: it swings between real rewriting (ch1, ch34) and verbatim Garnett (ch15, ch25, ch41, ch45, ch89, ch96) within one book |
| restraint / no invention | 10% | **5** | No inventions found |
| naturalness | 5% | **3** | Natural where rewritten; Edwardian where not |

**Weighted score: 3.6 — band: Mixed.**

Note the weighted score is misleading here and should not be read as "better than Crime and Punishment".
Fidelity scores 5 precisely *because* the edition is largely a copy. The ranking signal that matters is
"48/96 chapters are mechanical."

## Recommendation

**RETRANSLATE**, confidence **high**, correction scope **substantial**.

The defect is the opposite of local: 86 of 96 chapters are at or above the 0.85 light threshold, and 48 are
at or above 0.95. This is a re-run of the failure `books/MODERN-EN-REPAIR-STATUS.md` documented in May 2026
for Don Quixote, Montaigne and Anna Karenina — Anna Karenina was repaired, Brothers Karamazov apparently
never was. It should be added to the same repair queue.

**Next action:** register `brothers-karamazov` on the modern-en repair backlog behind the existing
`classify-modern-en.py --gate` workflow; re-render the 48 mechanical chapters first (they are the whole of
Books 2–4, most of Book 8, and all of Book 12 + Epilogue), then the 38 light chapters; `modern-da` must be
re-translated from the repaired `modern-en` for every chapter touched, and the English audio regenerated.
Until then, the edition picker is telling readers they are getting a modern English text that, for half the
book, does not exist.

## Limitations of this review

- I inspected **10 passages** out of 96 chapters / 5,836 paragraphs. The mechanical-band classification is a whole-file computation and is reliable; the *quality* judgment on the 10 genuinely-rewritten chapters rests on two samples (ch1, ch34).
- I did **not** check the ten sub-0.85 chapters for omissions or inventions. A real rendering can still drop content, and none of those chapters was audited for fidelity.
- I did **not** review `modern-da`. Per the repo's own rule, `modern-da` was generated from `modern-en`; where `modern-en` is unchanged Garnett, `modern-da` was translated from 1912 English rather than from a modern reading edition, and will need redoing alongside it.
- I did not check audio manifests, onboarding JSON, or threads for this book.
- Rights research is desk research against public records; it is not a legal opinion.
