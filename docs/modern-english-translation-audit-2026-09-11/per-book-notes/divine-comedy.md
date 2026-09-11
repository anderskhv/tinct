# divine-comedy — The Divine Comedy (Dante Alighieri)

**Scope:** public
**Reviewer:** batch agent, long-form verse epics, 2026-09-11

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en — "Longfellow Translation (1867)", tr. Henry Wadsworth Longfellow | `494a37942b0005c1` | 100 | 4812 | 111,060 |
| modern-en — "Modern English" | `5938ed2727d6a26e` | 100 | 4812 | 109,841 |
| modern-da — "Moderne Dansk" | `d46657c4f927cb42` | 100 | 4812 | 106,455 |

`en_editions_aligned: true`. Sections: Inferno (ch 1–34), Purgatorio (ch 35–67), Paradiso (ch 68–100) — all 100 cantos present, correct three-canticle division.

## Provenance / completeness of the core English text

The `original-en` file is genuinely Longfellow's 1867 blank-verse translation, as labelled — spot-checked against the known opening ("Midway upon the journey of our life / I found myself within a forest dark") and against distinctive Longfellow readings ("The variegated skin of that wild beast", "Tully and Livy, and moral Seneca"). Public domain. Complete: 34 + 33 + 33 cantos.

**Structural note:** each JSON "paragraph" is one *terzina* (3 lines). `modern-en` preserves this one-tercet-per-paragraph mapping exactly (4812 = 4812), rendering each tercet as running prose. Tercet-level alignment is therefore intact and split-pane will work. The verse→prose conversion is a real transformation (terza rima, lineation and Longfellow's inversions all go), but Dante's images, similes and proper names largely survive it — see samples.

## Phase 1 flags: confirmed vs. disconfirmed

- `truncated_paragraphs_total: 8` (all short tercets). I inspected 3 of the 8.
  - **ch 1 / para 14 (ratio 0.44) — CONFIRMED as a content problem, though not an omission.** Content moved into para 13, but with a reversed logical relation (below).
  - **ch 49 (Purgatorio 15) / para 1 (ratio 0.29) — CONFIRMED as an image loss.** Longfellow's "that sphere / Which aye in fashion of a child is playing" (Dante's *la spera / che sempre a guisa di fanciullo scherza*) is simply gone from modern-en para 0; the tercet is compressed to "that much appeared to remain of the sun's course before nightfall."
  - **ch 87 (Paradiso 20) / para 48 (ratio 0.54) — DISCONFIRMED.** The material ("Even as the winking of the eyes concords") is present, shifted one paragraph forward into para 49 ("Like eyes blinking in harmony"). Nothing lost.
- `pct_identical_long_paragraphs: 0.0` — confirmed; I found no passage left in Longfellow's language. This is a genuine modernization, not a reflow.
- `mean_weighted_similarity: 0.4045` — consistent with what I saw: substantive rewriting throughout, evenly, with no book/canticle left under-modernized (unlike paradise-lost and beowulf in this same batch).
- `last_chapter_suspiciously_short: false` — confirmed, Paradiso 33 is 1,100 words and ends on "By the Love that moves the sun and the other stars."

## Samples inspected (11 locations across all three canticles)

### 1. Inferno 1 (ch 1), paras 0–17 — opening — STRONG, with one confirmed logic error

Strong overall: "Midway upon the journey of our life / I found myself within a forest dark" → "Halfway through the journey of my life, I found myself lost in a dark forest, for the straight path ahead had vanished." The *lonza*/lion/she-wolf sequence, the swimmer simile, the "firm foot ever was the lower" detail ("always keeping my lower foot firmly planted") are all preserved.

**Finding — altered logical relationship (paras 12–14).**
Source (para 13–14): *"So were to me occasion of good hope, / The variegated skin of that wild beast, // The hour of time, and the delicious season; / But not so much, that did not give me fear / A lion's aspect which appeared to me."*
Modern (para 13–14): *"The early hour and the sweet season gave me reason to hope, despite the beast's dappled hide."* / *"But that hope was short-lived, for a lion appeared before me."*

In Dante the leopard's spotted hide is one of the three *causes* of hope, alongside the hour and the season. "despite" reverses that relation and drops the spotted skin from the list. This is exactly the kind of logical distinction the standard asks to be preserved. Local, one-line fix.

### 2. Inferno 3 (ch 3), paras 0–11 — the gate of Hell — STRONG

"Through me the way is to the city dolent" → "Through me you enter the city of suffering", and "All hope abandon, ye who enter in!" → "Abandon all hope, you who enter here." The scholastic triad (Power / highest Wisdom / primal Love) is kept exactly, as is "who have lost the good of the intellect" — the doctrinally loaded phrase is not paraphrased away. The whirlwind-of-sand simile survives.

### 3. Inferno 4 (ch 4), paras 35–46 — Limbo, the name-dense catalogue — STRONG

Every name survives and none is invented: Electra, Hector, Aeneas, Caesar, Camilla, Penthesilea, Latinus, Lavinia, Brutus, Lucretia, Julia, Marcia, Cornelia, Saladin, Socrates, Plato, Democritus, Diogenes, Anaxagoras, Thales, Zeno, Empedocles, Heraclitus, Dioscorides, Orpheus, Livy, Seneca. "Tully" is normalised to "Cicero" — a correct and helpful modernization of an alternate name with no literary function. The seven walls / seven gates numerology is intact.

### 4. Inferno 11 (ch 11), paras 0–11 — the moral architecture of Hell — STRONG

The passage where Dante's whole structural scheme is stated survives precisely: force vs. fraud, fraud lower because it is "man's peculiar vice" → "a sin unique to humans", the three rings of the violent (against God, self, neighbour), Pope Anastasius and Photinus named. No vague gesturing where the source specifies.

### 5. Inferno 5 (ch 5), paras 30–41 — Francesca — STRONG, one narrowing

The triple *Amor* anaphora is preserved as a triple "Love, which…/Love, which…/Love led us…". Caina is kept, not glossed away. "There is no greater sorrow / Than to be mindful of the happy time / In misery" → "There is no greater sorrow than to remember happiness in a time of misery" — clean.

Minor: "for the person beautiful / That was ta'en from me" → "for the beautiful body that was torn from me". Italian *bella persona* will bear "body", but it narrows Longfellow's word and adds a physical reading the source leaves open.

### 6. Inferno 33 (ch 33), paras 5–16 — Ugolino — STRONG, one interpretive choice

The dream (wolf and whelps, Gualandi/Sismondi/Lanfranchi, the mountain "for which the Pisans cannot Lucca see"), the Tower of Hunger, little Anselm's line — all present, all specific.

Note: "And I heard locking up the under door" → "I heard the lower door of the horrible tower being **nailed shut**". Dante's *chiavar* is a famous crux (lock / nail up); "nailed shut" picks one reading and is *not* what the stated source says. Defensible, but it is an interpretation added at a point where the source was neutral.

### 7. Inferno 34 (ch 34), paras 20–31 — Lucifer and the climb out — STRONG

Judas/Brutus/Cassius correctly assigned to the three mouths; the gravity-inversion at the centre (the point "beyond which I had passed") is preserved rather than explained away — which is the hard part of this canto.

### 8. Purgatorio 15 (ch 49), paras 0–7 — mechanical outlier — ONE IMAGE LOST

See flags above. The reflection-of-light simile ("as demonstrate experiment and art" → "as both experiment and theory demonstrate") is well handled; only the "sphere that plays like a child" image is dropped.

### 9. Purgatorio 30 (ch 64), paras 30–39 — Beatrice's rebuke — STRONG

"The ice, that was about my heart congealed, / To air and water changed" → "the ice that had frozen around my heart turned to air and water, and in anguish it burst from my chest through my mouth and eyes." Astrological causation ("the great wheels… according to the stars' conjunction") and the theological distinction between natural endowment and grace both survive intact — this is dense doctrine and it is not blurred.

### 10. Paradiso 1 (ch 68), paras 0–9 — STRONG

Apollo, Parnassus's two peaks, Marsyas flayed "from the sheath of his own limbs", the laurel — all kept, none over-explained. The famous ineffability topos ("our intellect… plunges so far inward that memory cannot follow where it goes") is clear without being flattened.

### 11. Paradiso 20 (ch 87) and Paradiso 33 (ch 100) — STRONG

Par 33's closing vision — the three circles of one dimension, "as rainbow is by rainbow", the geometer squaring the circle, the flash of lightning, and the final line "By the Love that moves the sun and the other stars" — is rendered with the imagery fully intact.

One small anti-modernization at Par 20 para 47: Longfellow's "as good singer a good lutanist / Accompanies" becomes "as an accomplished **citharist** accompanies a good singer". "Citharist" is *less* accessible than the source word, the opposite of the brief's direction.

## Phase 3 — human-edition research

The underlying poem is public domain; the question is only which English text.

**Candidate A — Charles Eliot Norton, prose (Houghton Mifflin, 1891–92; rev. 1902).**
- Project Gutenberg: Hell https://www.gutenberg.org/files/1995/1995-h/1995-h.htm (also #1996 Purgatory, #1997 Paradise).
- Complete, all 100 cantos, prose, organised canto-by-canto (so canto-level alignment is trivial; tercet-level alignment would be work).
- Rights: **public domain** (US); Project Gutenberg licence statement verified on the page. Author d. 1908, so life+70 expired in the EU/Denmark as well.
- Read a sample: *"Midway upon the road of our life I found myself within a dark wood, for the right way had been missed. Ah! how hard a thing it is to tell what this wild and rough and dense wood was, which in thought renews the fear! So bitter is it that death is little more."*
- Verdict: readable and accurate, but still late-Victorian in rhythm ("for the right way had been missed"). **It is not clearly more accessible than the existing modern-en**, and it is less accessible than it in several places. Its real advantage would be provenance (a named human translator) rather than clarity.

**Candidate B — Standard Ebooks edition of Longfellow** (https://standardebooks.org/ebooks/dante-alighieri/the-divine-comedy/henry-wadsworth-longfellow), CC0 / US public domain. This is the *same* translation we already carry as `original-en`, better typeset. Useful if we ever want to refresh the source file; not a modern-en candidate.

**Not found in this search:** a complete, rights-clear, genuinely contemporary human English Dante. The well-known readable modern versions (Mandelbaum, Hollander, Musa, Esolen, Kirkpatrick, Bang) are all in copyright and would require permission. I did not attempt to contact any rightsholder.

## Ratings

| dimension | weight | score | reason |
|---|---|---|---|
| fidelity / completeness | 40% | **4** | No omissions of scene, argument or name in 11 samples; two confirmed local defects (Inf 1 logic reversal; Purg 15 dropped simile) |
| first-read clarity | 25% | **5** | Consistently readable contemporary prose; no passage in the samples left in 1867 diction |
| literary voice | 20% | **4** | Imagery, similes and doctrinal precision survive; terza rima and Longfellow's cadence do not (inherent to the prose choice, and not disclosed to the reader anywhere) |
| restraint / no invention | 10% | **4** | Three interpretive narrowings noted ("body", "nailed shut", "citharist"); no fabricated content |
| naturalness | 5% | **5** | Reads as written English, not as translationese; no mechanically short sentences |

**Weighted score: 4.3 — Good with fixes.**

## Recommendation

**LIGHT EDIT.** Confidence: **medium-high** for the sampled material; the samples covered all three canticles and both narrative and doctrinal registers, but 11 of 100 cantos is 11% coverage — I have not verified the other 89.

Correction scope: **local.** Specifically:
1. Inferno 1, tercets 13–14 — restore the leopard's hide as a *cause* of hope, not a concession.
2. Purgatorio 15, tercet 0 — restore the "sphere that plays like a child" image.
3. Sweep the remaining 5 flagged truncations (ch 8/5, 9/4, 18/3, 23/13, 33/10) for the same class of dropped simile.
4. Replace "citharist" (Par 20) with a word a general reader knows.
5. Consider a one-line edition note telling readers modern-en is prose, one paragraph per tercet.

## Limitations of this review

- I did not check `modern-da` at all.
- I did not compare against the Italian original — every judgement is modern-en against Longfellow, as instructed.
- 11 of 100 cantos inspected (~11%); 3 of 8 mechanical truncation flags opened.
- I did not check audio, onboarding JSON, threads JSON, or how the edition renders in the app.
- Norton was assessed from one Gutenberg sample of Inferno I plus the header licence statement; I did not read Purgatorio/Paradiso in his version.
