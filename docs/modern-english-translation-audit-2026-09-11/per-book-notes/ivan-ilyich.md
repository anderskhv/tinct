# ivan-ilyich — The Death of Ivan Ilyich, Leo Tolstoy (1886)

**Audit date:** 2026-09-11 · **Scope:** public (in `BOOKS`) · **Reviewer:** batch agent (Russian-novels batch)

> **Headline finding: the best modern-en in this batch, by a clear margin.** All 12 chapters are genuine
> rewrites, no byte-identical long paragraphs, no truncation, no omissions found. One real defect: the
> protagonist's name is spelled two different ways inside the same edition.

## Edition snapshot (from Phase 1 `mechanical/ivan-ilyich.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-ru | `3e9654b561b5e2c6` | 12 | 374 | 17,758 | Смерть Ивана Ильича (1886) |
| original-en | `2b9d02f6a874058e` | 12 | 298 | 22,285 | Maude, tr. Louise & Aylmer Maude |
| modern-en | `1bb15d1bc0758fea` | 12 | 298 | 22,810 | Modern English |
| modern-da | `7b420f9e7d3d8a47` | 12 | 298 | 23,148 | Moderne Dansk |

Structure: the three aligned editions all match at 12 chapters / 298 paragraphs; `en_editions_aligned: true`.
(`original-ru` has 374 paragraphs and is correctly flagged `aligned: false` in `bookRegistry.ts` — it is a
reference edition, not a split-pane partner.)
Mean weighted similarity **0.639**; identical long paragraphs **0.0%**; 0 truncation flags; 0 empty paragraphs.

## Provenance — answering the assignment's Maude question

**Question: is `ivan-ilyich`'s "original-en" a different Maude translation from War and Peace's, or the same family?**

**Answer: the same translators — Louise and Aylmer Maude — working on the same Oxford Tolstoy programme; a
different work, not a different Maude.**

Evidence: Tinct's `ivan-ilyich-original-en.json` ch1 para 0 is a verbatim match for the Maude text hosted by
the Christian Classics Ethereal Library, which credits "Louise and Aylmer Maude":

> **Tinct `original-en`:** During an interval in the Melvinski trial in the large building of the Law Courts the members and public prosecutor met in Ivan Egorovich Shebek's private room, where the conversation turned on the celebrated Krasovski case. Fedor Vasilievich warmly maintained that it was not subject to their jurisdiction, Ivan Egorovich maintained the contrary, while Peter Ivanovich, not having entered into the discussion at the start, took no part in it but looked through the Gazette which had just been handed in.

> **CCEL (Maude), https://ccel.org/ccel/tolstoy/ivan/ivan.ii.html:** "During an interval in the Melvinski trial in the large building of the Law Courts the members and public prosecutor met in Ivan Egorovich Shebek's private room, where the conversation turned on the celebrated Krasovski case. Fedor Vasilievich warmly maintained that it was not subject to their jurisdiction, Ivan Egorovich maintained the contrary, while Peter Ivanovich, not having entered into the discussion at the start, took no part in it but looked through the _Gazette_ which had just been handed in."

The Online Books Page indexes this under **Maude, Louise, 1855-1939** — the same authority record that
indexes the Maudes' *War and Peace*. Wikisource dates the translation **1923** and states: *"The work is in
the public domain worldwide (original work published before 1931, author died 100+ years ago). The
translation is in the public domain in the United States (published before January 1, 1931)."*
It is also PD in the EU/Denmark on life+70 grounds (Aylmer d. 1938, Louise d. 1939 → expired 2009/2010).

So: **same Maude pair, same public-domain basis, a different book.** War and Peace is their 1922–23 Oxford
version (PG #2600); this is their Ivan Ilych from the same programme. `bookRegistry.ts` leaves `year` null
for this edition — **recommend setting it to 1923** to match Wikisource's dating, and back-filling a
`books/raw/ivan-ilyich/SOURCE.md`, which does not currently exist.

Completeness: 12 chapters, complete and unabridged.

## Structural profile of modern-en (my own recomputation, quote-normalized)

Weighted token similarity after normalizing quotes, apostrophes and dash spacing. Mean **0.658**.

- **0 chapters ≥0.95 (mechanical)** · **0 chapters 0.85–0.95 (light)** · **12 of 12 below 0.85 (genuine rewrite)**
- **Byte-identical long paragraphs (≥40 words) after normalization: 0 / 168**
- Per-chapter range 0.611 (ch1) to 0.728 (ch8) — tight and consistent, with no batch-boundary sawtooth.
- Word retention 1.02 (modern-en is slightly *longer* than the source), which is the expected shape when
  tangled syntax is unpacked rather than compressed.

## Samples inspected (5)

### 1. Opening — ch1, paras 0–3 — STRONG

> **Source p0:** …the members and public prosecutor met in Ivan Egorovich Shebek's private room, where the conversation turned on the celebrated Krasovski case… while Peter Ivanovich, not having entered into the discussion at the start, took no part in it but looked through the Gazette which had just been handed in.

> **modern-en p0:** …the judges and the public prosecutor gathered in Ivan Egorovich Shebek's private room, and the talk drifted to the famous Krasovski case… and Peter Ivanovich, who had stayed out of the dispute from the start, took no part in it at all but leafed through a copy of the Gazette that had just been brought in.

Fully re-rendered, nothing lost. `the members` → `the judges` is a gloss (Maude means members of the court);
accurate and helpful.

**One tone note.** In p3 the death notice reads:

> **Source:** informs relatives and friends of **the demise** of her beloved husband Ivan Ilych Golovin… **which occurred** on February the 4th
> **modern-en:** announces to relatives and friends **the death** of her beloved husband Ivan Ilych Golovin… **who passed away** on the fourth of February

`the demise` → `the death` is right. But `who passed away` imports a euphemism into a story whose entire
subject is the refusal to look at death directly — and which Tolstoy keeps blunt throughout. Minor, but it
cuts against the grain of this particular book.

### 2. ch2 para 0 — the book's thesis sentence — STRONG

> **Source:** Ivan Ilych's life had been most simple and most ordinary and therefore most terrible.
> **modern-en:** Ivan Ilych's life had been the most simple, the most ordinary—and therefore the most appalling.

The famous sentence survives with its rhythm and its sting.

The 131-word paragraph that follows — Maude's single coiled sentence about the father's sinecure — is
unpacked well without losing a clause:

> **Source:** …posts are specially created, which though fictitious carry salaries of from six to ten thousand rubles that are not fictitious, and in receipt of which they live on to a great age.
> **modern-en:** …posts that are therefore invented specially for them, fictitious in everything but the salaries of six to ten thousand rubles, which are not fictitious at all, and on which such men go on living to a ripe old age.

### 3. ch2 para 1 (323 words) — STRONG, with one added gloss

> **Source:** Ivan Ilych was **le phénix de la famille** as people said.
> **modern-en:** Ivan Ilych was, as people said, **le phénix de la famille—the family's shining exception.**

An inline translation is added. This is within the standard ("explain essential unfamiliar terms briefly at
the point of need"), but it should be a documented convention — note that the French in `war-and-peace` is
handled with a completely different device (`[Speaking in French]` markers). The two books disagree.

Everything else in this 323-word paragraph is present: the three sons, Baron Greff, the School of Law, the
fly-to-the-light simile, "what he took to be his duty was whatever those in authority took to be his duty".

### 4. Hardest passage — ch6 para 1, the Caius syllogism — STRONG

> **Source:** The syllogism he had learnt from Kiesewetter's Logic: "Caius is a man, men are mortal, therefore Caius is mortal," had always seemed to him correct as applied to Caius, but certainly not as applied to himself… What did Caius know of the smell of that striped leather ball Vanya had been so fond of? Had Caius kissed his mother's hand like that, and did the silk of her dress rustle so for Caius? Had he rioted like that at school when the pastry was bad? Had Caius been in love like that? Could Caius preside at a session as he did?

> **modern-en:** There was a syllogism he had picked up from Kiesewetter's Logic: "Caius is a man, all men are mortal, therefore Caius is mortal." It had always struck him as sound when it was about Caius, but never, ever as something that applied to him… What could Caius possibly know about the smell of that striped leather ball Vanya had loved so much? Had Caius ever kissed his mother's hand the way he had, and had the silk of her dress rustled like that for Caius? Had he made an uproar over bad pastry at school the way Vanya had? Had Caius ever been in love like that? Could Caius have presided over a court session the way he could?

This is the passage most at risk of being flattened into explanation, and it is not. Every item in the
catalogue survives; the anaphoric drumbeat of "Had Caius…" is preserved rather than smoothed away; the
Kiesewetter attribution is kept. 210 → 240 words — expansion, not compression.

### 5. MECHANICAL-OUTLIER SUBSTITUTE — highest-similarity chapter, ch8 (norm sim 0.728)

Phase 1 gave this book **zero** truncation flags, zero identical paragraphs and no short-final-chapter flag,
so per the instructions I substituted the hardest available target: the single highest-similarity chapter.
At 0.728 it is still far below the 0.85 light threshold, with 34 long paragraphs and **none** identical.
There is no mechanical outlier in this book to find.

### 6. NAME INCONSISTENCY — whole-file scan (not a passage finding) — CONFIRMED DEFECT

`original-en` spells the protagonist **Ivan Ilych** (180 occurrences; 1 stray `Ilyich`).
`modern-en` spells him **both ways, split cleanly by chapter**:

| ch | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `Ilych` | 24 | 31 | 26 | 30 | 9 | 0 | 0 | 0 | 2 | 5 | 4 | 1 |
| `Ilyich` | 0 | 0 | 0 | 0 | 0 | **5** | **23** | **24** | 0 | 0 | 0 | 0 |

Chapters 6, 7 and 8 use `Ivan Ilyich`; every other chapter uses `Ivan Ilych`. 52 occurrences in total. This
is a generation-batch artifact and it is visible to any reader who gets that far — which is most of them,
since ch6–8 are the illness chapters. Other names (`Gerasim` 44/44, `Praskovya` 39/40) are consistent.

Note the book's registry title and `bookRegistry.ts` id use *Ilyich*, while both English editions
predominantly use *Ilych* — worth a deliberate decision about which spelling the product standardizes on.

## Phase 1 flags: confirmed vs. disconfirmed

- `mean_weighted_similarity: 0.639` — **confirmed** (my quote-normalized recomputation: 0.658). Solid real-rewrite band.
- `pct_identical_long_paragraphs: 0.0%` — **confirmed**; 0 of 168 long paragraphs identical even after quote normalization.
- `truncated_paragraphs_total: 0` — **confirmed**; no omissions in any sampled passage, and word retention is 1.02 (expansion, not compression).
- `empty_paragraphs_total: 0`, `para_count_mismatches: []`, `en_editions_aligned: true` — **all confirmed**.
- `last_chapter_suspiciously_short: false` (844 words) — **confirmed**; ch12 is genuinely the shortest chapter in the novella and is fully rendered.
- **New defect not visible to Phase 1:** the `Ilych`/`Ilyich` split. Similarity metrics cannot see it because both spellings are equally "different from the source" at the token level.

## Phase 3 — human-edition research

**Conclusion: the Maude already in use is the best public-domain English text; no upgrade path exists.**

| candidate | translator | date | completeness | rights | evidence |
|---|---|---|---|---|---|
| **In use** | Louise & Aylmer Maude | 1923 | complete | **Public domain in the US (published pre-1931); public domain in the EU/Denmark (Aylmer d.1938, Louise d.1939 → life+70 expired 2009/2010)** | https://en.wikisource.org/wiki/The_Death_of_Ivan_Ilych — *"The translation is in the public domain in the United States (published before January 1, 1931)"*; full text also at CCEL https://ccel.org/ccel/tolstoy/ivan/ivan.i.html, credited "Louise and Aylmer Maude", indexed on The Online Books Page under Maude, Louise, 1855-1939 |
| rejected | Constance Garnett | — | complete | public domain | Garnett's Tolstoy short fiction exists but Maude is the Tolstoy-approved standard and is already in place |
| rejected | Rosemary Edmonds | 1960 (Penguin) | complete | in copyright | Commercial |
| rejected | Lynn Solotaroff | 1981 (Bantam) | complete | in copyright | Commercial |
| rejected | Pevear & Volokhonsky | 2009 (Vintage) | complete | **in copyright** | Commercial; P&V on live copyright |
| rejected | Peter Carson | 2013 (Penguin/Liveright) | complete | in copyright | Commercial |

Standard Ebooks corroborates: its Tolstoy shelf uses the Maudes for *War and Peace*, *Resurrection*,
*Hadji Murád*, *What Is Art?*, *A Confession* and *The Power of Darkness*. Maude is the settled
public-domain standard for Tolstoy in English.

Additionally, this book is the only one in the batch that carries an `original-ru` edition, which gives
readers and the chat model a genuine source-language reference. That is a real asset and worth noting as a
model for the other Russian books, none of which have one.

## Ratings

| dimension | weight | score | reason |
|---|---|---|---|
| fidelity / completeness | 40% | **5** | No omissions or inventions found across 5 passages including the two hardest in the book; 0 truncation flags; word retention 1.02; alignment intact |
| first-read clarity | 25% | **5** | Consistently clearer than Maude; the 131-word sinecure sentence and the Caius syllogism are both genuinely easier without losing a clause |
| literary voice | 20% | **4** | The thesis sentence, the Caius anaphora and the narrator's irony all survive. Deduction for the `passed away` euphemism in a book about refusing euphemism |
| restraint / no invention | 10% | **4** | One added inline gloss (`the family's shining exception`) and one glossed term (`members`→`judges`); both defensible, neither documented as a convention |
| naturalness | 5% | **5** | Reads as contemporary English throughout |

**Weighted score: 4.7 — band: Strong.**

## Recommendation

**LIGHT EDIT**, confidence **high**, correction scope **local**.

The edition meets the standard. It does not get an unqualified KEEP only because of the confirmed name
inconsistency, which is a listed defect class and is trivially fixable.

**Next action:** normalize the protagonist's name to a single spelling across `modern-en` (52 `Ilyich`
occurrences in ch6–8, or the reverse if *Ilyich* is chosen as the product standard — decide once, apply to
`original-en`'s single stray too, and note the decision alongside the registry title); revisit
`who passed away` → a plainer verb in ch1 p3; record the French-gloss convention so `ivan-ilyich` and
`war-and-peace` stop disagreeing; set `year: 1923` on the `original-en` registry entry and back-fill
`books/raw/ivan-ilyich/SOURCE.md`. If the name fix changes `modern-en` text, re-run the Danish byte-identity
audit and regenerate the affected audio segments for ch6–8.

## Limitations of this review

- I inspected **5 passages** out of 12 chapters / 298 paragraphs — but that is a much higher proportion of a 22,000-word novella than the same number would be for a long novel, and it includes the opening, the thesis chapter, the hardest philosophical passage, and the highest-similarity chapter. Coverage here is genuinely good.
- I did **not** closely read chapters 3, 4, 5, 9, 10, 11 or the ending (ch12). The whole-file computation covers them and shows no mechanical or truncation signal, but no passage from them was read for omissions.
- I did **not** compare `original-en` against `original-ru`. The Maude's fidelity to Tolstoy's Russian is assumed on reputation, not verified here — and the two files are deliberately unaligned (374 vs 298 paragraphs), so paragraph-level comparison would need separate alignment work.
- I did **not** review `modern-da`, audio, onboarding or threads. Note `bookRegistry.ts` marks this book's editions with no `hasAudio` flags and the registry comment says "Audio (Kokoro EN) + Codex deploy verification still pending" — worth confirming separately.
- Rights research is desk research against public records; it is not a legal opinion.
