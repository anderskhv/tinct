# Modern-English Draft Prompt

Reusable prompt for producing (or repairing) a `modern-en` chapter. Fill in
the `{{...}}` fields per book/chapter. Referenced from
`books/TRANSLATION_PROTOCOL.md`.

---

You are producing a faithful, genuinely accessible modern-English reading
edition of one chapter for Tinct, a deep-reading platform. This is **not** a
summary and **not** a lightly modernized original translation. It is a full
sentence-level rendering into today's ordinary literary English.

**Book:** {{book title}}
**Chapter:** {{chapter number/title}}
**Source edition (fidelity anchor):** {{exact edition identifier, e.g.
"Garnett translation, locked `{book-id}-original-en.json`" or "Hobbes 1651
first edition text as parsed into `{book-id}-original-en.json`"}}

Use **only** the source text supplied below as your fidelity anchor. Do not
import phrasing, details, or interpretive choices you recall from any other
translation or edition of this work, even if you know them well. If the
source appears to contain an error (a citation, a name, a fact), reproduce
it exactly as written — do not silently "correct" it to the historically or
factually standard form.

## What to preserve

Every paragraph must preserve, without exception:

- Every claim, image, action, and condition.
- Every example, quantity, number, date, and named figure.
- Every expressed uncertainty, qualification, or hedge ("perhaps," "it is
  said," "I do not pretend to warrant").
- Every deliberate repetition (refrains, rhetorical repetition, a phrase
  the author repeats on purpose) — do not "fix" it by varying the wording.
- Every joke, irony, or register shift.
- Deliberate ambiguity or omission in the source (e.g., a detail the
  narrator withholds, a line of dialogue a character declines to repeat).
  Do not resolve it or fill it in.

## How to rewrite

- Rebuild difficult period syntax into clear present-day sentence
  structure. One source sentence may become two or three — but avoid
  choppy, list-like prose. Aim for prose a strong contemporary reader
  would enjoy, not a simplified paraphrase.
- Use ordinary vocabulary. Replace archaic function words and verb forms
  (thee/thou/doth/hath, "-eth" endings, inverted "if but," etc.) with
  their plain modern equivalents, in both prose *and* verse, unless the
  work's own genre convention requires keeping them (e.g., a play
  deliberately archaizing a character's speech as a character trait,
  which is different from the whole text simply being old).
- If a passage is already clear, idiomatic, and unambiguous, you may leave
  it unchanged. There is no required rewrite percentage and no target
  similarity score. Similarity to the source is not itself a defect.
- When a term or reference is essential to following the passage and would
  stop a general reader (an obscure historical event, a legal term, a
  mythological name central to the sentence), you may add a brief,
  accurate, proportionate clarification. Do not add clarification that
  isn't needed, and do not use it to inject your own interpretation of
  the author's argument — state only what a reference work would confirm.
- Preserve paragraph count, order, and array indices exactly. Never merge,
  split, reorder, drop, or invent a paragraph. Paragraph N in your output
  must correspond exactly to paragraph N in the source.
- Do not condense arguments, examples, dialogue, or descriptive detail to
  save words.

## Verse and song

- Meaning outranks rhyme. Never add an idea, invent an image, or change a
  detail merely to land a rhyme or a metrical beat. If a faithful modern
  line doesn't rhyme, let it not rhyme rather than distort the sense.
- Where a source line does rhyme and a faithful modern equivalent can
  preserve that rhyme (or a comparably natural one) without adding or
  changing content, do so — musicality matters, but never at fidelity's
  expense.
- Modernize archaic diction in verse exactly as you would in prose. "Doth
  say" becomes "says" in a couplet exactly as it does in a sentence,
  unless dropping the archaism breaks the meter badly enough that a
  different, equally faithful, modern phrasing is needed instead.
- Where the source deliberately omits or elides content (e.g., "sung in
  two indecent lines" without quoting them), preserve that omission.
  Never invent the missing lines.

## Character names

Use the book's documented name convention (see the book's own conventions
note, or ask before establishing one). Do not perform a blind global
find-and-replace on a name — check context, since the same string can
denote different things in different places (e.g., a title vs. a name, or
a name that legitimately varies by speaker/register in the source).

## Source text

{{paste the locked source chapter JSON/paragraphs here, exactly as stored,
with paragraph indices visible}}

## Output format

Return a JSON array of paragraph strings, same length and order as the
source, ready to drop into the book's chapter-array format. Do not add
commentary, headers, or markdown outside the JSON.
