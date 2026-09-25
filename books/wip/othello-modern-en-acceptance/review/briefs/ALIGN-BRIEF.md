# Othello — editorial validation of meaning-based Compare alignment (validator brief)

You are an independent editorial validator. You did **not** write this text. Read `../STANDARD-DRAFT.md` first. The previous render guide (`GUIDE-original-render-brief.md`) forced one modern line per original verse line. That constraint is now **withdrawn**. Alignment is by short corresponding **units of meaning**, and modern sentences should be natural.

## Your packet

Your packet is `align-<ID>.md`. It covers every speech in your scenes.

- **Verse speeches** are pre-grouped into proposed units `U1, U2, ...`. A unit is a run of original lines `O<k>` together with the current modern segments `M<k>` for the same line indices. Units were cut automatically where both the original line and the modern segment end in sentence or clause punctuation. Long runs were then cut again at shared commas.
- **Prose and short speeches** are one unit each. Speeches tagged `LONG PROSE (map sentences)` need a sentence-level mapping from you.
- **Stage directions** are context only.

The original text is Project Gutenberg #1531 (`pg1531.txt` in this folder). You may consult the public-domain lexicons named in the standard. Do not consult any modern translation.

## Check every unit

1. **Correspondence.** Does the modern unit carry the whole meaning of its original lines, and nothing that belongs to a neighbouring unit? Report any content that has crossed a unit boundary or gone missing.
2. **Boundaries.** Is the unit a sensible unit of meaning?
   - Propose a **split** when a unit is long (5 or more lines) and both sides can be divided at a clean clause boundary. Give the line index after which to split, adjusting the modern wording minimally if needed.
   - Propose a **merge** when a boundary cuts through a single clause on either side.
3. **Naturalness.** Flag modern units whose English is contorted because it followed the original line order: topicalized objects, dangling fragments, inverted clauses, or a sentence broken where no modern speaker would break it. For each one, propose a **natural rewrite of the whole modern unit** that keeps every piece of content, image and qualification. Do not restyle units that already read naturally.
4. **Fidelity (secondary).** If you notice a mis-gloss, omission, invention or flattened pun, report it with a fix. The whole play has already had a full fidelity read, so report only real defects.

## Long prose speeches

For each `LONG PROSE` speech, give a sentence-level unit map. Each unit is identified by the **first 3–6 words** of its original span and the first 3–6 words of the corresponding modern span, quoted exactly and in order. A unit may group several sentences when the modern sentences do not split the same way.

## Output

Write your result as JSON to `/tmp/claude-0/-home-user-tinct/781378ba-275b-5897-8531-920676c586a7/scratchpad/out/align-<ID>.json`:

```json
{"validator": "<ID>", "chapters": [..], "verse_speeches_checked": N, "units_checked": N,
 "long_prose_mapped": N,
 "findings": [
  {"id": "1.4", "unit": "U2", "lines": [4, 9], "type": "unnatural",
   "severity": "should-fix",
   "issue": "one sentence",
   "current_modern_unit": "<the modern segments of the unit joined with single spaces>",
   "proposed_modern_unit": "<full natural replacement for the whole unit>"},
  {"id": "3.12", "unit": "U4", "lines": [10, 16], "type": "split", "severity": "note",
   "issue": "...", "split_after_line": 12, "proposed_modern_unit": null},
  {"id": "9.40", "unit": "U2", "lines": [3, 4], "type": "misaligned" | "merge" | "fidelity", "severity": "...",
   "issue": "...", "current_modern_unit": "...", "proposed_modern_unit": "... or null"}
 ],
 "prose_maps": [
  {"id": "3.84", "units": [{"o": "Virtue! a fig!", "m": "Virtue? Nonsense!"}, {"o": "...", "m": "..."}]}
 ]
}
```

Severity levels:

- `must-fix`: meaning wrong, missing or crossed into another unit.
- `should-fix`: clearly unnatural or confusing English.
- `note`: optional.

Replacement text must follow the conventions:

- no speaker prefix;
- straight apostrophes, curly double quotes, spaced em dashes, no ellipses;
- inline `[_To ..._]` directions and `_..._` italics copied verbatim, in place;
- a proposed unit must still begin and end at the same content as its original lines.

If a unit begins mid-sentence, because the previous unit ended at a clause, keep the lowercase start.

Your final message should give counts by type and severity, and your overall judgment: can these scenes' units serve as a meaning-based Compare alignment once your fixes are applied? Do not edit any file other than your JSON.
