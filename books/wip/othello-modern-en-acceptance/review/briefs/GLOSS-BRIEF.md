# Othello — independent resolution of contested glosses (resolver brief)

You are an independent reviewer. You did not render or edit this text, and you did not take part in its first review.

## Your packet

Your packet is `gloss-items.md`. It lists 31 items from the Othello Modern English candidate (sha256 `012ede1e…`). Each item shows the original lines (`O<k>`, Project Gutenberg #1531) next to the current modern lines (`M<k>`), and explains why the item is contested. It includes:

- the renderer's 28 self-flagged interpretive choices;
- three renderings the previous re-checker accepted with reservations (3.35, 4.72, 10.6);
- **two edits that no independent reviewer has checked**: 15.2 line 2 and 1.33 ("the beast with two backs — having sex"). Give each of these an explicit verdict.

Read `../STANDARD-DRAFT.md` for the target. `pg1531.txt` in this folder is the full play, for context.

## Sources

You may use the public-domain annotations named in the standard. Useful ones:

- Alexander Schmidt's *Shakespeare-Lexicon* on Perseus: `https://www.perseus.tufts.edu/hopper/`. Search the lexicon for the word.
- C. T. Onions's *A Shakespeare Glossary* (1911), on Internet Archive or Wikisource.
- H. H. Furness's *New Variorum Othello* (1886), on Internet Archive.

Record which source supports each verdict. If you cannot reach a source, say so and rely on standard glossing knowledge. **Never consult or reproduce a copyrighted modernization** (No Fear Shakespeare and similar).

## For each item decide

- `KEEP`: the current rendering is accurate, understandable by ear, and keeps the image, pun or ambiguity it should.
- `REVISE`: the rendering is wrong, misleading, opaque, flattened, over-explicit or tonally off. Give the exact replacement for each affected modern line. Natural modern sentence order is allowed across the lines of one sentence; if you reorder, replace all the affected lines together.
- `OPEN`: a genuine crux where more than one reading is defensible. Name the reading you recommend and the alternative, and say whether the text should stay open or commit.

## Output

Write JSON to `/tmp/claude-0/-home-user-tinct/781378ba-275b-5897-8531-920676c586a7/scratchpad/out/gloss-resolution.json`:

```json
{"resolver": "G1", "items": [
 {"id": "1.4", "verdict": "KEEP" | "REVISE" | "OPEN", "confidence": "high" | "medium" | "low",
  "reading": "<what the original means, one or two sentences>",
  "basis": "<source(s) consulted: e.g. Schmidt s.v. 'damn'; Furness Var. note on 1.1.21>",
  "replacements": [{"line": 13, "current": "...", "proposed": "..."}],
  "note": "<why>"}
]}
```

Leave `replacements` empty for `KEEP`. The replacement conventions are:

- no speaker prefix;
- straight apostrophes, curly double quotes, spaced em dashes, no ellipses;
- inline `[_…_]` directions and `_…_` italics kept exactly.

Your final message should give the counts of KEEP, REVISE and OPEN, and list your REVISE items in one line each. Do not edit any other file.
