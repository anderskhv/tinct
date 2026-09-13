# Book 9 — how to review it, and four questions put explicitly

Step 5 of `../WORKFLOW.md`. You are the independent reader. The draft is frozen
at `candidate-v1.json` and **must not be edited** (D10); a correction becomes
`candidate-v2.json`, built by a script, at step 6.

## What to do

1. **Read `continuity.md` first**, then the packets. `review-packets/` has 15
   packets of three paragraphs, each with Butler beside the candidate and one
   paragraph of context either side. Every one of the 44 paragraphs is assigned
   exactly once, and `manifest.json`'s `coverage_check` asserts it.
2. **Recompute the figures yourself.** `python3 scripts/checks.py 9`. Do not
   take a number in `README.md` or `continuity.md` on trust — three of the last
   four rounds found a published figure wrong, and one of them found the
   instrument that produced it wrong.
3. **Verify the source independently, by a rule that shares no channel with
   the fourteen.** The fourteen used: needle-based; anchorless digit-blind;
   occurrence-unique needles; global per-paragraph fingerprint alignment;
   residue; global monotone diff; suffix-automaton resemblance profile;
   letter-blind typographic shape; PG transcriber line-wrapping; capitalization
   bitstring; body-blind title/TOC locator; marker-to-marker byte tiling with
   positional streams; and **the arithmetic-only word-count partition** used
   here. Still unused: **Butler's own PREFACES and their cross-references into
   the text** (and note that **Preface to the First Edition states his own
   policy on Book openings and Book endings** — see the ledger's A7, where it
   is now decisive evidence), **the footnotes' cross-references between one
   another**, and **the appendix's plan of Odysseus's house**. Audit your rule
   before you trust it; the last three rules' audits failed them 2, 5 and 1
   times respectively, and every one of those failures found something.
4. **Report five numbers with the basis on every one**: retention, raw D17
   rate, **NORM RATE on the D27 basis, on Butler's own pointing**, dividing
   marks **split into kept and added**, and **MOVE-GAP with displaced runs
   beside it**.
5. **Classify every finding** as substantive / minor / optional / records, and
   cover all 44 paragraphs — say so explicitly for the ones with no material
   issue, so the record shows they were read and not skipped.

## Four questions, put explicitly

**1. The forty-four-paragraph quotation.** Odysseus's narrative is one speech.
Every paragraph from B09-P001 to B09-P044 opens with `“` and only the last
closes one, which is D4's convention stretched across the whole Book. Is that
right? And is it right *in the app*, where a paginated reader will put dozens
of paragraph breaks on page boundaries and each will read as a dropped quote?
`PUNCTUATION.md` §2 records this as an app question and this Book is the
largest instance the edition will ever have.

**2. The thirty semicolons that were cashed, and the twenty-four that were
not.** Book 8's round 1 found a whole category converted with no exceptions and
restored seven. This Book keeps 24 of Butler's 54 and adds none. **The question
is not whether the count is respectable; it is whether each of the thirty
conversions is right one at a time.** Name any you would restore, and any of
the 24 you would cash. `B09-P028`'s is the one I am most sure of — *"Noman is
killing me by fraud; no man is killing me by force"* — and the one I am least
sure of is `B09-P013`'s colon-then-semicolon chain over the three flocks.

**3. The supplied `you` at B09-P015.** PG reads *"Where do sail from?"*. The
draft supplies `you` under D16 clause (b), naming the parallel as the same
speech's own *"do you sail the sea as rovers"*. Is that inside the rule Book 8
wrote, or is it a repair of PG's compositor that the package should be
recording as a divergence instead, beside the four in ledger A7? **They are
different claims and only one can be right.**

**4. Anything flattened that the collision check could not see.** Fifteen
repairs were made from it before the freeze, six of them from arrow B across
paragraphs — which the record says is a blind spot arrow C does not close, and
which was in range here only because both of Butler's words happened to be
rare. Read for the ones that were not. The named shapes: one Butler word with
two renderings in different paragraphs; two Butler words rendered by one; and
a rendering that reuses a word Butler himself keeps nearby.

## And one thing to attack rather than check

`scripts/verify_source_book9.py` locates this Book on **44 integers**. Its
audit fires nine controls and declares three blindnesses. **Try to construct a
44-paragraph text that the locating clause would accept and clause D would
reject**, other than the page-number case the audit already found — and if you
can, say whether clause C (the sentence-count stream) would have caught it.
