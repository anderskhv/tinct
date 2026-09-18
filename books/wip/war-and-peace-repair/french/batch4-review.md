Model: opus

# French pass — batch 4 review (ch 76, 79, 85, 90, 97, 103, 111, 113, 115, 117, 121, 126, 127, 139, 146, 148, 150, 155, 169, 171)

Method: per-chapter Python diff of `chN-baseline.json` vs `chN-french.json` (paragraph-by-paragraph,
plus `number`/`title`/paragraph-count identity), every changed paragraph read against `chN-source.json`
(Maude) and against `french-pass.md` rules 1–6 and `CONVENTIONS.md` §"Foreign language and footnotes".
Candidate spliced into the live edition and run through
`python3 books/edition_checks.py war-and-peace --candidate <spliced> --chapters 76,…,171`:
**0 BLOCK, 0 `bracket-tag`, 0 `footnote-slot-bare`, 1 `footnote-orphan-marker` (ch97 p14)**.

## Diff vs log vs inventory

43 paragraphs changed across 18 chapters (76:1, 79:2, 85:1, 90:2, 97:9, 103:2, 111:3, 113:1, 115:3,
117:1, 121:4, 126:2, 127:2, 139:1, 146:2, 148:2, 155:2, 171:3); ch150 and ch169 unchanged.
**Derived diff = log headings = 43 exactly**, and every changed index is inside the batch4-inventory
index set (dialogue ∪ slot). Nothing changed outside the inventory: no title, `number` or
paragraph-count change in any chapter, and no untouched-paragraph drift. Seven inventory dialogue
indices (76 p1, 85 p13, 111 p34, 113 p17, 117 p8, 139 p45, 171 p13) and the whole of ch150/ch169 were
deliberately left alone, each with a written "no change needed" entry in the log. Inventory items: 30;
items that produced no edit: 8 (all logged). No unlogged edit, no logged non-edit.

## Ruling on ch97 p14 / p16 / p17

**The re-pairing is right; the p14 omission is not.** Maude's ch97 has two footnotes: source p14 ends
`"Il faut que vous sachiez que c'est une femme," *` and source p15 is `"Andrew, au nom de Dieu!" *(2)`;
the slots follow as p16 = `* "You must know that this is a woman."` (footnote 1, i.e. p14's French) and
p17 = `* (2) "For heaven's sake."` (footnote 2, i.e. p15's French). The inventory's auto-derived pairing
(15→16, 16→17) is off by one paragraph — p16 is itself a slot, not a dialogue line. The drafter's
slots (p16 ← `* Il faut que vous sachiez…`, p17 ← `* Andrew, au nom de Dieu!`) restore the source's
actual footnote ownership and are correct; the inventory is what is wrong here, not the file.

But p14 is then left inconsistent: its slot now carries French, while p14 itself still carries the bare
`*` marker and still has no `(in French)` cue. It is an ordinary `french-kept`-shaped paragraph and
needed the same treatment as p19/p46 in the same chapter. `edition_checks.py` confirms this as the
batch's only structural flag. The log documents neither the re-pairing rationale nor the p14 decision.

## Findings

| # | Sev | Chapter / para | Rule | Finding |
|---|---|---|---|---|
| 1 | MAJOR | 127 p18/p19 | 5, (c) | `Le cousinage est un dangereux voisinage` is a proverb kept inline under rule 3, so the slot must keep Maude's English. The drafter overwrote the slot with the *same* French, so the proverb is now printed twice. The baseline slot (`* "Cousinhood is a dangerous neighborhood."`) was already correct and should have been left; only p18 needed the edit. |
| 2 | MAJOR | 171 p21/p22 | 5, (c) | Identical defect. `royauté oblige` kept inline with its English, and slot p22 overwritten with `* Royauté oblige!` — French twice. Slot should read `* "Royalty has its obligations."` (baseline already held that English, only needing the `(The French phrase means: …)` wrapper reformatted). |
| 3 | MAJOR | 90 p16/p17 | 5, (c) | `L'Urope ne sera jamais notre alliée sincère` is rule 3 (the "Urope" mispronunciation is the point) and is kept inline with a parenthesised English gloss — then slot p17 was overwritten with the same French. Three printings of the French in two paragraphs. Slot should be `* "Europe will never be our sincere ally."` |
| 4 | MODERATE | 97 p14 | 2, (b) | Orphan `*` left in the dialogue paragraph and no `(in French)` cue, although its footnote (p16) was correctly re-pointed at it. Only `footnote-orphan-marker` flag in the batch. |
| 5 | MINOR | 169 p17 vs 150 p7/p12 | 5 | Rule-5 slots are formatted two ways: `("Those whom God wishes to destroy…")` in ch169 but `* Death gives relief…` in ch150. Pick one (`* <English>` per rule 5). Also ch150 p12 is `*Poisonous…` — missing the space after `*`. |
| 6 | MINOR | 150 p6, p11 | 2 | Trailing `*` markers retained in the dialogue paragraphs, where every other chapter in the batch had the marker stripped. Not flagged (next paragraph is a slot), but inconsistent. |
| 7 | MINOR | 97 p17 vs 115 p3 | 4 | Second-footnote ordinal kept in ch115 (`* (2) D'une femme charmante…`) but dropped in ch97 p17. Choose one. |
| 8 | MINOR | 111 p32 | 4 | Slot capitalises `Le principe…` where Maude has lowercase `le` mid-sentence; ch117 p9 correctly preserves lowercase `das soll mein Weib werden`. |
| 9 | MINOR | 171 p13 | 2 | No `(in Italian)` cue. The log defends it via "some Italians called out to him", which is thin but defensible; flagged for consistency with ch111 p34, where "pronouncing French with evident difficulty" carries the same weight and is accepted. |

## What passes

- **(a) meaning.** All 20 translation-type slots and inline renderings keep the source footnote's sense.
  Spot-checks against Maude: ch97 p11/p19/p46, ch103 p13, ch111 p31, ch115 p1, ch121 p2/p18, ch146 p4,
  ch148 p3, ch155 p7 — no drift, no added or lost clause, no prose modernisation outside the French handling (rule 6).
- **(b) cue once.** Every changed dialogue paragraph carries `(in French)` / `(in German)` exactly once
  (ch117 p8 and ch126 p10 correctly use "in German"; ch126 p10 "what it means to be a man (in German)").
  No paragraph carries two cues; no cue was added to a paragraph the source did not mark.
- **(c) slot content.** Translation slots hold the source's foreign wording prefixed `* ` and match Maude
  word for word (ch97 ×4, ch103, ch111 ×2, ch115 ×2, ch117, ch121 ×2, ch126, ch146, ch148, ch155).
  All five named gloss slots are correctly parenthesised and free of the `* ` prefix, matching the
  ch169 p2 house precedent: ch76 p2 `(Frühstück: breakfast.)` (umlaut correctly restored per the
  diacritics rule), ch79 p4 `(Denisov.)`, ch85 p14 `(To indicate he didn't want more tea.)`,
  ch113 p18 `(The Illuminati…)`, ch139 p46 `(The French shawl dance.)`.
- **(d) scope.** No change outside the inventory in any of the 20 chapters.
- **(e) tags.** Case-insensitive search for `[speaking in …]` and `[in french|german|italian` across all
  20 baseline and all 20 candidate files: **zero hits**, before and after. Nothing to clean up here.

## Merge caveat (not a drafter fault)

`chN-baseline.json` differs from the current live `war-and-peace-modern-en.json` in 9 paragraphs of
4 chapters — ch90 p12, ch121 p16/p17, ch139 p51, ch148 p15/p17/p20/p23/p25 — all name-variant deltas
(Bolkonski/Bolkonsky, Mikhaylovna/Mikhailovna) from a separate consistency pass. None is an inventory
index. Splice the changed paragraphs in by index rather than replacing whole chapters, or these
paragraphs will be silently reverted.

## Required before re-review

1. ch127 p19 → `* "Cousinhood is a dangerous neighborhood."`
2. ch171 p22 → `* "Royalty has its obligations."`
3. ch90 p17 → `* "Europe will never be our sincere ally."`
4. ch97 p14 → strip the `*`, add the cue: `…"You must know that this is a woman," Prince Andrew said to Pierre (in French).`
5. Settle findings 5–8 (one rule-5 slot format, one ordinal convention, `* ` spacing, source capitalisation)
   and record the ch97 footnote re-pairing in `ch97-french-log.md`.

French batch verdict: ANOTHER ROUND
