# henry-iv-part-2 — Henry IV, Part 2 (William Shakespeare)

Batch B5 · reviewed 2026-09-11 · scope: public

## Edition snapshot (from Phase 1 `mechanical/henry-iv-part-2.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `5312386825366dc9` | 19 | 1,081 | 26,974 | Shakespeare (1600) |
| modern-en | `5488605e212b451b` | 19 | 1,081 | 27,330 | Modern English |
| modern-da | `789c2f3e84b5af3f` | 19 | 1,081 | 27,654 | Moderne Dansk |

`mean_weighted_similarity` 0.7724 (highest in this batch) ·
`pct_identical_long_paragraphs` 2.0% · 0 truncation flags · 0 empty
paragraphs · 0 chapter/paragraph mismatches · `en_editions_aligned: true` ·
not on the Phase 1 "closer attention" list.

## Provenance — and a confirmed missing scene

Registry label: **"Shakespeare (1600)", year 1600** (the Quarto). Not accurate:
the file is a transcription of **Project Gutenberg #100**, a modernized Complete
Works text. Verified by direct comparison against
`https://www.gutenberg.org/cache/epub/100/pg100.txt`.

### The INDUCTION is missing

**This is the most serious finding in the batch.** The play as printed —
including in the very PG#100 file Tinct's text was cut from — opens with an
**Induction spoken by Rumour** ("Open your ears; for which of you will stop /
The vent of hearing when loud Rumour speaks?"), ~40 lines / **~310 words**,
before Act 1 Scene 1.

It is absent from **all three** Tinct editions (original-en, modern-en,
modern-da). chapter 1 begins directly with `Enter Lord Bardolph.` and
`LORD BARDOLPH. Who keeps the gate here, ho?`

Evidence:

- PG#100 contains it in full at line 46034ff, under the heading `INDUCTION`,
  with the location `Warkworth. Before the castle.` (confirmed by grep on the
  downloaded file).
- Folger Shakespeare publishes it as a distinct section
  (https://www.folger.edu/explore/shakespeares-works/henry-iv-part-2/read/IND/),
  as does Standard Ebooks (verified by opening
  https://standardebooks.org/ebooks/william-shakespeare/henry-iv-part-ii/text/single-page).

The cause is almost certainly the chapter parser: PG#100 heads the section
`INDUCTION`, not `ACT … SCENE …`, so it was skipped. The tell is still visible
in the data — **chapter 1's title is `Act 1, Scene 1 — The same`**, which is
PG's `SCENE I. The same.` and refers back to the Induction's
`Warkworth. Before the castle.` With the Induction gone, "The same" points at
nothing. That dangling title is exactly the editorial-apparatus debris the
batch brief asked me to watch for, and here it is a *symptom* of the omission.

The Epilogue **is** present (ch19 paras 51–54) and complete.

Completeness: **incomplete** — 19 chapters = Acts 1–5 (18 scenes) + Epilogue;
Induction absent.

Rights: public domain.

## Whole-corpus mechanical check run for this review

Normalized per-paragraph similarity (strip markup/speaker tag, lowercase,
punctuation-insensitive, paragraphs ≥25 source words):

- **51.7% of substantial paragraphs are ≥0.85 similar to the source
  (51.1% by word share).**

Batch comparison: Julius Caesar 9.6%, Twelfth Night 21.9%, Henry IV Pt 2
**51.7%**, Merry Wives 56.1%, Measure for Measure 65.0%.

Just over half of this "Modern English" edition is the source with `thou/thee/
thy` → `you/your`, `hath/doth` → `has/does`, and elided endings spelled out.

## Samples inspected (6 passages, ~4,000 source words, one per act, both
registers)

### 1. Act 1 Scene 1 opening (ch1, paras 0–5) — checked specifically for the
Induction

Confirmed absent, as above. Within the scene itself the modernization is light
but unobjectionable: `LORD BARDOLPH. Tell thou the Earl That the Lord Bardolph
doth attend him here.` → `Tell the Earl that Lord Bardolph is waiting for him
here.`

### 2. Act 3 Scene 1 (ch8, paras 8–15) — the King's insomnia scene; high
register verse

Near-verbatim. Source para 12 → modern-en para 12 differ essentially only in
`O`→`Oh`, `'Tis`→`It's`, `toil'd`→`toiled`, `chance's mocks`→`chance's
mockings`. Everything opaque survives: "the beachy girdle of the ocean too wide
for Neptune's hips", "fill the cup of alteration with various liquors", "in two
years after were they at wars" → "within two years after they were at war"
(the one real change). Warwick's reply (para 15) keeps "lie treasured in their
seeds and weak beginnings" and "the hatching and brood of time" untouched.

### 3. Act 3 Scene 2 (ch9, paras 30–51) — Shallow, Silence and the recruits;
Falstaff comic prose

**Confirmed finding (no register differentiation).** The batch brief asked
specifically whether the tavern/comic prose and the political verse get
distinct voices. They do not: both receive the same light word-swap pass.

> `FALSTAFF. Prick him.` → `FALSTAFF. Prick him.`
> `FALSTAFF. Go to. Peace, Mouldy; you shall go. Mouldy, it is time you were
> spent.` → `FALSTAFF. Get on. Peace, Mouldy; you shall go. Mouldy, it is time
> you were spent.`

"Prick" (= mark on the muster roll, with the obvious bawdy second sense),
"spent", "Things that are mouldy lack use" — the entire run of jokes in the
scene passes through with no help and no gloss. A first-time reader cannot tell
"Prick him" is an administrative instruction.

**Minor finding (naturalness / consistency).** "Marry, have we, sir" → "**By
Mary**, we have, sir"; "Yea, marry, sir" → "Yes, **by Mary**, sir". The same
tin-eared half-gloss appears in `measure-for-measure` and
`merry-wives-of-windsor` but not in `julius-caesar`.

### 4. Act 4 Scene 5 (ch14, paras 20–47) — the crown scene; the play's emotional
centre and its longest verse speeches

The King's rage (para 43) and the Prince's reply (para 44) and the King's
deathbed counsel (para 45) are all `thou`→`you` passes. Retained untouched:
"my cloud of dignity is held from falling with so weak a wind", "compound me
with forgotten dust", "England shall double-gild his treble guilt", "the moist
impediments to my speech", "give entertainment to the might of it", "preserving
life in drinkable medicine", "all the soil of the achievement goes with me into
the earth", "since griefs are green", "by whose fierce working I was first
advanced". The one substantive gloss in 900 words is `med'cine potable` →
`drinkable medicine`, which is not a gloss so much as a translation of the
Latinism into another opaque phrase.

**Positive observation (speaker-tag disambiguation).** modern-en renames the
source's `KING.` to `HENRY IV.` here and to `HENRY V.` in Act 5 Scene 5. This
diverges from the source convention but is a genuine reading aid in a play
where the crown changes hands, and it is applied consistently. Worth keeping.

### 5. Act 5 Scene 5 (ch19, paras 24–35) — the rejection of Falstaff

**Confirmed finding (half-applied modernization inside a single speech).**
Source para 30 opens `KING. I know thee not, old man. Fall to thy prayers.`
modern-en para 30:

> HENRY V. I know **thee** not, old man. Fall to **your** prayers. How ill
> white hairs becomes a fool and jester! … Make less **your** body hence, and
> more **your** grace…

The famous clause keeps `thee`; the very next clause converts to `your`; the
ungrammatical archaism "white hairs **becomes**" is left standing. The result
reads as an error rather than as either a preserved archaism or a modernization.
Whatever the intended policy, it is not applied within a single sentence.

### 6. Act 5 Scene 5, Epilogue (ch19, paras 51–54) — the ending

Present and complete, including the Oldcastle disclaimer and the promise of
Henry V. But para 53 differs from the source in **one word** (`were` → `would
be`) across 70 words, and para 54 in four small substitutions. The last page of
the play is, for practical purposes, the source text.

## Phase 1 flags confirmed / disconfirmed

- `pct_identical_long_paragraphs: 2.0%` — **confirmed as a byte measure, but it
  badly understates the picture.** Normalized comparison gives **51.7%**.
  Because the source uses curly apostrophes and elided forms (`toil'd`,
  `'Tis`), a pure `thou`→`you` pass never produces a byte-identical paragraph.
  Recommend the Phase 1 script normalize typography before measuring.
- `mean_weighted_similarity 0.7724` — **confirmed**; it is the highest in this
  batch and it was pointing at the right thing, but it sat below the 0.90
  screening threshold so no flag was raised.
- `truncated_paragraphs_total: 0` — **confirmed** at paragraph level; no
  compression seen. It cannot and did not detect the missing Induction, because
  the Induction is absent from *both* editions, so there is no paragraph pair
  to compare. **This is a real gap in the Phase 1 instrument**: it compares
  original-en to modern-en and so is blind to anything dropped from both during
  ingestion.
- `last_chapter_suspiciously_short: false` (1,264 words) — **confirmed**; the
  Epilogue is intact.
- `en_editions_aligned: true` — **confirmed** across six sampled chapters.
- Chapter titles: mostly real Act/Scene + location labels, **except** ch1's
  `Act 1, Scene 1 — The same`, which is dangling apparatus caused by the missing
  Induction.

## Phase 3 — human-edition research

**Is the original already accessible?** No. This play is unusually demanding:
Hal/Falstaff prose full of dead slang, legal and military vocabulary, Pistol's
scraps of mangled quotation, and three long verse speeches whose syntax runs
across a dozen lines. A modern edition is clearly worth maintaining.

Human modern-English **translations**:

1. **No Fear Shakespeare (SparkNotes)** — complete. **Fully copyrighted.**
   Rejected on rights.
2. **Shakescleare (LitCharts)** — includes Henry IV Part 2 (their Prologue/
   Induction translation is published at
   https://www.litcharts.com/shakescleare/shakespeare-translations/henry-iv-part-2/prologue).
   **Fully copyrighted.** Rejected on rights.
3. **Folger Shakespeare digital texts** — modernized-spelling *original*, not a
   translation; **CC BY-NC 3.0** (verified at
   https://www.folger.edu/copyright-policy/). Noncommercial restriction blocks
   Tinct's paid tier.
4. **Lamb, *Tales from Shakespeare*** — does **not** include the histories.
   Not applicable.

**No complete, readable, rights-clear human modern-English translation was found
in this search.** "None found in this search", not "none exists".

Human edition for the **original-language** text — actionable because of the
missing Induction:

- **Standard Ebooks, *Henry IV, Part II*** —
  https://standardebooks.org/ebooks/william-shakespeare/henry-iv-part-ii —
  Clark & Wright 1887 Victoria/Globe text, **CC0 1.0**. Verified by opening
  `/text/single-page`: it **includes the Induction** ("Open your ears; for which
  of you will stop / The vent of hearing when loud Rumour speaks?") as a
  distinct section, and an Epilogue. Clean text, no line numbers, no markup.
- **Project Gutenberg #100** — equally free, and it is already Tinct's source;
  the Induction is present there too (line 46034ff). Restoring from PG#100 is
  the smaller change and keeps the existing text byte-consistent.

## Phase 4 — rating

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 3 |
| first-read clarity | 25% | 2 |
| literary voice | 20% | 3 |
| restraint / no invention | 10% | 4 |
| naturalness | 5% | 3 |

**Weighted score 2.9 — band: Mixed (bottom of the band).**

Fidelity 3 rather than 4–5: content *within* the ingested scenes is complete and
accurate, with no compressions found — but a whole 310-word scene is missing
from the edition, and that is a substantive omission by any reading, even though
its cause is an ingestion bug rather than a translation choice. Clarity 2:
51.7% near-verbatim, concentrated on the speeches that most need work.
Voice 3: no register differentiation between tavern prose and political verse;
offset by the useful HENRY IV / HENRY V speaker-tag disambiguation. Restraint 4:
very little is invented — the flip side of doing very little. Naturalness 3:
the half-applied thou/you pass produces sentences that read as mistakes.

## Recommendation

**RETRANSLATE** — confidence **high**, correction scope **substantial**.

The defect is recurring rather than local: present in every act sampled and
confirmed corpus-wide at 51.7%. The confirmed omission also rules out any
unqualified KEEP.

Ordered next actions:

1. **Restore the Induction to all three editions** (original-en, modern-en,
   modern-da) from PG#100 or Standard Ebooks, as a new chapter 1 or a
   pre-Act-1 section, and fix the now-dangling `Act 1, Scene 1 — The same`
   title. This is a correctness fix and should not wait on the retranslation.
2. **Retranslate modern-en**, with an explicit brief to differentiate the
   tavern/Falstaff prose from the court verse, and to actually gloss the
   military-muster jokes in Act 3 Scene 2 and the dead vocabulary in Acts 3–4.
   Keep the HENRY IV / HENRY V speaker-tag disambiguation.
3. Apply one consistent `thou`/`you` policy and enforce it within sentences.
   Replace the "By Mary" rendering of "Marry".
4. **Correct the registry provenance label** — "Shakespeare (1600)" / year 1600
   is not what this file is.
5. **Process note for the audit as a whole:** Phase 1 cannot see content dropped
   from *both* editions at ingestion. Every book whose chapter structure came
   from a heading-pattern parser should be checked against its upstream source's
   table of contents for non-`ACT/SCENE`/`CHAPTER` sections (Inductions,
   Prologues, Choruses, Epilogues, Prefaces, Dedications).

## Limitations of this review

- 6 of 19 chapters sampled line by line (~4,000 of 26,974 source words, ~15%),
  covering Acts 1, 3, 4 and 5 plus the Epilogue. **Act 2 was not read**
  (ch4–ch7, including the long Boar's Head tavern scene with Doll Tearsheet and
  Pistol, which is the play's biggest comic set-piece and its hardest prose).
  My "no register differentiation" finding rests on Act 3 Scene 2 and Act 5
  Scene 5; it should be confirmed against Act 2 Scene 4 before the retranslation
  brief is finalized.
- I checked for missing sections only via the PG#100 table of contents and the
  Standard Ebooks / Folger structures; I did not diff the two texts scene by
  scene, so I cannot rule out smaller drops elsewhere.
- The 51.7% figure measures non-change, not unreadability, and cannot detect
  omission or invention.
- `modern-da` not reviewed — but note it shares the missing Induction. Audio
  alignment, onboarding JSON and cast JSON not checked (the missing Induction
  may also affect audio chapter indexing).
- Rights research is a documentary review, not legal advice.
