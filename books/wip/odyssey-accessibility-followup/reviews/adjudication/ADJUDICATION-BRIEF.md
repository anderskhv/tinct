# Odyssey accessibility follow-up — adjudication and repair brief

You are a source-aware ADJUDICATOR. Tinct's modern-English Odyssey is built from Samuel
Butler's 1900 prose translation. Your Books were flagged as only lightly modernized: much
of the text is still Butler with spelling and names updated. A blind reader, who saw only
the modern text, has recorded what they understood in every paragraph and where they got
stuck. Your job:

1. Compare that understanding with Butler.
2. Identify the real comprehension failures.
3. Propose minimal, faithful repairs.

You do NOT edit any file except your own output. A lead screens your proposals, and a
separate verifier checks every applied change against Butler.

## Inputs (read-only)

- `in/bookNN-pairs.json`: for every paragraph `p` (0-based), `butler` (the served
  original, Project Gutenberg #1727 via the served edition) and `modern` (the accepted
  candidate text you are reviewing).
- `../ody-readers/out/bookNN.json`: the blind reader's `paraphrase` and `barriers` per
  paragraph, plus `book_level` notes.
- `in/GLOSSARY.md` and `in/PUNCTUATION.md`: the package's binding conventions.
- `in/bookNN-continuity.md`: per-Book rulings, where one exists. Books 23 and 24 have none.

Read the whole Book in both versions before proposing anything.

## What counts as a genuine problem

**A. Misunderstanding.** The reader's paraphrase gets something wrong: an action, who
does what to whom, a speaker or addressee, a relationship, the logic of a speech or
argument, or what an image or simile compares. The modern wording must plausibly cause
the error. If the text is clear and the reader was careless, record it as not caused by
the text.

**B. Barrier.** Something the reader flagged as `misread` or `unsure`, or as a `pause`
that a typical present-day reader would not recover from. It counts only where the
wording is archaic, obsolete, a false friend or tangled syntax, and the meaning matters.

**C. Sweep.** Your own source-aware pass. Find words and constructions a present-day
adult reader would likely misread even though this reader did not flag them. Typical
cases are false friends and dead senses: *mess* (a dish of food or drink), *substance*
(property), *presently*, *anon*, *meet* (fitting), *sore* (sorely), *want* (lack),
*hard by*, *fain*, *wont*, *save* (except), *betimes*, *quit* (repay), *stay* (stop),
*bane*, *wroth*, *would that*, *nothing loth*. Also cover obsolete syntax that hides who
is acting or what follows from what.

Known examples to rule on where they occur in your Books (check the context and do not
replace them mechanically):

- "gold and substance" and "alien speech" (3.23)
- "bondwoman" (4.0)
- "He took nothing by it" (4.8)
- "gobbets" and "besmirched" (9.25)
- "mixed a mess" for a drink and "fared onward" (10.24)

## What is NOT a repair

- Butler's names in the package's Greek forms, his epithets and patronymics, and the
  fixed formulas and renderings recorded in GLOSSARY.md. Examples: "So he spoke",
  rosy-fingered Dawn, "tell me truly", "at that" for *whereon*, "oxen" never "cattle",
  "sufferings" for *ills*, and bracket rules D12.
  Exception: where the reader actually misunderstands the meaning, propose the smallest
  fix and cite the rule you would override.
- A pause where the meaning is recoverable and the word is part of the edition's
  dignified register. A word is not a problem just because it is old-fashioned.
- Anything that deletes, adds, condenses or reorders content, resolves Butler's
  ambiguity, adds interpretation, or turns speech into report.
- Rewording whose only purpose is to sound more modern or to lower a similarity score.
  This review is about comprehension. Do NOT chase the numeric gate.

## Repair rules

- **Minimal.** Replace only the words needed. Restructure a sentence only when its
  structure causes the misreading.
- **Keep everything.** Keep every fact, image, number, qualifier, hedge, name, epithet,
  sequence and speech boundary.
- **Register.** Use plain current English in the same dignified register. No slang, no
  anachronism.
- **Glosses.** Add one only if indispensable: a few words folded into narration (not
  dialogue) at first use.
- **Conventions.** American spelling; `toward` not `towards`; typographic quotes “ ” ‘ ’
  and the apostrophe ’; closed em dash —; the Greek name forms of GLOSSARY.md; the words
  the edition holds steady.
- **Collision rule (package D26, "arrow C").** Inside the same paragraph, your replacement
  must not reuse a word that Butler uses there for something else. It also must not render
  two different Butler words with one modern word where Butler keeps them apart. If this
  is unavoidable, say so. (Example: the package restored "fared onward" at 10.24 because
  "went on" collided with Butler's "went back" in the same paragraph. So a repair there
  needs a verb that collides with nothing, e.g. check "pressed on".)
- **D29.** Prefer Butler's own word when it is still current English and fits the
  meaning. A new rendering needs a reason.
- **Consistency.** When the same archaic item recurs across your Books, propose one
  consistent rendering, but judge every occurrence in its own context.

## Output

Write `out/bookNN-adjudication.json` (one per Book) as valid JSON:

```json
{
  "book": 4,
  "proposals": [
    {"id": "B04-01", "p": 0, "kind": "misunderstanding|barrier|sweep",
     "quote_modern": "exact substring of the CURRENT modern paragraph, occurring exactly once in it",
     "replacement": "the text that replaces it",
     "butler": "the Butler words this corresponds to",
     "reader_evidence": "the reader's paraphrase/barrier that shows the problem, or 'not flagged'",
     "reason": "why a present-day reader fails here and why the repair is faithful",
     "severity": "blocking|recommended|optional",
     "collision_check": "which Butler words in this paragraph you checked against"}
  ],
  "rejected_barriers": [
    {"p": 3, "quote": "...", "reason": "Butler's formula kept by GLOSSARY ...; meaning recoverable"}
  ],
  "reader_errors_not_caused_by_text": [
    {"p": 7, "reader_said": "...", "butler": "...", "why_text_is_clear": "..."}
  ],
  "recurring": [{"item": "...", "rendering": "...", "where": ["4.8", "4.31"]}],
  "summary": "3–6 sentences: how comprehensible the Book is now, what the main problem types were"
}
```

Severity guide:
- `blocking`: a typical reader gets the story or meaning wrong.
- `recommended`: a typical reader is stuck or must guess on something that matters.
- `optional`: a noticeable stumble with recoverable meaning.

The `quote_modern` value must match the current modern paragraph exactly, including curly
quotes and dashes, and occur exactly once in it. Validate your JSON before finishing.
