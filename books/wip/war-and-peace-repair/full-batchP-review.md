# Batch P — Independent Adversarial Review

**Verdict: ACCEPT AS-IS.**

`full-batchP-corrected.json` may be merged/promoted. All 9 paragraph edits the drafter
made are verified correct and complete against `full-batchP-source.json` (Maude). An
independent close read of all 19 chapters (including the 14 claimed "sound" chapters)
found no additional defects: no dropped/invented content, no meaning inversions, no
name/place inconsistencies, no factual/unit distortions, and no other orphaned or
duplicated footnote paragraphs. Paragraph counts match source exactly in every chapter.

---

## 1. Diff confirmation (current-modern-en.json vs corrected.json)

Programmatic paragraph-indexed diff (chapter+paragraph key) was run over all 774
paragraphs in all three files. Exactly **9 paragraphs changed, across 5 defects**,
matching the drafter's claimed list **exactly** — no discrepancies:

| Ch  | Paragraph indices (0-based) | Defect type |
|-----|------------------------------|-------------|
| 15  | 15, 16 | orphaned footnote marker (`humanum est errare`) |
| 69  | 19, 20 | orphaned footnote marker (`Kólya`) |
| 254 | 45 | dropped jeering line ("Torture serves a thief right.") |
| 288 | 8, 9 | orphaned footnote marker (`à la maraude`) |
| 300 | 3, 4 | orphaned footnote marker (`Les gros bataillons...`) |

No paragraph outside these 9 differs between `current-modern-en.json` and
`corrected.json`. No paragraph-count mismatch was found in any of the 19 chapters
across `source.json` / `current-modern-en.json` / `corrected.json` (all three agree,
chapter by chapter — see section 4).

## 2. Per-claimed-fix verification

All five fixes were checked against the locked source text.

**1. Ch15 paras 15–16 (footnote: "To err is human").**
Source para 15: `“Prince, humanum est errare, * but...”`. Source para 16: `* To err is
human.` Corrected para 15 restores the `*` immediately after the translated phrase
("to err is human, *"), and para 16 is the plain apparatus line. **Correct and
complete**, matches source placement exactly.

**2. Ch69 paras 19–20 (footnote: "Nicholas").**
Source para 19: `“Here he is... our own... Kólya, * dear fellow...”`. Source para 20:
`* Nicholas.` Corrected para 19 restores the `*` after "Kolya," and para 20 is reduced
to the plain gloss "Nicholas." (dropping the drafter's earlier invented expansion "Kolya
is the familiar form of Nicholas."). **Correct and complete.**

**3. Ch288 paras 8–9 (footnote: "As looters").**
Source para 8: `...à la maraude * to obtain provisions...`. Source para 9: `* As
looters.` Corrected para 8 places the `*` directly after the retained French phrase; para
9 is restored to plain apparatus form. **Correct and complete.**

**4. Ch300 paras 3–4 (footnote: "Large battalions are always victorious").**
Source para 3: `...Les gros bataillons ont toujours raison. *`. Source para 4: `* Large
battalions are always victorious.` Corrected para 3 ends the translated line with `*`;
para 4 restored to plain apparatus form. **Correct and complete.**

**5. Ch254 para 45 (dropped jeering line).**
Source: `"...serves him right! Torture serves a thief right. Use the hatchet!..."`
Pre-fix current text dropped "Torture serves a thief right." entirely. Corrected text
restores it verbatim, in the correct position between "serves him right!" and "Use the
hatchet!...". **Correct and complete.** (Note: source also has "tenacious" where both
pre- and post-fix modern text has "stubborn" — a synonym-level word choice, not a
fidelity break; not part of the claimed defect and not flagged as a required fix — see
"Minor items noted, no action required" below.)

All five fixes are real defects correctly identified and correctly repaired, with the
`*` marker placed in the same position relative to the translated/retained phrase as in
the source, and the footnote paragraph reduced to match the source's plain
apparatus style (no editorializing expansion).

## 3. Independent close read of all 19 chapters

Every paragraph of all 19 chapters was read side-by-side against source (not just the
paragraphs the drafter flagged). Chapters checked: 15, 33, 49, 50, 61, 69, 108, 131,
195, 200, 231, 242, 250, 254, 280, 288, 291, 292, 300.

**Findings: no additional defects.** Specifically checked for and not found:

- **Dropped/invented content** — none beyond the one already-fixed instance (Ch254
  para 45). All dialogue, narration, and essay-chapter argumentation (Ch231, Ch280,
  Ch300 — the historiographical/guerrilla-war essays) preserve every clause and
  logical step of the source's argument.
- **Meaning inversions** — none. Checked in particular the ambiguous antecedent-
  resolution cases the drafter's own notes flagged (Ch61 para 10 "latter wing" →
  "right wing"; Ch108 para 0 "Ryazán estate of which he was trustee" → "his son's
  Ryazan estate") — both confirmed correct resolutions, not distortions. Also checked
  Ch131 para 6's reworded double-negative ("who, it seems, is accepted everywhere...
  except at Bald Hills" vs. source's "who only at Bald Hills... is not accepted") —
  semantically equivalent, not an inversion.
- **Name/place house-convention violations** — none. Andrew, Nicholas, Mary, Kutuzov,
  Helene, Peter, and de-diacritized transliterations (Boris, Sonya, Natasha, Petya,
  Vera, Denisov, Rostov, Bezukhov, Bagration, Miloradovich, Przhebyshevsky, Dokhturov,
  Kirsten, Weyrother, Langeron, Buxhowden, Rostopchin, Vereshchagin, Alpatych, Dron,
  Bourienne, Karataev, Sokolov, Tikhon, Tushin, Timokhin, Zherkov, etc.) are applied
  consistently across all 19 chapters.
- **Factual/unit distortions** — none. Numbers, ranks, dates, distances, troop counts,
  and ruble amounts all match source (e.g., Ch49 "twenty-two years," Ch195 "fifteen
  thousand men... thirty-five hours... fourteen hours," Ch200 "six hundred quarters,"
  Ch254 "hard labor" vs. Rostopchin's false claim of "condemned to death" — correctly
  preserved as the narrator's editorial aside in both source and corrected text).
- **Other orphaned/duplicated footnote paragraphs** — none found beyond the 4 already
  fixed. All other italicized/foreign-language fragments in these 19 chapters (e.g.,
  Ch49 "Matvévna," Ch254 French asides, Ch288's proclamation text, Ch292's dialogue)
  are either fully in-line English or correctly untouched by footnote apparatus.

An independent automated length-ratio scan (source-paragraph-length vs.
corrected-paragraph-length, flagging ratios <0.55 or >1.6 on paragraphs >20 chars) was
also run as a second check for undetected compression/drops. It flagged exactly two
paragraphs, both already reviewed and dismissed by the drafter as faithful
compressions with no content loss:
- Ch49 para 3: `"Tell them to give me a seat, for God's sake!"` → `"Please, give me a
  seat!"` — faithful compression, no dropped content.
- Ch250 para 1: single-sentence description of bridge congestion, faithfully
  compressed.

No other paragraphs triggered the length-ratio flag, and manual review of all 19
chapters' full text (not just flagged paragraphs) turned up nothing the automated scan
missed.

## 4. Paragraph-count / structural integrity check

Verified programmatically: chapter order and chapter numbers are identical across
`source.json`, `current-modern-en.json`, and `corrected.json` (15, 33, 49, 50, 61, 69,
108, 131, 195, 200, 231, 242, 250, 254, 280, 288, 291, 292, 300), and the paragraph
count per chapter is identical across all three files for every one of the 19
chapters. No structural drift, no missing/added paragraphs, no merged/split
paragraphs.

## Minor items noted, no action required

- **Ch254 para 45 "stubborn" vs. source "tenacious"** — a synonym-level word choice
  divergence, present in both the pre-fix and post-fix text. Not part of the claimed
  defect, does not change meaning, and is consistent with the batch's stated policy of
  not re-translating for prose-quality reasons. No fix needed.

## Conclusion

The drafting pass's diff, defect list, and fixes are all verified accurate and
complete. No further defects were found anywhere in batch P's 19 chapters (774
paragraphs). Recommend promoting `full-batchP-corrected.json` as the accepted output
for this batch, closing out the 16-batch full close-read of War and Peace.
