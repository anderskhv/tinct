Model: opus

# French pass — batch 5 review (independent)

Chapters 186, 189, 197, 206, 207, 213, 235, 248, 255, 257, 262, 263, 266.
Method: Python diff of `chN-baseline.json` vs `chN-french.json`, every changed
paragraph read against `chN-source.json` (Maude) and against the six rules in
`prompts/modern-en-repair/french-pass.md` / `CONVENTIONS.md` §"Foreign language
and footnotes". Change list derived independently, then compared with the logs
and the inventory.

## Diff vs log vs inventory

**44 changed paragraphs across 13 chapters. Derived diff == log == inventory (dialogue + slot) for all 13 chapters, once the six chained-footnote / natural-cue traces below are allowed; zero paragraphs changed outside the inventory; chapter `number` and `title` byte-identical in every file; paragraph counts unchanged (16/31/23/24/53/10/23/25/24/35/43/38/32).**

Per chapter — changed (logged) vs inventory indices:

| Ch | changed = logged | inventory | unchanged inventory index — ruling |
|---|---|---|---|
| 186 | 10 | 9,10 | p9 rule 3 (666 arithmetic), correctly untouched |
| 189 | 12,13 | 12,13 | — |
| 197 | 2,3,18,19 | 2,3,18,19 | — |
| 206 | 14,15,18,19 | 14,15,17,18,19 | inv "dialogue 18" is itself the slot for 17; true dialogue is p17 — **correct** |
| 207 | 4,33,34,42,43,49,50 | +3 | p3 already inline English with Maude's own natural cue ("had told them in French") — **correct**, only slot 4 needed changing |
| 213 | 2 | 1,2 | p1 gloss-type (`flèches`), term stays inline, no cue due — **correct** |
| 235 | 13,14 | 13,14 | — |
| 248 | 8,9,12,13,16,17,18 | same | inv "dialogue 17" is the slot for 16; drafter treated p16 as dialogue with chained slots 17/18 — **correct** |
| 255 | 21,22 | 21,22 | — |
| 257 | 2,3,5,6,9 | +8 | p8 carries Maude's natural cue ("he asked again in French") — **correct**, only slot 9 changed |
| 262 | 21,22 | 21,22 | — |
| 263 | 19,20 | 19,20 | — |
| 266 | 0,1,2,3,4 | same | inv "dialogue 3" is the slot for 2; drafter traced the true dialogue to p2 with chained slots 3/4 — **correct** |

Log before/after strings were compared byte-for-byte against the actual
baseline and french text: all 44 match. Nothing was changed but not logged, and
nothing was logged but not changed.

## Findings

| # | Sev | Where | Finding |
|---|---|---|---|
| 1 | **MAJOR** | ch186 p10 | **Rule 5 violation.** Slot changed `* Forty-two.` → `* Quarante-deux.` while p9 keeps `quarante-deux (forty-two)` inline under rule 3 (the chapter rule 3 names explicitly). French is now printed twice and Maude's English footnote is lost. Rules 5/§4-5 require the slot to keep `* <English>` exactly where the foreign wording stays inline. Same class as the three rule-5 duplicates batch 4 had to fix in round two. Fix: revert p10 to `* Forty-two.` — ch186 then has zero changes and the inventory item is a no-op. |
| 2 | MINOR | ch197 p18 | Cue floats after the terminal period: `…would affect this child of the Don. (in French)`. Should sit inside the sentence: `…this child of the Don (in French).` No quotation mark and no speech verb here, so rule 2's two placements don't apply literally; the parenthesis still belongs to the clause. |
| 3 | MINOR | ch255 p22 | Slot `* Au patriotisme féroce de Rostopchíne.` keeps Maude's stress accent on a Russian name; the Diacritics convention drops those (`Rostopchine`). Only slot in the whole French workspace carrying a Russian stress accent. Capitalising source's mid-sentence `au` → `Au` is fine and matches the other slots. |
| 4 | MINOR | ch206 p14/p17, ch207 p42 | `Tout vient à point à celui qui sait attendre`, `Dans le doute… abstiens-toi`, `Qui s'excuse s'accuse` are proverbs and arguably qualify for rule 3 inline retention — the more so at ch206 p17, where Maude writes "he articulated the French proverb deliberately". Drafter applied the default `french-kept` treatment instead. Consistent with batches 1 and 4, so noted only; no action this round. |
| 5 | MINOR | ch257 p2 | `he said (in French) gaily` splits "said … gaily". Permitted by rule 2 (after the speech verb); reads slightly stiff. |

## Rule-by-rule verification

- **(a) English keeps the source footnote's meaning.** Checked all 17 cued dialogue paragraphs against Maude's footnote: ch189 "cannon fodder" ← "Food for cannon"; ch197 p2/p18; ch206 p14; ch207 p33/p42/p49; ch248 p8/p12/p16; ch255 p21; ch257 p2/p5; ch262 p21; ch263 p19; ch266 p0/p2 — all faithful. ch206 p14 drops "in time" from "Everything comes in time to him who knows how to wait"; pre-existing in the baseline, not introduced here, meaning intact.
- **(b) Cue once, not duplicated.** No paragraph in the batch carries more than one `(in French)`. No cue was added to any paragraph that already has a natural cue: the five inventory paragraphs left unchanged are exactly the ones where Maude's own "in French" / "the French proverb" already does the work (ch186 p9, ch206 p17, ch207 p3, ch257 p8) or where no cue is due (ch213 p1, gloss).
- **(c) Slot contents.** 20 slots rewritten. 18 are `* ` + the source's quoted foreign wording only, narration stripped; chained footnotes keep Maude's `(2)` numbering (ch206 p19, ch248 p18, ch266 p4). The two gloss-type items — ch213 p2 `(A type of entrenchment.)` and ch235 p14 `(A lay member of the Society of Jesus.)` — use the parenthesised, asterisk-free form already accepted in batches 1 and 4 (19 instances across the workspace, e.g. `(Old style date.)`, `(An esaul is a captain of Cossacks.)`); consistent. Rule-3-with-slot: applies only to ch186, and is where finding 1 sits.
- **(d) Nothing outside the inventory changed.** Confirmed by full-paragraph diff of all 13 chapters. Stronger: normalising away `(in French)` and the orphan `*`/`*(2)` marker makes every changed dialogue paragraph byte-identical to its baseline — **0 paragraphs with prose drift**, so rule 6 is clean. Orphan markers left stranded in baseline prose were removed at ch235 p13, ch248 p8/p12, ch255 p21, ch262 p21, ch263 p19, ch266 p0/p2; no `*` remains inside any prose paragraph.
- **(e) ch186.** p9 sha256 identical before and after. String counts unchanged: `L'Empereur Napoleon` ×2, `quarante-deux` ×1, `L'russe Besuhof` ×2, `L'Empereur Alexandre` ×1, `La nation russe` ×1, `Comte Pierre Besouhoff` ×1, `Le russe Besuhof` ×1, `666` ×5. The slot change is **not** correct — see finding 1.
- **(f) Bracket tags.** Case-insensitive scan for `[…]` and `speaking in` across all 13 candidates: **zero** remaining tags. One false positive, ch189 p5 "was speaking in one of the rooms" (ordinary narration).
- **Gate.** `python3 books/edition_checks.py war-and-peace --candidate chN-french.json` for all 13: **0 BLOCK, 0 bracket-tag, 0 footnote-slot-bare, 0 orphan-marker**. Only the pre-existing whole-book `title-sequence` flags for the 16 book-final chapters (known source defect, out of scope).

## Verdict

Twelve of thirteen chapters are clean and can be carried into round two unchanged. One MAJOR rule-5 violation blocks acceptance; the fix is a one-line revert of ch186 p10 to `* Forty-two.` Findings 2 and 3 are worth folding into the same round-two pass.

French batch verdict: ANOTHER ROUND
