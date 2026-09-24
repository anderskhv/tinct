# Moby-Dick modern-en repair — working brief

Every repair and review agent reads this before starting. It sets the scope, the conventions, and the defect definitions.

## Files (all in `books/wip/green-moby-dick/`)

- `source.json`: Melville's 1851 text. It is the fidelity anchor, byte-identical to the live `moby-dick-original-en.json`, and complete against Project Gutenberg #2701 from Chapter 1 to the Epilogue.
- `baseline-live-modern-en.json`: the live modern-en edition before this work. Read-only.
- `candidate.json`: the working candidate. **Only the lead edits it.** Agents write proposal files.
- Shape: `{"chapters":[{"number","title","paragraphs":[...]}]}`. Chapter N is `chapters[N-1]`, and paragraph indices are 0-based. A coordinate is written `N.i`, for example `76.1`.
- To print pairs, run `python3 /tmp/claude-0/-home-user-tinct/4842ad26-bf59-5bfd-abcc-9745fd551e61/scratchpad/show.py 76.0-3` (source then candidate). You can also load the JSON yourself.

## What modern-en is

It is a full, sentence-by-sentence modern-English reading edition of Melville. It is **not** a summary, an abridgement or a spelling pass. Every paragraph renders the complete content of the matching source paragraph:

- the same claims, sequence, examples, qualifications and uncertainty;
- the same images, metaphors, allusions, names, numbers and technical details;
- the same jokes, irony and changes of register (lecture, sermon, stage play, mock-scholarship, reverie, sea-talk).

A paragraph needs **no change** if it already does all of that in clear modern English. Do not rewrite for taste. When you repair, keep the existing modern wording wherever it is correct, and fix only what is wrong. The exception is a paragraph so damaged that a fresh rendering from the source is cleaner.

Short is not the same as abridged. Melville's padding ("for the nonce", "I say") can legitimately shrink. Conversely, a long paragraph can still have lost content. Judge only by a paired reading.

## Defects, meaning reasons to change a paragraph

| code | meaning |
|---|---|
| `omission` | Any source claim, example, image, qualification, allusion, name, number, step or sentence is missing |
| `invention` | Content that is not in the source: added interpretation, a summary sentence, a new simile or new stage business |
| `meaning` | Sense changed or reversed; fact altered; who/what/when wrong; the order of events changed |
| `hedge` | Speculation made into fact, or fact made into speculation; qualifications ("as far as I know", "perhaps", "hypothetically") dropped or added |
| `technical` | Whaling, anatomical or nautical term or physical description wrong, blurred or conflated |
| `voice` | Humour, irony, metaphor, register or characteristic rhetoric flattened or lost |
| `unmodernized` | Left in near-verbatim 1851 English (archaic pronouns and verb forms, obsolete words, inverted syntax) when the rest of the edition modernizes. It is a barrier to a modern reader |
| `corruption` | Garbled text, such as the `wbefore`, `thbefore` or `eyou` find-and-replace damage in chs 134–135 |
| `convention` | Typography or spelling inconsistent with the conventions below (fix only while repairing, or where the text is visibly odd) |

## Conventions (match the existing edition)

- **Quotes:** straight double quotes `"` and straight apostrophes `'`. Never curly.
- **Dashes:** an em dash with spaces, ` — `.
- **Italics:** none. The edition carries no `_underscore_` italics. Where the source's italic carries meaning (for example the "_sneezes_" joke or stress that changes sense), convey it through wording or word order. Don't add underscores.
- **Spelling:** modern American (color, gray, center, honor). Keep "whaleman/whalemen", "try-works", "Leviathan/leviathan" as they are used.
- **Harpooneer → "harpooner"** everywhere in modern-en (the modern spelling). Keep "harpooneer" only inside a quotation where the spelling itself is the point, which is rare.
- **Species names:** don't touch a paragraph just to change the capitalization of "Sperm Whale" or "sperm whale". In a paragraph you rewrite, follow the source's capitalization.
- **Archaic pronouns:** thee, thou, thy, ye and the -est/-eth verb forms become you/your and modern verbs in narration and dialogue. That includes Quaker speech and Ahab's high speeches, which is the edition's practice in chs 16, 18, 36 and 119. Keep the *elevation* of Ahab's and Mapple's rhetoric: its cadence, apostrophes, exclamations and imagery. Only the grammar is modernized.
- **Quoted verse and hymns:** modernize the wording lightly, keep the lines as the source lays them out, and keep the rhyme where it survives.
- **Proper names and allusions:** keep them exactly as printed (Heidelburgh Tun, Melancthon, Lavater, Lais, Darien, Lacépède, Scoresby, Beale, Pequod, Town-Ho, Jeroboam, Samuel Enderby). Don't swap "Indian" for "Pacific" and so on.
- **Whaling terms:** keep them (blubber, spermaceti, case, junk, blanket-piece, try-works, flukes, flurry, gam, lay, fast-fish, loose-fish, cutting-in, mincer, spade, crotch, line-tub, chocks, loggerheads, top-maul, and so on). Where a term would stop a first-time reader and the text does not explain it nearby, you may add a **brief, accurate** gloss woven into the sentence, for example "the case (the great reservoir of spermaceti in the head)". A gloss should be a few words, used once per chapter, and never contain an opinion or a claim that the source does not make. When unsure of a gloss's accuracy, leave the term unglossed.
- **Measures, numbers and dates:** keep them as printed (feet, fathoms, barrels, tuns).
- **Addressing the reader:** keep Melville's "you" and imperative asides ("mark", "bethink yourself"), rendered in modern form ("Now, notice this", "Think of another thing").
- **Speaker tags and stage directions** in the dramatic chapters: keep the source's layout, for example `STUBB.`, `(Aside)` and parenthetical directions.
- **Chapter titles** are identical to the source. Never change them.

## Hard rules

1. Keep one output paragraph per source paragraph. Never merge, split, reorder, drop or add paragraphs. Paragraph N begins with content equivalent to the start of source paragraph N.
2. Don't insert conclusions, morals, explanations of what a passage "means", or connecting sentences that the source does not make.
3. Don't turn speculation into fact, and don't resolve uncertainty Melville leaves open. Keep his confident errors of 1851 natural history exactly as he states them; do not correct Melville.
4. Don't soften period language or add editorial correction.
5. If a source reading is genuinely unclear (a crux), render it as literally as reads naturally and record it as an open question in your report. Keep working on everything else.

## Proposal file format (repair and review agents)

JSON, UTF-8:
```json
{
  "batch": "b76",
  "role": "repair | fidelity | accessibility | reverify",
  "chapters": [76],
  "reviewed": ["76.0", "76.1", "76.2", "76.3"],
  "items": [
    {"id": "76.1", "severity": "blocking|non-blocking", "category": ["meaning","omission"],
     "reason": "Specific: what is wrong or missing, quoting the source phrase(s).",
     "new": "Full replacement paragraph text."}
  ]
}
```
`reviewed` must list **every** coordinate you read in full, which is the coverage evidence. `new` is always the complete paragraph, never a fragment. Validate the file with `python3 -c "import json;json.load(open(PATH))"` before finishing.
