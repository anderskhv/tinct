# faust-part-1 — Faust, Part One (Johann Wolfgang von Goethe)

**Scope:** public
**Reviewer:** batch agent, long-form verse epics, 2026-09-11

> **Headline: the `original-en` file is not the translation the registry says it is, and it is materially corrupt. Everything downstream of it — including `modern-en` and `modern-da` — inherits that damage. This book needs a source replacement before any editorial verdict on the modern edition is meaningful.**

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-de — "Goethe (1808)" | `edb0081f759c0eb2` | 28 | **1056** | 30,589 |
| original-en — "Bayard Taylor (1870)", tr. Bayard Taylor | `bff236838e6e5ee6` | 28 | 895 | 35,368 |
| modern-en — "Modern English" | `9e66da5b45267bfb` | 28 | 895 | 34,570 |
| modern-da — "Moderne Dansk" | `ce719108b40e89f1` | 28 | 895 | 33,391 |

All 28 scenes present, Dedication through Dungeon. `en_editions_aligned: true` (paragraph *counts* match; see below — counts matching is not the same as content aligning).

## PROVENANCE FAILURE (confirmed)

**1. `original-en` is not Bayard Taylor's translation.**

`bookRegistry.ts` line 2075 labels it `'Bayard Taylor (1870)'` with `translator: 'Bayard Taylor'`. Taylor's translation is famous for being rendered *in the original metres*, in rhymed verse. His opening monologue reads:

> "I've studied now Philosophy / And Jurisprudence, Medicine,— / And even, alas! Theology,— / From end to end, with labor keen; / And here, poor fool! with all my lore / I stand, no wiser than before"
> (verified at Project Gutenberg #14591, https://www.gutenberg.org/files/14591/14591-h/14591-h.htm)

Our `original-en` contains **no verse and no rhyme anywhere**. It is a *prose* crib with bracketed stage directions and footnote markers — the shape of the Bohn's Standard Library / Hayward-tradition prose Faust, not Taylor. The label is wrong, and it is wrong in the specific way that matters most for this book: **Goethe's Faust is a rhymed verse drama whose wordplay and metrical shifts are the point, and the English chain we ship has none of that, at any level.**

**2. `original-en` is OCR-corrupt and incomplete.**

- **Chapter 4 ("Night") begins mid-sentence**: *"bitter sweat, be obliged to speak of what I do no know; that I may learn what holds the world togethe in its inmost core…"*. The opening of the most famous speech in German literature — "Habe nun, ach! Philosophie… durchaus studiert" — **is simply not in the file.** `modern-en` faithfully reproduces the truncation as *"FAUST. ... with bitter sweat, be forced to speak of what I do not know"*.
- **49 of 895 paragraphs contain raw untranslated German and/or OCR debris**, concentrated in: ch 26 (10/27), ch 27 (6/13), ch 17 (6/28), ch 11 (6/19), ch 7 (6/93), ch 9 (6/59), ch 10 (4/30), ch 6 (2/38), ch 14, 16, 25 (1 each). Example, ch 27 para 6: *"MEPHISTOPHELES. On! on! BB KERKER. '1 Der Menschheit ganzer Jammer faszt mich an. Hier wohnt sie, hinter dieser feuchten Mauer, 4050 Und ihr Verbrechen war ein guter Wahn!"* — running heads, line numbers and untranslated German inside the *English* edition.
- Scattered OCR noise throughout: `"you are entitled to ery fie!"`, `"nothing perfect falls to the lot of . man!"`, `"the doctor still sticks to you"` preceded by `"‚and dripping stone"`, `"Am Ia god?"`, `"Suppo I chose to talk"`.

## Phase 1 flags: confirmed vs. disconfirmed

- `truncated_paragraphs_total: 25`, clustered in ch 17 (10), ch 26 (7), ch 27 (2), ch 9 (3), ch 2 (2), ch 11 (1). **Partially disconfirmed as omissions, but they point at a worse problem.** Most of these are *false* truncation signals — the source paragraph is long only because it is padded with German/OCR junk, and `modern-en` correctly drops the junk. But see ch 2 below: in at least one case the generator dropped the junk *including real Goethe content that was only present in German*.
- `pct_identical_long_paragraphs: 1.3` — confirmed and understated. My own measurement: **182 of 549 long paragraph pairs (33%) sit at ≥0.85 word-similarity.** A third of the "modern" edition is the prose crib with contractions added.
- `mean_weighted_similarity: 0.6511` — confirmed; but the per-scene spread is extreme: ch 18 = 0.955 (essentially unchanged), ch 5 = 0.906, ch 7 = 0.847 vs. ch 27 = 0.086, ch 17 = 0.111, ch 26 = 0.133. The three near-zero scenes are near-zero because `modern-en` there is not tracking `original-en` at all — it is reconstructing from the German.
- `empty_paragraphs_total: 0`, `last_chapter_suspiciously_short: false` — confirmed.
- `original-de` has **1056 paragraphs vs. 895** in the three others. The German is *not* paragraph-aligned with anything, despite `aligned: true` on the English/Danish editions.

## Samples inspected (7 scenes)

### 1. Ch 4 "Night", para 0 — Faust's opening monologue — CONFIRMED OMISSION

Both source and modern begin mid-sentence. Roughly the first 30 lines of Goethe's play (Faust's account of having studied philosophy, law, medicine and theology and being no wiser) are absent from the English editions entirely. A reader opening the book at the first real scene lands in the middle of a clause.

### 2. Ch 2 "Prelude on the Stage", paras 3–4 — CONFIRMED OMISSION

Source para 4 is a mixture of English and a long German block containing real Goethe: the POET's speech (*"Der saubern Herren Pfuscherei / Ist, merk' ich, schon bei euch Maxime"*) and the DIRECTOR's reply (*"Ein Mann, der recht zu wirken denkt, / Musz auf das beste Werkzeug halten… Bedenkt, ihr habet weiches Holz zu spalten"*), plus the lines about the audience arriving jaded from reading journals and the ladies coming to show off their finery.

`modern-en` para 4 renders only the English portion and **drops the Poet's and the Director's speeches entirely**. This is a substantive omission of dialogue, not of OCR noise.

### 3. Ch 17 "Forest and Cavern" — CONFIRMED DUPLICATION AND REORDERED DIALOGUE

This is the worst scene in the book. Two distinct defects:

**(a) Duplicated text.** `modern-en` para 0 ends *"…So I reel from desire to enjoyment, and in enjoyment I languish for desire. [MEPHISTOPHELES enters.]"* — and then para 5 repeats the same passage in near-identical words: *"— whom I already cannot do without; though, cold and insolent, he degrades me in my own eyes… So I reel from desire to enjoyment, and in enjoyment languish for desire. [MEPHISTOPHELES enters.]"* — and it is mislabelled **MEPHISTOPHELES**, though it is Faust speaking.

**(b) Faust's central speech appears twice.** `modern-en` para 22 and para 26 are two different renderings of the same speech:
- para 22: *"Am I not the **fugitive**, the homeless one, the monster without purpose or rest, who, like a cataract, **raged** from rock to rock… Hell, **you had to have** this sacrifice!"*
- para 26: *"Am I not the **outcast** — the homeless one — the monster without aim or rest, who, like a cataract, **dashed** from rock to rock… Hell, **you could not rest without** this sacrifice!"*

Source has it once (para 25). Paras 1–4 of `modern-en` are likewise English renderings of the German debris in source paras 1–4, whose content then recurs in English at paras 6–10. The dialogue order is scrambled relative to the source: modern puts Faust's speech *before* Mephistopheles' "twin pair" jibe; the source has it after.

Duplicated and reordered speeches in a drama are a hard fail on restraint and fidelity both.

### 4. Ch 26 "A Gloomy Day" / ch 27 "Night. Open Field" — CONFIRMED MISALIGNMENT

`modern-en` here reconstructs from the German and, in doing so, drifts out of paragraph correspondence with `original-en`. At ch 26, source para 10 (*"Gnash not thy greedy teeth thus defyingly at me!"*) corresponds to **modern para 6**; at ch 27, source paras 6–9 (German) correspond to modern paras 7–9 (English). Paragraph counts still match, so the Phase 1 alignment check passes — but `aligned: true` is not true at the content level in these scenes, and split-pane will display mismatched text.

To be fair to the generator: the *reconstruction itself is good*. Ch 27 para 7 renders the German correctly as *"The whole misery of mankind grips me. She lives here, behind this damp wall, and her crime was a fond delusion!"* That is right. The problem is that it silently shifts the alignment.

### 5. Ch 8 "Auerbach's Cellar", paras 40–51 — the Song of the Flea — ACCEPTABLE, form lost

Modern is a clean light edit of the crib: *"There was once upon a time a king who had a great flea"* → *"There once was a king who had a great flea"*, `waiting-woman`→`chambermaid`, `capital!`→`first-rate!`. It also usefully adds quotation marks so the reader can see where the song starts and stops. But Goethe's *Es war einmal ein König* is a **rhymed drinking song**, and here it is a prose paragraph — because the source is a prose crib, not because of any choice made in the modernization. This is the cost of the wrong source, visible in miniature.

### 6. Ch 18 "Margaret's Room" — the spinning-wheel song — GOOD, and the one place form is restored

Source runs *"My peace is gone; My heart is heavy; I shall find it never, And never more…"* as one unbroken prose blob. `modern-en` restores it to verse lines and stanzas. Word-similarity is 0.955 — nearly nothing changed lexically — but the *lineation* is restored, which is the right service here. Well judged.

### 7. Ch 28 "Dungeon", paras 48–54 — the ending — ACCEPTABLE

*"Thine am I, Father! Save me! Ye Angels! Ye Holy Hosts"* → *"Yours am I, Father! Save me! You angels! You holy hosts"*. Mephistopheles' *"She is judged!"* and the voice from above, *"Is saved"*, are both preserved — including the theologically load-bearing terseness of "Is saved". The closing "Henry! Henry!" survives. The scene is intact; it is simply a very light edit.

## Phase 3 — human-edition research

**Candidate A — Bayard Taylor, *Faust: A Tragedy, Translated in the Original Metres* (1870–71). THE FIX.**
- Project Gutenberg #14591 (Part One): https://www.gutenberg.org/files/14591/14591-h/14591-h.htm
- Also Internet Archive: https://archive.org/details/fausttragedytran00goetuoft
- Rights: **public domain.** Published 1870–71 (Houghton Mifflin), copyright renewals of 1898 long expired; Taylor d. 1878, so life+70 expired in Denmark/EU in 1948. Gutenberg's standard licence statement applies.
- Complete Part One, in verse, preserving Goethe's metres and rhyme.
- Verified by reading the opening monologue (quoted above): it is verse, it rhymes, and it is *the text our registry already claims to be shipping*.
- Trade-off the brief asked me to weigh: Taylor's meter-preserving verse does read stiffly to modern ears in places, and that is a real cost. But it is incomparably better than what is in the file now, and it is what the label promises.

**Candidate B — Anna Swanwick, *Faust* Part One (1850; rev. later eds.).**
- Rights: **public domain** (Swanwick d. 1899). Available via Internet Archive / Wikisource.
- Also verse, generally regarded as among the more readable Victorian Fausts.
- **Unverified** — I did not open and read a sample of Swanwick's text in this session, so I record it as a candidate, not as assessed.

**Candidate C — a prose Faust (Hayward 1833 / Bohn tradition).** This is, in substance, what we already have — but a *clean* copy, with its real translator named and without the OCR damage and German interpolations. Public domain. Worth identifying precisely if the decision is to keep a prose base; I did not pin down which edition ours was OCR'd from.

**Not found in this search:** any rights-clear contemporary human English Faust. Walter Kaufmann (1961), David Luke (1987), Randall Jarrell, Stuart Atkins and Martin Greenberg are all in copyright.

## Ratings

Rating the *existing* `modern-en` as it stands, per the rubric.

| dimension | weight | score | reason |
|---|---|---|---|
| fidelity / completeness | 40% | **2** | Opening of Faust's monologue missing; Poet's and Director's speeches missing from ch 2; Faust's ch 17 speech duplicated and the scene's dialogue reordered; content-level misalignment with `original-en` in ch 26–27 |
| first-read clarity | 25% | **4** | The English that *is* present reads clearly and idiomatically; the generator's OCR repair work is competent |
| literary voice | 20% | **2** | Goethe's verse, rhyme and metrical variety are absent from the entire English chain; the Song of the Flea is a prose paragraph; a speaker attribution is wrong in ch 17 |
| restraint / no invention | 10% | **3** | The duplicated ch 17 speech is, functionally, invented text — the same speech given twice in different words; against that, no fabricated *content* was found |
| naturalness | 5% | **4** | Idiomatic contemporary English prose |

**Weighted score: 2.7 — Poor.**

## Recommendation

**BLOCKED.** Confidence: **high**.

What is unresolved / broken, precisely:

1. **`original-en` is misattributed.** It is labelled "Bayard Taylor (1870)" in `bookRegistry.ts` and it is demonstrably not that translation. Until the actual provenance of the file is established or the file is replaced, we are crediting a named translator for text he did not write — which is both a quality problem and an attribution problem.
2. **`original-en` is incomplete** (ch 4 opens mid-sentence; the play's opening monologue is missing) **and corrupt** (49/895 paragraphs carry untranslated German and OCR debris).
3. **`modern-en` cannot be assessed on its merits** while it is derived from that file. Its worst defects (duplication, reordering, omission, misalignment) are all downstream artefacts of the generator trying to cope with a broken source.

Correction scope: **substantial**.

Next action, in order:
1. Replace `faust-part-1-original-en.json` with the real Bayard Taylor text from Project Gutenberg #14591 — verse, complete, public domain, and already what the registry claims. Re-parse into the 28 scenes.
2. Re-verify `original-de` against the new English and fix the 1056-vs-895 paragraph mismatch so `aligned` is honest.
3. Regenerate `modern-en` (and then `modern-da`) from the clean source. Do not attempt to patch the current `modern-en` — three of the four defects I found are alignment/duplication artefacts that a local edit would not reach.
4. Escalate to Anders before step 1: this is a source replacement for a live public book, which is outside routine content work.

## Limitations of this review

- `modern-da` not checked at all; it shares the same source and almost certainly the same defects, but I did not confirm that.
- `original-de` inspected only for paragraph count and for the German fragments quoted above; I did not verify that the German text itself is complete or correctly scene-split.
- 7 of 28 scenes read closely; I opened 5 of the 25 mechanical truncation flags.
- I did not determine which specific prose translation our `original-en` was OCR'd from — I established what it is *not* (Taylor) and what kind of text it is (a prose crib), not its exact edition.
- Swanwick recorded as **unverified**: candidate identified from search results and translator death date, no text sample read.
- Taylor's rights status rests on publication date (1870–71) and the translator's death (1878) plus Project Gutenberg's own licence statement; I did not examine US copyright renewal records directly.
- No rendering, audio, onboarding or `faust-part-1-threads.json` checks.
