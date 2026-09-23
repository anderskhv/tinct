# Candidate-only accessibility review — Pride and Prejudice (modern-en)

You are a fresh reader reviewing part of Tinct's Modern English edition of *Pride and
Prejudice* for accessibility. You have NOT been shown the original text or any
reviewer's notes, and you must not look for them: do not open any file other than the
one named below (in particular, not `source.json`, `baseline-*.json`,
`app/public/data/editions/*original*`, `round1/`, or any other file in the staging
folder). Do not use your memory of Austen's original wording as a reference. Judge
the text as English prose that a general adult reader or listener meets today.

The edition is meant to be light touch. It keeps Austen's irony, rhythm, social
distinctions (rank, money, marriage, reputation, manners) and the characters' voices,
including their period formality. Formality, irony and period flavour are NOT problems
in themselves. Flag only what a general contemporary reader would actually stumble on,
misread, or have to re-read:

- vocabulary or a period term they are unlikely to know, where the meaning matters (say
  what a brief in-line clarification might be);
- a leftover archaic construction that obstructs;
- an overloaded or tangled sentence, or one that is ambiguous;
- an unclear pronoun or referent, or an unclear speaker;
- a sentence that is grammatically broken, garbled, or contradicts its context;
- choppy, stitched-together or anachronistic prose (modern slang, therapy-speak,
  twenty-first-century attitudes) that jars against the rest.

## Input

`{{FILE}}` — the candidate paragraphs for chapters {{A}}–{{B}}, labelled `[chapter.index]`
(index 0-based). Read ALL of it with the Read tool in chunks. Read each chapter start
to finish as a reader would, then go back through paragraph by paragraph.

## Output (write exactly these two files; touch nothing else)

A. `/home/user/tinct/books/wip/green-pride-and-prejudice/round2/acc-ch{{A}}-{{B}}.json`: a JSON array:
```json
[{"ch": 5, "idx": 3, "quote": "exact wording from the paragraph",
  "problem": "vocabulary|archaic|overloaded|ambiguous|referent|speaker|garbled|jarring",
  "blocking": false,
  "why": "concrete explanation",
  "suggestion": "optional replacement for the quoted wording"}]
```
`blocking: true` only for something that stops comprehension or is garbled or
contradictory. `quote` must be copied exactly (straight quotes, em dashes).

B. `/home/user/tinct/books/wip/green-pride-and-prejudice/round2/acc-ch{{A}}-{{B}}.md`: (1) an exact
coverage statement at the top (which paragraph indices you read, in full or sampled);
(2) findings in brief; (3) passages that read especially well; (4) an overall verdict per
chapter group: substantially accessible / needs targeted fixes / needs a broader pass,
and a one-paragraph readability summary.

Be sparing. A short list is a good outcome if the text reads well. Your final message:
the number of paragraphs read, the number of findings, the number of blocking findings,
and the paths.
