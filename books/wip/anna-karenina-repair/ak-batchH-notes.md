# Anna Karenina — Batch H Fidelity Review (Chapters 156–176)

## Method

Every paragraph of `ak-batchH-current-modern-en.json` was compared, paragraph by
paragraph, against the corresponding paragraph in `ak-batchH-source.json`
(Constance Garnett translation, locked ground truth). All 21 chapters, covering
Part Five chapters 32–33 and the whole of Part Six chapters 1–19, were read in
full side-by-side.

Checked for: dropped/invented clauses or sentences, meaning inversions,
compression/summarization, factual or plot distortions (names, places,
relationships), and any other content-fidelity break.

## Result

**No content-fidelity defects were found in any of the 21 chapters.** The
modern-English rendering is a faithful, complete, paragraph-aligned
modernization of the Garnett source throughout. Every clause, aside, parenthetical,
and piece of dialogue present in the source is present in the modern-en text;
no meanings were inverted, no plot/factual details (names, relationships,
places, numbers — e.g. "thirty-seven pounds," "seventeen snipe," "five thousand"
vs "fifty roubles," Anna's daughter being unnamed/"a Karenina," etc.) were
altered, and no passages were compressed or summarized away. Register was
consistently modernized (contractions, updated idiom, "propose" for "make an
offer," etc.) without loss of content.

Paragraph counts were verified programmatically to match the source exactly
for all 21 chapters (156: 28, 157: 74, 158: 23, 159: 71, 160: 47, 161: 5,
162: 31, 163: 43, 164: 63, 165: 34, 166: 34, 167: 41, 168: 65, 169: 18,
170: 17, 171: 49, 172: 57, 173: 19, 174: 40, 175: 35, 176: 28).

## Per-chapter verdict

| Chapter | Title | Paragraphs | Verdict |
|---|---|---|---|
| 156 | Ch. 32 | 28 | PASS — no defects |
| 157 | Ch. 33 | 74 | PASS — no defects |
| 158 | Ch. 1 | 23 | PASS — no defects |
| 159 | Ch. 2 | 71 | PASS — no defects |
| 160 | Ch. 3 | 47 | PASS — no defects |
| 161 | Ch. 4 | 5 | PASS — no defects |
| 162 | Ch. 5 | 31 | PASS — no defects |
| 163 | Ch. 6 | 43 | PASS — no defects |
| 164 | Ch. 7 | 63 | PASS — no defects |
| 165 | Ch. 8 | 34 | PASS — no defects |
| 166 | Ch. 9 | 34 | PASS — no defects |
| 167 | Ch. 10 | 41 | PASS — no defects |
| 168 | Ch. 11 | 65 | PASS — no defects |
| 169 | Ch. 12 | 18 | PASS — no defects |
| 170 | Ch. 13 | 17 | PASS — no defects |
| 171 | Ch. 14 | 49 | PASS — no defects |
| 172 | Ch. 15 | 57 | PASS — no defects |
| 173 | Ch. 16 | 19 | PASS — no defects |
| 174 | Ch. 17 | 40 | PASS — no defects |
| 175 | Ch. 18 | 35 | PASS — no defects |
| 176 | Ch. 19 | 28 | PASS — no defects |

## Defects found and fixed

None. No edits were required against `ak-batchH-current-modern-en.json`.
`ak-batchH-corrected.json` is byte-for-byte the same content as
`ak-batchH-current-modern-en.json` (copied, with paragraph counts verified
programmatically against the source), since no fidelity repairs were needed.

## Minor observations (not fidelity breaks, not fixed)

Two very small phrasing choices were noted during review as stylistically
loose paraphrase but were judged **not** to rise to the level of a content-fidelity
defect (no information lost, no meaning changed), so they were left as-is:

- Ch. 162 (para 26): source "I'll show you," she said... vs modern-en "Like
  this," she said... — the demonstrative action and its meaning (Kitty
  showing Levin how the kiss on the priest's hand doesn't bite) is unchanged;
  only the introductory tag phrase differs.
- Ch. 174 (para 35): source "if we could take that raven horse" vs modern-en
  "if we could borrow that raven horse" — a peasant's joking aside about the
  passing carriage horse; substance and comic intent unchanged.

Neither affects plot, characterization, factual content, or meaning, so no
edit was made.
