# war-and-peace — War and Peace, Leo Tolstoy (1869)

**Audit date:** 2026-09-11 · **Scope:** public (in `BOOKS`) · **Reviewer:** batch agent (Russian-novels batch)

## Edition snapshot (from Phase 1 `mechanical/war-and-peace.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `6112db117bbc3664` | 365 | 11340 | 561,695 | Maude Translation (1922), tr. Aylmer & Louise Maude |
| modern-en | `d3ecdb9d013f45e5` | 365 | 11340 | 534,552 | Modern English |
| modern-da | `773c92e160681723` | 365 | 11340 | 537,122 | Moderne Dansk |

Structure: chapter counts match, 0 paragraph-count mismatches, `en_editions_aligned: true`.
Mean weighted similarity 0.6958; identical long paragraphs 0.6%; **21 truncation flags**; 0 empty paragraphs.

## Provenance / completeness of the core English text

Confirmed Louise & Aylmer Maude (Oxford, 1922–23) — the in-file spellings `Bolkónski` (180), `Rostóv` (965),
`Kutúzov` (529), `Denísov` (432), `Pétya` (267) are the Maude accent convention as published in
Project Gutenberg #2600 (https://www.gutenberg.org/ebooks/2600 — "Translators: Maude, Aylmer, 1858-1938 and
Maude, Louise, 1855-1939"; public domain in the USA). Complete, unabridged, 15 books + two epilogues.
This is the Tolstoy-approved translation and the strongest public-domain option for the work.

## Structural profile of modern-en (my own recomputation, quote-normalized)

I recomputed per-chapter weighted token similarity after normalizing curly quotes/apostrophes and dash
spacing (so that pure typographic changes do not read as "modernization"). Mean 0.731. No chapter is
mechanical (≥0.95), but **51 chapters sit in the 0.85–0.95 "light" band**, clustered in two runs:
ch 149–214 (Books Eight–Ten) and ch 255–278 (Book Twelve).

Word-count retention by book — the decisive signal:

| book | source words | modern words | ratio |
|---|---|---|---|
| Book One–Book Twelve | ~453,000 | ~437,000 | 0.94–0.98 |
| Book Thirteen (1812) | 21,506 | 19,175 | 0.892 |
| Book Fourteen (1812) | 19,579 | 18,026 | 0.921 |
| Book Fifteen (1812–13) | 25,406 | 23,774 | 0.936 |
| First Epilogue | 22,778 | 20,955 | 0.920 |
| **Second Epilogue** | **19,428** | **16,568** | **0.853** |

Worst individual chapters: ch355 (Second Epilogue ch2) 0.64, ch362 (Second Epilogue ch9) 0.75,
ch357 0.83, ch361 0.84, ch365 0.85.

## Samples inspected (10)

### 1. Opening — ch1 (Book One, ch1), paras 0–4 — STRONG

> **Source:** "Heavens! what a virulent attack!" replied the prince, not in the least disconcerted by this reception. He had just entered, wearing an embroidered court uniform, knee breeches, and shoes, and had stars on his breast and a serene expression on his flat face.

> **modern-en:** "Good heavens! What a fierce attack!" replied the prince, not at all put out by this reception. He had just walked in wearing an embroidered court uniform with knee breeches and buckled shoes, decorations glinting on his chest, his flat face wearing a look of calm self-assurance.

Genuine, confident modernization; complete. Two small notes: **`stars` → `decorations`** loses the specific
orders of chivalry, and `glinting` is added. Para 0 and para 3 open with an inserted editorial marker
**`[Speaking in French]`** that is not in Maude — a defensible reader aid for Tolstoy's French passages,
but an addition, and it should be a deliberate documented convention rather than an ad-hoc insert.

### 2. Narrator's voice — ch1 para 4 and ch215 para 0 — MINOR VOICE FLATTENING

> **Source (ch1 p4):** that refined French in which **our grandfathers** not only spoke but thought
> **modern-en:** that refined French in which **an earlier generation** not only conversed but thought

> **Source (ch215 p0):** listened to his talk of Moscow and the position of **our** army
> **modern-en:** listened to his talk about Moscow and the position of **their** army

Tolstoy's first-person-plural narrator ("our") is a real device; converting it to third person is a
consistent small loss of narratorial presence.

### 3. Mid-book narrative — ch215 (Book Ten ch25, Pierre and Prince Andrew before Borodino), paras 0–2 — LIGHT

Synonym swaps only ("about to take leave" → "about to leave", "round which" → "around which", "chiefly" →
"mainly"). Complete and readable, but this is nearer a copy-edit than a modern rendering.

### 4. Philosophical digression — ch168 (Book Nine ch1, "Why did millions of men march…") — LIGHT

Word-level diff of para 3 (302 words): 21 change-ops, all synonym/punctuation
(`seemed like`→`appeared`, `chief`→`main`, `diplomatists of that time`→`diplomats`, `awkward`→`clumsy`,
`thing that happened`→`event`, `insufficient`→`inadequate`). Also drops the italicized French
`re-establishing les bons principes` → `restoring good principles`.

### 5. Book Twelve — ch274 (Book Twelve ch11) — LIGHT

Para 9 (171 words) has 8 change-ops after quote normalization: `gazed at`→`watched`,
`taking place`→`happening`, `lad`→`boy`, `cloak`→`coat`, `incredible`→`impossible`, and one deletion
(`at any rate`). Twenty-seven chapters in this run are in the same state.

### 6. MECHANICAL OUTLIER / ALIGNMENT SLIP — ch350 (First Epilogue ch13), paras 0–6 — CONFIRMED DEFECT

Phase 1 flagged ch350 p2 (87→11 words, ratio 0.13) and p5 (339→72, ratio 0.21). Neither is a simple
truncation. modern-en **merged source paras 0 and 1 into modern para 0**, which pushed every following
paragraph one slot out of register, and then **split source para 5 across modern paras 4 and 5** to
re-synchronize at para 6:

> **Source p2 (87 w):** "Thank you, my dear, you have cheered me up," said she as she always did. "But best of all you have brought yourself back—for I never saw anything like it, you ought to give your wife a scolding! …"
> **modern-en p2 (11 w):** Belova admired the presents and was delighted with her dress material.

(modern p2 is in fact source **p3**.) Content is not lost here, but **paragraph alignment is broken for
six paragraphs**, which violates the project's alignment invariant and will desynchronize split-pane,
audio and highlight anchoring for this chapter.

Within the same chapter, an image is replaced by an explanation and a detail is mistranslated:

> **Source p5:** Mílka, the old gray borzoi bitch …, **with a quite gray face and large black eyes that seemed more prominent than ever**
> **modern-en p4:** Milka, an old gray borzoi bitch …, **with a face full of black spots**

> **Source p5:** … who were now for the most part scattered about the world and like herself were **garnering the last ears of the harvests they had sown in earlier years**
> **modern-en p4:** … who were now for the most part scattered over the world, **finishing their earthly course like she was**

### 7. CONFIRMED IN-PLACE OMISSION — ch355 (Second Epilogue ch2) para 1 (228 → 107 words)

Neighbouring paragraphs align in register (sim 0.89 / 0.78), so this is deletion, not shift. Everything
after "…often in completely opposite ways" is gone, including the named illustration and the paragraph's
conclusion:

> **Source (deleted portion):** One historian says that an event was produced by Napoleon's power, another that it was produced by Alexander's… **Thiers, a Bonapartist, says that Napoleon's power was based on his virtue and genius. Lanfrey, a Republican, says it was based on his trickery and deception of the people. So the historians of this class, by mutually destroying one another's positions, destroy the understanding of the force which produces events, and furnish no reply to history's essential question.**

### 8. CONFIRMED IN-PLACE OMISSION + INVENTION — ch355 para 3 (185 → 56 words)

> **Source (end of paragraph):** Gervinus, Schlosser, and others, for instance, at one time prove Napoleon to be a product of the Revolution… **The ideas of the Revolution and the general temper of the age produced Napoleon's power. But Napoleon's power suppressed the ideas of the Revolution and the general temper of the age.**

> **modern-en (whole paragraph):** According to this view, the power of historical figures—represented as the product of many forces—can no longer be treated as a force that itself produces events. Yet in most cases, universal historians still use the concept of power as a force that independently produces events, **treating it as both cause and effect at the same time.**

The Gervinus/Schlosser evidence and Tolstoy's closing chiasmus are deleted, and the italicized clause is a
**summary the source does not contain** — an assertion substituted for the demonstration. This is
simultaneously an omission and an invention.

### 9. CONFIRMED IN-PLACE OMISSION — ch362 (Second Epilogue ch9) para 25 (383 → 112 words)

Neighbours align (sim 0.73 / 0.66). The modern paragraph stops after the first three sentences. Deleted:

> That a criminal was reared among malefactors mitigates his fault in our eyes. The self-sacrifice of a father or mother… The founder of a sect or party, or an inventor, impresses us less when we know how or by what the way was prepared for his activity… The dishonest conduct of the son of a dishonest father, the misconduct of a woman who had fallen into bad company, a drunkard's relapse into drunkenness… If the man whose actions we are considering is on a very low stage of mental development, like a child, a madman, or a simpleton—then… as soon as we know the cause prompting the action we can foretell the result.

Every one of Tolstoy's eight examples and the concluding inference are gone. The remaining prose is fluent
and reads as complete — the textbook "missing substance concealed by fluent prose" failure.

### 10. CONFIRMED IN-PLACE OMISSION — ch365 (Second Epilogue ch12, the novel's final argument) para 11 (152 → 61 words)

> **Source:** …so in history the difficulty of recognizing the subjection of personality to the laws of space, time, and cause lies in renouncing the direct feeling of the independence of one's own personality. **But as in astronomy the new view said: "It is true that we do not feel the movement of the earth, but by admitting its immobility we arrive at absurdity, while by admitting its motion (which we do not feel) we arrive at laws," so also in history the new view says: "It is true that we are not conscious of our dependence, but by admitting our free will we arrive at absurdity, while by admitting our dependence on the external world, on time, and on cause, we arrive at laws."**

> **modern-en:** …so in history the difficulty of recognizing the subjection of the individual to the laws of space, time, and cause lies in abandoning the immediate feeling of the independence of one's own personality.

Both quoted analogies — the entire payload of the paragraph and of the book's closing argument — are deleted.

### 11. Name / diacritic inconsistency (whole-file scan, not a passage sample)

modern-en normally strips Maude's stress accents (`Natásha` → `Natasha` 1221×, `Denísov` → `Denisov` 430×),
but does so inconsistently:

- Prince Andrew is `Andrew` 1058× but **`Andrei` 82×**, in chapters 4, 5, 25, 26, 27, 37, 64, 65, 212.
- `Bolkónski` (accented) survives 26× in chapters 38, 39, 40, 41, 205; `Bolkonsky` 128× elsewhere.
- One stray `Denísov` in ch205.

These are batch-boundary artifacts, mechanically fixable.

## Phase 1 flags: confirmed vs. disconfirmed

All 21 truncation flags were classified by comparing each flagged paragraph against modern paras *i*, *i−1*
and *i+1* and checking whether the neighbours align in register:

- **11 confirmed in-place omissions:** ch334/21, 344/10, 345/8, 355/1, 355/3, 357/19, 359/6, 360/13, 361/27, 362/10, 362/25, 365/11.
- **4 alignment shifts (not omissions, but alignment breakage):** ch38/12, 150/12, 350/2, 350/5.
- **6 ambiguous, needing a second look:** ch338/12, 355/11, 358/14, 358/18, 359/5 — all show sim(i,i) between 0.12 and 0.51 with weak neighbour alignment; each loses 40–75% of its words and is very unlikely to be innocent.
- `last_chapter_suspiciously_short: false` — **disconfirmed as a problem**; ch365 is 718 words because the Second Epilogue's final chapter is genuinely short, though para 11 within it is gutted (above).
- `pct_identical_long_paragraphs: 0.6` — **confirmed benign**; after quote normalization only 6 of 4,462 long paragraphs are identical. War and Peace is not a mechanical edition.

## Phase 3 — human-edition research

**Conclusion: no better rights-clear human English edition exists; Tinct already uses the best one.**

| candidate | translator | date | completeness | rights | evidence |
|---|---|---|---|---|---|
| **In use** | Louise & Aylmer Maude | 1922–23 (Oxford) | complete | **Public domain (US, pre-1931 publication; EU life+70 expired 2009/2010 — Aylmer d.1938, Louise d.1939)** | https://www.gutenberg.org/ebooks/2600 — PG bibliographic record names both Maudes, "Public domain in the USA" |
| alternative | Constance Garnett | 1904 | complete | public domain | Widely reported as PD; generally judged weaker than Maude ("a little too Edwardian, and lacks precision") |
| alternative | Nathan Haskell Dole | 1889 | complete | public domain | Older, less regarded |
| alternative | Leo Wiener | 1904 | complete | public domain | Older, less regarded |
| rejected | Anthony Briggs | 2005 (Penguin) | complete | **in copyright** | Commercial Penguin edition |
| rejected | Pevear & Volokhonsky | 2007 (Knopf) | complete | **in copyright** | Commercial; P&V translations are on live copyright |
| rejected | Andrew Bromfield | 2007 | *first-draft* text, not the final novel | in copyright | Not the canonical text |

Standard Ebooks — the most rigorous free-ebook publisher — also ships the **Maude** War and Peace,
corroborating both its PD status and its status as the best free option.

There is therefore no upgrade path via a different human translation. The question for this book is purely
whether the AI modern-en is worth keeping alongside Maude.

## Ratings

| dimension | weight | score | reason |
|---|---|---|---|
| fidelity / completeness | 40% | **2** | ≥11 confirmed in-place omissions, all in Books Thirteen–Fifteen and the Epilogues; the Second Epilogue loses 15% of its words; the novel's closing argument is gutted; paragraph alignment broken in ch350 |
| first-read clarity | 25% | **4** | Where rendered, genuinely clearer than Maude |
| literary voice | 20% | **3** | Excellent in Book One; 51 chapters barely modernized; narratorial "our" flattened; one image replaced by an explanation |
| restraint / no invention | 10% | **3** | Invented summary clause in ch355 p3; `[Speaking in French]` editorial inserts; Milka's description mistranslated |
| naturalness | 5% | **4** | Reads naturally |

**Weighted score: 2.9 — band: Mixed.**

## Recommendation

**RETRANSLATE** (scoped), confidence **high** for the defects found, **medium** for the whole book.

The defects are not local: they are a recurring pattern occupying an entire structural region
(Books Thirteen–Fifteen, First Epilogue, Second Epilogue — ~87,000 of 561,695 source words), where the
philosophical-digression prose has been systematically compressed rather than modernized. Books One–Twelve
are a genuine, complete rendering and do not need re-doing; they need a light pass for the 51 light-band
chapters and the name/diacritic inconsistencies.

**Correction scope: substantial.**

**Next action:** re-render ch298–365 (Books Thirteen–Fifteen + both Epilogues) paragraph-by-paragraph
against the Maude source with the `--gate` similarity check and a per-paragraph 75%-word-retention check;
repair the ch350 paragraph-merge so alignment is restored; then sweep `Andrei`→`Andrew`, `Bolkónski`→`Bolkonsky`,
`Denísov`→`Denisov`; re-generate `modern-da` for every re-rendered chapter and regenerate the affected audio.

## Limitations of this review

- I inspected **10 passages plus 3 whole-file scans** out of 365 chapters / 11,340 paragraphs. "Strong in Book One" is not "Books One–Twelve are verified."
- I classified all 21 Phase 1 truncation flags mechanically and read 6 of them in full; 6 flags remain **ambiguous and unread**.
- I did **not** systematically search for omissions outside the truncation-flagged paragraphs. The Second Epilogue's 15% word loss implies omissions spread across paragraphs that individually fall under the truncation threshold — the confirmed 11 are a floor, not a count.
- I did **not** review `modern-da` at all. Per the repo's own rule, Danish quality is bounded by `modern-en`; every chapter re-rendered above will need Danish re-translation.
- I did not verify audio manifests or whether audio was generated from the current text.
- Rights research was desk research against public records; it is not a legal opinion.
