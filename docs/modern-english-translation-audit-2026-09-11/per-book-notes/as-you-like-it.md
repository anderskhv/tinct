# as-you-like-it — As You Like It (William Shakespeare)

Batch B5. Reviewed 2026-09-11. Scope: **public**.

> **Headline: this book's source text is broken. Act 1 Scene 1 is missing entirely, sixteen
> paragraphs of 1990s CD-ROM copyright boilerplate are embedded in the reading text (including as
> the last four paragraphs of the book), all seventeen chapter titles are wrong, and five real
> scenes have been merged away. None of this is a translation problem — it is upstream of the
> translation, and it also affects `original-en` and `modern-da`.**

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `2c04249b4ea52861` | 17 | 901 | 21,470 | Shakespeare (1623) |
| modern-en | `df270fa2b6059509` | 17 | 901 | 21,482 | Modern English |
| modern-da | `80064e115bd31f19` | 17 | 901 | 22,227 | Moderne Dansk |

`en_editions_aligned: true`. Mean weighted similarity 0.7557 (the highest in batch B5); identical
long paragraphs 4.2% (also the highest); no truncation, no empty paragraphs, no paragraph-count
mismatches, last chapter not flagged short.

Every Phase 1 signal is green. Every defect below is invisible to source-vs-modern comparison,
because both editions carry it.

## Provenance — the odd one out in this batch

The other four plays in B5 come from Project Gutenberg's "modernized" 1500-series lineage (curly
apostrophes, scene headings with locations, `[_Exeunt._]` stage directions). **As You Like It does
not.** It uses straight quotes, has no scene locations, runs stage directions into the end of speech
paragraphs with whitespace (`Come, Audrey.                    Exeunt`), and carries this, four times,
as ordinary reading paragraphs:

```
<<THIS ELECTRONIC VERSION OF THE COMPLETE WORKS OF WILLIAM SHAKESPEARE IS COPYRIGHT 1990-1993 BY
WORLD LIBRARY, INC., AND IS PROVIDED BY PROJECT GUTENBERG ETEXT OF CARNEGIE MELLON UNIVERSITY
WITH PERMISSION.  ELECTRONIC AND MACHINE READABLE COPIES MAY BE DISTRIBUTED SO LONG AS SUCH COPIES
(1) ARE FOR YOUR OR OTHERS PERSONAL USE ONLY, AND (2) ARE NOT DISTRIBUTED OR USED
COMMERCIALLY.  PROHIBITED COMMERCIAL DISTRIBUTION INCLUDES BY ANY
SERVICE THAT CHARGES FOR DOWNLOAD TIME OR FOR MEMBERSHIP.>>
```

That identifies the source precisely: **Project Gutenberg #1786**, the World Library / "Library of
the Future" CD-ROM transcription, part of PG's 1765–1802 series. I downloaded #1786 and confirmed
the match.

`grep -l "WORLD LIBRARY"` over the whole `app/public/data/editions/` directory returns **only the
three as-you-like-it files**. It is an isolated sourcing accident, not a corpus-wide problem.

### Rights status of that source — likely fine, but the notice still ships to readers

Project Gutenberg's own Shakespeare page (https://www.gutenberg.org/help/shakespeare.html) says of
the 1765–1802 series:

> "This series had been listed as copyrighted (© 1990-1993) based on 'sweat of the brow' effort to
> transcribe printed works. Based on contemporary copyright law interpretations, the metadata for
> these was updated in October 2023 to indicate that they are in the public domain in the U.S."

PG's catalogue page for #1786 now reads "Public domain in the USA." So the **US** rights risk is
most likely resolved. In the EU/Denmark a faithful transcription of a public-domain text generally
attracts no new copyright either (no sweat-of-the-brow protection). I am not offering a legal
opinion, but I record this as **low, probably resolved** rather than as a live blocker.

What is *not* resolved is that Tinct — a paid service — currently ships a paragraph telling its
readers this text may not be used commercially. That is a product and reputational problem whatever
the law says. PG itself advises against this series: "Generally, readers are advised to instead
choose from those" (the 1500 series and #100).

## Confirmed structural defects

### 1. Act 1 Scene 1 is missing from the book

`grep "As I remember, Adam"` → 0 hits in all three editions. `DENNIS` (a speaker in I.i) → 0 hits.
`CHARLES` appears only twice, both in the wrestling scene.

Chapter 1 begins:

```
[0] A lawn before the DUKE'S palace
[1] Enter ROSALIND and CELIA
[2] CELIA. I pray thee, Rosalind, sweet my coz, be merry.
```

— which is Act 1 **Scene 2**. The play's opening scene (Orlando and Adam in the orchard, the quarrel
with Oliver, Charles's news of the banished Duke, Oliver's plot to have Charles break Orlando's
neck; ~1,150 words) is simply absent. A reader meets Orlando in the wrestling scene with no
established grievance and no Adam.

**This is a Tinct ingestion bug, not a source defect.** PG #1786 contains the scene:
`ACT I. SCENE I. / Orchard of OLIVER'S house / Enter ORLANDO and ADAM / ORLANDO. As I remember,
Adam, it was upon this fashion bequeathed me by will…`. The chapteriser evidently split on `SCENE`
headers and treated everything before the *second* one — including the boilerplate block that
precedes `ACT I. SCENE I.` in #1786 — as front matter.

Word-count corroboration: PG #1523 (the clean modernized As You Like It) has 22,826 body words; our
`original-en` has 21,470 and includes ~250 words of boilerplate. The ~1.6k gap is exactly one scene.

### 2. Sixteen paragraphs of boilerplate inside the reading text

Four blocks of four paragraphs each, at ch2 p51–54, ch12 p27–30, ch14 p61–64 and ch17 p71–74 —
identical in `original-en`, `modern-en` and `modern-da`. The **final four paragraphs of the whole
book** are the copyright notice, followed by `End of this Etext of The Complete Works of William
Shakespeare, As You Like It`. A reader who finishes the play finishes on a CD-ROM licence.

Adjacent debris: `ACT II. SCENE I. The Forest of Arden` (ch2 p55), `ACT III. SCENE I. The palace`
(ch8 p43), `ACT IV. SCENE I. The forest` (ch12 p31), `ACT V. SCENE I. The forest` (ch14 p65) and
`THE END` (ch17 p70) are all rendered as body paragraphs rather than consumed as headings.

### 3. All seventeen chapter titles are wrong; five scenes merged

Titles cycle nonsensically: ch1 `Act 1, Scene 2`, ch2 `Act 1, Scene 3`, ch3 `Act 1, Scene 2`, ch4
`Act 1, Scene 3`, ch5 `Act 1, Scene 4`, ch6 `Act 1, Scene 5`, ch7 `Act 1, Scene 6`, ch8 `Act 1,
Scene 7`, ch9 `Act 1, Scene 2`, … ch17 `Act 1, Scene 4`. Nothing is ever labelled Act 2, 3, 4 or 5.
Compare the other four plays in this batch, which carry proper labels with locations
(`Act 3, Scene 2 — The same`).

The play has 22 scenes; this file has 17 chapters. Each act's Scene I has been absorbed into the
tail of the preceding chapter (II.i sits at ch2 p56–66, III.i at ch8 p44–47, IV.i at ch12 p32–114,
V.i at ch14 p66–97), and I.i is gone. 22 − 4 merges − 1 missing = 17.

Consequence for the product: chapter navigation, the "Cast"/threads loader, per-chapter progress,
audio alignment and any AI chat that cites a scene are all keyed to labels that are wrong.

## Passages inspected (6) — the translation itself

Setting the structural problems aside, the modern-en rendering is the **lightest** of the five plays
in this batch: 23.7% of paragraphs ≥25 words are ≥85% word-identical to the source, and 5.5% are
≥95% identical (batch comparison: comedy-of-errors 1.8% / 0.0%, merchant-of-venice 4.7% / 0.8%,
henry-v 14.8% / 0.4%, winters-tale 5.3% / 0.9%). The pattern is consistent: **prose scenes get a
real modernization, verse and songs get a lexical touch-up only.**

### 1. Chapter 1 (real Act 1 Scene 2) paras 6–13 — prose, Rosalind and Celia
Source: `CELIA. Marry, I prithee, do, to make sport withal; but love no man in good earnest, nor no further in sport neither than with safety of a pure blush thou mayst in honour come off again.`
Modern: `CELIA. By all means, do—as a sport. But don't love any man in earnest, and don't go further even in sport than you can safely retreat from with an honorable blush.`

**Finding: good.** Genuinely modernized, meaning intact, Celia's voice intact.

### 2. Chapter 8 (real Act 2 Scene 7) para 34 — "All the world's a stage"
Source: `Then a soldier, Full of strange oaths, and bearded like the pard, Jealous in honour, sudden and quick in quarrel`
Modern: `Then a soldier, Full of strange oaths and bearded like the leopard, Jealous in honor, sudden and quick to quarrel`

**Finding: good and appropriately restrained** — `pard`→`leopard`, `saws`/`instances`→
`sayings`/`examples`, `sans` kept. Verse lineation (capitalised line starts) is preserved here,
unlike the other four plays in the batch, which reflow verse into prose sentences.

### 3. Chapter 8 (real Act 2 Scene 7) paras 40–41 — the song "Blow, blow, thou winter wind"
Source: `Freeze, freeze, thou bitter sky, That dost not bite so nigh As benefits forgot;`
Modern: `Freeze, freeze, you bitter sky, That do not bite so near As benefits forgot;`

**Finding: damage.** Mechanical `thou`→`you` in a lyric breaks both the rhyme (`sky`/`nigh` → 
`sky`/`near`) and the grammar (`sky … do not`). In the preceding stanza `Although thy breath be
rude` becomes `Although your breath be rough` for no gain. Songs are the one place where leaving
the text alone is clearly right; here it was neither left alone nor handled as verse.

### 4. Chapter 12 (real Act 4 Scene 1) para 107 — Rosalind, prose, high-similarity outlier (0.949)
Source: `ROSALIND. By my troth, and in good earnest, and so God mend me, and by all pretty oaths that are not dangerous, if you break one jot of your promise… I will think you the most pathetical break-promise, and the most hollow lover, and the most unworthy of her you call Rosalind, that may be chosen out of the gross band of the unfaithful.`
Modern: `ROSALIND. By my faith, and in good earnest, and so God mend me, and by all pretty oaths that are not dangerous, if you break one jot of your promise… I will think you the most pathetical break-promise, and the most hollow lover, and the most unworthy of her you call Rosalind, who may be picked out of the gross band of the unfaithful.`

**Finding: light/mechanical.** Three words changed in 79. `pathetical break-promise` and `gross band
of the unfaithful` are exactly the phrases a modern reader stumbles on, and both are left
unassisted.

### 5. Chapter 16 (real Act 5 Scene 3) paras 10–13 — "It was a lover and his lass"
Three of the four song stanzas are **byte-identical** to the source, including the editorial
shorthand `In the spring time, &c.` left unexpanded. Leaving the lyric alone is defensible; leaving
`&c.` is debris.

### 6. Chapter 17 (real Act 5 Scene 4 + Epilogue) paras 45–71 — ending; highest-similarity chapter (0.873)
Source: `HYMEN. …If truth holds true contents. You and you no cross shall part;`
Modern: `HYMEN. …If truth holds true contents. You and you no cross shall part;`

Rosalind's Epilogue (`It is not the fashion to see the lady the epilogue…`) is present and lightly
touched. Then `THE END`, then four paragraphs of CD-ROM copyright notice, then
`End of this Etext…`. **Finding: the book does not end; it stops and then prints a licence.**

## Phase 1 flags: confirmed vs disconfirmed

- `truncated_paragraphs_total: 0`, `empty_paragraphs_total: 0`, `para_count_mismatch_total: 0`,
  `chapter_count_mismatch: false`, `en_editions_aligned: true`, `last_chapter_suspiciously_short:
  false` — all **confirmed as accurate**, and all **useless here**. Every defect in this book is
  present identically in both English editions, so alignment-based screening cannot see it. This is
  the batch's clearest example of a mechanical screen returning green on a badly broken book.
- `pct_identical_long_paragraphs: 4.2` (highest in batch) — **confirmed as a real signal**. Of the
  identical long paragraphs, 8 are the copyright-boilerplate lines and the rest are songs and verse
  left verbatim.
- `mean_weighted_similarity: 0.7557` (highest in batch) — **confirmed**: this is the lightest
  modernization of the five.

## Phase 3 — human-edition research

Two separate questions here.

**(a) Replacement *source* text — resolved, easy.** Use **PG #1523** (the modernized-series As You
Like It) or **PG #100** (The Complete Works). I downloaded #1523 and verified: 22 scene headers,
`ACT I / SCENE I. An Orchard near Oliver's house / Enter Orlando and Adam. / ORLANDO. As I remember,
Adam…`, zero occurrences of "WORLD LIBRARY", Epilogue present, and the same curly-quote /
`[_Exeunt._]` conventions as the other four B5 plays. Public domain; PG explicitly recommends this
series over #1786. https://www.gutenberg.org/ebooks/1523

**(b) Human modern-English edition — none found.** As You Like It's prose is among the most
accessible in the canon, but the verse (Hymen's masque, Jaques, the Duke Senior scenes) and the
period slang still pose a real barrier, so a modern edition is worth having.

1. **Play On Shakespeare / ACMRS Press — *As You Like It*, tr. David Ivers.** Complete modern-verse
   translation, in print from ACMRS Press. https://acmrspress.com/series/play-on-shakespeare/
   **Rights: permission required** (in copyright, living playwright; no open-access edition found).
   Text **unverified** — no free sample located.
2. **Folger Shakespeare digital texts** — **CC BY-NC 3.0**, commercial use excluded
   (https://www.folger.edu/copyright-policy/). Blocked, and not a modern-English rendering.
3. **Lamb, *Tales from Shakespeare* (1807)** — public domain, includes As You Like It; verified by
   reading the opening ("During the time that France was divided into provinces…"): an abridged
   third-person prose retelling. Fails completeness.
4. **No Fear Shakespeare / NoSweatShakespeare** — free to read, fully copyrighted. Rejected.

## Ratings

| dimension | score |
|---|---|
| fidelity / completeness (40%) | 2 |
| first-read clarity (25%) | 3 |
| literary voice (20%) | 3 |
| restraint / no invention (10%) | 4 |
| naturalness (5%) | 4 |

**Weighted score 2.8 — band: Poor.**

Fidelity is 2 because a whole scene is missing and sixteen paragraphs of non-text are present;
clarity is 3 because the verse half of the play is barely modernized; restraint is 4 because the
translator invented nothing — the foreign matter came in with the source.

## Recommendation

**BLOCKED** — confidence **high** on the structural findings (verified against two Project Gutenberg
source files), **medium** on the translation quality (6 passages sampled).

What exactly is unresolved: **the completeness and provenance of the base text.** Until
`as-you-like-it-original-en.json` is re-ingested from PG #1523 (or #100), there is no point rating
or repairing the modern edition — the modern edition is paragraph-aligned to a defective source, so
restoring Act 1 Scene 1 and stripping the boilerplate changes every downstream paragraph index in
`modern-en`, `modern-da`, the threads/cast file and any stored reading positions.

Correction scope: **substantial**.

Next action, in order:
1. Re-ingest `original-en` from PG #1523 — restores Act 1 Scene 1, removes all boilerplate and
   `THE END`/etext debris, and gives 22 correctly-labelled scenes with locations.
2. Regenerate `modern-en` and `modern-da` against the corrected source (they cannot be patched:
   paragraph indices shift throughout).
3. While regenerating, fix the two translation-level issues found: stop mechanically substituting
   `thou`→`you` inside song lyrics (it breaks rhyme and subject-verb agreement), and give the verse
   scenes the same level of modernization the prose scenes already get.
4. Audit whether any reader has a stored position in this book before the chapter renumbering lands
   (see invariant 6 in CLAUDE.md — out-of-range positions must reset *and* delete the storage key).
5. Add an ingestion guard: reject any edition file containing `WORLD LIBRARY`, `PROJECT GUTENBERG`,
   `Etext`, `THE END`, or a chapter title that repeats within a book.

## Limitations of this review

- 6 of 901 paragraphs read closely (~8% of the book by words). Acts 3 and the long 4.3/5.2 stretches
  were scanned mechanically, not read line by line.
- I verified the missing scene and the boilerplate against PG #1786 and #1523, but I did not inspect
  Tinct's ingestion script, so "ingestion bug" is an inference from the evidence (the source has the
  scene; our file does not).
- `modern-da` not reviewed beyond confirming it carries the same four boilerplate blocks and the same
  901-paragraph structure.
- The rights conclusion (US public domain per PG's October 2023 re-classification; probably also
  clear in the EU) is desk research, not a legal opinion, and no Denmark/EU-specific counsel was
  obtained.
- I did not check whether the onboarding JSON, threads file, or audio manifest for this book
  reference the (wrong) chapter labels.
