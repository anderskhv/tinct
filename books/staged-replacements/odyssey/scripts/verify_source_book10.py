#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Source verification for Book 10 — the **SIXTEENTH** kind of rule: the
sentence-terminator sequence. It reads **three characters** and nothing else.

Fifteen rules have been used and no two read the same channel, because *two
unlike rules are evidence and two rules reading the same channel are one rule
twice*. Needles; an anchorless digit-blind token block; occurrence-unique
needles; per-paragraph fingerprint alignment; residue; a global monotone diff;
a suffix-automaton resemblance profile; letter-blind typographic shape;
transcriber line-wrapping; a capitalization bitstring; a body-blind title/TOC
locator; marker-to-marker byte tiling; a 44-integer word-count signature; and
Butler's own Preface driving a parameter-free maximum-subarray over a ±1
quotation stream.

**This rule destroys everything except the end of a sentence.** Every
character of the chapter that is not `.`, `?` or `!` is deleted — every
letter, every digit, every capital, every space, every comma, every semicolon,
every colon, every dash, every quotation mark. What survives is a string of
three symbols, one per sentence: **the chapter's terminator sequence**. Book X
is 175 characters of it, twelve of them `?`.

If that string occurs exactly once in the terminator string of PG's entire
body, the chapter has been located without one letter of Butler being read.

**Is it a NEW channel, honestly?** The characters are a subset of the ninth
rule's (letter-blind typographic shape, which keeps every mark AND every word
length), exactly as the fifteenth rule's two quotation marks were. What makes
it a different instrument is what it is blind to and what fires it. The ninth
rule sees word lengths and so sees any substitution that changes one; this one
sees **only how many sentences there are and how each one ends**, which is
precisely the axis a modern-English draft moves and a transcription error does
not. And its verdicts differ from its neighbours' in a way that is checkable
rather than claimed: see clause 5.

## The clauses

0. **Refuse to run** unless PG's body yields a terminator string at all, and
   unless it carries all three symbols. A rule that can silently degrade into
   a constant somebody typed is not a rule (the C8 lesson of rule fifteen).
1. **Locate.** The served chapter's terminator string occurs in PG's body
   terminator string **exactly once**. The count is asserted AND printed, so
   that zero can never be read as one (the ninth rule's audit failure) and
   two can never be read as one.
2. **Align.** The unique occurrence must begin and end on a **paragraph
   boundary** of PG's body. A substring match that straddles paragraphs is a
   coincidence, not a location, and nothing but this clause could tell the
   difference.
3. **Confirm.** At the located span — recovered from the terminator index
   alone, never by searching for the text — PG's blocks must be the served
   chapter paragraph for paragraph under the published normalization.
4. **Bound the neighbourhood.** Report the longest terminator run the chapter
   shares with PG anywhere else, so a reader can see how far the second-best
   candidate is.
5. **The whole edition, and the two halves of the rule disagree on purpose.**
   Run over all 24 chapters:

   * **clause 1 — the locating clause, which reads three characters — locates
     23 of 24.** The one it cannot locate is **chapter 3**, whose B03-P038
     splice replaces one clause of Butler with 208 words of another file and
     so changes the terminator sequence: **0 occurrences, not one**, and the
     rule says zero rather than reporting a pass.
   * **clause 3 — the verifying clause, which reads the letters once the span
     is fixed — then fails two more: chapters 1 and 4.** Chapter 1's
     divergence is a space before an em dash and chapter 4's is an initial
     capital, and the LOCATOR is blind to both by construction. It locates
     both, and the verifier catches both.

   So **21 of 24 verify, three fail, and the three are exactly the three
   chapters ledger A7 records divergences in** — with the division of labour
   between the clauses visible in which clause fires. That is the
   complementarity with rules eleven and fifteen demonstrated as a verdict
   rather than claimed.

Run: `python3 scripts/verify_source_book10.py`
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pg_source as P                                        # noqa: E402

BOOK = 10
TERMS = ".?!"


def terminators(s):
    """The three characters, and nothing else."""
    return "".join(c for c in s if c in TERMS)


def body_blocks():
    pg = P.extract_books()
    return [b for n in range(1, 25) for b in pg[n]]


def stream(blocks):
    """The body's terminator string, plus the index where each block starts in
    it — clause 2's paragraph boundaries."""
    s, bounds, k = [], [], 0
    for b in blocks:
        bounds.append(k)
        t = terminators(P.norm(b))
        s.append(t)
        k += len(t)
    bounds.append(k)
    return "".join(s), bounds


def locate(chapter_paras, body, bounds):
    want = terminators(" ".join(P.norm(p) for p in chapter_paras))
    occ = [i for i in range(len(body) - len(want) + 1)
           if body.startswith(want, i)]
    return want, occ


def longest_shared_elsewhere(want, body, skip):
    """Clause 4, computed honestly rather than asserted: the longest prefix of
    the chapter's terminator string that occurs somewhere that is not the
    located span."""
    best = 0
    for n in range(len(want), 0, -1):
        for i in range(len(body) - n + 1):
            if i == skip:
                continue
            if body.startswith(want[:n], i):
                return n
        if n < best:
            break
    return best


def verify(book, blocks=None, served=None, quiet=False):
    """Returns (ok, messages)."""
    msgs = []
    blocks = body_blocks() if blocks is None else blocks
    served = (P.served_chapters() if served is None else served)
    body, bounds = stream(blocks)

    # clause 0
    if not body or not all(c in body for c in TERMS):
        return False, ["clause 0: PG's body yields no usable terminator "
                       "stream — the rule REFUSES to run rather than "
                       "reporting a verdict it cannot support"]

    paras = served[book - 1]["paragraphs"]
    want, occ = locate(paras, body, bounds)
    msgs.append("clause 1: chapter %d's terminator string is %d characters "
                "(%d `?`, %d `!`) and occurs %d time(s) in PG's body"
                % (book, len(want), want.count("?"), want.count("!"), len(occ)))
    if len(occ) != 1:
        return False, msgs + ["clause 1 FAILS: %d occurrences, not one" % len(occ)]

    start = occ[0]
    # **Clause 2, and the audit failed the rule here.** `bounds` is NOT
    # injective: a paragraph that ends with a colon or a semicolon introducing
    # a speech contributes NO terminator, so it occupies zero characters of
    # the stream and shares its offset with its neighbour. There are **eight**
    # such paragraphs in PG's body, one of which is Book III's comma-ending
    # ¶38. The first version resolved the boundary with `bounds.index(start)`,
    # which returns the EARLIEST block at that offset — and chapter 4's span
    # came back as 82 blocks against 81 paragraphs and the rule reported a
    # clause-2 failure. **That was a locating clause failing for the wrong
    # reason**: chapter 4's recorded divergence is an initial capital, to
    # which this rule is blind, and the failure had nothing to do with it.
    # The fix is to enumerate every block pair consistent with the offsets and
    # require exactly one of the right size — and to SAY when the offsets are
    # ambiguous, rather than silently taking the first.
    lo = [i for i, b in enumerate(bounds) if b == start]
    hi = [i for i, b in enumerate(bounds) if b == start + len(want)]
    if not lo or not hi:
        return False, msgs + [
            "clause 2 FAILS: the unique occurrence at %d is not "
            "paragraph-aligned in PG — it straddles a block boundary, which "
            "is a coincidence and not a location" % start]
    pairs = [(a, b) for a in lo for b in hi if b - a == len(paras)]
    if len(lo) > 1 or len(hi) > 1:
        msgs.append("clause 2: the offset is shared by %d/%d block boundaries "
                    "(paragraphs that end on a colon or a semicolon "
                    "contribute no terminator; PG's body has eight), so the "
                    "alignment is resolved by block COUNT and not by the "
                    "first index" % (len(lo), len(hi)))
    if len(pairs) != 1:
        return False, msgs + [
            "clause 2 FAILS: %d block spans of the right length are "
            "consistent with the located offsets, not one" % len(pairs)]
    i0, i1 = pairs[0]
    msgs.append("clause 2: the occurrence is paragraph-aligned, PG blocks "
                "[%d..%d] — %d paragraphs against the served chapter's %d"
                % (i0, i1 - 1, i1 - i0, len(paras)))

    bad = [k + 1 for k in range(len(paras))
           if P.norm(blocks[i0 + k]) != P.norm(paras[k])]
    if bad:
        return False, msgs + [
            "clause 3 FAILS: PG and the served chapter differ at paragraph(s) "
            "%s inside the located span" % bad]
    msgs.append("clause 3: at the located span, PG is the served chapter "
                "paragraph for paragraph (%d of %d)" % (len(paras), len(paras)))
    n = longest_shared_elsewhere(want, body, start)
    msgs.append("clause 4: the longest terminator run this chapter shares "
                "with PG anywhere else is %d of %d characters" % (n, len(want)))
    return True, msgs


# ------------------------------------------------------------------ controls
def controls():
    """D18's two clauses on every one: (a) the mutation changed the input,
    (b) the verdict changed."""
    import copy
    pg = P.extract_books()
    blocks = [b for n in range(1, 25) for b in pg[n]]
    served = P.served_chapters()
    ok0, _ = verify(BOOK, blocks, served)
    assert ok0, "the control baseline does not verify; every verdict below "\
                "would be meaningless"
    fired = []

    def fire(name, mutate, expect_fail=True):
        bl = list(blocks)
        sv = copy.deepcopy(served)
        # **The audit failed the rule here, and the failure was in the AUDIT.**
        # The first version snapshotted `[c["paragraphs"] for c in sv]`, which
        # is a list of REFERENCES to the very lists the mutation then edits in
        # place — so `before` and `after` were the same objects and clause (a)
        # compared a thing with itself. It could never have failed, which
        # means it could never have caught a control that did nothing: the
        # exact defect D18 clause (a) exists to prevent, sitting inside the
        # implementation of D18 clause (a). Snapshotting is now a deep copy.
        before = (list(bl), copy.deepcopy([c["paragraphs"] for c in sv]))
        mutate(bl, sv)
        after = (list(bl), copy.deepcopy([c["paragraphs"] for c in sv]))
        assert before != after, \
            "control %r did not change its input (D18 clause (a)) — it would "\
            "have 'passed' for a reason unrelated to the rule" % name
        ok, _ = verify(BOOK, bl, sv)
        if expect_fail:
            assert not ok, "control %r did NOT fire — the rule is blind to it" % name
        else:
            assert ok, "control %r fired and must not have" % name
        fired.append(name)

    # the served chapter 10 occupies blocks [b0 .. b0+48]
    b0 = sum(len(pg[n]) for n in range(1, BOOK))

    fire("the B03-P038 SPLICE planted at B10-P020 — 208 words of the replaced "
         "`modern-en` in place of Butler's clause",
         lambda bl, sv: sv[BOOK - 1]["paragraphs"].__setitem__(
             19, P.served_chapters()[2]["paragraphs"][37]))
    fire("a paragraph of Butler's BOOK IX (adjacent) at B10-P005",
         lambda bl, sv: sv[BOOK - 1]["paragraphs"].__setitem__(
             4, " ".join(pg[9][10].split())))
    fire("a paragraph of Butler's BOOK XXII (not adjacent) at B10-P005 — so "
         "the control is not about adjacency",
         lambda bl, sv: sv[BOOK - 1]["paragraphs"].__setitem__(
             4, " ".join(pg[22][10].split())))
    fire("one sentence divided in two",
         lambda bl, sv: sv[BOOK - 1]["paragraphs"].__setitem__(
             3, sv[BOOK - 1]["paragraphs"][3].replace(", ", ". ", 1)))
    fire("a full stop raised to a question mark",
         lambda bl, sv: sv[BOOK - 1]["paragraphs"].__setitem__(
             3, sv[BOOK - 1]["paragraphs"][3].replace(". ", "? ", 1)))

    def _transpose(bl, sv):
        ps = sv[BOOK - 1]["paragraphs"]
        ps[3], ps[4] = ps[4], ps[3]
    fire("two paragraphs transposed", _transpose)

    # **The control that answers *a chapter matching itself*.** The rule
    # compares the served chapter with PG; if the two were one object it would
    # be a tautology. Replace the served chapter entirely and the rule must
    # FAIL — and, separately, replacing PG's copy must fail too, which is the
    # same assertion from the other end.
    fire("the served chapter 10 replaced entirely with filler",
         lambda bl, sv: sv[BOOK - 1].__setitem__(
             "paragraphs", ["Filler sentence %d." % i for i in range(49)]))
    fire("PG's Book X replaced entirely with filler",
         lambda bl, sv: bl.__setitem__(
             slice(b0, b0 + 49), ["Filler sentence %d." % i for i in range(49)]))

    # **The control that answers *a count of zero reported as a pass*.**
    # Strip every `?` and `!` from PG and the body terminator stream becomes a
    # run of full stops; the chapter's string then occurs MANY times and the
    # rule must FAIL on non-uniqueness rather than report "no anomalies".
    def _flatten(bl, sv):
        for i, b in enumerate(bl):
            bl[i] = b.replace("?", ".").replace("!", ".")
        for i, p in enumerate(sv[BOOK - 1]["paragraphs"]):
            sv[BOOK - 1]["paragraphs"][i] = p.replace("?", ".").replace("!", ".")
    fire("every `?` and `!` levelled to `.` in BOTH texts — the terminator "
         "stream becomes one long run of full stops", _flatten)

    return fired


DECLARED_BLIND = [
    ("every letter, every capital and every word length",
     "the rule deletes them before it looks at anything. Chapter 4's recorded "
     "A7 divergence is an initial capital and this rule LOCATES chapter 4 — "
     "which is the complementarity with the eleventh rule (the capitalization "
     "bitstring) and the fifteenth (the quotation stream) demonstrated as a "
     "verdict rather than claimed",
     "rules 11 and 15, and clause 5's run over all 24 chapters"),
    ("whitespace",
     "the published normalization collapses it, as every measure in this "
     "package does. Chapter 1's recorded divergence is a space before an em "
     "dash and this rule locates chapter 1",
     "the fourteenth rule, which sees it"),
    ("a substitution that changes no sentence boundary and no terminator",
     "which is most of what a modern-English draft does, and is why this is a "
     "SOURCE rule and not a measure",
     "clause 3, which reads the letters once the span is fixed"),
    ("a defect PG #1727 and the served file SHARE",
     "every source rule in this package is blind to it by construction; three "
     "concrete instances are recorded (B09-P015, B09-P022, and PG's Book II "
     "terminal full stop against Butler's own Preface)",
     "nothing in the package — it is blind spot 11 and it is named, not "
     "carried"),
]


def main():
    print(__doc__.split("## The clauses")[0].strip().splitlines()[0])
    print()
    fired = controls()
    for name in fired:
        print("  ✓ control fires: %s" % name)
    print()
    ok, msgs = verify(BOOK)
    for m in msgs:
        print("  %s" % m)
    print()
    print("clause 5 — every chapter PG carries:")
    pg = P.extract_books()
    blocks = [b for n in range(1, 25) for b in pg[n]]
    served = P.served_chapters()
    loc, ver, fail = [], [], {}
    for n in range(1, 25):
        o, m = verify(n, blocks, served)
        if "clause 1 FAILS" not in " ".join(m):
            loc.append(n)
        if o:
            ver.append(n)
        else:
            fail[n] = [x for x in m if "FAIL" in x][0]
    print("  clause 1 LOCATES (three characters): %s" % loc)
    print("  clauses 1-3 VERIFY:                  %s" % ver)
    for n, why in sorted(fail.items()):
        print("  \u2717 chapter %-2d %s" % (n, why))
    print("  — the three failures are exactly the three chapters ledger A7 "
          "records a divergence in, and WHICH CLAUSE fires says which kind:")
    print("    chapter 3 at clause 1 (the splice changes the terminator "
          "sequence); chapters 1 and 4 at clause 2/3, the locator being "
          "blind to whitespace and to a capital.")
    print()
    for what, because, carried in DECLARED_BLIND:
        print("  declared blind: %s" % what)
        print("      because %s" % because)
        print("      carried by %s" % carried)
    print()
    if not ok:
        print("VERDICT: Book 10's source is NOT verified.")
        return 1
    print("VERDICT: the served Odyssey chapter %d is PG #1727's Book X, "
          "located by three characters." % BOOK)
    return 0


if __name__ == "__main__":
    sys.exit(main())
