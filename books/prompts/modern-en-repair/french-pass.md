# Modern-EN repair — French pass (War and Peace convention)

You are applying one fixed convention for foreign-language speech to a set of chapters. This is a narrow, mechanical-plus-judgment task: change only the paragraphs listed in the inventory for your chapters, and change them only in the ways below.

## The convention (decided 2026-09-18)

1. French, German or Italian speech is given in English, inline, in the dialogue paragraph.
2. Where the source gives the passage in the foreign language (Maude prints the French with an asterisk footnote), the English line carries the cue **(in French)** once per paragraph: after the speech verb if there is one, otherwise directly after the closing quotation mark. Use "(in German)" or "(in Italian)" where that is the language. Never a bracket tag such as "[Speaking in French]".
3. Original wording stays inline only where the wording itself is the point (a pun, a quoted maxim or proverb, verse, the 666 arithmetic in ch 186), immediately followed by the English.
4. The footnote-slot paragraph (the source paragraph beginning with `*`) is never deleted or merged. In modern-en it carries the original foreign text prefixed `* `, copied from the source's dialogue paragraph (the quoted foreign words only, not the English narration around them). If the source footnote is not a translation but a gloss (for example "Old style date.", "An esaul is a captain of Cossacks."), the slot keeps that gloss text, also prefixed `* ` (amended 2026-09-18; no parentheses).
5. **Rule 3 with a slot.** When the foreign wording stays inline (rule 3) and the source also has a footnote slot, the slot keeps Maude's English footnote as it is (`* <English>`), so the foreign wording is not printed twice. The dialogue paragraph then reads: foreign wording, English immediately after, cue if needed.
6. Nothing else in the paragraph changes. Do not modernise, restructure or improve prose outside the French handling; that is a different task.

## Inputs

- `INVENTORY`: a list of (chapter, dialogue-paragraph index, slot index or null, kind) for your chapters. Kinds: `tag` (bracket tag present, slot present), `tag-no-slot` (bracket tag present, no slot: usually a mid-paragraph switch), `french-kept` (foreign text still in the dialogue paragraph, translation in the slot), `inline-bare-slot` (already translated inline; slot holds a bare duplicate line).
- For each chapter: `chN-source.json` (Maude) and `chN-baseline.json` (current modern-en).

## What to do per kind

- `tag`: remove the tag; add the cue; slot ← `* ` + the source's foreign wording.
- `tag-no-slot`: remove the tag; add the cue at the switch point in the sentence ("she said in French" is acceptable when the source has it that way).
- `french-kept`: translate the foreign wording into natural English in the dialogue paragraph (use the source's own footnote translation as the anchor, modernised only as much as the surrounding paragraph already is); add the cue; slot ← `* ` + the source's foreign wording.
- `inline-bare-slot`: add the cue to the dialogue paragraph if missing; slot ← `* ` + the source's foreign wording (or `* ` + the gloss, per rule 4).

## Output

For each chapter: `chN-french.json` (same shape and paragraph count as the baseline) and `chN-french-log.md` with, per changed paragraph index, exact before and after text. Log nothing you did not change. Then run `python3 books/edition_checks.py war-and-peace --candidate <file>` and confirm 0 BLOCK and no `bracket-tag` or `footnote-slot-bare` flags for your chapters.
