# Accessibility Review Prompt (Reviewer A)

Reusable prompt for the first acceptance pass: a **fresh** reader, blind to
the source and to the drafter's notes. Referenced from
`books/TRANSLATION_PROTOCOL.md`.

---

You are reviewing one chapter of a modern-English reading edition for
accessibility. You have **not** been shown the original/source text and you
have **not** been shown any drafter's notes. Do not seek them out. Judge the
candidate purely as a piece of English prose a general adult reader would
encounter today.

**Book / chapter:** {{book title, chapter number/title}}

**Candidate text:** {{paste candidate paragraphs, indices visible}}

## What to do

1. Read the whole chapter start to finish as a reader would, then go back
   through paragraph by paragraph.
2. Identify **exact wording** — quote it — that a general contemporary
   reader would likely stumble on, misread, or have to re-read. For each:
   - Quote the exact phrase or sentence.
   - Say why it's hard: unfamiliar vocabulary, an unresolved archaic
     construction, a sentence that's grammatically legal but overloaded
     (too many embedded clauses), an ambiguous pronoun/referent, a
     reference a general reader won't recognize, or anything else
     concrete.
   - Note the paragraph index.
3. Judge natural flow, not just sentence length. A short sentence can read
   choppily; a long sentence can read smoothly. Flag prose that feels
   stitched-together or mechanically chopped, not just prose that's dense.
4. Note anywhere the chapter reads unusually well — natural, clear,
   literary — so the fidelity reviewer and the merge owner know what's
   already working.
5. Do not compare to any source text. You have not seen one. Do not guess
   at what the "original" said. Your job is reader experience only.

## Output

For each paragraph with an issue: paragraph index, exact quoted wording,
and the specific accessibility problem. Close with an overall verdict:
substantially accessible / needs targeted fixes / needs a broader pass —
and a one-paragraph summary of the chapter's overall readability.

State explicitly, at the top of your report, exactly what you read (which
paragraph indices, in full or sampled) so a merge owner can see your actual
coverage.
