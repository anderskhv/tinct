# Independent fidelity review — Othello modern-en candidate

You did NOT write this text. Your job is an adversarial fidelity review against the public-domain
original (Gutenberg #1531). Use only the original and your own standard Shakespeare glossing
knowledge; do not consult or quote any copyrighted modernization, and do not use the web.

Read `GUIDE.md` in the same folder: it is the brief the renderers followed (the target standard).

View your scenes line-by-line with:  `python3 <S>/view.py <firstChapter> <lastChapter>`
(chapter numbers: 1=1.1, 2=1.2, 3=1.3, 4=2.1, 5=2.2, 6=2.3, 7=3.1, 8=3.2, 9=3.3, 10=3.4,
11=4.1, 12=4.2, 13=4.3, 14=5.1, 15=5.2). Ids are `chapter.paragraphIndex`; `n` is the line index.

## Coverage
Read EVERY speech in your chapters (full read, not a sample). Stage directions are kept verbatim by
design; ignore them.

## What to report (only real defects — do not restyle acceptable renderings)
- `omission` — a clause, image, detail, name, oath, or line meaning dropped.
- `invention` — content added that the original does not say or clearly imply (glosses that only
  unpack the original's meaning are fine; added motives, facts, or emotions are not).
- `mis-gloss` — a wrong reading of the original (archaic word or idiom misunderstood, speaker's
  meaning reversed, wrong referent).
- `pun-bawdy` — a pun, double meaning or bawdy sense flattened or lost, or made coarser than the
  original.
- `too-close` — a hard line left essentially untranslated so a modern reader would not understand
  it (the defect this repair exists to fix). Do not flag lines that are already clear, or famous
  lines the guide says to keep.
- `register` — anachronistic slang, wrong tone, or inconsistency with the fixed conventions
  (ensign, handkerchief, etc.).
- `line-order` — content moved further than an adjacent line.

Severity: `must-fix` (meaning wrong/missing/invented), `should-fix` (clearly worse than it
should be), `note` (defensible, but worth the editor's eye).

## Output
Write JSON to `<S>/review/<your-name>.json`:
```json
{"reviewer": "<your-name>", "chapters": [a, b], "speeches_read": N,
 "findings": [{"id": "9.7", "line": 2, "category": "mis-gloss", "severity": "must-fix",
   "original": "<the original line>", "current": "<the current modern line>",
   "issue": "<one sentence>", "proposed": "<replacement for that line only, same conventions>"}]}
```
`proposed` must be a drop-in replacement for exactly that one line entry (same line index, no
speaker prefix, straight apostrophes, curly double quotes, spaced em dashes, no ellipses). Do NOT
edit any files other than your review JSON. Final message: counts by category/severity and your
overall judgment of the scenes (does it meet the guide's standard?).
