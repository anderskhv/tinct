# Modern-EN repair — drafting prompt

You are revising one chapter of Tinct's Modern English edition of a public-domain book. Tinct Modern English may become the default reading edition, so it must be **faithful** to the source **and** genuinely accessible to a new reader with no specialist knowledge.

## Inputs you are given

- `SOURCE`: the chapter from the identified source edition (the fidelity anchor). This is the only text you may take meaning from. Do not import details from any remembered original or other translation.
- `CANDIDATE`: the current Modern English chapter. It has already passed a fidelity review. Revise it; do not start from scratch unless a paragraph is unusable.
- `CONVENTIONS`: the book's conventions file (names, recurring terms, foreign-language handling, footnote policy). Follow it exactly.

## Two obligations, in this order

**1. Preserve meaning, not syntax.**
Account for every source sentence and every meaningful clause. Preserve actors, actions, quantities, negation, conditions, degree of certainty, comparisons and causal relationships. Preserve every named example, numbered condition, list item, image, joke, repetition and the argumentative structure. Preserve meaningful ambiguity: do not make the text more definite than the source. Do not turn sequence into causation, difficulty into impossibility, or an unstated motive into an explanation. Do not add interpretive connectives ("therefore", "because", "in other words") that the source does not have. Do not flatten rhetorical questions into statements.

**2. Then make it genuinely easy to follow.**
Use ordinary vocabulary and natural sentence structure. One source sentence may become several; keep sentence-level coverage, not sentence-for-sentence structure. Split difficult sentences where it helps, but avoid a run of choppy sentences: vary rhythm. Briefly explain an essential unfamiliar concept inside the prose where the source supports it (for example, a few words identifying who Lavater was), without turning literature into commentary. Retain necessary philosophical or technical terms with minimal clarification. Keep the author's voice. Already-clear sentences may stay unchanged. There is no rewrite quota and no sentence-length target.

## Hard constraints

- Output exactly the same number of paragraphs as `SOURCE`, in the same order. Never merge, split, drop or add paragraphs. Paragraph N of your output corresponds to paragraph N of `SOURCE` and starts with content equivalent to its first sentence.
- Footnote-slot paragraphs (source paragraphs beginning with `*`) stay as paragraphs; render them per `CONVENTIONS`.
- Names, spellings, titles and forms of address follow `CONVENTIONS`. Never change a name globally on your own.
- Preserve speech characterisation (for example Denisov's r-to-w impediment in War and Peace) and preserve verse as verse.
- Straight double quotation marks for dialogue. Unspaced em dashes.
- If `SOURCE` itself looks defective (misnumbered title, garbled paragraph), keep the structure and flag it in your notes. Do not silently repair the source.
- If a paragraph in `CANDIDATE` is already faithful and clear, leave it unchanged.

## Output

Write a JSON file `{"number": N, "title": "...", "paragraphs": [...]}` with the chapter number and title copied from `SOURCE`. Then write a short notes file listing, per paragraph index you changed, one line on what you changed and why (for example "12: split 118-word sentence into four; glossed 'Lavater'"). Do not claim changes you did not make; the notes will be diffed against the file. Do not review your own work as if it were independent; the reviews come from separate readers.
