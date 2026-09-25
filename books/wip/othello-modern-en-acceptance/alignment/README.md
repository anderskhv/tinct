# Othello Compare alignment: meaning units (proposed)

**Status:** proposed data, validated editorially, **not integrated**. The reader's Compare view needs a Codex decision to use it (see the end of this file).

## What problem this solves

Tinct's Compare maps the two editions paragraph by paragraph, and within a paragraph in proportion to word count. That works for prose. In a verse speech it pairs the wrong phrases whenever the modern sentence reorders the verse.

The base package's line sidecar (`othello-modern-en-lines.proposed.json`, `bd67ab0b…`) forced one modern break for every original verse line. The standard now rejects that:

> Do not force one modern line per original verse line. Preserve natural modern sentences and map short corresponding units of meaning.

The sidecar is also keyed to the v1 text (`012ede1e…`), so it is invalid for v2.

## Files

| File | Contents | SHA-256 |
|---|---|---|
| `othello-compare-units.proposed.json` | Ordered meaning units for all 1,220 speech paragraphs | `371bfe03c365f22aac5d4ea809e8301fc6ec4dca836b086496478d51261e6411` |
| `othello-modern-en-lines.units.proposed.json` | Display lineation for modern-en v2: a new line at each meaning unit in 324 verse paragraphs (705 breaks) | `bf7cb681721eba56611a395f2540ba522bdf8fa8de57a1b312166176440459a9` |


### `othello-compare-units.proposed.json`

For each speech paragraph (`chapters → paragraphIndex → [units]`), each unit is `{"o": [start, end], "m": [start, end]}`:

- `o` and `m` are `[start, end)` UTF-16 offsets into the served `original-en` paragraph (`a8e8ae40…`) and the modern-en v2 paragraph (`ed1e3ebb…`).
- Verse units also carry `lines`, the 0-based Gutenberg #1531 line range they cover, with the speaker prefix excluded.

| Kind | Paragraphs | Units |
|---|---|---|
| Verse speeches, unit by unit | 457 | 1,162 |
| Long prose speeches, sentence-mapped | 32 | 195 |
| Short speeches, one unit | 731 | 731 |
| **Total** | **1,220** | **2,088** |

Stage-direction paragraphs are not listed, because they are byte-identical in both editions. In the 43 bracketed paragraphs (see `../structure/PROPOSAL.md`, Part A), the units cover the text inside the brackets.

### `othello-modern-en-lines.units.proposed.json`

This file has the same shape as `hamlet-lines.json`. A modern verse speech is shown with a line break at each meaning-unit boundary, so the eye can match units across the two columns without forcing the modern sentence into verse order. Every offset passes the reader's `offsetsFit` rule:

- the character before the offset is a space;
- the character at the offset is not a space;
- offsets strictly increase.

## How the units were made and validated

1. **Drafted from the renderer's own verse units.** Each unit is the smallest span whose modern wording corresponds in meaning to a run of original lines.
2. **Four independent validators (A1–A4)** covered all 15 chapters:
   - A1: chapters 1–3;
   - A2: chapters 4–8 and 11;
   - A3: chapters 9–10;
   - A4: chapters 12–15.

   Between them they checked all 457 verse speeches, 1,959 units and all 32 long prose speeches. They reported 171 findings: 93 should-fix and 78 notes, with no must-fix. The kinds were:
   - units that should merge, because a modern sentence straddled two units;
   - units that should split;
   - modern syntax left unnatural by the old line-order rendering;
   - fidelity points.

   Their reports are `../review/align-A1.json` to `../review/align-A4.json`. The accepted findings produced 97 of the 168 text edits in v2 (see `../CHANGES-v1-to-v2.md`) and the unit re-cuts. The finished ledger has 53 merges and 29 splits.
3. **The re-cut units were re-checked by RC1 and RC2**, who reported **no unit problems**.
4. **Mechanical checks on the final v2 text.** Every unit is in range and in order. Units are contiguous apart from the whitespace between them. The last unit ends at the end of the paragraph, or at the closing bracket in the 43 bracketed paragraphs.

## Integration dependency (Codex)

The reader currently uses proportional word mapping and loads a single `/data/editions/{bookId}-lines.json`. Using these files needs:

- a schema or file decision for per-edition lineation;
- a Compare mode that reads the units.

That is app work, and nothing here changes the app. If Part A or Part B is adopted, the units and lineation must be recomputed on the patched texts. The unit boundaries themselves do not change, only the offsets.
