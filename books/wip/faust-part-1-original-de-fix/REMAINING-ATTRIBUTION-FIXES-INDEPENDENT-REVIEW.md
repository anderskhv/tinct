# Independent Review — Remaining Attribution Fixes (Faust Part I, original-de)

**Reviewer:** Independent review agent (fresh read of raw source; not derived from prior release notes)
**Date:** 2026-09-26
**File under review:** `books/wip/faust-part-1-original-de-fix/editions/faust-part-1-original-de.json`
**Raw source:** `books/raw/faust-part-1/raw-de.txt` (sha256 `f6d90c084da1576820da37f76b10ddd0d560d51638643d7f65985aea2980ddc4` — matches spec)
**Prior accepted state:** `git show 6cfdcb0e:books/wip/faust-part-1-original-de-fix/editions/faust-part-1-original-de.json`

## Verdict: **ACCEPT**

All three fixes are correct against the raw source, all other paragraphs in the touched chapters are unchanged, all 25 untouched chapters are byte-identical to the prior accepted state, and the file is valid JSON with the specified structure (28 chapters, 1,095 paragraphs).

---

## 1. Raw-source verification of the three fixes

### (a) Chapter 16, paragraph 5 — MARGARETE attribution
Raw lines ~5605-5625 (`_Ein Gartenhäuschen._` scene):
```
_Margarete._

(ihn fassend und den Kuß zurück gebend.)

          Bester Mann! von Herzen lieb' ich dich!
```
Confirmed: `_Margarete._` stands as a speaker label immediately before the stage direction `(ihn fassend...)`, which itself immediately precedes this exact line. Prefixing "MARGARETE. " is correct and matches the raw attribution precisely.

Diff observed (only change in chapter 16, para index 5 of 20):
- OLD: `"Bester Mann! von Herzen lieb' ich dich!"`
- NEW: `"MARGARETE. Bester Mann! von Herzen lieb' ich dich!"`

### (b) Chapter 21, paragraph 2 — GRETCHEN (not MARGARETE) attribution
Raw lines ~6360-6412 (`_Zwinger._` scene):
```
_Zwinger._

In der Mauerhöhle ein Andachtsbild der #Mater dolorosa,# Blumenkrüge
davor.

_Gretchen._

(steckt frische Blumen in die Krüge.)

Ach neige,
Du Schmerzenreiche,
...
```
Confirmed: the raw source explicitly labels this speech `_Gretchen._`, not `_Margarete._`. The fix correctly uses "GRETCHEN. " rather than "MARGARETE.".

Diff observed (only change in chapter 21, para index 2 of 3):
- OLD begins: `"Ach neige,\nDu Schmerzenreiche,..."`
- NEW begins: `"GRETCHEN. Ach neige,\nDu Schmerzenreiche,..."`
(full body of the prayer otherwise byte-identical)

### (c) Chapter 25, paragraph 7 (old) — Titania/chorus split and missing stage direction
Raw lines ~7520-7545 (`Walpurgisnachtstraum`):
```
_Titania._

        Schmollt der Mann und grillt die Frau,
        So faßt sie nur behende,
        Führt mir nach dem Mittag Sie
        Und Ihn an Nordens Ende.

_Orchester Tutti_

(#Fortissimo.#)

        Fliegenschnauz' und Mückennas',
        Mit ihren Anverwandten,
        Frosch im Laub' und Grill' im Gras'
        Das sind die Musikanten!

_Solo._
        ...
```
Confirmed:
- `_Titania._`'s actual speech is exactly the "Schmollt der Mann..." quatrain — it ends there in the raw source; the following material belongs to a different speaker (`_Orchester Tutti_`).
- `(#Fortissimo.#)` is a bracketed parenthetical performance direction (matching this raw text's stage-direction convention, e.g. compare `(Er küßt sie.)`, `(ihn fassend...)` elsewhere), not spoken text — it correctly becomes its own `[Fortissimo.]` paragraph, not text appended to any speaker's lines.
- The old single paragraph (`old[7]`) had "TITANIA. " + Titania's quatrain + an unlabeled "Orchester Tutti" text line + the chorus quatrain, with the "(Fortissimo.)" direction dropped entirely — i.e., Titania's speech, the chorus's separate speech, and the missing stage direction were all glued together under one speaker tag.

The new split produces exactly three paragraphs (indices 7, 8, 9 of the new 43-paragraph chapter):
- `new[7]` = `"TITANIA. Schmollt der Mann und grillt die Frau,\nSo faßt sie nur behende,\nFührt mir nach dem Mittag Sie\nUnd Ihn an Nordens Ende."`
- `new[8]` = `"[Fortissimo.]"`
- `new[9]` = `"ORCHESTER TUTTI. Fliegenschnauz' und Mückennas',\nMit ihren Anverwandten,\nFrosch im Laub' und Grill' im Gras'\nDas sind die Musikanten!"`

All other paragraphs in chapter 25 are otherwise unchanged (verified programmatically, see §3-4).

---

## 2. GRETCHEN vs MARGARETE consistency check

Verified programmatically across the fixed file (counting paragraphs starting with each label):

| Chapter | Title | Label used | Count |
|---|---|---|---|
| 18 | Gretchens Stube | GRETCHEN. | 1 |
| 20 | Am Brunnen | GRETCHEN. | 6 |
| 22 | Nacht. Straße vor Gretchens Türe | GRETCHEN. | 5 |
| 23 | Dom | GRETCHEN. | 4 |
| 10 | Straße | MARGARETE. | 1 |
| 11 | Abend | MARGARETE. | 2 |
| 13 | Der Nachbarin Haus | MARGARETE. | 15 |
| 15 | Garten | MARGARETE. | 16 |
| 16 | Ein Gartenhäuschen | MARGARETE. | 5 |
| 19 | Marthens Garten | MARGARETE. | 17 |
| 28 | Kerker | MARGARETE. | 23 |

This confirms the file already establishes "GRETCHEN." as the legitimate alternate tag starting from the later, darker scenes (18, 20, 22, 23) while "MARGARETE." is used throughout the earlier/other scenes (10, 11, 13, 15, 16, 19, 28). Chapter 21 (Zwinger) sits chronologically/thematically among the "GRETCHEN." scenes (18, 20, 22, 23 bracket it), so using "GRETCHEN." there is consistent with the file's existing pattern — not an arbitrary or one-off choice.

---

## 3. Chapter 25 split — content-preservation check

Programmatic check confirms no words were dropped, added, or duplicated by the split (beyond the previously-missing stage direction, which is new content by design, not altered dialogue):

```
old_body = old[7] minus "TITANIA. " prefix
new7_body = new[7] minus "TITANIA. " prefix
new9_body = new[9] minus "ORCHESTER TUTTI. " prefix
reconstructed = new7_body + "\nOrchester Tutti\n" + new9_body
reconstructed == old_body   →  True (exact match)
```

The only genuinely new content is the `"[Fortissimo.]"` paragraph — which is the direction that raw source line ~7538 (`(#Fortissimo.#)`) shows was entirely absent from the prior (unfixed) paragraph. This is exactly the described defect (direction "entirely missing") and its correction (added as its own paragraph), with no other content altered.

Paragraphs surrounding the split are untouched:
- `new[0:7] == old[0:7]` → True
- `new[10:] == old[8:]` → True (i.e., everything after the split lines up one-for-one with the old chapter shifted by +2, confirming a clean 1→3 paragraph split with nothing else touched)

---

## 4. Chapters 16, 21, 25 — no other paragraphs changed

Paragraph-by-paragraph diff against the prior accepted state (`6cfdcb0e`):

- **Chapter 16** (20 → 20 paragraphs): exactly 1 paragraph differs (index 5, the MARGARETE fix). All 19 others byte-identical.
- **Chapter 21** (3 → 3 paragraphs): exactly 1 paragraph differs (index 2, the GRETCHEN fix). Both others byte-identical.
- **Chapter 25** (41 → 43 paragraphs): paragraphs 0-6 and 10-42(new)/8-40(old) byte-identical; only the split of old paragraph 7 into new paragraphs 7/8/9 differs, as analyzed above (net +2 paragraphs, consistent with spec).

## 5. All other 25 chapters — untouched

Programmatic dict-equality check of every chapter object except 16, 21, 25 between the new file and the prior accepted state (`6cfdcb0e`) returned **zero differences** — all 25 other chapters (1-15, 17-20, 22-24, 26-28) are unchanged.

## 6. Structural / JSON validity

- File parses as valid JSON.
- 28 chapters total (matches spec).
- 1,095 total paragraphs (matches spec; prior state was 1,093 — the +2 delta is fully and only accounted for by the chapter 25 split, since chapters 16 and 21 kept their paragraph counts of 20 and 3 respectively, both unchanged from the prior state).
- Per-chapter paragraph counts for the three touched chapters: ch16=20 (unchanged), ch21=3 (unchanged), ch25=43 (was 41, +2 from the split).

---

## Summary

| Check | Result |
|---|---|
| Ch16 MARGARETE attribution matches raw source | Pass |
| Ch21 GRETCHEN (not MARGARETE) attribution matches raw source | Pass |
| Ch21 GRETCHEN label consistent with file's existing GRETCHEN/MARGARETE usage pattern | Pass |
| Ch25 Titania/chorus split correctly separates speeches; Fortissimo is a genuine stage direction, previously missing | Pass |
| Ch25 split preserves exact same words (no drop/duplication) | Pass |
| No other paragraphs changed in ch16, ch21, ch25 | Pass |
| All other 25 chapters byte-identical to prior accepted state | Pass |
| Valid JSON, 28 chapters, 1,095 total paragraphs | Pass |

**Verdict: ACCEPT.** All three fixes are independently verified against the raw source and are surgical — no unintended changes elsewhere in the file.
