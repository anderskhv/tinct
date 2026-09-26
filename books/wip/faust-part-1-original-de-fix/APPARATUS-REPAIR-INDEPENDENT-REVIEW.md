# Independent Review — Faust Part I, `original-de` Apparatus Repair

**Reviewer:** independent verification pass (this session), performed against raw source and the pre-fix (commit `dc77f925`) JSON before consulting the repair's own changelog.

**Verdict: ACCEPT**

No paragraph-level defects were found. Every claim in `CHANGELOG-apparatus-repair.json` that was checked, checked out. Per-chapter paragraph deltas computed independently match the changelog exactly, with no discrepancies.

---

## 1. Structural validity

- Candidate (`editions/faust-part-1-original-de.json`) is valid JSON, 28 chapters, 1093 paragraphs total. Matches spec.
- All paragraphs are plain strings (no malformed objects).

## 2. Untouched chapters (1, 4, 9)

Compared byte-for-byte (full JSON equality, not just paragraph count) against the commit-`dc77f925` starting version:

- Chapter 1 (Zueignung): identical.
- Chapter 4 (Nacht): identical.
- Chapter 9 (Hexenküche): identical.

Confirmed untouched as claimed.

## 3. Defect 1 — Chapter 5 crowd scene ("Vor dem Thor")

Read raw-de.txt lines ~1159–1495 directly and compared against both the prior (42-paragraph) and candidate (61-paragraph) chapter 5.

- Prior chapter 5 paragraph-by-paragraph inspection confirms the defect as described: consecutive distinct speakers ("Andre.", "Fünfter.", "Dienstmädchen.", "Erste.", etc.) were merged under a single wrong/stale speaker label, with several genuine labels silently dropped, and the scene-opening stage direction ("Spaziergänger aller Art ziehen hinaus.") missing entirely.
- Candidate chapter 5 was checked speaker-by-speaker against raw-de.txt (all 61 paragraphs read against the source): every restored label (`EINIGE HANDWERKSBURSCHE`, `ANDRE`, `DIE ERSTEN`, `EIN HANDWERKSBURSCH`, `ZWEYTER`, `DIE ZWEYTEN`, `EIN DRITTER`, `VIERTER`, `FÜNFTER`, `DIENSTMÄDCHEN`, `ERSTE`, `SCHÜLER`, `BÜRGERMÄDCHEN`, `[ZWEYTER SCHÜLER zum ersten]`, `ERSTER`, `BÜRGER`, `[BETTLER singt]`, `ANDRER BÜRGER`, `DRITTER BÜRGER`, `[ALTE zu den Bürgermädchen]`, `DIE ANDRE`, `SOLDATEN`, `ALLE`) matches the raw source's speaker cues correctly, in correct order, with correct dialogue attached.
- **Self-check verified independently**: programmatically stripped every speaker label / bracketed stage direction from both the candidate's 61 paragraphs (skipping only the restored opening stage-direction line, which is a Defect-2 addition, not part of the Defect-1 re-split) and the prior's 42 paragraphs, then diffed the two resulting dialogue streams. They are identical except for one already-accounted-for artifact: the prior had a stray, unlabeled floating fragment "Zweyter Schüler zum ersten." sitting in the body text (itself a defect), which the candidate correctly converts into a bracketed stage direction. No dialogue was dropped, duplicated, or textually altered anywhere in the re-split — only re-attributed/re-split, exactly as claimed.
- Net delta for chapter 5 is +19 (42→61): +18 from the crowd-scene re-split (12 merged paragraphs → 30) and +1 from a separate fix (splitting off the "ALLE." line from a paragraph wrongly attributed entirely to "ALTER BAUER"). Both changelog entries for chapter 5 line up with this exactly.

## 4. Defect 2 — Missing scene-opening stage directions/speaker labels

Spot-checked 16 of the affected chapters directly against raw-de.txt (exceeding the required 12): chapters 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 19, 20, 22, 24, 26, 27, 28.

For every one of these, the restored opening bracket/stage-direction/speaker-label was verified to be an accurate transcription of the corresponding raw-source cast-list line(s), and the paragraph(s) immediately following (the actual dialogue text) were confirmed unchanged from the prior version except for the label now correctly prefixed. Representative confirmations:

- Ch. 6: `[FAUST mit dem Pudel hereintretend]` ← raw line 1718.
- Ch. 7: `[FAUST. MEPHISTOPHELES]` ← raw line 2207.
- Ch. 11: two-part restore (`Ein kleines reinliches Zimmer.` / `[MARGARETE ihre Zöpfe flechtend und aufbindend]`) ← raw lines 4464–4468, correctly split scene-setting vs. character-action per the chapter-4/8/9 convention.
- Ch. 14: `[FAUST. MEPHISTOPHELES]` ← raw line 5168, which in the raw source has the OCR-era typo "Mehpistopheles"; candidate correctly normalizes it (see §6).
- Ch. 17: `[FAUST allein]` ← raw line 5694.
- Ch. 19: `[MARGARETE. FAUST]` ← raw line 5983.
- Ch. 20: `[GRETCHEN und LIESCHEN mit Krügen]` ← raw lines 6261–6263, with the first speaker correctly identified as LIESCHEN (not GRETCHEN), matching raw line 6265.
- Ch. 22: `[VALENTIN Soldat, Gretchens Bruder]` ← raw line 6420.
- Ch. 24: two-part restore (`Harzgebirg.\nGegend von Schirke und Elend.` / `[FAUST. MEPHISTOPHELES]`) ← raw lines 6820–6826, correctly separating the place-name stage direction from the cast-list bracket.
- Ch. 27: full stage direction `[FAUST. MEPHISTOPHELES auf schwarzen Pferden daher brausend]` restored from a truncated fragment ("auf schwarzen Pferden daher brausend.") ← raw lines 7903–7904.
- Ch. 28: `[FAUST mit einem Bund Schlüssel und einer Lampe, vor einem eisernen Thürchen]` restored from a truncated fragment ("Thürchen.") ← raw lines 7936–7937.

No dialogue text was altered in any of these chapters beyond the label/bracket insertion itself.

## 5. Defect 3 — Heading fragments and PG "#" markup

- Chapter 2: paragraph 0 was the stray fragment `"lustige Person._"`. Confirmed against raw lines 111–112 (`_Director, Theaterdichter,\nlustige Person._`) — candidate correctly replaces it with the full cast-list stage direction `[DIRECTOR, THEATERDICHTER, LUSTIGE PERSON]`.
- Chapter 3: last paragraph previously ended with the stray fragment `"Der Tragödie"`, bled in from the next chapter's title (`_Der Tragödie_ / _Erster Theil._`, raw lines 547–549). Confirmed removed; Mephistopheles' closing line now correctly ends at "...selbst zu sprechen."
- Chapter 25: paragraphs 0–2 were title/subtitle debris (`"Walpurgisnachtstraum\noder"`, a bracket, and `"OBERONS. Intermezzo."` — the last mis-attributing the genre subtitle "Intermezzo." to a fictitious speaker "OBERONS"). Confirmed against raw lines 7481–7487 and verified the candidate now merges these into a single non-speaking stage direction `[Oberons und Titanias goldne Hochzeit. Intermezzo.]`, with THEATERMEISTER's actual speech intact as the next paragraph.
- **Zero "#" characters remain anywhere in the candidate file** (checked programmatically across all 28 chapters/1093 paragraphs).

## 6. Flagged judgment calls — independently verified as accurate

- **Chapter 16, two further unfixed instances of the same missing-label bug** (explicitly out of scope): confirmed present and unfixed. Paragraph 4 (`[ihn fassend und den Kuß zurück gebend]`) omits the `MARGARETE` name from the bracket, and paragraph 5 (`"Bester Mann! von Herzen lieb' ich dich!"`) carries no speaker label at all — both verified against raw lines 5605–5626, where the raw source repeats a bare `_Margarete._` label before the parenthetical stage direction, which was dropped in both the prior and candidate versions. This is a real, still-present defect of the same class, correctly left out of scope and correctly disclosed.
- **Chapter 21, unfixed GRETCHEN-attribution gap** (explicitly out of scope): confirmed. Candidate paragraph 1 (`[steckt frische Blumen in die Krüge]`) and paragraph 2 (the "Ach neige..." poem) both lack the `GRETCHEN.` speaker label that raw lines 6363–6364 show (`_Gretchen._` / `(steckt frische Blumen in die Krüge.)`). Confirmed unfixed as claimed; the chapter's actual assigned Defect-3 fix (removing the `#Mater dolorosa#` markup in paragraph 0) was correctly applied.
- **Chapter 25, "Orchester Tutti (Fortissimo.)" label swallowed with no "#" survivor, unfixed**: confirmed. Candidate paragraph 7 is attributed entirely to `TITANIA` and includes the "Orchester Tutti" ensemble stanza (Fliegenschnauz'/Mückennas'...) run on as if it were Titania's own speech, verified against raw lines 7531–7541 (`_Orchester Tutti_` / `(#Fortissimo.#)`). Both the speaker mislabeling and the missing "#" markup for this line persist in the candidate, exactly as flagged, and correctly left out of the fix's scope.
- **"Mehpistopheles" → "MEPHISTOPHELES" typo normalization**: confirmed correct. Raw line 5168 has the source's own OCR-era typo "Mehpistopheles". The candidate normalizes this occurrence to "MEPHISTOPHELES" in chapter 14's opening bracket. A full scan of the candidate file for every spelling variant of the name found: `MEPHISTOPHELES` (all-caps speaker-label form) used 307 times, always spelled correctly and consistently, and `Mephistopheles` (mixed-case, mid-sentence narrative form, e.g. inside stage directions like "nachher Mephistopheles.") used 7 times, also always spelled correctly. No instance of "Mehpistopheles" or any other misspelling remains anywhere in the file.

## 7. Paragraph counts vs. the repair's own report

Independent per-chapter deltas were computed (candidate paragraph count − commit-`dc77f925` paragraph count) before reading `CHANGELOG-apparatus-repair.json`, then cross-checked against it:

| Ch | Δ (independent) | Consistent with changelog entries? |
|----|------|------|
| 1 | 0 | yes (untouched) |
| 2 | 0 | yes (fragment→full replace, no count change) |
| 3 | 0 | yes (one insertion + one bleed removal, net 0) |
| 4 | 0 | yes (untouched) |
| 5 | +19 | yes (+18 crowd re-split, +1 ALLE split) |
| 6 | +1 | yes |
| 7 | +1 | yes |
| 8 | +1 | yes |
| 9 | 0 | yes (untouched) |
| 10 | +1 | yes |
| 11 | +2 | yes (two insertions + one relabel) |
| 12 | +1 | yes |
| 13 | +1 | yes |
| 14 | +1 | yes |
| 15 | +1 | yes |
| 16 | 0 | yes (fragment restore only, no split) |
| 17 | +1 | yes |
| 18 | +1 | yes |
| 19 | +1 | yes |
| 20 | +1 | yes |
| 21 | 0 | yes (apparatus-only removal) |
| 22 | +1 | yes |
| 23 | +1 | yes |
| 24 | +2 | yes (two insertions + one relabel) |
| 25 | -2 | yes (3 title/subtitle paragraphs merged into 1) |
| 26 | +1 | yes |
| 27 | 0 | yes (fragment restore only) |
| 28 | +1 | yes |

Total: 1056 → 1093 (+37), matching both the candidate's actual total and the sum of the changelog's own per-chapter deltas exactly. No discrepancy found anywhere.

## Findings

No paragraph-level defects requiring correction were found. Every checked chapter's restored labels/stage directions are accurate to the raw source, no dialogue text was altered, dropped, or duplicated, the three flagged-as-unfixed judgment calls (ch. 16, ch. 21, ch. 25) are genuine, correctly scoped-out, still-present defects (not oversights the repair should have caught), and the "Mehpistopheles"→"MEPHISTOPHELES" normalization is correct and consistent throughout the file.

## Verdict: **ACCEPT**
