# frankenstein — Frankenstein (Mary Shelley; text = the 1831 revised edition)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (English-originals batch)

## Edition snapshot (from Phase 1 `mechanical/frankenstein.json`)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en (Original (1831)) | `71008d6d1e14b581` | 28 | 764 | 74,919 |
| modern-en (Modern English) | `a3550019107ecb1f` | 28 | 764 | 63,214 |
| modern-da (Moderne Dansk) | `f52630181990e7ae` | 28 | 764 | 63,456 |

`en_editions_aligned: true`, no count mismatches, mean weighted similarity **0.542** (the lowest in
this batch — i.e. the most thoroughly rewritten), **0.3 % identical long paragraphs**, **1
truncation candidate** (ch 24 p30), 0 empty paragraphs, last chapter not flagged short (7,280 words).

## Provenance / completeness of the core English text — **1818 vs 1831 verified**

The 28 units are `Letter 1`–`Letter 4` + `Chapter 1`–`Chapter 24`.

**The text is the 1831 revised edition, and I confirmed this from the text itself, not from the
label.** Two independent markers:

1. **Chapter count.** The 1818 first edition is in three volumes of 7 / 9 / 7 chapters = 23. The
   1831 edition is 24 running chapters. This file has 24.
2. **Elizabeth Lavenza's origin.** File `Chapter 1` (ch 5) paras 7–9 read: `When I was about five
   years old, while making an excursion beyond the frontiers of Italy…` and the peasant woman
   explains `She was not her child, but the daughter of a Milanese nobleman`. That is the **1831**
   story — Elizabeth as an adopted foundling discovered near Lake Como. In **1818** she is Victor's
   first cousin, the daughter of his father's sister, sent to the Frankensteins when her widowed
   father plans to remarry. (Scholarly summaries of the 1818→1831 revisions confirm this as one of
   the principal changes, along with the removal of Elizabeth's speech against capital punishment
   and her plea for Ernest's farming career, and the recasting of her as the Victorian "angel in
   the house" — see e.g. https://knarf.english.upenn.edu/Articles/mellor9.html.)

**Disclosure status:** partially correct, with one inconsistency to fix.
- The *edition label* correctly says `Original (1831)` and the edition-level `year` is `1831`. Good.
- But the *book-level* metadata in `bookRegistry.ts` (`FRANKENSTEIN`) says `year: 1818`. So the
  book card advertises 1818 while the text delivered is 1831. A reader who came for the 1818
  *Frankenstein* — a real and common preference, since the two differ substantively on Elizabeth,
  on Victor's culpability, and on the book's determinism — gets the other book without being told.
  **Recommend:** either change the book-level `year` to 1831, or (better) keep 1818 as the work's
  first-publication date but add a one-line disclosure in the onboarding copy: *"This is Shelley's
  revised 1831 text, which differs from the 1818 first edition in several substantive ways."*

Otherwise complete: all four Walton letters and all 24 chapters present in every edition.

## Shape of the modern-en edition

Uniform. Word overlap 0.59–0.71 across all 28 units, length ratio a consistent **0.80–0.88**
everywhere — i.e. a steady ~16 % trim applied evenly, not localised compression. No chapter was
skipped (only 1 identical long paragraph in the entire book), and no chapter was gutted.

My truncation scan (src ≥ 50 w, ratio < 0.70) returns 21 paragraphs, spread thinly over 15
different chapters, with the *worst* at 0.58. There is no cliff anywhere. This is the signature of a
translator who trims consistently — the question is only whether the trim is Shelley's redundancy
or Shelley's content.

## Samples inspected (7)

### 1. Letter 1 (Walton), paras 0–2 — STRONG

- SRC p2: `You will rejoice to hear that no disaster has accompanied the commencement of an
  enterprise which you have regarded with such evil forebodings.`
- MOD p2: `You'll be glad to hear that nothing has gone wrong at the start of this expedition you
  were so worried about.`

Complete and readable. (On `You'll`, see sample 7.)

### 2. Chapter 5 (file ch 9), paras 4–7 (the creation night) — STRONG

- SRC p4: `dreams that had been my food and pleasant rest for so long a space were now become a hell
  to me; and the change was so rapid, the overthrow so complete!`
- MOD p4: `Dreams that had been my nourishment and comfort for so long had become my hell. The
  change was so sudden, the collapse so complete!`

The Coleridge stanza at p7 (`Like one who, on a lonely road, / Doth walk in fear and dread…`) is
carried **verbatim**, which is correct — a quoted poem should not be modernized. Nothing lost across
four paragraphs.

### 3. Chapter 16 (file ch 20), paras 26–34 (the Creature's narration: William, and the barn) — GOOD, small losses

Register and content hold. Two items:
- p34 `‘Awake, fairest, **thy** lover is near—he who would give his life but to obtain one look of
  affection from **thine** eyes` → `'Wake, beautiful one — **your** lover is near…'` (see sample 7).
- p34 `not indeed so beautiful as her whose portrait I held` → `She wasn't as beautiful as the woman
  in the portrait` — fine.

### 4. Chapter 18 (file ch 22), para 17 (366 → 233 words) — the largest single trim — **LOCAL OMISSION**

Clerval's rhapsody on the Rhine.

- SRC (deleted): `…and the waves dash with fury the base of the mountain, **where the priest and his
  mistress were overwhelmed by an avalanche and where their dying voices are still said to be heard
  amid the pauses of the nightly wind**; I have seen the mountains of La Valais, and the Pays de
  Vaud`
- MOD: `I've seen Lake Lucerne whipped up by storms, with waterspouts and waves crashing against
  mountain bases. I've seen the mountains of the Valais and the Pays de Vaud.`

The avalanche legend — a complete small story, and the passage's only supernatural note — is gone.
Also cut: `the most verdant islands that relieve the eye by their gay appearance` and the
water-spout analogy's explanatory clause. This is the pattern behind the book-wide 16 % trim:
secondary images and subordinate qualifications get shaved. Individually small; cumulatively, a real
loss of texture across 75,000 words.

### 5. Chapter 20 (file ch 24), para 30 — the one mechanical flag (50 → 29 words) — **LOCAL OMISSION**

- SRC: `I was exceedingly surprised on receiving so rude an answer from a stranger, **and I was also
  disconcerted on perceiving the frowning and angry countenances of his companions.**`
- MOD: `I was extremely surprised by this rude answer.`

The companions' hostile faces — which is what makes the scene threatening rather than merely rude —
are deleted. Same shaving pattern as sample 4.

### 6. Chapter 24 (file ch 28), paras 78–81 (the Creature's last speech, the ending) — STRONG

263 → 233 and 125 → 114 words, with everything present: the funeral pile, `that its remains may
afford no light to any curious and unhallowed wretch`, `He is dead who called me into being`, the
final `He was soon carried away by the waves and lost in darkness and distance.` The strongest
passage in the edition.

One small drift: `and in this condition must I find my happiness` → `In that nothingness I must find
my peace` — **`nothingness` is added** (an interpretation of what "this condition" means) and
`happiness` is softened to `peace`, which loses the deliberate strangeness of the Creature seeking
*happiness* in annihilation.

### 7. **Cross-cutting finding: register flattening across all three narrators**

Frankenstein's whole architecture is three nested first-person voices. Two measurements show the
modern edition lowering all three toward a single contemporary register.

**(a) Contractions.** Shelley uses essentially none — the source has **1 contraction in 74,919
words**. The modern edition introduces them everywhere:

| narrator | source contractions / 1,000 w | modern contractions / 1,000 w |
|---|---|---|
| Walton (Letters 1–4) | 0.00 | **24.7** |
| Victor (chs 1–10) | 0.00 | **15.8** |
| The Creature (chs 11–16) | 0.00 | **13.6** |
| Victor + frame (chs 17–24) | 0.03 | **16.1** |

The *relative* ordering is defensible (Walton's private letters to his sister loosest, the Creature
tightest), so the three voices are not made identical — but all three are pulled well below
Shelley's uniform formality, and the Creature is the one who can least afford it: in the story he
learns English from *Paradise Lost*, Plutarch and *Werther*, and his diction is the evidence.

**(b) The thou/thee register shift is deleted entirely.** The source marks 13 paragraphs with
`thou / thee / thy / thine / wert / hadst` — always at heightened moments. The modern edition
contains **zero**. The clearest casualty is the Creature's central appeal on the Mer de Glace
(ch 10, file ch 14, para 11):

- SRC: `Remember, **thou hast** made me more powerful than **thyself**; my height is superior to
  **thine**, **my joints more supple**. But I will not be tempted to set myself in opposition to
  **thee**. I am **thy** creature, and I will be even **mild** and docile to my **natural lord and
  king** if **thou wilt** also perform **thy** part, the which **thou owest** me… I was benevolent
  and good; misery made me a **fiend**. Make me happy, and I shall again be **virtuous**.`
- MOD: `Remember: you made me more powerful than yourself. **I'm taller and stronger.** But I won't
  pit myself against you. I am your creature, and I'll be **obedient** and docile to my **natural
  master** — if you'll also fulfill your obligations to me… I was good and kind. Misery made me a
  **monster**. Make me happy, and **I'll be good again.**`

Beyond the lost archaism: `my joints more supple` becomes `stronger` (a different claim — the
Creature says he is taller and more *supple*, not stronger); `mild` becomes `obedient` (mildness is
offered, obedience is submission); `lord and king` — the Miltonic address — becomes `master`;
`fiend` becomes `monster`, dropping the novel's own keyword for him; `virtuous` becomes `good`.
None of these is large on its own; together they take the Creature's most important speech down one
whole register.

## Phase 1 flags: confirmed / disconfirmed

| flag | verdict |
|---|---|
| 1 truncation candidate (ch 24 p30) | **CONFIRMED, minor.** See sample 5. My own looser scan returns 21 paragraphs across 15 chapters, all mild (worst ratio 0.58) — consistent trimming, not chapter-scale loss. |
| mean similarity 0.542 (lowest in batch) | **Confirmed** — this is the most genuinely rewritten of the five. Low similarity here is a *good* sign, not a bad one. |
| 0.3 % identical long paragraphs | **Confirmed and benign** — 1 paragraph ≥ 25 words (ch 9 p7), and that is the Coleridge quotation, which *should* be identical. |
| alignment / no count mismatch | **Confirmed clean.** |
| last chapter short | **Disconfirmed** — 7,280 words, the longest chapter in the book. |
| **Not flagged mechanically but found:** 1831-vs-1818 metadata inconsistency; contraction/thou register flattening | Neither is visible to ratio-based screening. |

## Human-edition research (Phase 3)

English original; no translation-rights question.

- **Original, public domain.** The 1831 text is public domain in the US and the EU/Denmark (Shelley
  died 1851). Both the 1818 and 1831 texts are freely available: Project Gutenberg #84 (1831) and
  #41445 (the 1818 text), and Standard Ebooks publishes a proofed edition dedicated to the public
  domain under **CC0 1.0** (https://standardebooks.org/ebooks/mary-shelley/frankenstein).
- **Is the original already accessible enough to stand alone?** Less so than Austen. Shelley's prose
  is the most abstract and Latinate in this batch — long periodic sentences built on abstract nouns
  (`the commencement of an enterprise which you have regarded with such evil forebodings`) — and the
  16 % trim the modern edition applies produces a real, measurable clarity gain without gutting
  anything. This is the one book in the batch where I think a modern edition clearly earns its keep.
- **Human modern-English editions: none rights-clear found.** Only commercial learner/plain-English
  editions and adaptations. Recording as "none found in this search", not "none exists".
- **A rights-clear alternative that *is* worth considering:** offering the **1818 text** as a second
  "original" edition (PD, Gutenberg #41445). That is a content decision, not a translation decision,
  but it would resolve the metadata problem above by making the choice explicit to the reader.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40 % | **4** |
| first-read clarity | 25 % | **5** |
| literary voice | 20 % | **3** |
| restraint / no invention | 10 % | **4** |
| naturalness | 5 % | **5** |

**Weighted score 4.1 — band: Good with fixes.**

Fidelity 4: no chapter-scale loss and no fabricated content anywhere I looked, but the consistent
shaving of secondary images and qualifications (samples 4 and 5) is a recurring, if mild, pattern.
Voice 3: the contraction and thou/thee flattening is book-wide and measurable, and it costs the
Creature most. Restraint 4 for the small additions (`nothingness`, `if you must`).

## Recommendation

**LIGHT EDIT** — confidence **medium**, correction scope **local** (with one book-wide voice pass).

This is the healthiest modern-en in the batch and it should be kept. Scoped work:

1. **Metadata (do this first, it is 2 minutes and it is a correctness issue):** reconcile
   `FRANKENSTEIN.year = 1818` with the 1831 text actually shipped, and disclose the 1831 revision in
   the onboarding copy.
2. **Voice pass:** restore the Creature's elevated register — de-contract his speeches, and restore
   the marked address in the 13 thou/thee paragraphs by some modern means (e.g. keeping the formality
   and the `lord and king` / `fiend` / `virtuous` vocabulary rather than the archaic pronouns).
   Consider lowering Walton's 24.7/1,000 contraction rate toward the rest.
3. **Restore shaved content** in the 21 under-length paragraphs my scan lists — starting with the
   avalanche legend (ch 18 / file ch 22 p17) and the hostile companions (ch 20 / file ch 24 p30).

I am *not* recommending RETRANSLATE: the recurring defect (trimming) is mild and the edition's
clarity gain is real and evenly delivered. Re-generating would risk the good work.

## Limitations of this review

- 7 sampled locations out of 28 units; ~20 paragraph pairs read in full. The contraction and
  thou/thee counts are full-text measurements over all 764 paragraph pairs, as are the length-ratio
  and identical-paragraph statistics, so the *shape* claims are solid.
- I read the Creature's narration (chs 11–16) at two points only; his justice/Felix-and-Safie
  material (file chs 17–19) was not opened, and that is where his self-taught diction is most on
  display. That would be my next sample.
- Equal-length invention is invisible to every check I ran; I found none in what I read, but cannot
  rule it out.
- I did not inspect `modern-da`.
- I did not diff our `original-en` against a canonical 1831 text word-for-word — the 1831
  identification rests on chapter count plus the Elizabeth-origin passage, which is decisive for
  *which edition* but does not prove the transcription is error-free.
