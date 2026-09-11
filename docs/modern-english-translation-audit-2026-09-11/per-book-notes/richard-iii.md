# richard-iii — Richard III (William Shakespeare)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (Shakespeare batch B5)

## Edition snapshot (from Phase 1 `mechanical/richard-iii.json`)

| edition | label | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|---|
| original-en | Shakespeare (1597) | `891ead74f6cbcfa6` | 25 | 1420 | 30,808 |
| modern-en | Modern English | `30204ef16006235b` | 25 | 1420 | 31,425 |
| modern-da | Moderne Dansk | `15ce2bdaa6368395` | 25 | 1420 | 31,720 |

`en_editions_aligned: true`. Mean weighted similarity 0.7172 (note: this is the
mechanical file's own metric; my per-paragraph recomputation over long paragraphs
only gives 0.27–0.87 per scene, mean ≈0.47 — see "per-scene similarity" below).
No truncated paragraphs, no empty paragraphs, no paragraph-count mismatches,
`pct_identical_long_paragraphs` 0.7%, last chapter not flagged short.

## Provenance / completeness of the core English text

- The core text is the English original; there is no translator. Registry
  (`app/src/data/bookRegistry.ts:575`) labels it **"Shakespeare (1597)"**.
- **Provenance labelling issue (minor, non-blocking):** the file is *not* the
  1597 first quarto. It is a modern-spelling editorial text with Project
  Gutenberg conventions (`[_Exeunt._]` italic markers, curly apostrophes,
  "Tewksbury", "loured"), i.e. a conflated Q/F editorial text. The "1597" in the
  label is the play's first-publication year, not the edition in the file.
  Same pattern across the Shakespeare set. Worth a one-line registry note
  eventually; it does not affect reading quality.
- **Completeness: confirmed complete.** All 25 scenes present with real
  Act/Scene + location titles (`Act 1, Scene 1 — London. A street` …
  `Act 5, Scene 5 — Another part of the Field`), matching the standard 25-scene
  division (4+4+7+5+5). No editorial-apparatus debris in any chapter title.
  I read the closing scene end-to-end: Richmond's final speech is whole.

## Per-scene similarity (my own recomputation, long paragraphs only)

Lowest (most rewritten): 1.1 (0.273), 5.5 (0.182), 3.6 (0.180), 5.1 (0.282).
Highest (least touched): 5.4 (0.866), 5.2 (0.815), 3.3 (0.780), 4.5 (0.711),
4.2 (0.708), 3.4 (0.726). Inspection showed the high-similarity scenes are ones
where the source line is *already* plain modern English (messenger reports,
"A horse! A horse!"), so high similarity there is correct behaviour, not a
light-touch failure. Unlike Cymbeline, there is **no act-level drift**.

## Samples inspected (10 locations, ~2,600 source words)

### 1. Act 1, Scene 1, paras 0–13 — opening soliloquy + Clarence (STRONG)

Source: `RICHARD. Now is the winter of our discontent Made glorious summer by
this son of York; ... Grim-visaged war hath smoothed his wrinkled front; And
now, instead of mounting barbed steeds To fright the souls of fearful
adversaries, He capers nimbly in a lady's chamber To the lascivious pleasing of
a lute.`

Modern: `RICHARD. Now is the winter of our discontent made glorious summer by
this son of York; ... Grim-faced war has smoothed his wrinkled forehead; and
now, instead of mounting armored horses to terrify the souls of fearful enemies,
he skips nimbly in a lady's chamber to the lewd, pleasing strumming of a lute.`

Finding: excellent. Ironic, self-relishing voice preserved; the whole
"I, that am… / I, that am… / I, that am…" anaphora survives ("I, who am… I, who
am… I, who am…"). Nothing dropped across 307 → 315 words.

Two small notes:
- `And descant on mine own deformity` → `and comment on my own deformity`
  flattens the musical/discoursing metaphor of "descant".
- `a prophecy which says that "G" Of Edward's heirs the murderer shall be` →
  `a prophecy which says that someone whose name begins with "G" shall be the
  murderer of Edward's heirs` — an added gloss. It is repeated eight paragraphs
  later in Clarence's own speech (`says a wizard told him that by "G" His issue
  disinherited should be` → `someone whose name begins with G shall disinherit
  his offspring`) even though the source there has already supplied the context
  (`from the cross-row plucks the letter G`). Second instance is redundant.

### 2. Act 1, Scene 1, para 11 — added name gloss (BORDERLINE, restraint)

Source: `The jealous o'er-worn widow and herself, Since that our brother dubbed
them gentlewomen, Are mighty gossips in our monarchy.`
Modern: `The jealous worn-out widow and Mistress Shore herself, since our
brother dubbed them gentlewomen, are powerful gossips in our monarchy.`

Finding: the modern edition **resolves an editorially disputed referent** by
naming Mistress Shore. Accurate on the majority reading, but it is an
interpretation added at the point where the source is deliberately elliptical.
Local; low severity.

### 3. Act 1, Scene 2, paras 30–61 — wooing of Anne, stichomythia (STRONG)

Source: `ANNE. Dost grant me, hedgehog? ... RICHARD. Your bed-chamber. /
ANNE. Ill rest betide the chamber where thou liest! / RICHARD. So will it,
madam, till I lie with you.`
Modern: `ANNE. You grant me, hedgehog? ... RICHARD. Your bedchamber. /
ANNE. May ill rest befall the chamber where you lie! / RICHARD. So it will,
madam, until I lie with you.`

Finding: the one-line-for-one-line duel keeps its speed; no line is padded into
explanation. "hedgehog" (Richard's boar badge) is left unglossed, correctly.

Two pronoun-disambiguating additions:
- `Curse not thyself, fair creature; thou art both.` → `…you are both my day and
  life.`
- `He lives that loves thee better than he could.` → `…better than your husband
  could.`
Both are correct readings, both slightly reduce the sting of the source's
compression. Local.

### 4. Act 1, Scene 2, para 103 — "Was ever woman in this humour wooed?" (STRONG)

Source: `Was ever woman in this humour wooed? … And yet to win her, all the world
to nothing! … My dukedom to a beggarly denier, I do mistake my person all this
while!`
Modern: `Was ever a woman wooed in this manner? … And yet, to win her — I bet
the world against nothing on it! … My dukedom against a beggar's penny, I've
been misjudging my person all this while!`

Finding: strong. The betting idioms are glossed accurately without being turned
into exposition; the self-delighted swagger survives. `turn yon fellow in his
grave` → `dump that fellow into his grave` is a touch more colloquial than the
source but captures the callousness; acceptable.

### 5. Act 1, Scene 4, paras 5–14 — Clarence's dream (STRONG, one added intensifier)

Source: `CLARENCE. No, no, my dream was lengthened after life. O, then began the
tempest to my soul. I passed, methought, the melancholy flood, With that sour
ferryman which poets write of, Unto the kingdom of perpetual night.`
Modern: `CLARENCE. No, no — my dream went on after death. Oh, then the real
tempest came over my soul. I crossed, I thought, the melancholy river, with that
sour ferryman the poets write about, into the kingdom of perpetual night.`

Finding: every image survives — the wreck, the jewels in the skulls, Warwick,
the shrieking shadow, the legion of fiends. The one addition is `the real
tempest`; "real" is not in the source. It does capture the implied contrast with
the sea-tempest, but it is an editorial intensifier. Local; low severity.

### 6. Act 1, Scene 4, paras 24–43 — the two murderers (STRONG, register)

Source: `SECOND MURDERER. Faith, some certain dregs of conscience are yet within
me. / … / SECOND MURDERER. Zounds, he dies! I had forgot the reward.`
Modern: `SECOND MURDERER. Honestly, some leftover dregs of conscience are still
in me. / … / SECOND MURDERER. By God's wounds, he dies! I had forgotten the
reward.`

Finding: the prose comedy lands; the conscience routine ("Where's thy conscience
now?" / "O, in the Duke of Gloucester's purse") keeps its timing. Register
contrast against the surrounding verse is maintained by diction.

**Consistency defect (confirmed):** `Zounds` is rendered `By God's wounds` here
but `Damn!` at 5.3 para 117 (`KING RICHARD. Zounds! Who's there?` → `KING
RICHARD. Damn! Who's there?`). Same oath, two unrelated treatments. Local, but
it is the kind of thing a light-edit pass should sweep.

### 7. Act 2, Scene 3, paras 8–24 — the three citizens (STRONG)

Source: `THIRD CITIZEN. When clouds are seen, wise men put on their cloaks; …
Untimely storms make men expect a dearth.`
Modern: `THIRD CITIZEN. When clouds appear, wise men put on their cloaks. …
Untimely storms make men expect a famine.`

Finding: the whole choric scene is intact, including `Woe to that land that's
governed by a child` (left verbatim, correctly) and `God wot` → `God knows`,
`Marry` → `Truly`. No summarising.

### 8. Act 4, Scene 2, para 37 — untouched archaic line (BORDERLINE / LIGHT-EDIT)

Source: `I must be married to my brother's daughter, Or else my kingdom stands
on brittle glass. … But I am in So far in blood that sin will pluck on sin.
Tear-falling pity dwells not in this eye.`
Modern: `I must be married to my brother's daughter, or else my kingdom stands
on brittle glass. … But I am in so far in blood that sin will pluck on sin.
Tear-falling pity dwells not in this eye.`

Finding: 48 → 49 words, similarity 0.994 — this is the single most-untouched
long paragraph in the play. Most of it is genuinely already clear, but two
clauses are not: `I am in so far in blood` (= "I am already so deep in blood")
and `Tear-falling pity dwells not in this eye` (archaic negation). Left
unmodernised. This is the clearest instance of the LIGHT/MECHANICAL pattern in
this book — and it is a two-clause instance, not a systemic one.

### 9. Act 4, Scene 4, paras 0–17 and 92–115 — the queens' lament and the second wooing (STRONG)

Source: `KING RICHARD. … The liquid drops of tears that you have shed Shall come
again, transformed to orient pearl, Advantaging their loan with interest Of ten
times double gain of happiness.`
Modern: `KING RICHARD. … The liquid drops of tears you have shed shall come
again, transformed to oriental pearl, advantaging their loan with the interest
of ten times double gain of happiness.`

Findings:
- **Small mistranslation:** `orient pearl` → `oriental pearl`. "Orient" of
  pearls means lustrous/brilliant, not "from the Orient". One word, local.
- Elizabeth's 105-word catalogue of Richard's crimes (the bleeding hearts, the
  handkerchief steeped in Rutland's blood, Clarence, Rivers, Anne) is complete
  and correctly sequenced.
- **Structural defect inherited from the source file, not introduced by the
  modernisation:** Margaret's asides are split across three paragraphs each —
  para 5 is the bare string `QUEEN MARGARET.`, para 6 is `[_Aside_.] Hover about
  her; say that right for right`, para 7 is the rhyme-word line `Hath dimmed
  your infant morn to aged night.` Both editions reproduce this, so a reader
  sees an orphaned speaker tag followed by a half-couplet. Same at paras 9–11
  and 13–14. This is a parsing artefact in `richard-iii-original-en.json` and
  should be fixed in *both* English editions together.

### 10. Act 5, Scene 3, paras 100–121 and Act 5, Scenes 4–5 — ghosts, waking, ending (STRONG, one voice loss)

Source: `O, no, alas, I rather hate myself For hateful deeds committed by
myself.`
Modern: `O no, alas, I rather hate myself for the hateful deeds I have
committed.`

Finding: the insistent reflexive chain — *myself / myself / myself / myself* —
is the engine of this speech ("Richard loves Richard, that is, I am I… since
that I myself Find in myself no pity to myself"). The modern keeps it everywhere
except this one clause, where `by myself` is dropped. Also `All several sins,
all used in each degree` → `All my sins, used in every degree` loses "several"
(= separate/distinct), which the same speech elsewhere renders correctly as
"separate tongues / separate tale". Both local, both in the play's most
voice-dependent speech.

Ending verified complete: `RICHMOND. Inter their bodies as becomes their births.
… Now civil wounds are stopped, peace lives again. That she may long live here,
God say Amen.` → `RICHMOND. Bury their bodies as befits their birth. … Now civil
wounds are stopped, peace lives again. That she may long live here, God say
Amen.` Nothing lost, including the whole York/Lancaster catalogue.

### Stage-direction conventions

Modern brackets and capitalises all directions (`[Enter RICHARD, Duke of
Gloucester, alone.]`), which is an improvement in consistency over the source's
mixed `Enter Clarence, guarded and Brakenbury.` / `[_Exeunt._]`. Two defects:
- `[_Exeunt Norfolk and Soldiers._]` (5.4 para 2) → `[Exit NORFOLK and
  Soldiers.]` — plural rendered singular.
- The same source string `[_Exeunt._]` becomes `[Exeunt.]` at 2.3 para 24 but
  `[They exit.]` at 5.4 para 7 and 5.5 para 8. Inconsistent.

## Phase 1 flags: confirmed vs disconfirmed

| Phase 1 signal | Verdict |
|---|---|
| `truncated_paragraphs_total: 0` | **Confirmed.** My own truncation scan (source ≥40 words, modern/source < 0.62) returned 0 hits. |
| `empty_paragraphs_total: 0` | **Confirmed.** |
| `para_count_mismatch_total: 0`, `chapter_count_mismatch: false` | **Confirmed.** Alignment is exact paragraph-for-paragraph across all 25 scenes; spot-checked in 10 scenes. |
| `last_chapter_suspiciously_short: false` (367 w) | **Confirmed** — 5.5 is genuinely a 9-paragraph closing scene and is complete. |
| `pct_identical_long_paragraphs: 0.7%` | **Confirmed and explained.** The near-identical long paragraphs (4.2 p37; 4.4 pp213–217; 3.4; 3.5) are almost all cases where the source is already plain. Only 4.2 p37 is a genuine light-touch miss. |
| `mean_weighted_similarity: 0.7172` | **Disconfirmed as a quality signal.** My per-paragraph recomputation over long paragraphs gives a much lower figure (≈0.47 mean, 0.27 in 1.1). Whatever the Phase 1 metric measures, it overstates how close the two texts are; do not read 0.72 as "barely modernised" for this book. |

## Phase 3 — human-edition research

**Step 1: does the original already meet the reading standard?** No. Unlike
Victorian prose, Shakespeare's verse is a real barrier: compressed syntax,
obsolete idiom ("mewed up", "an it please your worship", "cross-row", "denier",
"o'er-worn"), and dense wordplay. A modern-English companion is justified for
this title. (Separately: the *source* edition is fine as a source — modern
spelling, complete, well-punctuated.)

**Step 2: candidate human modern-English editions.**

| Candidate | What it is | Complete? | Rights | Verdict |
|---|---|---|---|---|
| **Standard Ebooks — Richard III** (based on Clark & Wright, *Victoria* edition 1887, from the Globe text) — https://standardebooks.org/ebooks/william-shakespeare/richard-iii | **Original language**, modernised spelling/punctuation only. Not a modern-English translation. | Complete | Underlying text PD (Clark d. 1878, Wright d. 1914 → PD in the EU/DK and the US). Standard Ebooks' own contributions dedicated CC0 1.0; page states "thought to be free of copyright restrictions in the United States". | **Rights-clear but not a substitute for modern-en** — it is a better *source* text, not a modern edition. Fetched and read the rights statement directly. |
| **Play On Shakespeare / ACMRS Press — *Richard III*, modern verse translation by Migdalia Cruz** (ISBN 9780866986762) — https://acmrspress.com/series/play-on-shakespeare/ | A genuine complete modern-English verse translation, by a professional playwright, commissioned by Oregon Shakespeare Festival. Editorially this is the strongest human candidate that exists. | Complete | **Permission required.** In print, ACMRS Press / distributed by University of Chicago Press; "© 2026 ACMRS Press. All Rights Reserved." Some series volumes carry an "Read open access" link to ASU Pressbooks, but **no CC licence is stated for this title** and I could not establish one. | **Rejected for reuse on rights grounds.** Whether an open-access reading edition of *this* title exists is **unverified**. Would need a written licence for commercial distribution in DK/EU and the US. |
| **Folger Shakespeare digital texts** — https://www.folger.edu/copyright-policy/ | Modernised-spelling edition with facing glosses. Not a translation. | Complete | **CC BY-NC 3.0 Unported** — "You may not use the material from Folger Digital Texts for commercial purposes." | **Rejected.** Noncommercial-only is incompatible with Tinct's $3/mo Premium product; and it is not a modern-English rendering anyway. |
| **Internet Shakespeare Editions (UVic) "modern text"** — https://internetshakespeare.uvic.ca | Modernised-spelling scholarly edition, not a translation. | Complete | "May be freely used for educational, non-profit purposes; for all other uses, contact the Editor." | **Rejected** — noncommercial, and not a translation. |
| **Lamb, *Tales from Shakespeare* (1807)** — https://www.gutenberg.org/ebooks/573 | Prose retelling for children. | **Does not include Richard III** — the Lambs covered no history plays. | PD | **Not applicable.** |

**Conclusion:** *no complete, readable, rights-clear human modern-English
edition of Richard III was found in this search.* That is "none found in this
search", not "none exists" — but the one strong candidate (Play On / Cruz) is
firmly copyrighted, and every freely licensed alternative is a
modernised-*spelling* edition rather than a modern-English rendering. The
existing AI modern-en has no rights-clear human competitor.

**Jurisdiction note:** the underlying Shakespeare text is PD in DK/EU and the
US. The rights risk lives entirely in the *modern translation* layer. Folger's
CC BY-NC and ISE's non-profit clause both bite on a paid product regardless of
jurisdiction; the Play On volumes are under active commercial copyright in both
the US and the EU. Nothing here is jurisdictionally ambiguous enough to need a
lawyer — all three are clear "no".

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | **5** |
| first-read clarity | 25% | **4** |
| literary voice | 20% | **4** |
| restraint / no invention | 10% | **4** |
| naturalness | 5% | **5** |

**Weighted score: 4.5** — band **Strong**.

Justification: across 10 sampled locations I found **no substantive omission and
no invented content**. What I did find is a short list of *local* defects: one
mistranslated word (`orient` → `oriental`), one dropped reflexive (`by myself`),
two–three added pronoun/name glosses, one untouched archaic paragraph (4.2 p37),
an inconsistent oath, and inconsistent `Exeunt` handling. Clarity is docked to 4
for 4.2 p37 and the 4.4 orphaned-speaker-tag paragraphs; voice to 4 for the
5.3 reflexive chain and "descant".

## Recommendation

**LIGHT EDIT** · confidence **medium-high** · correction scope **local**.

The edition meets the reading standard. A scoped fix list:
1. 4.2 para 37 — modernise `I am in so far in blood` and `Tear-falling pity
   dwells not in this eye`.
2. 5.3 para 114 — restore `for hateful deeds committed by myself`; render
   `several` consistently.
3. 4.4 para 109 — `oriental pearl` → `lustrous pearl` (or just `pearl`).
4. Global sweep: one treatment for `Zounds`; one treatment for `[_Exeunt._]`;
   fix `[Exit NORFOLK and Soldiers.]` → `[Exeunt …]`.
5. 1.1 para 8 — drop the second "whose name begins with G" gloss as redundant.
6. **Both English editions (not just modern-en):** repair the orphaned
   speaker-tag / split-couplet paragraphs in 4.4 (paras 5–7, 9–11, 13–14) and
   1.1's un-tagged continuation at 4.2 p37. This is a source-parsing fix and
   must be applied to `original-en` and `modern-en` in lockstep to preserve
   paragraph alignment.

Do **not** retranslate. Do **not** replace with a human edition — none is
rights-clear.

## Limitations of this review

- I inspected **10 locations covering all five acts** (1.1 ×2, 1.2 ×2, 1.4 ×2,
  2.3, 4.2, 4.4 ×2, 5.3, 5.4, 5.5), roughly 2,600 source words of 30,808 — about
  **8% of the play**. "Strong in samples" is not "the whole book is verified."
- I did **not** read Acts 2 and 3 in full; 3.7 (Buckingham staging Richard's
  piety), 3.1, 3.5, 4.1 and 4.3 were only seen through the mechanical/similarity
  screen, not read line by line.
- I did **not** audit `modern-da` at all (out of scope for this batch).
- I did **not** check audio alignment, the threads/Cast JSON, or onboarding JSON.
- Verse lineation is flattened to prose in **both** English editions. That is a
  pre-existing property of the whole Shakespeare edition set, not a defect of
  this modernisation, and I did not treat it as one — but it is a real
  reading-experience question for the product and it hides the verse/prose
  register switch that Shakespeare uses deliberately.
- Rights research is my reading of publicly stated licences, not legal advice.
