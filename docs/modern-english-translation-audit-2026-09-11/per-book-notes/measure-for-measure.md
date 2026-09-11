# measure-for-measure — Measure for Measure (William Shakespeare)

Batch B5 · reviewed 2026-09-11 · scope: public

## Edition snapshot (from Phase 1 `mechanical/measure-for-measure.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `b99ee3fc8f98dca8` | 17 | 1,006 | 23,200 | Shakespeare (1623) |
| modern-en | `d0e5a5ae2cf437bb` | 17 | 1,006 | 23,245 | Modern English |
| modern-da | `f5e4e26b9dc5ac80` | 17 | 1,006 | 23,562 | Moderne Dansk |

`mean_weighted_similarity` 0.7236 · `pct_identical_long_paragraphs` 0.0% ·
0 truncation flags · 0 empty paragraphs · 0 chapter/paragraph mismatches ·
`en_editions_aligned: true` · not on the Phase 1 "closer attention" list.

**The 0.0% identical-paragraph figure is misleading for this book** and is the
single most important thing this review adds to the Phase 1 screen — see below.

## Provenance of the core English text — and a source-quality problem

Registry label: **"Shakespeare (1623)", year 1623**. Wrong, and wrong in a
different way than the other Shakespeare books in this batch.

Unlike `julius-caesar`, `twelfth-night` and `henry-iv-part-2` (all
Project Gutenberg #100), this file comes from a **different textual source
entirely**: a transcription of the **Clark & Wright Cambridge/Globe text**, and
it still carries that edition's **editorial apparatus**:

- Abbreviated, italic-marked speaker tags: `_Duke._`, `_Escal._`, `_Ang._`,
  `_Isab._`, `_Prov._`, `_Pom._` — not the `DUKE.` convention used by the other
  three plays.
- **Globe line numbers embedded in the running text**, at five-line intervals:

  > `_Duke._ Of government the properties to unfold, Would seem in me to affect
  > speech and discourse; Since I am put to know that your own science
  > 5 Exceeds, in that, the lists of all advice…`

- **407 of 1,006 paragraphs (40.5%) contain this line-number debris.**
- 2,150 underscore characters across the file. `ParagraphRenderer.tsx` does not
  convert `_` to italics, so all of this renders **literally** in the reader.

Project Gutenberg #100 contains a clean Measure for Measure (verified: the
crux line appears there as `But that, to your sufficiency, as your worth is
able,` with full speaker names and no line numbers), so this is an avoidable
ingestion choice, not a limitation of the public-domain corpus.

Completeness: **complete** as to scenes — 17 chapters = Acts 1–5, all 17
scenes, real Act/Scene + location chapter titles (verified as real scene labels,
not apparatus).

Rights: public domain.

## Whole-corpus mechanical check run for this review — the decisive finding

The Phase 1 metric counts only **byte-identical** paragraphs. Because this
source carries line numbers and `_` markup, *no* paragraph can be byte-identical
in modern-en, so Phase 1 reports 0.0% and the book was not flagged. Recomputing
with normalization (strip `_`, strip line numbers, strip speaker tag, lowercase,
punctuation-insensitive, paragraphs ≥25 source words):

- **65.0% of substantial paragraphs are ≥0.85 similar to the source
  (64.1% by word share).**

For comparison, in the same batch and with the same measure: Julius Caesar
9.6%, Twelfth Night 21.9%, Henry IV Pt 2 51.7%, Merry Wives 56.1%.

Nearly two thirds of this "Modern English" edition is the source text with
`thou/thee/thy` converted to `you/your`, contractions expanded, and spelling
regularized. That is a **LIGHT/MECHANICAL modernization**, and the samples below
show it lands on exactly the passages a first-time reader needs most.

## Samples inspected (5 passages + one whole-scene pass, ~3,000 source words,
one per act, including comic prose and high-register verse)

### 1. Act 1 Scene 1 (ch1, paras 0–11) — opening; high-register verse

Good news first: modern-en **cleans the apparatus**. `_Duke._` → `DUKE.`, line
numbers removed, `_Enter DUKE, ESCALUS, _Lords_ and _Attendants_._` →
`[Enter DUKE, ESCALUS, Lords and Attendants.]`. As a reading text the modern-en
is markedly better presented than the original-en it sits beside.

**Confirmed finding (invention — a textual lacuna silently filled).** The source
carries the play's famous corrupt line with the Globe edition's ellipsis:

> `_Duke._ … then no more remains, But that to your sufficiency
> . . . . . . . . . . . . . . . . . . . . as your worth is able, And let them
> work.`

modern-en:

> `DUKE. … So nothing remains but to trust your sufficiency to act as your worth
> allows, and let your judgment do its work.`

The gap is not merely smoothed — it is filled with a confident reading
("to trust your sufficiency", "let **your judgment** do its work") and the
reader is given no signal that the text is defective at this point. The
antecedent of "them" is supplied as "your judgment", which the source does not
state. For comparison, the Standard Ebooks edition of the same text prints it
as `But that to your sufficiency⁠— / —as your worth is able,` keeping the break
visible.

**Confirmed finding (added term).** Source para 8:

> Mortality and mercy in Vienna Live in thy tongue and heart

modern-en:

> Life and death, mercy and justice in Vienna live on your tongue and in your
> heart.

A two-term doublet becomes a four-term phrase, and **"justice" is added** — a
word that carries real thematic weight in this particular play. This is an
invention, not a gloss.

### 2. Act 2 Scene 1 (ch5, paras 20–45) — Elbow, Pompey and Froth; the play's
main comic-prose scene

**Confirmed finding (flattened joke; the scene's central device destroyed).**
Elbow is a malapropist; Escalus says so on stage ("Do you hear how he
misplaces?"). modern-en keeps the first malapropism —

> `_Elb._ My wife, sir, whom I detest before heaven and your honour,--`
> → `ELBOW. My wife, sir, whom I detest before heaven and your honour—`

— but **silently corrects the second**:

> `_Elb._ Marry, sir, by my wife; who, if she had been a woman cardinally
> given, might have been accused in fornication, adultery, and all
> uncleanliness there.`

modern-en:

> `ELBOW. By Mary, sir, by means of my wife; who, if she had been **carnally
> inclined**, might have been accused there of fornication, adultery, and every
> uncleanness.`

"Cardinally" for "carnally" *is* the joke. Fixing it removes one of the two
malapropisms Escalus's line is pointing at, and leaves that line half-stranded.

**Minor finding (naturalness).** "Marry," is rendered as "**By Mary**" here and
throughout this book (and in `merry-wives-of-windsor` and `henry-iv-part-2`).
It is a half-gloss that is neither the source's idiom nor natural modern
English; Julius Caesar's modern-en handles the same word far better ("Yes,
indeed", "Well").

### 3. Act 2 Scene 2 (ch6, paras 52–71) — Isabella pleads with Angelo; the
play's moral hinge

**Confirmed pattern (old language left essentially unchanged).** The pivot of
Angelo's fall is delivered untouched:

> `_Ang._ [_Aside_] She speaks, and 'tis Such sense, that my sense breeds with
> it.`
> → `ANGELO. [Aside] She speaks, and it is such sense, that my sense breeds
> with it.`

The double meaning of "sense" (reason / sensuality) — the whole point of the
line — gets no help at all. Likewise "That skins the vice o' the top" → "that
skins over the vice on the surface" (image retained, opacity retained);
"Not with fond shekels of the tested gold" → "Not with foolish shekels of the
assayed gold" (one word glossed, the construction untouched).

**Minor finding (garbled reading).** `_Lucio._ Art avised o' that?` → `LUCIO.
Are you wise to that?` — "avised" is *advised / aware*. The modern reading is
passable colloquially but is not what the line says.

Credit where due: restraint is genuinely good here. Nothing is added to
Angelo's aside, and Isabella's arguments are not tidied into a position.

### 4. Act 3 Scene 1 (ch9, paras 0–4 and 35–57) — "Be absolute for death" and
Claudio's "Ay, but to die"; the two hardest speeches in the play, taken as the
"difficult passage" sample

This is the clearest demonstration of the problem. Claudio's speech, source
para 43, and modern-en para 43, differ **only** in `Ay`→`Yes`,
`incertain`→`uncertain`, `imagine`→`imagines`, `'tis`→`it is`,
`imprison'd`→`imprisoned`. Everything a modern reader would stumble on is
still there: "cold obstruction", "this sensible warm motion", "a kneaded clod",
"the delighted spirit", "thrilling region of thick-ribbed ice", "the viewless
winds", "the pendent world".

The Duke's speech (para 3) is the same story — a `thou`→`you` pass over
"servile to all the influences of the sky", "the soft and tender fork of a poor
worm", "the gout, serpigo, and the rheum", "the alms of palsied old age".
**"Serpigo" is left entirely unglossed.**

**Confirmed finding (mistranslation).** Source: "merely, thou art death's
fool". modern-en: "**To put it plainly**, you are death's fool." Here "merely"
means *utterly / absolutely*, not *to speak plainly*. The logical force of the
line is inverted from an absolute claim to a rhetorical aside.

### 5. Act 5 Scene 1 (ch17, paras 168–185) — the ending

**Ambiguity is correctly preserved** — the batch brief's specific caution for
this play is met. Isabella's silence after the Duke's proposal is untouched; no
stage direction, gloss or hint is added; Angelo's and Lucio's punishments are
left exactly as unsettled as the source leaves them. Restraint is a genuine
strength of this edition.

But the play's **final speech is essentially unmodernized**: "There's more
behind that is more **gratulate**", "I have a motion much imports your good;
whereto if you'll a willing ear incline", "what's yet behind, that's meet you
all should know" all pass straight through. A reader who has stayed with the
play to the last page is handed the most opaque forty words in it.

## Phase 1 flags confirmed / disconfirmed

- `pct_identical_long_paragraphs: 0.0%` — **technically confirmed but
  editorially disconfirmed.** Byte-identity is impossible against this source
  because of its embedded line numbers and `_` markup; normalized comparison
  gives **65.0%**. Recommend the Phase 1 script normalize before measuring, or
  this class of book will keep passing the screen.
- `truncated_paragraphs_total: 0` — **confirmed**; no compression or omission
  found in any sample. Content fidelity really is high.
- `mean_weighted_similarity 0.7236` — **confirmed and meaningful**: it is the
  second-highest in this batch and it did signal the right thing, but it sat
  below the 0.90 screening threshold and so raised no flag.
- `chapter/paragraph mismatch: 0`, `en_editions_aligned: true` — **confirmed**
  across five chapters by index-aligned reading.
- Chapter titles verified as real Act/Scene labels with locations, **not**
  apparatus debris. (The debris in this book is inside the paragraphs, not the
  titles.)

## Phase 3 — human-edition research

**Is the original already accessible?** No. This is the least accessible of the
five plays in the batch: dense Jacobean verse, a known textual crux in the first
scene, legal and theological vocabulary, and prose comedy built on malapropism.
"SOURCE + GLOSSES" is not an adequate answer here.

Human modern-English **translations**:

1. **No Fear Shakespeare (SparkNotes)** — complete, facing-page modern prose.
   **Fully copyrighted.** Rejected on rights.
2. **Shakescleare (LitCharts)** — complete. **Fully copyrighted.** Rejected.
3. **Folger Shakespeare digital texts** — modernized-spelling *original*, not a
   translation; **CC BY-NC 3.0** (verified at
   https://www.folger.edu/copyright-policy/ — "you may not use the material
   from Folger Digital Texts for commercial purposes"). Noncommercial
   restriction blocks Tinct's paid tier. Would need a licence from
   editions@folger.edu.
4. **Lamb, *Tales from Shakespeare* (1807)** — public domain
   (https://www.gutenberg.org/ebooks/573), and it *does* cover Measure for
   Measure. But it is an abridged prose retelling with the sexual content
   written out; not complete, not a translation. Rejected on completeness.

**No complete, readable, rights-clear human modern-English translation was
found in this search.** "None found in this search", not "none exists".

Human edition for the **original-language** text — and here there is a clear,
actionable win:

- **Standard Ebooks, *Measure for Measure*** —
  https://standardebooks.org/ebooks/william-shakespeare/measure-for-measure —
  **CC0 1.0 Universal public-domain dedication**, page scans cited to
  HathiTrust, based on **the same Clark & Wright 1887 Victoria edition (from the
  Globe edition)** that Tinct's original-en already derives from. Verified by
  opening the text (`/text/single-page`): full speaker names, **no line
  numbers**, no `_` markup, and the 1.1 lacuna printed as
  `But that to your sufficiency⁠— / —as your worth is able,` so the reader can
  see the text is defective.

  This is a **drop-in replacement for the corrupted original-en**, same textual
  family, rights-clear for commercial use, and it fixes a defect affecting 40%
  of the paragraphs. Alignment work would be required (paragraph/line
  segmentation differs), which per the brief is noted as work, not a quality
  strike. Project Gutenberg #100's Measure for Measure is an equally valid,
  equally free alternative.

## Phase 4 — rating

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 4 |
| first-read clarity | 25% | 2 |
| literary voice | 20% | 3 |
| restraint / no invention | 10% | 3 |
| naturalness | 5% | 3 |

**Weighted score 3.2 — band: Mixed.**

Fidelity 4: no omissions or compressions found anywhere, but three confirmed
inventions/alterations (the filled lacuna, the added "justice", the "merely"
mistranslation). Clarity 2: 65% near-verbatim, and the failure falls on the
most demanding speeches. Voice 3: ambiguity and moral weight preserved (a real
strength), comic register flattened. Restraint 3 and naturalness 3 as above.

## Recommendation

**RETRANSLATE** — confidence **high**, correction scope **substantial**.

The defect is **recurring, not local**: it is present in every act I sampled
and is confirmed across the whole corpus by the 65.0% / 64.1% near-verbatim
measurement. A light edit cannot fix a two-thirds-unmodernized text; the
verse needs to be rewritten with the same care the Julius Caesar edition shows.

Two things to preserve in any retranslation, because the current edition gets
them right: the ending's ambiguity, and the refusal to editorialize Angelo,
Isabella or the bed-trick.

Two prerequisites, both independent of the translation work:

1. **Replace `measure-for-measure-original-en.json`.** It is not a 1623 text,
   it carries Globe line numbers in 40.5% of its paragraphs and 2,150 literal
   underscores, and the app renders all of it. Use Standard Ebooks (CC0) or
   PG#100. Doing this *before* retranslating also gives the new modern-en a
   clean base to align against.
2. **Correct the registry provenance label** — "Shakespeare (1623)" / year 1623
   is not what this file is.

## Limitations of this review

- 5 of 17 scenes sampled line by line (~3,000 of 23,200 source words, ~13%),
  covering Acts 1, 2, 3 and 5. **Act 4 was not read** (ch11–ch16: the moated
  grange, the bed-trick arrangements, Barnardine, the head of Ragozine). Given
  the corpus-wide near-verbatim rate I expect the same pattern there, but I did
  not verify it.
- The 65.0% figure is a mechanical measure of *non-change*. It does not itself
  prove a passage is unreadable, and it cannot detect omission or invention —
  those findings come from the samples only.
- I did **not** review `modern-da`, audio alignment, onboarding JSON or cast
  JSON. I did **not** attempt a full diff of Tinct's original-en against
  Standard Ebooks or PG#100 beyond the passages quoted.
- Rights research is a documentary review, not legal advice. I did not resolve
  whether a commercial licence from the Folger is obtainable or affordable, and
  I did not separately analyse EU/Danish treatment of CC0 (CC0 is designed to
  function in both jurisdictions, but I did not verify that for Denmark
  specifically).
