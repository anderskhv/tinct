# Pilot — Heart of Darkness chapter 1

74 paragraphs, 14,258 source words. Sonnet drafter, mechanical gate, Opus
checker. Run 2026-09-17.

## Result

The chapter is repaired and passes the gate. Mean similarity against the
original is 0.402 — REAL-HEAVY by `classify-modern-en.py`'s buckets, against a
gate ceiling of 0.75 — and no paragraph is identical to the old modern-en text.
Word count is 99.4% of source, so nothing was condensed.

## Cost

| | Tokens | Tool calls |
|---|---|---|
| Sonnet drafter | 213,216 | 33 |
| Opus checker | 121,931 | 13 |
| **Total** | **335,147** | |

About 4,500 tokens per paragraph. The Confessions session, on the
draft/review/correct/verify cycle, has used roughly 110M tokens for about 285
accepted paragraphs. The difference is mostly structural: a fresh agent per
chapter carries no other book in its context, and the paper trail is a findings
table rather than five documents per book.

Most of the drafter's 213k went on re-emitting the whole 14,000-word array each
time it fixed a few paragraphs. `patch.py` now exists so later drafters patch
single paragraphs; expect the drafter figure to fall substantially.

## What the gate caught that a human reviewer would have missed

On the first pass the drafter dropped the closing quote on four paragraphs that
end a Marlow speech (60, 62, 64, 73). Quote-mark parity against the source now
catches this. Note that an *odd* quote count is correct here — Conrad's
continuation style opens a quote each paragraph without closing it, and 54 of
this chapter's source paragraphs are legitimately unbalanced.

## What the checker caught

5 major, 21 minor. The majors were all the same species: the drafter
plain-speaking a euphemism and destroying the irony that depends on it. The
Company's "helpers" who had "withdrawn to die" became "labourers" who "crawled
off to die"; workers who "became inefficient" became workers who "grew useless";
the manager's man with "no entrails" became one with "no guts", which in modern
English means brave and inverts the sense.

This is the failure mode to watch on every book. Modernizing prose whose whole
effect is bitter understatement tends to flatten the understatement.

## What the checker MISSED — the blind test

Before launching the checker I found one defect myself by sampling three
paragraphs at random, and deliberately withheld it, to test the checker's
recall. Paragraph 30: Conrad's "the merry dance of death and trade" became "the
grim dance of death and trade". "Merry" is the irony; "grim" is the literal
truth the irony is pointing at. The checker did not flag it, and it is still in
the text.

So the checker's recall on exactly the failure mode it is best at is good but
not complete. One reading pass is not a guarantee. Options, cheapest first:
name the failure mode explicitly in `CHECKER.md` rather than leaving it to the
checker to notice; or accept that a residue survives and rely on the sampled
chapters to size it. Do not conclude from "5 majors found" that 5 majors
existed.

## Open editorial question — racial slur

Conrad's original uses a racial slur 7 times in this chapter and 10 times in the
book. The currently published `modern-en` keeps all 7, because it is a
light-touch pass over the original. The new rendering silently removes all 7,
replacing them with "natives", "black man" and similar.

That is a substantive editorial change to a canonical text, made as a side
effect of a translation task, and it is not this pipeline's call. Anders decides
whether the modern editions preserve the original's language, soften it, or mark
it some other way — and the decision should apply across the library, not be
made per chapter by whichever agent happened to draft it. Until it is decided,
the pilot chapter is NOT written into the live edition.
