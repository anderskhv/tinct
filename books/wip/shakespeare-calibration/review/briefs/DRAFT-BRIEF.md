# Shakespeare calibration — drafting brief (King Lear, Twelfth Night, The Merchant of Venice)

You are drafting **calibration samples**, not a full edition. Read `../STANDARD-DRAFT.md` first; it is the standard you are testing.

## Your packet

Your packet is `<PLAY>-passages.md`. It holds three substantial passages from one play. Each paragraph shows:

- its id (`chapter.paragraph` in Tinct's served edition);
- the speaker prefix;
- the **original** in Gutenberg lineation. The served original-en edition runs verse lines together; the lineation here comes from the same Gutenberg text: #1532 King Lear, #1526 Twelfth Night, #1515 The Merchant of Venice;
- the **current Tinct Modern English** (live `modern-en`).

## What to produce, for every paragraph of every passage

1. **Proposed Modern English.** Write one proposed paragraph per original paragraph, in the same order.
   - Keep the speaker prefix exactly as the current modern text has it.
   - Stage directions stay exactly as the current modern text has them.
   - Some paragraphs are parser fragments: a lone `FOOL.`, a `[_Aside._]` continuation, or a speech continuation with no prefix. Keep the fragment structure as it is, and report it in `structure_notes`.
   - Where the current text already meets the standard, keep it word for word and say "keep".
2. **Unit map (verse and long prose).** List the short corresponding units of meaning as pairs: original line range (1-based line numbers within the paragraph's Gutenberg lines) ↔ the exact modern sentence or clause text. Do not force one modern line per verse line.
3. **Reasons.** For each change, give the reason:
   - a hard image or idiom made clear;
   - a mis-gloss or misreading fixed in the current text (say what the original actually means, and your annotation source);
   - a flattened pun restored;
   - register restored;
   - unnatural syntax fixed;
   - an omission or an invention in the current text fixed.
   Be specific. Quote the original words.

## Rules

- Work from the public-domain original and the annotations named in the standard. You may query Schmidt's *Shakespeare-Lexicon* on Perseus (`https://www.perseus.tufts.edu/hopper/`) or Onions (1911) on Internet Archive or Wikisource, and cite what you used.
- **Never consult, recall or imitate any copyrighted modernization.** Your wording must be your own.
- Preserve bawdy, insults and prejudice at the original's strength. This matters especially for Shylock's scenes: neither soften nor sharpen the antisemitic language of the Christian characters, or Shylock's reply.
- Keep what the characters want visible: the listener must hear the persuasion, the threat, the plea.

## Output

Write JSON to `/tmp/claude-0/-home-user-tinct/781378ba-275b-5897-8531-920676c586a7/scratchpad/out/calib-<PLAY>.json`:

```json
{"drafter": "<PLAY>", "passages": [
 {"passage": "LR-A", "paragraphs": [
   {"id": "11.1", "speaker": "LEAR.", "action": "rewrite" | "keep" | "stage-direction",
    "proposed": "LEAR. <full proposed paragraph>",
    "units": [{"o_lines": [1, 1], "m": "<modern text of this unit>"}],
    "reasons": ["'court holy-water' = flattery (Schmidt: court holy-water, 'fair words'); current 'holy water at court' is a mis-gloss", "..."]}
 ],
 "structure_notes": ["4.80–4.82: parser split a FOOL speech into three paragraphs ..."],
 "current_defects": ["11.2: mis-gloss ...", "11.1: 'thick rotundity' left untranslated (too close)"]}
]}
```

Your final message should summarize, per passage, the main defect classes you found in the current Modern English and how many paragraphs you rewrote or kept. Do not edit any other file.
