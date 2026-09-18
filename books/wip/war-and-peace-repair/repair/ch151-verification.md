Model: opus

# ch151 — independent verification (2026-09-18)

Verifier is not the corrector. Inputs: `repair/ch151-baseline.json`, `repair/ch151-corrected.json`,
`repair/ch151-corrections-log.md`, `repair/ch151-source.json` (Maude).

## 1. Diff (computed, Python, paragraph-by-paragraph)

Changed paragraph indices: **[4]** — and only 4.

Log claims: p4 only. **Log and diff agree exactly**; both logged strings are byte-identical to the baseline
and corrected paragraphs. Nothing unlogged, nothing claimed but unmade.

The single textual delta inside p4 is `Hello, Sonya dear!` → `Bonjour, Sonya dear!`. Everything else in that
long paragraph is character-for-character identical.

## 2. Structure

| Check | Baseline | Corrected | Verdict |
|---|---|---|---|
| `number` | 151 | 151 | unchanged |
| `title` | Book Eight (1811 - 12) — Chapter 6 | same | unchanged |
| paragraph count | 14 | 14 | unchanged (= source 14) |
| top-level keys | number/title/paragraphs | same | unchanged |
| empty paragraphs | — | none | ok |
| chapter `?` / `!` totals | 11 / 13 | 11 / 13 | unchanged |
| p4 `?` / `!` vs source | src 3 / 7 | cand 3 / 7 | parity holds |
| footnote slots | none in source, none in either candidate | — | ok |

## 3. The change, re-derived from the source

Source p4 (Maude): `... "Bring some rum for tea!... Bonjour, Sónya dear!" she added, turning to Sónya and
indicating by this French greeting her slightly contemptuous though affectionate attitude toward her.`

Maude writes `Bonjour` and then the narration *names it as French and makes it characterise Márya
Dmítrievna's relation to Sónya*. The baseline's "Hello" broke the sentence: the narration went on referring to
"this French greeting" while no French greeting was on the page. That is an internal contradiction, not merely
a lost flavour. **Rule 3** covers it squarely — the wording itself is the point — so `Bonjour` is restored inline.

**Verdict on p4: correct, complete, no new drift.**
- Restores exactly Maude's word, in exactly Maude's position.
- No English gloss was added, and none should be: the clause `indicating by this French greeting` is itself the
  gloss Maude supplies, and `Bonjour` is the one French word an English reader can be assumed to carry. Adding
  "— hello" would be redundant with the narration and would read as talking down.
- The distinction the sentence exists to make — she greets the poor relation in French, the others in Russian —
  is now legible again.
- Word count 113 → 115 (source 113); the delta is the tokenisation of the restored word, no content added.

## 4. New-reader read

Clear, and clearer than before. The greeting is now visibly a different register from everything else she says
in the paragraph ("what are you dawdling for?", "Get the samovar ready!", "You're half frozen, I'm sure!"), which
is what makes the closing narration land.

## 5. Mechanical checks

`python3 books/edition_checks.py war-and-peace --candidate repair/ch151-corrected.json`

- `blocks: 0`
- No `bracket-tag`, `footnote-slot-bare`, `footnote-orphan-marker` or `inline-marker-with-slot` flag for ch151.
- **Zero** chapter-scoped flags for ch151 at all (`long_sentences_gt50: 0`).
- Remaining flags (`title-sequence`, `title-duplicate`, `name-variant`) are book-wide properties of the
  assembled edition, not of this chapter or this edit.
- Summary: `{"chapters_checked": 1, "paragraphs_checked": 14, "ratio_low": 0, "french_kept_paragraphs": 0, "blocks": 0}`

## 6. New findings

None blocking. Out-of-scope observation (pre-existing in the baseline, *not* introduced by this edit): the same
paragraph renders Maude's `slightly contemptuous though affectionate` as `slightly condescending though
affectionate`. "Condescending" softens Maude, and it sits in the very clause this correction was protecting.
Worth queueing for a fidelity pass; it is not a French-pass item and this edit neither caused nor worsened it.

Verification: ACCEPT
sha256: repair/ch151-corrected.json 833c67ebf24870a422e4a7b0fa1b9c6944188418c2b15c1f561861769e894b96
