# ak-batchLIGHT modern-en repair — notes

## Scope
Re-rendered the 8 chapters flagged as "LIGHT" (still 85–89% textually similar
to the Garnett original-en, i.e. cosmetic word-swaps rather than a real
modern rendering): chapters 29, 33, 44, 45, 46, 47, 48, 49.

Output written to `ak-batchLIGHT-modern-en.json`, same `{number, title,
paragraphs}` array-of-8-chapters shape as the source and the flagged
current-modern-en file. Only this file was touched; nothing else in the repo
was modified.

## Method
Each paragraph was rewritten sentence-by-sentence from the Garnett
original-en for present-day clarity and naturalness — restructuring
syntax, breaking up Victorian subordinate-clause chains, modernizing
idiom and word choice, and using contractions where a contemporary
narrator/speaker naturally would — while preserving every claim,
sequence of events, image, and piece of dialogue. This is a genuine
rewrite, not a light edit of the previously-flagged modern-en file (which
was itself too close to Garnett to use as a starting point for most
sentences).

Kept:
- All character names in the book's established convention: Anna,
  Vronsky, Alexey Alexandrovitch (Karenin), Stepan Arkadyevitch (also
  "Stiva" where the source uses it), Kitty, Levin, Dolly, Annushka,
  Laska, Agafea Mihalovna, Vassily, Mishka, Ipat, Kouzma, the bailiff
  Vassily Fedorovitch, etc. — matched to the current modern-en file's
  existing usage elsewhere in the book (full patronymic forms retained
  for Alexey Alexandrovitch and Stepan Arkadyevitch, as the rest of the
  book does).
- Proper nouns, place names, book/author references (Duc de Lille,
  *Poésie des Enfers*; Shakespeare, Raphael, Beethoven; Ossian).
  Italicized foreign title kept italicized (`_..._` markdown convention,
  matching the source/current-modern-en style).
- Meaningful punctuation: em dashes for interruptions, ellipses for
  trailing dialogue, italics for emphasis (`_uncomfortable_`,
  `_he_`), quotation-within-narration structure.
- All uncomfortable content rendered faithfully and without
  softening — notably the ch. 45 consummation-scene "murderer/victim"
  metaphor (Anna's shame, the intensity of the imagery Tolstoy uses),
  Anna's dream in ch. 45, and Stiva's frank talk about women/pleasure
  in ch. 48. Nothing was toned down or cut.
- Straight quotes (`"`/`'`) and dash conventions to match the existing
  modern-en file's house style rather than switching to curly quotes.

## Judgment calls
- Ch. 33: "before the bronze Peter the First clock had struck the fifth
  stroke" → rendered as "before the bronze Peter the Great clock had
  finished striking the fifth chime" for natural modern phrasing; kept
  "Peter the Great" over the literal "Peter the First" since that's the
  common modern English name for the tsar and reads more naturally,
  while not changing any fact (same historical figure, same clock).
- Ch. 33 dressmaker paragraph: reordered a couple of clauses
  ("Altogether, Anna... was very much annoyed" → restructured around
  "Once her guests had left...") for natural modern sentence flow;
  content and sequence of the anecdote (three dresses, two undone, one
  wrong, dressmaker's excuse, Anna's anger and later embarrassment) is
  unchanged.
- Ch. 45's central metaphor (the murderer and the body) is one of the
  most stylistically extreme passages in the book — rendered closely
  but in modern syntax, since flattening or euphemizing it would violate
  the "do not sanitize" instruction and lose the passage's intended
  shock.
- Ch. 47/48 are dialogue-heavy with many one-line exchanges between
  Levin and his bailiff/Vassily/Stepan Arkadyevitch; these were
  modernized in register (contractions, natural word order) without
  padding or condensing — one line of source dialogue stayed one line
  of output dialogue throughout.
- "Compôte" (bailiff's malapropism for "compost") kept as in source,
  with the parenthetical gloss retained, since it's a specific verbal
  joke in the text.
- Chapter titles kept identical to the source file's titles ("Chapter
  29", "Chapter 33", "Chapter 10", "Chapter 11", "Chapter 12", "Chapter
  13", "Chapter 14", "Chapter 15") — these are per-part chapter numbers
  as given in the source/current-modern-en files, left untouched since
  retitling wasn't in scope.

## Verification
Paragraph counts were checked programmatically against
`ak-batchLIGHT-source.json` (script run in this session, not committed):

```
Chapter 29: source=6  output=6  match=True
Chapter 33: source=26 output=26 match=True
Chapter 44: source=1  output=1  match=True
Chapter 45: source=14 output=14 match=True
Chapter 46: source=4  output=4  match=True
Chapter 47: source=67 output=67 match=True
Chapter 48: source=44 output=44 match=True
Chapter 49: source=34 output=34 match=True
ALL MATCH: True
```

`ak-batchLIGHT-modern-en.json` also validated with `python3 -m json.tool`
(passes, no errors).

## Not done (out of scope for this task)
- Did not run `books/classify-modern-en.py --gate` against the full book
  (that script operates on the full per-book modern-en file, not this
  standalone 8-chapter batch extract) — Anders/Codex should splice this
  batch back into the book's real `{bookId}-modern-en.json` and re-run
  the similarity gate before treating these chapters as cleared.
- Did not touch `modern-da`, threads, onboarding, registry, or any file
  outside `ak-batchLIGHT-modern-en.json` and this notes file.
- No git commit or push performed.
