# niels-lyhne — Niels Lyhne (J.P. Jacobsen, 1880)

Reviewer: audit batch agent, 2026-09-11. Scope: `public`.

Tinct's home-market book (canonical Danish author), so this review also checks the Danish
files and the cross-language alignment, not only the English pair.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-da | `3e90c0967db4e214` | 14 | **1159** | 66,780 | Original (1880) |
| original-en | `5f30145593a20bee` | 14 | **912** | 68,196 | Larsen (1919) — tr. Hanna Astrup Larsen |
| modern-en | `88dc925851aae72f` | 14 | **912** | 68,875 | Modern English |
| modern-da | `497ef5e8a0d3c3d8` | 14 | **1159** | 66,923 | Moderne Dansk |

Phase 1: `en_editions_aligned: true`, no count mismatches, **no truncations**, no empty
paragraphs, mean weighted similarity **0.9207**, `pct_identical_long_paragraphs 10.9`.

## Provenance and completeness of the core English text

Hanna Astrup Larsen, *Niels Lyhne*, American-Scandinavian Foundation, 1919. Public domain
(pre-1929 US publication; Larsen d. 1967, so PD in the US; EU term for the translation
runs to 2038 — see rights note below). Complete: 14 chapters, 68,196 words against the
Danish 66,780. No abridgement detected.

## Findings on the English pair

I recomputed per-paragraph similarity (`difflib`, token sequences, **`autojunk=False`** —
the default `autojunk` badly understates similarity on long paragraphs and is why the
Phase 1 figure and my figure differ):

| ch | n (≥15w) | mean sim | byte-identical | paras >0.95 |
|---|---|---|---|---|
| 1 | 23 | 0.875 | 0 | 0 |
| 2 | 16 | 0.902 | 0 | 1 |
| 3 | 81 | 0.938 | 0 | 36 |
| 4 | 13 | 0.929 | 0 | 3 |
| 5 | 33 | 0.953 | 1 | 22 |
| 6 | 49 | 0.963 | 5 | 34 |
| 7 | 36 | 0.979 | 4 | 30 |
| 8 | 56 | 0.975 | 6 | 50 |
| 9 | 90 | 0.975 | 16 | 74 |
| 10 | 49 | 0.980 | 8 | 45 |
| 11 | 167 | 0.955 | 34 | 103 |
| 12 | 20 | 0.852 | 0 | 3 |
| 13 | 65 | 0.924 | 6 | 20 |
| 14 | 21 | 0.913 | 2 | 7 |
| **all** | **719** | **0.950** | **82 (11%)** | **428 (60%)** |

**The finding is not a defect — it is a value question.** `modern-en` is a careful
*copy-edit* of Larsen, not a modern translation. It introduces no omissions (worst
paragraph target/source word ratio anywhere in the book, for paragraphs ≥40 words, is
**0.89**), no inventions that I could find, and no name or term drift. It is uniformly
slightly smoother than Larsen. But across 60% of the book a reader toggling to "Modern
English" will see punctuation changes and one or two word swaps per paragraph, and in
11% of paragraphs, nothing at all. The intensity of editing also *decreases* through the
book: chapters 1–4 and 12 get real work, chapters 7–11 get almost none.

## Samples inspected (6)

### 1. Opening — ch1 p0–2 (light end of the range)

> **original-en p0:** "She had the black, luminous eyes of the Blid family with delicate,
> straight eyebrows; she had their boldly shaped nose, their strong chin, and full lips."
> **modern-en p0:** "She had the dark, luminous eyes of the Blid family, with delicate,
> straight eyebrows; she had their boldly modeled nose, their firm chin, and full lips."

Finding: three word substitutions and one comma. Larsen's sentence was already fully
clear; nothing was blocking a modern reader. Faithful, but not doing work.

### 2. ch3 p20–23 — Edele's portrait (the book's most admired description)

> **original-en p21:** "…They made efforts to shine in her eyes and their own by assuming
> _blasés_ airs, by inventing wild paradoxes … a deadly smile of boredom, which made the
> victim redden and feel that he was the one hundred and eleventh fly in the same merciless
> spider's web."
> **modern-en p21:** "…They made efforts to shine in her eyes and their own by affecting
> blasé airs, by inventing wild paradoxes … a deadly smile of boredom, that made the victim
> redden and feel he was the one-hundred-and-eleventh fly caught in the same merciless
> spider's web."

Finding: correct and welcome — `_blasés_` (a Gutenberg italics artifact plus a mis-set
French plural) is cleaned up. But the paragraph's difficulty was never vocabulary; it is
Jacobsen's syntax, and that is untouched. Note also `gray` → `grey` in p23, moving the
edition *toward* British spelling, which is inconsistent with the rest of the file.

### 3. ch11 p60–63 — Fennimore dialogue (the flattest sample)

> **original-en p61:** "'Dearest Fennimore! Thank God you don't know what you are saying,
> but you are very unjust to women and to yourself. _I_ believe in woman's purity.'"
> **modern-en p61:** "'Dearest Fennimore! Thank God you don't know what you are saying;
> but you are very unjust to women, and to yourself. _I_ believe in woman's purity.'"

Finding: one comma, one semicolon. Also: the `_I_` emphasis marker is **retained**. There
are **22 surviving `_word_` markers in modern-en** (down from 67 in original-en) — so the
edition strips them inconsistently. The reader body text does not render markdown (only
`Chat.tsx`, `Feed.tsx`, `Notes.tsx` do), so these render as literal underscores on the
page. Local cosmetic defect, easily fixed.

### 4. ch12 p1–2 — Niels's aimlessness (the strong end of the range, sim 0.852)

> **original-en p1:** "…for however desolate and forsaken a man may feel when he has no
> single spot on all this vast earth to which his affections can cling, which he can bless
> when the heart _will_ overflow and yearn for when longing _will_ spread its wings…"
> **modern-en p1:** "…for however forsaken a man may feel when there is no single place on
> earth his affections can cling to — no place he can bless when his heart overflows, no
> place he can long for when longing spreads its wings…"

Finding: this is what a good modern edition of Larsen looks like. The tangled relative
clause is unpicked into a parallel triple, the stray `_will_` italics disappear, every
image survives (the painter without hands, the quiet Pompeii, the harp in the corner,
water and oil), and the abstract argument is easier to follow. If the whole book read like
chapter 12 the edition would clearly earn its place.

### 5. ch14 p26–31 — the ending

> **original-en p31:** "And at last he died the death—the difficult death."
> **modern-en p31:** "And at last he died the death — the difficult death."

Finding: faithful; the famous final cadence is not smoothed away. p27 "breast" → "chest",
p28 "progressing" → "spreading". Also visible here: original-en has a typographic error
(`“If I were God,“` — opening quote used as a closing quote) that modern-en silently fixes.

### 6. Danish cross-check — ch14 against `original-da`

I read the Danish ending directly (basic Danish comprehension; no third-party reference
consulted):

> **original-da ch14, final paragraphs:** "»Dersom jeg var Gud,« mumlede han, og i Tankerne
> fortsatte han, »vilde jeg da langt hellere gjøre den salig, der ikke omvender sig paa det
> Sidste.« … "Imod Morgenstunden begyndte han at fantasere, Betændelsen var i fuld Gang."
> … "Og endelig døde han da Døden, den vanskelige Død."

Finding: Larsen's and modern-en's renderings of these lines are accurate to the Danish.
"Betændelsen var i fuld Gang" is literally "the inflammation was in full swing"; both
Larsen ("progressing rapidly") and modern-en ("spreading rapidly") are loose but not wrong.
No fidelity problem found at this spot. **Limitation:** this is one cross-check at one
location; I did not verify Larsen against the Danish systematically.

## Two production bugs found in the Danish files (outside the modern-EN question, reported here because this is the Danish flagship title)

1. **`niels-lyhne-original-da.json` has paragraphs broken mid-sentence.** 365 of 1,159
   paragraphs (**31.5%**) do not end in terminal punctuation — page/line-break artifacts
   from the source scan. Example, ch1 paragraphs 8 and 9, which are one sentence:

   > p8: "Forældre og Sødskende, Naboer og Bekjendte, de sagde aldrig et Ord, der var værdt
   > at lytte til, for deres Tanker løftede sig ingensinde fra"
   > p9: "den Jord eller den Bedrift, de havde under Hænder, ligesaalidt som deres Blik
   > nogensinde søgte bort fra de Forhold og Begivenheder, de havde lige for deres Øjne."

   Another at ch14: "…blev saa ulideligt ved. Det" / "kunde have været saa godt at have en
   Gud…". A Danish reader of Jacobsen — the most style-conscious prose in the Danish canon
   — is reading it chopped at random points.

2. **The Danish and English editions are not mutually paragraph-aligned, but all four are
   marked `aligned: true`** (`bookRegistry.ts:1594–1627`). da-pair = 1,159 paragraphs,
   en-pair = 912. Split-pane comparison works within a language pair and silently
   misaligns across languages (original-da vs. modern-en, etc.). The 247-paragraph gap is
   exactly the artifact described in (1).

Neither is in scope for this audit to fix, and neither changes the modern-en verdict, but
both are more damaging to Tinct's Danish audience than anything in the English pair.

## Phase 3 — human-edition research

| Candidate | Date | Completeness | Rights | Verdict |
|---|---|---|---|---|
| Hanna Astrup Larsen | 1919, American-Scandinavian Foundation | complete | Public domain in the US (pre-1929). Larsen d. 1967 → EU/DK term to **2038**. | **Already our `original-en`.** See rights note. |
| Ethel F. L. Robertson (pen name Henry Handel Richardson), *Siren Voices (Niels Lyhne)*, Heinemann, London | 1896 | complete (retitled) | Public domain US; Robertson d. 1946 → PD in EU/DK since **2017** | **Verified accessible.** Read via IA `in.ernet.dli.2015.95707`. Opening: "She had the Bliders' sparkling black eyes and straight, pencilled eyebrows; she had their well-formed nose, their powerful chin and full, curved lips." Competent Victorian prose — clear, but **not better than Larsen**, and it retitles the novel. No reason to switch. |
| Tiina Nunnally | 1990 Fjord Press; Penguin Classics 2006 | complete | **In copyright** | The acknowledged best English *Niels Lyhne*. Not usable. |

**No PD human translation improves on Larsen.** Larsen 1919 is, on the evidence of my
samples, already clear readable English for a thoughtful modern adult — which is exactly
why the current modern-en can only add polish.

**Rights note that needs a human decision, not mine:** Larsen died in 1967, so under EU
term (life + 70) her *translation* is protected in Denmark/EU until **2038**, even though
the underlying Jacobsen text is long PD and the translation is PD in the US. Tinct
operates from Denmark and serves globally. I am flagging this as an unresolved
jurisdictional question, not asserting a conclusion — and it applies to `original-en` and
to `modern-en` (a derivative of it) equally. Robertson 1896 is the one English text in the
table that is unambiguously PD in both jurisdictions.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 4 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 5 |

**Weighted score 4.6 — band: Good with fixes.**

Clarity and voice are 4s not 5s for the same reason: across the majority of the book the
modern edition does not meaningfully change the reading experience, so it neither improves
clarity nor risks the voice. Fidelity is a 5 — I found nothing removed and nothing added.

## Recommendation

**LIGHT EDIT.** Confidence: **medium** (6 sampled locations across 14 chapters, ~2,500
source words read in pairs, plus exhaustive mechanical comparison of all 912 paragraph
pairs and one Danish cross-check). Correction scope: **local**.

Scoped fixes:
1. Strip the 22 remaining `_word_` emphasis markers from `modern-en` (and the 67 in
   `original-en`), or teach the reader to render them.
2. Normalise `grey`/`gray` — modern-en drifts British in ch3 p23 against a US-spelled file.
3. Optionally, push chapters 7–11 to the editing depth of chapter 12, which is the one
   place the edition demonstrably earns its keep.

**Defensible alternative:** SOURCE + GLOSSES. Larsen 1919 already meets the reading
standard, the modern edition overlaps it 95%, and dropping it would cost readers little.
I did not choose that because the modern edition is genuinely (if marginally) better and
has no defects to justify removing it — but if maintenance cost is the deciding factor,
this is the book in my batch where retiring `modern-en` would be least harmful.

## Limitations of this review

- 6 sampled locations of 14 chapters. I did **not** read chapters 2, 4, 5, 6, 7, 8, 9, 10
  or 13 in pairs at all.
- My Danish check was **one passage at one location**. I did not verify Larsen's fidelity
  to Jacobsen systematically, and I am not qualified to judge Danish literary register.
- I did **not** audit `modern-da` for content (only its paragraph count and the structural
  artifact it inherits from `original-da`).
- The Larsen EU-copyright question is flagged, not resolved. It needs a legal answer.
- No rendering/visual QA in the app.
