Model: opus

# French pass — batch 6 review (ch 277, 278, 300, 302, 305, 307, 312, 313, 316, 326)

Method: per-chapter Python diff of `chN-baseline.json` vs `chN-french.json` (paragraph-by-paragraph,
plus `number` / `title` / top-level-key / paragraph-count identity), every changed paragraph read
against `chN-source.json` (Maude) and against `french-pass.md` rules 1–6 and `CONVENTIONS.md`
§"Foreign language and footnotes". Log entries were parsed and string-compared against the actual
before/after text. Candidate chapters spliced into the live edition and run through
`python3 books/edition_checks.py war-and-peace --candidate <spliced> --chapters 277,…,326`:
**0 BLOCK, 0 `bracket-tag`, 0 `footnote-slot-bare`, 0 `footnote-orphan-marker`, 0 `ratio-low`**
(the 61 flags are all pre-existing title-sequence/title-duplicate, long-sentence, near-verbatim and
name-variant items outside this pass's scope).

Case-insensitive scan for `[speaking in …]` across all ten `chN-french.json`: **0 hits** (the baselines
in this batch carried none either; the surviving tags in the directory are in batch 1–3 baselines).

## Diff vs log vs inventory

29 paragraphs changed across 9 chapters (277:2, 278:2, 300:2, 305:5, 307:12, 312:2, 313:2, 316:7,
326:4); **ch302 unchanged**. For every chapter the derived diff index set equals the log headings
exactly and equals the batch6-inventory index set (dialogue ∪ slot) exactly — no extra index, no
missing index, no unlogged edit. Every logged **Before**/**After** string matches the file byte-for-byte
after whitespace trim. Nothing outside the inventory moved: `number`, `title`, top-level keys and
paragraph counts are identical to baseline in all ten chapters. ch302's single inventory item
(p2 dialogue / p3 slot) is a *gloss* footnote ("A captain of Cossacks."); the baseline already carries
the inline gloss and `(An esaul is a captain of Cossacks.)` in the slot, which is what rule 4 asks for,
and the log records the no-change decision with reasoning. Consistent with the `(Old style date.)`
precedent in ch169. Inventory items: 21; items producing no edit: 1 (logged).

## Findings

| # | Sev | Chapter / para | Rule | Finding |
|---|---|---|---|---|
| 1 | MAJOR | ch300 p4 | 5 | The French maxim was (correctly) kept inline in p3 under rule 3, so the slot must keep **Maude's English** footnote. Instead the slot was overwritten with `* Les gros bataillons ont toujours raison.` — the French is now printed twice and Maude's footnote text is lost. Revert p4 to `* Large battalions are always victorious.` |
| 2 | MAJOR | ch316 p11 | 5 | Same violation. p10 now carries `Du sublime … au ridicule il n'y a qu'un pas` inline (twice), yet p11 was overwritten with the same French. Slot must read `* From the sublime to the ridiculous is but a step.` |
| 3 | MAJOR | ch326 p15 | 5 | Verse kept inline in p14 under rule 3, slot overwritten with `* Vive Henri Quatre! …`. Slot must keep Maude's English: `* Long live Henry the Fourth, that valiant king! That rowdy devil.` |
| 4 | MAJOR | ch326 p21 | 5 | Same. Slot must keep `* Who had a triple talent For drinking, for fighting, And for being a gallant old boy...` |
| 5 | MODERATE | ch313 p22 | 2 | **Ruling: the added cue is redundant.** The paragraph already reads "having picked up this expression from the French", so the line now says it twice — "Dolokhov kept saying (in French), having picked up this expression from the French". Rule 2 wants the fact of French marked *once*; the narration already marks it, and Maude's own sentence carries no second signal. Drop `(in French)` from p22. The slot change (`* Filez, filez!`) is correct and is by itself sufficient to satisfy the convention here. |
| 6 | MINOR | ch300 p3 | 3 / 6 | The inline English gloss was also rewritten, from Maude's footnote sense ("Large battalions are always victorious") to "big battalions are always right". Meaning is preserved and the phrase is the conventional English form of the maxim, so this is acceptable — but only once finding 1 restores Maude's wording to the slot; otherwise Maude's footnote disappears from the edition entirely. |
| 7 | MINOR | ch316 p2 | 2 | Cue lands as `…play the general" (in French)—but then immediately ran away`. Correct per rule 2 (no speech verb), but it reads awkwardly wedged before the em dash. Optional: move to `…play the general" (in French), but then…`-style only if the batch is being touched anyway; not a blocker. |
| 8 | MINOR | ch307 p22; ch326 p20 | 6 (pre-existing) | Baseline English drifts from Maude's footnote: "Good evening, gentlemen!" for `Bonjour, messieurs!` (Maude: "Good day, gentlemen"), and "a charming fellow" for `un vert galant` (Maude: "a gallant old boy"). Rule 6 correctly kept the drafter's hands off these, and both slots now carry the French so the reader can check — flag for the fidelity gate, not for this pass. |
| 9 | INFO | ch305 p32; ch316 p9 | 4 | Chained second footnotes preserved as `* (2) Entrez, entrez.` / `* (2) que c'est grand`, matching the source's `*(2)` numbering. Correct, and consistent with the batch-4 treatment. |
| 10 | INFO | ch305 p30; ch316 p7 | 2 | Paragraphs carrying two French footnotes take the cue once only. Correct reading of "once per paragraph". |
| 11 | INFO | ch307 p8 | 2 | `"Password." (in French)` — no speech verb, cue after the closing quotation mark. Correct. |

Rules (a)–(e) as applied: (a) English keeps the source footnote's meaning in all 29 changed paragraphs,
with the two pre-existing drifts at finding 8; (b) cue appears exactly once per changed dialogue
paragraph, redundant only at ch313 p22 (finding 5); (c) slots hold the source's foreign wording prefixed
`* ` — correct everywhere except the four rule-5 slots in findings 1–4, which must instead hold Maude's
English, plus ch302's parenthesised gloss which is correct as-is; (d) nothing outside the inventory
changed; (e) no `[speaking in …]` tag remains, in any case.

## Required before re-review

1. ch300 p4 → `* Large battalions are always victorious.`
2. ch316 p11 → `* From the sublime to the ridiculous is but a step.`
3. ch326 p15 → `* Long live Henry the Fourth, that valiant king! That rowdy devil.`
4. ch326 p21 → `* Who had a triple talent For drinking, for fighting, And for being a gallant old boy...`
5. ch313 p22 → remove `(in French)`; keep the slot as `* Filez, filez!`
6. Record findings 1–5 in the affected `chN-french-log.md` files so the rule-5 slot convention is not
   re-broken by the next batch (batch 4 lost four slots the same way, and ch186 in the drafting lane
   shows the same pattern — worth a note to the final sweep).

French batch verdict: ANOTHER ROUND
