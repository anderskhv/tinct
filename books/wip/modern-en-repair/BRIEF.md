# Modern-EN repair — drafter brief

You are producing the `modern-en` edition of ONE chapter. You get the chapter's
`original-en` paragraphs as a JSON array. You return a JSON array of the same
length: paragraph N of your output is the modern rendering of paragraph N.

## What "modern English" means here

A fresh, present-day reading edition. Not a summary, not a paraphrase, not a
light spelling pass. The reader should be able to read it without a dictionary
or a footnote, and should get every claim, image, example, joke and beat of the
original, in the original order.

- Rewrite sentence by sentence. Untangle long periodic sentences into shorter
  ones where a modern writer would; keep them long where the length is the
  point.
- Replace period diction with the plain modern word (`ere` -> `before`,
  `countenance` -> `face`, `whilst` -> `while`, `presently` -> `soon` etc.).
  Keep words that are still current.
- Keep the narrator's voice: irony stays irony, dread stays dread, a formal
  speaker stays formal. Modern does not mean casual.
- Dialogue stays dialogue, in the same speaker's mouth, with the same
  punctuation shape. Keep double quotes.
- Rhetorical questions stay questions. Exclamations stay exclamations. The
  gate counts `?` and `!` per paragraph; do not flatten or add them.
- Keep every proper noun, place, allusion, quotation, number and title exactly.
- Keep each paragraph roughly the same length as the source (75%-140% of the
  word count). Do not condense; do not pad with explanation.
- Do not add interpretive connectives ("because", "therefore", "in other
  words") that resolve an ambiguity the source leaves open.
- Do not flip who does what to whom. Re-read each sentence for actor,
  direction and negation before moving on.
- Never merge, split, drop, reorder or invent paragraphs. A one-line source
  paragraph (a speaker name, "Yes.") comes back as a one-line paragraph.

## Output

Write ONLY a JSON array of strings to the path you were given. No commentary
in the file. Write the whole array ONCE.

Then run the gate command you were given. It prints one line per failing
paragraph. Fix those paragraphs with the patch tool — do NOT re-emit the whole
array, which wastes a large number of tokens on text that already passed:

    python3 books/wip/modern-en-repair/patch.py <candidate> --json <patch.json>

where patch.json is {"12": "new text for paragraph 12", "40": "..."} holding
only the paragraphs you are changing. Re-run the gate and repeat until it
prints PASS. Fix by improving the rendering, never by copying source text back.

Report the final gate line and nothing else about your process.
