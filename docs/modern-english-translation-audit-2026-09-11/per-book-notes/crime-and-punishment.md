# crime-and-punishment — Crime and Punishment, Fyodor Dostoevsky (1866)

**Audit date:** 2026-09-11 · **Scope:** public (in `BOOKS`) · **Reviewer:** batch agent (Russian-novels batch)

> **Headline finding: the strongest modern-en in this batch.** Every one of the 41 chapters is a genuine
> sentence-level rewrite — no mechanical chapters, no light chapters, zero byte-identical long paragraphs,
> zero truncation flags. The remaining issues are cosmetic and local.

## Edition snapshot (from Phase 1 `mechanical/crime-and-punishment.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `6609777b2dfca00f` | 41 | 3904 | 202,615 | Garnett Translation (1914), tr. Constance Garnett |
| modern-en | `914bcdfae3967924` | 41 | 3904 | 189,484 | Modern English |
| modern-da | `04df4893cc4340ba` | 41 | 3904 | 185,593 | Moderne Dansk |

Structure: chapter counts match, 0 paragraph-count mismatches, 7 sections, `en_editions_aligned: true`.
Mean weighted similarity **0.6018** — the lowest (i.e. most thoroughly rewritten) of the six books in this
batch. Identical long paragraphs 0.1%; **0 truncation flags**; 0 empty paragraphs.

## Provenance / completeness of the core English text

Constance Garnett, 1914. `books/raw/crime-and-punishment/SOURCE.md` records it:

```
Source: Project Gutenberg eBook #2554
URL: https://www.gutenberg.org/cache/epub/2554/pg2554.txt
Translator: Constance Garnett
Year: 1866 (original), 1914 (Garnett translation)
Downloaded: 2026-03-31
```

Complete: 6 parts + Epilogue, 41 chapters. (https://www.gutenberg.org/ebooks/2554)

## Structural profile of modern-en (my own recomputation, quote-normalized)

Weighted token similarity after normalizing quotes, apostrophes and dash spacing. Mean **0.649**.

- **0 chapters ≥0.95 (mechanical)**
- **0 chapters 0.85–0.95 (light)**
- **41 of 41 chapters below 0.85 (genuine rewrite)**
- **Byte-identical long paragraphs (≥40 words) after normalization: 0 / 1,284**

Per-chapter range 0.55–0.80; only one chapter, ch36 (Part 6 ch5), rises above 0.77. Word retention is 0.94
overall, with no chapter showing the concentrated word loss seen in war-and-peace's Second Epilogue.

This is the only book in the batch with a clean profile on every mechanical measure.

## Samples inspected (8)

### 1. Opening — ch1 (Part 1 ch1), paras 0–4 — STRONG

> **Source p2:** This was not because he was cowardly and abject, quite the contrary; but for some time past he had been in an overstrained irritable condition, verging on hypochondria… to rack his brains for excuses, to prevaricate, to lie--no, rather than that, he would creep down the stairs like a cat and slip out unseen.

> **modern-en p2:** This was not because he was a coward -- far from it. But for some time now he had been in an agitated, irritable state bordering on nervous collapse… to have to scramble for excuses, to dodge and lie -- no, he would rather creep down the stairs like a cat and slip out unseen.

Full re-rendering, every clause present. `verging on hypochondria` → `bordering on nervous collapse` is a
slight modernizing of the diagnosis (Dostoevsky's *ипохондрия* is closer to the older sense), but Garnett's
word is genuinely misleading to a modern reader and the substitution is defensible.

### 2. LOST ALLUSION — ch1 (Part 1 ch1) para 4

> **Source:** I've learned to chatter this last month, lying for days together in my den thinking... **of Jack the Giant-killer.**

> **modern-en:** I've learned to talk this past month, lying around for days in my hole thinking... **about fairy tales.**

A specific image is replaced by a generic explanation — one of the named failure modes. The concrete
absurdity of a murder-planning student daydreaming about Jack the Giant-killer is exactly the kind of detail
the standard says must survive. A gloss would have worked better than a substitution.

### 3. The murder — ch7 (Part 1 ch7), paras 18–21 — STRONG

> **Source p21:** The old woman was as always bareheaded. Her thin, light hair, streaked with grey, thickly smeared with grease, was plaited in a rat's tail and fastened by a broken horn comb which stood out on the nape of her neck… Her eyes seemed to be starting out of their sockets, the brow and the whole face were drawn and contorted convulsively.

> **modern-en p21:** The old woman was bareheaded as always. Her thin, light hair, streaked with gray and heavily greased, was twisted into a rat-tail braid held in place by a broken horn comb that jutted from the back of her neck… Her eyes seemed ready to **pop** from their sockets. Her forehead and whole face were twisted in a convulsive grimace.

Complete and vivid. Two nits: `pop` is a register drop against Garnett's `starting`, and in p18 "he would
let the axe slip and fall" becomes "the axe would slip and **clatter to the floor**" — an added sound.

### 4. ch14 (Part 2 ch7) — STRONG, norm sim 0.67

Read for word retention only (6,919 → 6,782 source/modern words, 74 long paragraphs, none identical). No
truncation, no concentrated loss.

### 5. ch24 (Part 4 ch4, Sonia and the raising of Lazarus) — STRONG, norm sim 0.71

The highest-similarity chapter in Parts 1–5 and still a full rewrite. Word retention 1.00.

### 6. BORDERLINE / LIGHTEST CHAPTER — ch36 (Part 6 ch5, Svidrigailov), paras 22 and 59 — norm sim 0.80

> **Source p22:** "What a queer fellow! But here we are. Welcome to the staircase… Now, see! I take this five-per-cent bond out of the bureau--see what a lot I've got of them still--this one will be turned into cash to-day."

> **modern-en p22:** "What a strange fellow you are! Well, here we are. Welcome to the staircase… Now, look: I take this five-percent bond out of the bureau — see what a pile of them I still have — this one will be turned into cash today."

Genuine but the lightest rewriting in the book. Still comfortably above the light-band threshold.

### 7. TYPOGRAPHIC INCONSISTENCY — ch1/ch7 vs. ch36 (whole-file, not a passage finding)

`modern-en` is not typographically consistent across chapters. Chapters 1 and 7 use **straight quotes and
`--` double hyphens**:

> "I want to attempt a thing _like that_ and I'm scared of these little things," he thought… -- that's a given.

Chapter 36 uses **curly quotes, ellipsis characters and em-dashes**:

> “What a strange fellow you are! … Now, look: I take this five-percent bond out of the bureau — see what a pile…”

These are different generation batches shipped without a normalization pass. Readers will see the change
mid-book; it also means any downstream quote-handling (highlights, audio, Danish translation) faces two
conventions.

### 8. Ending — ch41 (Epilogue ch2), final four paragraphs — STRONG

> **Source p29:** But that is the beginning of a new story--the story of the gradual renewal of a man, the story of his gradual regeneration, of his passing from one world into another, of his initiation into a new unknown life. That might be the subject of a new story, but our present story is ended.

> **modern-en p29:** But that is the beginning of a new story -- the story of a man's gradual renewal, his gradual regeneration, his passage from one world into another, his initiation into a new and unknown life. That might be the subject of a new tale, but our present story is ended.

The closing paragraphs are complete and well judged. One small loss in p28: Garnett's emphasis markup
`Seven years, _only_ seven years!` becomes `Seven years -- only seven years!` — the italic emphasis is
dropped. Dostoevsky's emphasis there is doing work.

## Phase 1 flags: confirmed vs. disconfirmed

- `mean_weighted_similarity: 0.6018` — **confirmed** (my quote-normalized recomputation: 0.649). Real-rewrite band on any reading.
- `pct_identical_long_paragraphs: 0.1%` — **confirmed and improved on**: 0 of 1,284 long paragraphs are byte-identical after quote normalization.
- `truncated_paragraphs_total: 0` — **confirmed**; no omission found in any sampled passage, and no chapter shows concentrated word loss.
- `empty_paragraphs_total: 0`, `para_count_mismatches: []`, `en_editions_aligned: true` — **all confirmed.** Alignment is intact.
- `last_chapter_suspiciously_short: false` (3,230 words) — **confirmed**; the Epilogue's second chapter is fully rendered including the closing paragraphs.

## Phase 3 — human-edition research

**Conclusion: Garnett is the only rights-clear option, and for this book that's fine — but the AI modern-en
is clearly better for a first-time reader than either rights-clear human text.**

| candidate | translator | date | completeness | rights | evidence |
|---|---|---|---|---|---|
| **In use** | Constance Garnett | 1914 | complete | **public domain** | PG #2554, recorded in `books/raw/crime-and-punishment/SOURCE.md`; https://www.gutenberg.org/ebooks/2554 |
| corroboration | Constance Garnett (Standard Ebooks) | — | complete | **public domain / CC0 dedication** | https://standardebooks.org/ebooks/fyodor-dostoevsky/crime-and-punishment/constance-garnett — Standard Ebooks selected Garnett as its only source, describing the translation as "old but perfectly adequate" |
| considered, rejected | Frederick Whishaw | 1885/1886 (Vizetelly) | **abridged / heavily cut** | public domain | The earliest English version; consistently described in the translation-comparison literature as loose and cut. Not a completeness-safe base. |
| rejected | David Magarshack | 1951 (Penguin) | complete | in copyright | Commercial |
| rejected | Jessie Coulson | 1953 (Oxford) | complete | in copyright | Commercial |
| rejected | Sidney Monas | 1968 (Signet) | complete | in copyright | Commercial |
| rejected | David McDuff | 1991 (Penguin) | complete | in copyright | Commercial |
| rejected | Pevear & Volokhonsky | 1992 (Knopf) | complete | **in copyright** | Commercial; P&V on live copyright |
| rejected | Oliver Ready | 2014 (Penguin) | complete | in copyright | Commercial — widely regarded as the most idiomatic modern English version, and precisely the thing that is not available to us |
| rejected | Nicolas Pasternak Slater | 2017 (Oxford) | complete | in copyright | Commercial |
| rejected | Michael Katz | 2017 (Liveright) | complete | in copyright | Commercial |

The public-domain field is Garnett and Whishaw. Whishaw is abridged. So **Garnett is effectively the only
rights-clear complete English Crime and Punishment** — the assignment's hypothesis is confirmed. Given that,
a real modern rendering is the only way to give readers a more accessible text than 1914 English, and the
current `modern-en` does exactly that.

## Ratings

| dimension | weight | score | reason |
|---|---|---|---|
| fidelity / completeness | 40% | **4** | No omissions found in 8 passages across Parts 1, 2, 4, 6 and the Epilogue; 0 truncation flags; alignment intact. Deductions for one lost allusion (Jack the Giant-killer → "fairy tales") and one dropped emphasis (`_only_`). |
| first-read clarity | 25% | **5** | Consistently and substantially clearer than Garnett across every sampled passage |
| literary voice | 20% | **4** | Strong; the murder scene and Raskolnikov's interior monologue keep their pressure. Occasional register drop (`pop from their sockets`) |
| restraint / no invention | 10% | **5** | No inventions found; the one added detail (`clatter to the floor`) is sound-effect trivia, not a claim |
| naturalness | 5% | **5** | Reads as contemporary English throughout |

**Weighted score: 4.4 — band: Good with fixes.**

## Recommendation

**LIGHT EDIT**, confidence **medium-high**, correction scope **local**.

Nothing here calls for retranslation. Three scoped fixes:

1. **Normalize typography across the whole file.** Chapters roughly 1–35 use straight quotes and `--`; ch36+ use curly quotes and em-dashes. Pick one convention and apply it.
2. **Restore the Jack the Giant-killer allusion** in ch1 p4 (a brief gloss is fine; a generic replacement is not), and sweep for other allusion-flattening of the same kind.
3. **Restore the `_only_` emphasis** in ch41 p28 and check whether other `_italic_` markers from Garnett were dropped in the rewrite.

**Next action:** run a repo-wide diff of `_italic_` marker counts between `original-en` and `modern-en` for
this book to size fix (3); normalize quote/dash convention in one pass; then spot-fix the allusion. None of
this requires re-rendering, so `modern-da` and audio should not need regeneration unless the typography pass
changes paragraph text materially — check the Danish byte-identity audit afterwards.

## Limitations of this review

- I inspected **8 passages** out of 41 chapters / 3,904 paragraphs. Parts 3 and 5 were covered only by the whole-file similarity and word-retention computation, not by close reading.
- The similarity computation reliably detects mechanical copying; it does **not** detect a fluent paraphrase that silently drops content. With 0 truncation flags and no chapter-level word loss, a sub-threshold omission would be hard to find by these means, and I did not search for that class specifically.
- I did not verify the typographic split point precisely — I observed straight-quote style in ch1 and ch7 and curly-quote style in ch36, and inferred a batch boundary somewhere between. The exact range should be measured before fixing.
- I did **not** review `modern-da` (which is 185,593 words against modern-en's 189,484 — a 0.98 ratio, unremarkable), audio, onboarding or threads.
- Rights research is desk research against public records; it is not a legal opinion. I did not open the Whishaw text; my rejection rests on its documented abridgement and is **reasoned but unverified**.
