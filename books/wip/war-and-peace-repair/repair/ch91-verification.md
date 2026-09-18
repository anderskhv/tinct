Model: opus

# ch91 — independent verification (2026-09-18)

Verifier is not the corrector. Inputs: `repair/ch91-baseline.json`, `repair/ch91-corrected.json`,
`repair/ch91-corrections-log.md`, `repair/ch91-source.json` (Maude).

## 1. Diff (computed, Python, paragraph-by-paragraph)

Changed paragraph indices: **[7]** — and only 7.

Log claims: p7 only. **Log and diff agree exactly**; both logged strings are byte-identical to the
baseline and corrected paragraphs. Nothing unlogged, nothing claimed but unmade.

## 2. Structure

| Check | Baseline | Corrected | Verdict |
|---|---|---|---|
| `number` | 91 | 91 | unchanged |
| `title` | Book Five (1806 - 07) — Chapter 7 | same | unchanged |
| paragraph count | 22 | 22 | unchanged (= source 22) |
| top-level keys | number/title/paragraphs | same | unchanged |
| empty paragraphs | — | none | ok |
| chapter `?` / `!` totals | 5 / 5 | 5 / 5 | unchanged |
| p7 `?` / `!` vs source | src 0 / 1 | cand 0 / 1 | parity holds |
| footnote slots | none in source, none in either candidate | — | ok |

## 3. The change, re-derived from the source

Source p7 (Maude): `"Oh, it's nothing. I only wished to say..." (he wanted to repeat a joke he had heard in
Vienna and which he had been trying all that evening to get in) "I only wished to say that we are wrong to
fight pour le Roi de Prusse!"`

Maude leaves the French inline and gives it no footnote in this chapter. **Rule 3** applies — the wording is
the point — so it stays inline with the English immediately after.

### Does Maude's joke actually depend on the idiom? — checked, yes.

`travailler pour le roi de Prusse` is a stock French idiom meaning *to work for nothing, without reward*.
Hippolyte's line is funny only because both readings fire at once: Russia is literally fighting on Prussia's
side **and** fighting for nothing. The chapter itself proves the double reading is live:

- src p5 — Anna Pávlovna primes it: `"Come now, what about your Roi de Prusse?"`
- src p8 — `Borís smiled circumspectly, so that it might be taken as ironical or appreciative according to the
  way the joke was received. Everybody laughed.` (a joke, and one whose reception is uncertain)
- src p9 — `"Your joke is too bad, it's witty but unjust"` — *unjust* is only intelligible if the line accuses
  the war of being pointless.
- src p10 — `"We are not fighting pour le Roi de Prusse, but for right principles."` Anna Pávlovna's rebuttal
  swaps the idiom's sense for a purpose. That contrast is the joke's hinge.

So the French must survive inline; translating it away to "for the King of Prussia" alone would leave p9 and
p10 unmotivated. Restoring it is right.

### Does the gloss state more than the idiom's meaning? — checked, no.

Gloss as shipped: `pour le Roi de Prusse — for the King of Prussia, that is, for nothing!`

- `for the King of Prussia` — the literal sense.
- `that is, for nothing` — the idiomatic sense, and nothing beyond it. "For nothing" *is* what the idiom means.

It does not say "Hippolyte is punning", does not explain that this is a French proverb, does not editorialise
on the war, and does not pre-empt Anna Pávlovna's retort at p10 (which is still free to land, because the gloss
supplies the sense without supplying her objection). The two-sense gloss is the minimum needed for a reader
without French to follow p9 and p10, and it stops there. **Within bounds.**

**Verdict on p7: correct, complete, no new drift.** Word count 47 → 51; the eight added words are the gloss.

## 4. New-reader read

Clear. `"...we are wrong to fight pour le Roi de Prusse — for the King of Prussia, that is, for nothing!"`
The reader now gets the pun on first pass and the following paragraphs (the circumspect smile, "witty but
unjust", the rebuttal) all connect. Before the fix the punch line was in a language the reader may not have.

## 5. Mechanical checks

`python3 books/edition_checks.py war-and-peace --candidate repair/ch91-corrected.json`

- `blocks: 0`
- No `bracket-tag`, `footnote-slot-bare`, `footnote-orphan-marker` or `inline-marker-with-slot` flag for ch91.
- **Zero** chapter-scoped flags for ch91 at all (`long_sentences_gt50: 0`).
- Remaining flags (`title-sequence`, `title-duplicate`, `name-variant`) are book-wide properties of the
  assembled edition, not of this chapter or this edit.
- Summary: `{"chapters_checked": 1, "paragraphs_checked": 22, "ratio_low": 0, "french_kept_paragraphs": 0, "blocks": 0}`

## 6. New findings

None. Note for the record: p10 also carries `pour le Roi de Prusse` inline and is deliberately left unglossed —
correct, because the phrase has just been glossed at p7 and Anna Pávlovna is quoting Hippolyte back at him.
Glossing it twice would flatten the echo.

Verification: ACCEPT
sha256: repair/ch91-corrected.json 657ac32a87942f878b9b70bd76b675dbad1147d25815e957edf35234947a375e
