# War and Peace — Batch B (ch 27–55, 20 chapters): Independent Review

Reviewer: independent pass, run against
`full-batchB-source.json` (Maude, ground truth), `full-batchB-current-modern-en.json`
(pre-fix candidate) and `full-batchB-corrected.json` (drafter output).
Drafter notes reviewed: `full-batchB-notes.md`.

Method: (1) programmatic paragraph-level diff corrected↔current; (2) programmatic
paragraph-count, number, proper-noun and length-ratio scan source↔corrected across
all 951 paragraphs; (3) manual adversarial read of every paragraph of all 20
chapters against source, including the 12 marked "sound".

**Verdict: ACCEPT the drafter's 8 fixes — all are real, correct, and minimal — but
the pass is INCOMPLETE. 6 additional genuine defects found, 2 of them moderate,
and one of them introduced/entrenched by the drafter's own ch41 fix. The
chapter-title-numbering item the drafter waved off as "cosmetic metadata" is a
real, reader-visible content defect and should not be closed.**

---

## 1. Confirmed diff (corrected vs current)

Structure is identical: 20 chapters, same numbers, same titles, paragraph counts
match source exactly in all 20 chapters (34/97/86/61/129/29/50/24/44/29/63/63/15/
52/13/14/24/40/49/63). No paragraph merged, split, reordered, added or dropped.

Every byte of difference between `current` and `corrected` falls in exactly the 8
chapters claimed (27, 37, 38, 39, 40, 41, 42, 43) and is exactly the claimed class
of change. Token-level diff:

| Ch | Paras touched | Change |
|---|---|---|
| 27 | 6 | `Andrei` → `Andrew` (7 occurrences) |
| 37 | 9 | `Andrei` → `Andrew` (13) |
| 38 | 16 | `Bilíbin`→`Bilibin`, `Bolkónski`→`Bolkonsky`, `Kutúzov`→`Kutuzov` |
| 39 | 13 | `Bilíbin`, `Bolkónski`, `Kurágin` de-accented |
| 40 | 16 | `Bilíbin`, `Bolkónski`, `Kutúzov` de-accented |
| 41 | 28 | `Kutúzov`, `Bolkónski`, `Bilíbin`, `Kozlóvski`→`Kozlovsky`, `Bagratión`→`Bagration`, `Nesvítski`→`Nesvitsky` |
| 42 | 8 | `Kutúzov`, `Bagratión` de-accented |
| 43 | 1 | deletion only: `A bullet had clearly not caused this—it was punishment. ` |

No other chapter differs by a single character. **Claim 1 verified: the changes are
exactly what was claimed and nothing else.**

## 2. Verification of each claimed fix

**Ch 27 / 37 — Andrei → Andrew.** Correct. Source uses "Prince Andrew" throughout;
"Andrei" survived nowhere else in the batch. Zero residual `Andrei` in corrected.

**Ch 38–42 — de-accenting.** Verified complete *within each chapter*: an
exhaustive scan for capitalised words carrying diacritics in the corrected file
returns only legitimate German/Austrian place names (Brünn, Schönbrunn,
Dürrenstein, Olmütz, Hollabrünn, Buxhöwden) plus `Fräulein`. No Russian surname
retains an accent anywhere in the batch. **Claim 3 verified as far as it goes** —
but see §3.1: the *spelling* chosen in ch41 conflicts with ch34/35.

**Ch 43 — invented sentence.** Verified. Source ch43 ¶23 reads:
"...Two soldiers held him while two others were flourishing their switches and
striking him regularly on his bare back. The man shrieked unnaturally. A stout
major was pacing up and down the line..." — no equivalent of "A bullet had clearly
not caused this—it was punishment." exists anywhere in that paragraph, that
chapter, or the batch. The removal is surgical (the trailing "A " was correctly
retained so the next sentence still reads "A heavy-set major paced..."). The
drafter's diagnosis is right: it is invented editorialising, and it also implies a
misreading the source never invites. **Claim 2 verified.**

## 3. Independent findings — defects the drafter did not report

### 3.1 MODERATE — `Nesvitski` (ch34, 35) vs `Nesvitsky` (ch30, 31, 41)

The corrected file spells the same character two ways:

- `Nesvitsky` — ch30 (4×), ch31 (8×), ch41 (8×)
- `Nesvitski` — ch34 (7×), ch35 (17×)

The source is uniform (`Nesvítski` everywhere). The drafter's ch41 fix chose the
`-sky` form and so *entrenched* the split without checking ch34/35 — in a pass
whose entire stated purpose in 38–42 was name consistency. Either form is
defensible; the inconsistency is not. Same story, smaller, for `Kozlovsky` (ch31,
ch41) — consistent, but only because ch34/35 don't use it.

**Recommend:** pick one (the project's de-accented-Maude convention points at
`Nesvitski`, matching the source's own stem) and apply to all five chapters.

### 3.2 MODERATE — `Nicholas` (ch55) vs `Nikolai` (ch28, ch32)

Source uses `Nicholas` in ch28, ch32 and ch55. The candidate rendered it `Nikolai`
in ch28 ("Nikolai Bolkonsky", 2×) and ch32 ("Nikolai Rostov", 1×) but left
`Nicholas` standing in ch55 (8×, alongside `Nikolenka` 9×). So Nikolai Rostov is
"Nikolai Rostov" in ch32 and "Nicholas" in ch55 — the identical class of defect as
the Andrei/Andrew one the drafter fixed, in the opposite direction, and missed.

### 3.3 MODERATE — dropped clause, ch46 ¶1 (chapter marked "SOUND")

Source: "...but in reality he did not himself know what had happened during that
half-hour to the troops entrusted to him, **and could not say with certainty
whether the attack had been repulsed or his regiment had been broken up.** All he
knew was that..."

Corrected: "...but in truth he himself had no idea what had actually occurred
during that half hour. All he really knew was that..."

The bolded clause is gone. It is not decoration — it is the pivot of Tolstoy's
point about the meaninglessness of the word "repulsed" in the preceding sentence.
This is a genuine content omission in a chapter the drafter cleared.

### 3.4 LOW–MODERATE — dropped sentence, ch31 ¶28 (chapter marked "SOUND")

Source ends the paragraph: "...entered quickly, slamming the door. **Prince Andrew
stopped short.**" The corrected paragraph ends "...He had obviously just arrived."
— the final sentence is dropped. Minor beat, but it is a dropped sentence, not a
compression.

### 3.5 LOW — ch43 ¶17, ¶39, ¶41: raw footnote markers left in, one line untranslated

Every other translator's-footnote paragraph in the batch has its leading `*`
stripped (ch28 ¶8, ch31 ¶50/58/59, ch32 ¶7/9/10/13, ch39 ¶2/10, ch40 ¶36/41/42,
ch41 ¶3, ch48 ¶24). Three paragraphs in ch43 did not get that treatment:

- ¶17 `* "These are the pleasures of camp life, Prince."`
- ¶39 `* "On vous fera danser."`  ← also still untranslated French
- ¶41 `* "What's he singing about?"`

¶39 is the worst of the three: a reader of the modern-English edition gets a bare
French sentence prefixed with a stray asterisk.

### 3.6 LOW (systemic, project decision) — orphaned duplicate footnote paragraphs

Because the modern-en rendering inlines the French/German and its gloss into the
body paragraph, the following footnote paragraph now restates the same sentence
with nothing to attach to. E.g. ch40 ¶40 already says "He lets them into the
**bridgehead**"; ¶41 is then a standalone paragraph reading `"Bridgehead."`.
Ch31 ¶57 inlines "Forty thousand men slaughtered…"; ¶58 repeats it verbatim.
Same pattern: ch32 ¶7/¶9/¶10/¶13, ch38 ¶12 (rendered as the meta-line
`[The above was spoken in French.]`), ch41 ¶3, ch48 ¶24.

This is forced by the sacred 1:1 paragraph rule, so it is not the drafter's error —
but it is reader-visible redundancy across the whole edition and deserves a
deliberate house rule (e.g. render every footnote paragraph as a bracketed
translator's note, as ch38 ¶34/¶37 already do, rather than as a bare duplicate).

### 3.7 Minor items (noted, not blocking)

- **ch44/47/48 — `Schön Grabern` → `Schon Grabern`.** Umlaut stripped from a German
  place name while Brünn, Schönbrunn, Dürrenstein, Olmütz, Hollabrünn all keep
  theirs, in the same file. Internally inconsistent; trivially fixable.
- **ch32 — `Lavrúshka` → `Lavrusha` (11×).** A different diminutive, not a
  de-accenting. Aggravated by ¶19, where Denisov's lisped shout is kept as
  "Lavwuska" — i.e. the lisp of *Lavrushka*, not of *Lavrusha*.
- **ch37 ¶16 — `[Speaking in French]` added** where the source marks no French, two
  paragraphs before the source explicitly says "he exclaimed in German".
  Unsupported stage direction.
- **ch48 ¶4 — "burst upon the French from behind"**; source says only "attacked the
  French unexpectedly". Small invented detail.
- **ch43 ¶42 — "your Suvara" → "your Suvorov"**, erasing the French soldier's
  mangling of the name, which is the point of the line.
- **ch31 ¶15 — deliberate, correct divergence:** source file reads "a man who *has*
  time to think of the impression he makes on others"; corrected reads "has *no*
  time". The corrected reading is the right sense and matches Maude; the source
  JSON appears to carry a dropped negative. Flag so it isn't "fixed" back later.
- **ch34 ¶26 — command "One!" rendered "Fire!"**, which breaks the link to ¶27
  "Number one jumped nimbly aside." Defensible modernization; noting for the record.

## 4. Chapter-by-chapter, independent verdicts

| Ch | Drafter | This review |
|---|---|---|
| 27 | fixed (Andrei) | fix correct; otherwise faithful. Clean. |
| 28 | sound | faithful. Name form `Nikolai Bolkonsky` inconsistent with ch55 (§3.2). |
| 30 | sound | faithful. Uses `Nesvitsky` (see §3.1). |
| 31 | sound | **dropped sentence ¶28 (§3.4)**; footnote duplication ¶58/59; ¶15 negative divergence. |
| 32 | sound | faithful. `Lavrusha`/`Nikolai` name-form issues (§3.2, §3.7). |
| 34 | sound | faithful. `Nesvitski` spelling conflicts with 30/31/41. "One!"→"Fire!". |
| 35 | sound | faithful; Denisov's speech impediment well preserved. `Nesvitski`. |
| 37 | fixed (Andrei) | fix correct. Unsupported `[Speaking in French]` at ¶16. |
| 38 | fixed (accents) | de-accenting complete; faithful. ¶12 footnote orphan. |
| 39 | fixed (accents) | de-accenting complete; faithful. Clean. |
| 40 | fixed (accents) | de-accenting complete; faithful. ¶41/42 footnote orphans. |
| 41 | fixed (accents) | de-accenting complete; faithful. **Fix chose `Nesvitsky`, conflicting with 34/35 (§3.1).** |
| 42 | fixed (accents) | de-accenting complete; faithful. Clean — the strongest chapter in the batch. |
| 43 | fixed (invention) | removal correct and verified. **Residual `*` markers + untranslated French at ¶17/39/41 (§3.5)**; "Suvara"→"Suvorov". |
| 44 | sound | faithful. `Schon Grabern`; second occurrence generalized to "the two armies". |
| 46 | sound | **dropped clause ¶1 (§3.3).** Otherwise faithful. |
| 47 | sound | faithful; German colonel's accent well handled. `Schon Grabern`. |
| 48 | sound | faithful. `Schon Grabern`; ¶4 "from behind"; ¶24 footnote orphan. |
| 54 | sound | faithful. Clean. |
| 55 | sound | faithful. **`Nicholas` vs ch28/32 `Nikolai` (§3.2).** |

## 5. Assessment of the chapter-title-numbering discrepancy

**The drafter's assessment is wrong on both of its load-bearing claims. This is a
real content defect, not cosmetic metadata, and should be raised — though it is
correctly out of scope for a paragraph-fidelity pass.**

The drafter wrote that the candidate's numbering "is internally consistent with
itself (Book Two chapter N = original chapter 27+N)". It is not. Checking the full
`modern-en-name-normalized.json`:

```
28 'Book Two (1805) — Chapter 1'     ← offset 27
29 'Book Two (1805) — Chapter 2'     ← offset 27
30 'Book Two (1805) — Chapter 3'     ← offset 27
31 'Book Two (1805) — Chapter 4'     ← offset 27
32 'Book Two (1805) — Chapter 5'     ← offset 27
33 'Book Two (1805) — Chapter 5'     ← offset 28  ** DUPLICATE LABEL **
34 'Book Two (1805) — Chapter 6'     ← offset 28
...
48 'Book Two (1805) — Chapter 20'    ← offset 28
49 'Book Three (1805) — Chapter 21'  ** WRONG BOOK LABEL **
50 'Book Three (1805) — Chapter 1'
```

Two reader-visible bugs fall straight out of this:

1. **Global chapters 32 and 33 both render as "Book Two — Chapter 5."** A duplicate
   entry in the reader's table of contents is a navigation defect, not metadata
   trivia.
2. **Global chapter 49 is labelled "Book Three — Chapter 21."** Book Three has no
   chapter 21; this is Book Two's last chapter with the wrong book name.

The source file is the one that is consistent, at offset 28 throughout (ch30 =
"Chapter 2", ch34 = "Chapter 6", ch37 = "Chapter 9", ch49 = "Chapter 21"), which
matches canonical Maude: Book One runs to 28 chapters, so global 28 is **Book One,
Chapter 28** — and its content confirms it (Prince Andrew's departure from Bald
Hills, the icon, the farewell to the old prince: the close of Book One, not the
opening of Book Two). The source's own title for global 28 carries the right
number ("Chapter 28") with the wrong book name ("Book Two"), which is almost
certainly where the candidate's off-by-one originated: someone "fixed" the
anomalous 28 by renumbering it to Book Two Chapter 1 and dragged 29–32 along,
stopping at 33.

Correct mapping: global 28 = Book One ch 28; global 29–49 = Book Two ch 1–21;
global 50+ = Book Three ch 1+. Five titles in the live file need correcting (28,
29, 30, 31, 32) plus the book label on 49.

**Severity: moderate. Not a translation-fidelity defect — no prose is affected —
but it mislabels five chapters, duplicates one label, and misfiles one chapter
under the wrong book. It should be tracked as its own task, not closed as
cosmetic.**

## 6. Final verdict

**Accept the 8 fixes as applied. Do not close the batch.**

All 8 claimed fixes are genuine, correctly scoped and correctly executed; the
invented ch43 sentence is confirmed absent from source; the ch38–42 de-accenting is
complete within each chapter; paragraph alignment is perfect across all 20
chapters; and prose fidelity across the batch is, on a full independent read,
genuinely high — no summarization, no reordering, no further inventions, speech
impediments and dialect preserved.

Before the batch ships, resolve:

- **Blocking:** §3.1 Nesvitski/Nesvitsky, §3.2 Nicholas/Nikolai, §3.3 ch46 dropped
  clause, §3.5 ch43 stray `*` + untranslated French.
- **Should fix:** §3.4 ch31 dropped sentence, §3.7 Schön Grabern umlaut.
- **Project decision, whole edition:** §3.6 footnote-orphan convention.
- **Separate task:** §5 chapter-title numbering (5 wrong titles, 1 duplicate label,
  1 wrong book label).

The drafter's "12 of 20 sound" figure does not hold: on an independent read, 4 of
those 12 (31, 34, 35, 46, and 55 — 5 counting name-form issues) carry defects,
two of them content-level. The right summary is: **structure perfect, prose
fidelity strong, name normalization still unfinished, two small content omissions
survived, one formatting class missed in ch43.**
