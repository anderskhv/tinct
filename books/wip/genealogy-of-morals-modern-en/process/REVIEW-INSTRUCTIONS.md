# Independent fidelity review instructions (Tinct Modern English)

You did NOT write this text. You review ONE bundle of a rendered modern edition against the served source. Your task message names the book id and the bundle id.

Base directory: `/tmp/claude-0/-home-user-tinct/21282b73-f8f8-5d05-8287-17edaf34564b/scratchpad/night/`  (`$N`).

## Read first, completely

1. `$N/<book>/STYLE-NOTE.md` (philosophy/history), or for the plays `$N/SHAKESPEARE-BRIEF.md` and `$N/<book>/PLAY-NOTE.md`. These are the standard the renderer followed.
2. Your packet: `$N/<book>/review/<bundle>.packet.json`: a JSON list of `{coord, source_original, candidate}` (coord is chapter:paragraphIndex).

## What to do

For EVERY item (a full read, not a sample) compare `candidate` with `source_original` sentence by sentence and decide PASS or FAIL.

FAIL only for a concrete defect, using one of these categories:
- `omission`: a clause, qualification, figure, name, example or image dropped.
- `invention`: content, specifics, motives or commentary the source does not say or clearly imply (glosses that only unpack the source's meaning are fine).
- `reversal`: meaning reversed or a wrong referent.
- `hedge`: a hedge or judgment made stronger or weaker ("perhaps", "may", "almost all", "very").
- `term`: a key term drifting from the style note, or a wrong rendering of a technical word.
- `markers`: footnote or note markers, speaker prefix, bracketed stage direction or italic markers changed (they must be kept as the style note or brief says).
- `too-close`: a non-quotation paragraph left essentially the source's wording and sentence shapes with only word swaps, so a modern reader would still stumble. For plays, also a hard line, image or pun left untranslated or flattened.
- `grammar`: a grammar, punctuation or typography error, including an ellipsis the source does not have, or a newline. A source ellipsis that the candidate DROPPED is also a defect (category `markers`; the replacement must restore it); never remove an ellipsis the source has.
- `length`: sentences clearly still much longer than the style note's target where splitting is easy and safe.

Do NOT fail for matters of taste. Do NOT restyle acceptable renderings. Do NOT fail the quotations the style note keeps verbatim.

For each FAIL give `replacement`: the FULL paragraph, equal to `candidate` except for the minimal changes that fix the defect (same typography conventions, no ellipsis the source lacks, no newlines).

## Output

Write `$N/<book>/review/<bundle>.review.json`: a list, one object per packet item, in packet order:

```json
{"coord": "3:12", "verdict": "PASS"|"FAIL", "category": "omission|...", "note": "one short sentence", "replacement": "(FAIL only)"}
```

Every coord must appear. Validate that the file parses as JSON. Do not modify any other file. Do not consult or copy other translations; never use the web.

Final message: 4 lines: PASS count, FAIL count, FAIL counts by category, and the most significant defects.
