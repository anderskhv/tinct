# Render instructions (Tinct Modern English)

You render ONE bundle of slices of a book into plain contemporary English. Your task message names the book id and the bundle id (for example `phaedo` and `B03`).

Base directory: `/tmp/claude-0/-home-user-tinct/21282b73-f8f8-5d05-8287-17edaf34564b/scratchpad/night/`  (called `$N` below).

## Read first, completely

1. `$N/<book>/STYLE-NOTE.md` if it exists (philosophy and history books), or for the plays `$N/SHAKESPEARE-BRIEF.md` and `$N/<book>/PLAY-NOTE.md`. These govern every choice: voice, key terms, quotations, markers, typography, what must never happen.
2. `$N/<book>/bundles.json`: find your bundle; its `slices` list names the slice ids you render.

## What to do

For each slice id in your bundle:
1. Read `$N/<book>/src/<id>.json`. It has `paragraphs`: a list of `{i, source, live_modern}`. `source` is the text you modernize (the fidelity anchor). `live_modern` is the current modern edition, which is mostly the source with spelling changes: use it only as a convenience (keep a good rendering, fix drift); render fully every paragraph that still reads like the source.
2. Write `$N/<book>/out/<id>.json`:
   ```json
   {"book": "<same as input>", "chapter": <same>, "start": <same>, "paragraphs": ["...", "..."]}
   ```
   `paragraphs` has EXACTLY as many strings as the input, in the same order. Paragraph k renders source paragraph k and begins with equivalent content. Never merge, split, drop, reorder or add paragraphs, even when the source has fragments, headings or damaged text: render what is there.
3. Typography, markers, quotation handling and key terms: exactly as the style note says.

## Quality bar

- A modernization, not a new translation and not a summary. Keep every argument step, qualification, hedge, example, figure, date, name and image. No added commentary or facts; no softening or sharpening of the author's force.
- Plain, everyday, contemporary English a general reader follows on one reading. Sentences clearly shorter than the source's: split long periodic sentences, keep the logical connectives. Replace archaic diction and stock formulae with natural modern forms. Do not reword a plain sentence only to be different, and never trade accuracy for ease.
- Do not consult or copy any other translation or modernization. Never use the web.
- Ellipses: keep an ellipsis (`...` or the single character) where the SOURCE paragraph has one, because it is part of the text (a pause, a trailing-off, or a gap marker). NEVER introduce an ellipsis the source lacks: the QA gate treats a new ellipsis that elides content as truncation. No newlines inside a paragraph.


## Depth requirement (the repository's QA gate; read this carefully)

The finished edition is measured against the served source with a word-sequence similarity gate: the whole book must come out at about 0.75 or LOWER (a faithful, well-modernized edition normally lands around 0.60-0.72), and almost every chapter must be clearly different from the source, not just a few words swapped. A first attempt that only swaps archaic words and splits a few long sentences lands near 0.90 and is rejected. So:
- Rework the sentence STRUCTURE, not only the vocabulary. Change the order of clauses, turn passives into actives, replace relative-clause chains and "which"/"whereof"/"whereby" constructions with plain verbs and subjects, replace nominal phrases ("the possession of the power to") with verbs ("to be able to"), replace stock formulae and Latinate or Victorian phrasing with the plain modern word or phrase a general reader would use.
- Every ordinary paragraph should look and read clearly different from its source while saying exactly the same thing. Where a paragraph is already plain modern English, still tighten and re-express it naturally; leave verbatim ONLY quotations, citations, verse and the bracketed or foreign-language items the style note keeps verbatim.
- The style note's fixed technical TERMS stay fixed (that is the vocabulary of the argument); everything AROUND the terms is yours to rewrite.
- This never licenses dropping content, softening or sharpening a claim, adding commentary, or changing a hedge or conditional into an assertion. Fidelity is checked paragraph by paragraph by independent reviewers.
- The validator prints a slice similarity line. If your slice reports similarity above about 0.78, you have stayed too close: rework the weakest paragraphs again before you finish.

## Check your own work (required)

1. Run `python3 $N/check_bundle.py <book> <bundle>`. Fix every ERROR. Look at every WARN: SHORT means you may have dropped something; LONG means you may have embellished; "identical to source" is fine only for quotations/citations the style note keeps verbatim.
2. Re-read your output once against the source, paragraph by paragraph, and fix omissions, invented content, flattened hedges, wrong terms, and sentences left essentially archaic.
3. Do not modify any file other than your `out/<id>.json` files.

## Final message (3 short lines)

Validator result (ERROR/WARN counts after your fixes); the coordinates (chapter:index) of any passage you are unsure about and why; anything wrong with the source text itself (damaged, duplicated or missing material).
