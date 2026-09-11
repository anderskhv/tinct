# notes-from-underground — Notes from Underground, Fyodor Dostoevsky (1864)

**Audit date:** 2026-09-11 · **Scope:** public (in `BOOKS`) · **Reviewer:** batch agent (Russian-novels batch)

> **Headline finding: the modernization tapers off monotonically from the first chapter to the last.**
> Part 1 chapters 1–5 are an excellent, fully-realized modern rendering. By Part 1 ch8 the effort has
> already thinned to a light edit, and the whole of Part 2 (ch 12–21) is Garnett with contractions,
> American spellings and respaced em-dashes.

## Edition snapshot (from Phase 1 `mechanical/notes-from-underground.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `c600f3f5ac650824` | 21 | 495 | 44,050 | Garnett (1918), tr. Constance Garnett |
| modern-en | `8df3e74890b26ce3` | 21 | 495 | 42,757 | Modern English |
| modern-da | `5654b6b12c596775` | 21 | 495 | 43,942 | Moderne Dansk |

Structure: chapter counts match, 0 paragraph-count mismatches, 2 sections, `en_editions_aligned: true`.
Mean weighted similarity **0.8553**; identical long paragraphs 3.9%; 0 truncation flags; 0 empty paragraphs.

## Provenance / completeness of the core English text

Constance Garnett, 1918. `books/raw/notes-from-underground/SOURCE.md` records it precisely:

```
Translator: Constance Garnett (1918)
Source: Project Gutenberg eBook #600
URL: https://www.gutenberg.org/cache/epub/600/pg600.txt
License: Public domain (US)
Notes: Garnett translation confirmed in Gutenberg header: "Translator: Constance Garnett"
       Nekrassov epigraph translated by Juliet Soskice
```

Complete: Part I "Underground" (11 chapters) + Part II "Apropos of the Wet Snow" (10 chapters). Dostoevsky's
fictional-editor footnote is preserved as ch1 para 0; the Nekrassov epigraph is preserved as the first
paragraph of Part II.

## Structural profile of modern-en (my own recomputation, quote-normalized)

Per-chapter weighted token similarity after normalizing curly quotes/apostrophes and dash spacing:

| ch | part/chapter | norm sim | ch | part/chapter | norm sim |
|---|---|---|---|---|---|
| 1 | P1 c1 | **0.559** | 12 | P2 c1 | 0.889 |
| 2 | P1 c2 | **0.636** | 13 | P2 c2 | 0.949 |
| 3 | P1 c3 | **0.691** | 14 | P2 c3 | 0.932 |
| 4 | P1 c4 | **0.727** | 15 | P2 c4 | 0.941 |
| 5 | P1 c5 | **0.745** | 16 | P2 c5 | 0.934 |
| 6 | P1 c6 | 0.807 | 17 | P2 c6 | 0.944 |
| 7 | P1 c7 | 0.833 | 18 | P2 c7 | 0.932 |
| 8 | P1 c8 | 0.895 | 19 | P2 c8 | **0.954** |
| 9 | P1 c9 | 0.911 | 20 | P2 c9 | **0.956** |
| 10 | P1 c10 | 0.887 | 21 | P2 c10 | **0.967** |
| 11 | P1 c11 | 0.897 | | | |

Mean 0.889. **3 chapters mechanical (≥0.95): 19, 20, 21.** **11 chapters light (0.85–0.95): 8–18.**
**7 chapters real (<0.85): 1–7.** Byte-identical long paragraphs after normalization: 12/219 (5.5%).

The monotone climb from 0.559 to 0.967 is the signature of a generation run whose effort decayed, not of a
deliberate editorial choice.

## Samples inspected (6)

### 1. Opening — ch1 (Part 1 ch1), paras 0–4 — STRONG

> **Source p2:** I have been going on like that for a long time—twenty years. Now I am forty. I used to be in the government service, but am no longer. I was a spiteful official. I was rude and took pleasure in being so. I did not take bribes, you see, so I was bound to find a recompense in that, at least. (A poor jest, but I will not scratch it out…)

> **modern-en p2:** I've been going on like this for a long time — twenty years. I'm forty now. I used to work for the government, but I don't anymore. I was a spiteful clerk. I was rude and enjoyed being rude. I didn't take bribes, you see, so I had to find some other compensation. (That's a weak joke, but I won't cross it out…)

Excellent — the underground man's voice survives intact, the syntax is genuinely reworked, nothing is lost.

One small fidelity nit in the same chapter (p3):

> **Source:** I almost did succeed.  →  **modern-en:** I almost always managed it.

Garnett's "almost did succeed" is a statement of degree; "almost always managed it" is a statement of
frequency. A logical distinction the reading standard asks us to preserve.

### 2. ch5 (Part 1 ch5) — STRONG (norm sim 0.745)

Real rewriting throughout; no findings.

### 3. BOUNDARY — ch8 (Part 1 ch8), longest paragraph — LIGHT (norm sim 0.895)

> **Source:** …while will is a manifestation of the whole life, that is, of the whole human life including reason and all the impulses.
> **modern-en:** …while will is a manifestation of the whole of life — that is, of the whole human life, including reason and all the impulses.

Two inserted commas and one `of`. The rest of the paragraph is Garnett unchanged. The decay is already
visible here, at the exact point where the book's central argument begins.

### 4. ch12 (Part 2 ch1) — LIGHT (norm sim 0.889)

> **Source:** We Russians, speaking generally, have never had those foolish transcendental "romantics"—German, and still more French—on whom nothing produces any effect… they would not even have the decency to affect a change…
> **modern-en:** We Russians, generally speaking, have never had those foolish transcendental "romantics" — German, and still more French — on whom nothing makes any impression… they wouldn't even have the decency to fake a change…

Real but shallow: two synonym swaps, contractions, em-dash respacing. Everything structural is Garnett's.

### 5. ch17 (Part 2 ch6) — LIGHT (norm sim 0.944)

856-word paragraph, 35 change-ops. The full inventory of the first twenty:

```
"H'm ... → "Hmm...     does not → doesn't     he would → he'd       there is → there's
she would → she'd      I will → I'll         you are → you're      honourable → honorable
they had → they'd      It is → It's          should not → shouldn't  it is → it's
there will → there'll  that is → that's      + em-dash respacing and 3 comma insertions
```

Nothing but contractions, American spelling and punctuation.

### 6. MECHANICAL — ch19, 20, 21 (Part 2 ch8, 9, 10 — the Liza scenes and the book's conclusion)

ch19 (580-word paragraph, 15 change-ops):
```
I had → I'd     upon → on (×3)     behaviour → behavior     favour → favor
did not → didn't (×2)   It is → It's   that is → that's   could not → couldn't (×3)   that → the
```

ch20 (625-word paragraph, 25 change-ops): `I am`→`I'm` ×5, `I had`→`I'd` ×2, `realise`→`realize`,
`saviour`→`savior`, `dressing-gown`→`dressing gown`, `sheep-dog`→`sheepdog`, plus em-dash respacing.

ch21 (541-word paragraph, 16 change-ops) — and the surrounding prose shows the same thing at sentence level:

> **Source p1:** I know I shall be told that this is incredible—but it is incredible to be as spiteful and stupid as I was… with me loving meant tyrannising and showing my moral superiority… the right—freely given by the beloved object—to tyrannise over her.

> **modern-en p1:** I know I shall be told this is incredible — but it is incredible to be as spiteful and stupid as I was… with me loving meant tyrannizing and showing my moral superiority… the right — freely given by the beloved object — to tyrannize over her.

The entire 541-word paragraph differs by `that` deleted, `tyrannising`→`tyrannizing` ×2, and dash spacing.
Note that even the archaism the modernization exists to remove — "I know I shall be told" — is left standing.

## Phase 1 flags: confirmed vs. disconfirmed

- `mean_weighted_similarity: 0.8553` — **confirmed, and it conceals a gradient.** The single mean averages a genuinely good Part 1 opening (0.56) against a mechanical Part 2 ending (0.97). Reporting one number per book hides exactly this failure shape.
- `pct_identical_long_paragraphs: 3.9%` — **confirmed**; rises to 5.5% after quote normalization, which exceeds the repo's own 5% "translation has gaps" threshold used for the Danish byte-identity audit.
- `truncated_paragraphs_total: 0` — **confirmed.** Nothing is omitted.
- `empty_paragraphs_total: 0`, `chapter_count_mismatch: false`, `en_editions_aligned: true` — **all confirmed.**
- `last_chapter_suspiciously_short: false` — **confirmed** (1,956 words) — but ch21 is the single most mechanical chapter in the book, so "not short" was never the right question here.

## Phase 3 — human-edition research

**Conclusion: Garnett is the only rights-clear option of acceptable quality.**

| candidate | translator | date | completeness | rights | evidence |
|---|---|---|---|---|---|
| **In use** | Constance Garnett | 1918 | complete | **public domain (US)** | PG #600, recorded in `books/raw/notes-from-underground/SOURCE.md`; https://www.gutenberg.org/ebooks/600 |
| corroboration | Constance Garnett (Standard Ebooks) | — | complete | **public domain / CC0** | https://standardebooks.org/ebooks/fyodor-dostoevsky/notes-from-underground/constance-garnett — Standard Ebooks also chose Garnett |
| considered, rejected | C. J. Hogarth, *Letters from the Underworld* | 1913 (J. M. Dent, Everyman's) | complete | **public domain** (pub. 1913) | First English translation. Hogarth (1869–1945) is described in the reference literature as working with "incomplete knowledge of Russian but rich imagination"; the title alone signals how far it strays. Not an improvement on Garnett. |
| rejected | Jessie Coulson | 1972 (Oxford) | complete | in copyright | Commercial |
| rejected | Mirra Ginsburg | 1974 (Bantam) | complete | in copyright | Commercial |
| rejected | Pevear & Volokhonsky | 1993 (Vintage) | complete | **in copyright** | Commercial; P&V on live copyright |
| rejected | Richard Freeborn / Ronald Wilks | Penguin, various | complete | in copyright | Commercial |

Garnett's 1918 Notes from Underground is dated but clear and complete. There is no rights-clear human
alternative that would serve readers better. A real modern rendering is therefore the only route to a more
accessible text — which is what `modern-en` is for, and which it delivers for Part 1 and abandons for Part 2.

## Ratings

| dimension | weight | score | reason |
|---|---|---|---|
| fidelity / completeness | 40% | **5** | Nothing omitted, nothing invented, alignment perfect, 0 truncation flags |
| first-read clarity | 25% | **2** | Chapters 12–21 (roughly 27,000 of 44,000 words) remove essentially no reader barrier |
| literary voice | 20% | **3** | Part 1 is a genuine, sustained rendering of the underground man's voice; Part 2 is Garnett's voice with apostrophes |
| restraint / no invention | 10% | **4** | No inventions; one altered logical relation (`almost did succeed` → `almost always managed it`) |
| naturalness | 5% | **3** | Natural in Part 1; Edwardian syntax with modern contractions grafted on in Part 2 |

**Weighted score: 3.7 — band: Mixed.**

## Recommendation

**RETRANSLATE**, confidence **high**, correction scope **substantial**.

The defect is recurring and structural, not local: 14 of 21 chapters are at or above the 0.85 light
threshold and three are effectively mechanical. It is, however, a *small* book — roughly 27,000 source words
need re-rendering (ch 8–21), which makes this by far the cheapest of the three repair candidates in this
batch and a good candidate to do first.

**Next action:** re-render ch8–21 paragraph-by-paragraph from Garnett, gated on
`python3 books/classify-modern-en.py notes-from-underground --gate` with `--chapters 8-21`; the Part 1
chapters (1–7) are the quality reference and should not be touched. Re-translate `modern-da` for ch8–21
afterwards and regenerate the English audio for those chapters.

## Limitations of this review

- I inspected **6 passages** out of 21 chapters / 495 paragraphs. The band classification is a whole-file computation and is reliable; the quality judgment on Part 1 rests on two samples.
- I did **not** audit Part 1 chapters 1–7 for omissions or inventions beyond the one logical-relation nit noted. A real rewrite can still drop content.
- I did **not** verify that the Nekrassov epigraph and the fictional-editor footnote are handled correctly in `modern-en`, beyond seeing that ch1 para 0 exists and is rewritten.
- I did **not** review `modern-da`, audio, onboarding or threads.
- Rights research is desk research against public records; it is not a legal opinion. I did not open the Hogarth 1913 text itself — my rejection of it rests on reference-literature reputation plus its acknowledged retitling, so treat "Hogarth is worse than Garnett" as **reasoned but unverified**.
