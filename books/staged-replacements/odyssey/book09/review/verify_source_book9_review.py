#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Book 9, round 1 — source verification by a FIFTEENTH kind of rule.

The fourteen already used are listed in `RESUME.md`.  Every one of them either
reads the chapter's own characters in some form, or reads PG's apparatus
(footnote list, headings, argument lines, table of contents), or reads the
published artefact's layout (line wrapping), or reduces the chapter to
arithmetic (word counts).  **Not one of them has read Butler's own
PREFACE**, which `RESUME.md` names as the channel still unused and which the
previous worker has just shown to be load-bearing (ledger A7).

**The channel.**  In the *Preface to the First Edition* Butler states the
architecture of the poem in his own words:

    "This poem includes the Phaeacian episode, and the account of Ulysses'
    adventures as told by himself in Books ix.-xii."

That sentence is a claim about a REGION of the text, made outside the text.
This rule turns it into a locator, and the locator reads **two characters** —
the opening and closing double quotation marks — and **nothing else**.  No
letter, no word, no word length, no capital, no digit, no line break, no
heading.

**The instrument.**  Butler's convention for a speech that runs across
paragraphs (the package's D4) is to re-open with an opening quotation mark at
every paragraph and to close only at the end.  A narrative told by one speaker
across four Books is therefore a long run of paragraphs each of which opens a
quotation it does not close.  Score every block of PG's body

    +1  if it begins with an opening double quote and carries more opening
        than closing double quotes,
    -1  otherwise,

and take the **maximum-sum contiguous subarray** of that stream.  There is no
threshold and no window: Kadane's algorithm has no parameter to tune, which is
what stops the locating clause being fitted to the answer it is supposed to
find.  The argmax interval is the region the Preface names, and its first
paragraph-block is the second block of Book IX.

**Body-blindness is asserted, not claimed (clause 2, and control C6).**  The
whole locating computation is run a second time with the served chapter 9
replaced by 44 blocks of filler.  The interval must come back identical.  A
locator that cannot be moved by rewriting its own subject cannot have found
its subject by matching it against itself — which is the audit failure
`review-instructions.md` names as *a chapter matching itself*.

**Clause 5 verifies, and it is the only clause that reads a letter.**

Run: `python3 book09/review/verify_source_book9_review.py`
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BOOK = HERE.parent
PKG = BOOK.parent
REPO = PKG.parent.parent.parent

PG = PKG / "source-texts" / "pg1727-butler-1900.txt"
SERVED = REPO / "app" / "public" / "data" / "editions" / "odyssey-original-en.json"

OPEN, CLOSE = "“", "”"
FAILS = []
BLIND = []


def ok(cond, msg):
    print(("  PASS  " if cond else "  FAIL  ") + msg)
    if not cond:
        FAILS.append(msg)
    return cond


# ----------------------------------------------------------------- the corpus
def pg_blocks():
    raw = PG.read_text(encoding="utf-8")
    a = raw.index("*** START OF THE PROJECT GUTENBERG EBOOK")
    b = raw.index("\nFOOTNOTES:")
    return [x for x in re.split(r"\n\s*\n", raw[a:b]) if x.strip()]


def strip_anchors(block):
    """PG glues its footnote-reference numerals to the word they follow
    (`sea24`, `Menelaus36`, `lotus77`).  The served edition drops them.  This
    is the ONLY licence clause 5 grants, and it is granted to digits alone."""
    t = " ".join(block.split())
    t = re.sub(r"(?<=[A-Za-z.,;:!?" + CLOSE + "’)])\\d{1,3}\\b", "", t)
    t = re.sub(r"\s+\d{1,3}\b", "", t)            # and the ones PG sets bare
    return " ".join(t.split())


def served_chapters():
    d = json.loads(SERVED.read_text(encoding="utf-8"))["chapters"]
    return [[" ".join(p.split()) for p in c["paragraphs"]] for c in d]


# --------------------------------------------------------- clause 0: the Preface
PREFACE_RE = re.compile(
    r"the account of Ulysses[’'] adventures as told by himself in Books\s+"
    r"([ivxlc]+)\.-([ivxlc]+)\.")

ROMAN = {"i": 1, "ii": 2, "iii": 3, "iv": 4, "v": 5, "vi": 6, "vii": 7,
         "viii": 8, "ix": 9, "x": 10, "xi": 11, "xii": 12}


def read_preface(raw=None):
    """Read the claim out of the Preface to the First Edition.  The region is
    everything before the first `BOOK ` heading, so not one character of any
    Book's prose is inside it."""
    raw = raw if raw is not None else PG.read_text(encoding="utf-8")
    head = raw[:raw.index("\nBOOK I\n")]
    i = head.index("PREFACE TO FIRST EDITION")
    m = PREFACE_RE.search(" ".join(head[i:].split()))
    if not m:
        return None
    return m.group(0), ROMAN[m.group(1)], ROMAN[m.group(2)]


# ------------------------------------------- clause 1: the quotation-state stream
def unclosed(block):
    t = " ".join(block.split())
    return t.startswith(OPEN) and t.count(OPEN) > t.count(CLOSE)


def argmax_interval(blocks):
    """Kadane, over +-1.  No parameter."""
    S = [1 if unclosed(b) else -1 for b in blocks]
    best = (-10 ** 9, 0, -1)
    cur, st = 0, 0
    for i, v in enumerate(S):
        if cur <= 0:
            cur, st = v, i
        else:
            cur += v
        if cur > best[0]:
            best = (cur, st, i)
    return best, S


def runner_up(blocks, span):
    """The best interval DISJOINT from the winner, reported rather than
    bounded — the Book 6 drafter's discipline."""
    lo, hi = span
    S = [1 if unclosed(b) else -1 for b in blocks]
    for i in range(lo, hi + 1):
        S[i] = -10 ** 6
    best = (-10 ** 9, 0, -1)
    cur, st = 0, 0
    for i, v in enumerate(S):
        if cur <= 0:
            cur, st = v, i
        else:
            cur += v
        if cur > best[0]:
            best = (cur, st, i)
    return best


# ------------------------------------------------------------------ the rule
def locate(blocks):
    """Everything the locating clause knows.  Returns (sum, lo, hi)."""
    (tot, lo, hi), _ = argmax_interval(blocks)
    return tot, lo, hi


def run(blocks, served, verbose=True):
    """Returns (ok, detail).  Clauses 0-5."""
    fails = []

    def note(c, m):
        if verbose:
            print(("  PASS  " if c else "  FAIL  ") + m)
        if not c:
            fails.append(m)
        return c

    # clause 0 — the Preface names the region, and the sentence is printed.
    claim = read_preface()
    if not note(claim is not None,
                "clause 0: the Preface to the First Edition states the region"):
        return False, fails
    text, a, b = claim
    if verbose:
        print("          Butler: “%s”" % text)
    note((a, b) == (9, 12),
         "clause 0: the region Butler names is Books ix.-xii. (got %d-%d)" % (a, b))

    # clause 1 — the quotation-state argmax.
    tot, lo, hi = locate(blocks)
    if verbose:
        print("          argmax interval: blocks [%d..%d], length %d, sum %+d"
              % (lo, hi, hi - lo + 1, tot))
    note(tot > 0, "clause 1: the argmax sum is positive (%+d) — a count of zero "
                  "is NOT a pass" % tot)
    ru = runner_up(blocks, (lo, hi))
    if verbose:
        print("          best DISJOINT interval: [%d..%d] length %d sum %+d"
              % (ru[1], ru[2], ru[2] - ru[1] + 1, ru[0]))
    note(ru[0] < tot / 2.0,
         "clause 1: the runner-up (%+d) is less than half the winner (%+d)"
         % (ru[0], tot))

    # clause 2 — the span accounts for exactly four Books' worth of paragraphs.
    want = sum(len(served[k]) for k in range(8, 12))
    note(abs((hi - lo + 1) - want) <= 12,
         "clause 2: the span (%d blocks) is the four Books the Preface names "
         "(%d paragraphs plus their headings and argument lines)"
         % (hi - lo + 1, want))

    # clause 3 — Book IX opens one block before the run.  Butler's narrative
    # is introduced by a line of the poet's own (`And Ulysses answered, ...`),
    # which opens no quotation of its own and is therefore scored -1.
    start = lo - 1
    note(start >= 0, "clause 3: there is a block before the run")

    # clause 4 — arithmetic: the served chapter 9 has 44 paragraphs, so the
    # span of Book IX is blocks [start .. start+43], and the block AFTER it
    # must fall outside the run's first Book.  Reported, not assumed.
    n9 = len(served[8])
    if verbose:
        print("          Book IX predicted at blocks [%d..%d] (%d paragraphs)"
              % (start, start + n9 - 1, n9))

    # clause 5 — the verifier, and the only clause that reads a letter.
    got = [strip_anchors(b) for b in blocks[start:start + n9]]
    note(got == served[8],
         "clause 5: PG blocks [%d..%d], footnote numerals stripped, are the "
         "served chapter 9 paragraph for paragraph" % (start, start + n9 - 1))
    if got != served[8] and verbose:
        for k, (x, y) in enumerate(zip(got, served[8])):
            if x != y:
                print("          first divergence at paragraph %d:" % (k + 1))
                print("            PG     : %s" % x[:110])
                print("            served : %s" % y[:110])
                break
        if len(got) != len(served[8]):
            print("          length %d against %d" % (len(got), len(served[8])))

    # clause 6 — and it occurs there ONCE.  Over the whole file.
    N = [strip_anchors(b) for b in blocks]
    hits = [i for i in range(len(N) - n9 + 1) if N[i:i + n9] == served[8]]
    note(hits == [start],
         "clause 6: the served chapter 9 occurs in PG exactly once, at block "
         "%s (found %s)" % (start, hits))
    return not fails, fails


# ---------------------------------------------------------------- the audit
def audit(blocks, served):
    print()
    print("=" * 72)
    print("AUDIT — nine controls and three declared blindnesses")
    print("=" * 72)
    import copy

    def trial(name, blocks2, served2, must_fail=True):
        good, fails = run(blocks2, served2, verbose=False)
        fired = not good
        res = (fired == must_fail)
        print(("  PASS  " if res else "  FAIL  ")
              + "%-58s %s" % (name, "fired" if fired else "did not fire"))
        if not res:
            FAILS.append("control: " + name)
        return fails

    # C1 — the B03-P038 splice, planted into chapter 9.
    s = [list(c) for c in served]
    spliced = served[2][37]
    s[8][20] = spliced
    trial("C1 the B03-P038 splice planted at B09-P021", blocks, s)

    # C2 — a paragraph of Butler's Book VIII (adjacent).
    s = [list(c) for c in served]
    s[8][10] = served[7][20]
    trial("C2 a paragraph of Butler's Book VIII", blocks, s)

    # C3 — a paragraph of Butler's Book XXII (not adjacent).
    s = [list(c) for c in served]
    s[8][10] = served[21][20]
    trial("C3 a paragraph of Butler's Book XXII", blocks, s)

    # C4 — one word added.
    s = [list(c) for c in served]
    s[8][30] = s[8][30].replace("As for myself", "As for myself indeed", 1)
    trial("C4 one word added at B09-P031", blocks, s)

    # C5 — two paragraphs transposed.
    s = [list(c) for c in served]
    s[8][5], s[8][6] = s[8][6], s[8][5]
    trial("C5 two paragraphs transposed", blocks, s)

    # C6 — BODY-BLINDNESS of the locating clause.  Replace chapter 9 entirely;
    # the interval must not move.  This is the control that answers 'a chapter
    # matching itself'.
    s = [list(c) for c in served]
    s[8] = ["“filler %d" % i for i in range(len(served[8]))]
    before = locate(blocks)
    good, _ = run(blocks, s, verbose=False)
    after = locate(blocks)
    c = (after == before) and not good
    print(("  PASS  " if c else "  FAIL  ")
          + "%-58s %s" % ("C6 chapter 9 replaced: locator unmoved, clause 5 fires",
                          "interval %s -> %s" % (before[1:], after[1:])))
    if not c:
        FAILS.append("control C6")

    # C7 — a count of zero must not be a pass.  Strip every quotation mark
    # from PG; the stream is then all -1 and the argmax is a single block.
    b2 = [b.replace(OPEN, "").replace(CLOSE, "") for b in blocks]
    tot, lo, hi = locate(b2)
    c = tot <= 0 or (hi - lo + 1) < 50
    print(("  PASS  " if c else "  FAIL  ")
          + "%-58s %s" % ("C7 quotation marks removed: the locator collapses",
                          "sum %+d, length %d" % (tot, hi - lo + 1)))
    if not c:
        FAILS.append("control C7")

    # C8 — the Preface claim is the rule's premise; a rule that runs without
    # reading it is a rule running on a constant somebody typed.
    raw = PG.read_text(encoding="utf-8")
    c = read_preface(raw.replace("as told by himself in Books ix.-xii.", "")) is None
    print(("  PASS  " if c else "  FAIL  ")
          + "%-58s %s" % ("C8 Preface sentence deleted: clause 0 refuses",
                          "refused" if c else "ran anyway"))
    if not c:
        FAILS.append("control C8")

    # C9 — the rule's NULL SPACE, asserted rather than assumed.  A change
    # inside a paragraph that keeps the quotation state is invisible to the
    # LOCATOR and must be caught by clause 5 alone.
    s = [list(c) for c in served]
    assert "Ismarus" in s[8][2], "C9 would be a no-op — the audit's own " \
        "first failure was exactly this: a control inside the rule's null space"
    s[8][2] = s[8][2].replace("Ismarus", "Ismaros")
    before = locate(blocks)
    good, _ = run(blocks, s, verbose=False)
    c = (locate(blocks) == before) and not good
    print(("  PASS  " if c else "  FAIL  ")
          + "%-58s %s" % ("C9 one letter changed: locator blind, clause 5 fires",
                          "as declared"))
    if not c:
        FAILS.append("control C9")

    print()
    print("  DECLARED BLINDNESSES")
    for b in [
        "(1) a defect PG and the served file SHARE. Every source rule in this "
        "package is blind to it by construction.",
        "(2) the LOCATING clause reads two characters and nothing else. It "
        "cannot see a substitution, a transposition or a deletion inside a "
        "paragraph; clause 5 is what sees those, and C9 asserts the division "
        "of labour instead of leaving it implied.",
        "(3) the locator finds the FOUR-Book region, not the Book. The cut "
        "between Book IX and Book X is made by arithmetic on the served "
        "chapter's own paragraph count, so a served chapter 9 that had "
        "absorbed Book X's first paragraphs would be located and verified as "
        "a longer run. Clause 6's uniqueness is what bounds this, not the "
        "locator.",
    ]:
        print("    - " + b)
        BLIND.append(b)


def whole_file(blocks, served):
    """What the rule says about the other chapters the Preface names."""
    print()
    print("=" * 72)
    print("WHAT IT SAYS ABOUT THE REST — the four Books Butler names")
    print("=" * 72)
    N = [strip_anchors(b) for b in blocks]
    tot, lo, hi = locate(blocks)
    print("  (whitespace is normalized on both sides, so a divergence that is")
    print("   a line break alone — B01-P025's — is invisible here and is NOT")
    print("   reported as a difference. The fourteenth rule sees it; this one")
    print("   does not, and that is a difference of channel, not a defect.)")
    for k in range(24):
        n = len(served[k])
        hits = [i for i in range(len(N) - n + 1) if N[i:i + n] == served[k]]
        inside = "in the Preface's region" if hits and lo - 1 <= hits[0] <= hi else ""
        print("  chapter %2d  %3d paragraphs  occurrences in PG: %-12s %s"
              % (k + 1, n, hits if len(hits) < 4 else "%d" % len(hits), inside))


def main():
    blocks = pg_blocks()
    served = served_chapters()
    print("PG #1727 body blocks between the Gutenberg markers: %d" % len(blocks))
    print("served chapters: %d" % len(served))
    print()
    print("=" * 72)
    print("THE RULE")
    print("=" * 72)
    good, fails = run(blocks, served)
    FAILS.extend(fails)
    audit(blocks, served)
    whole_file(blocks, served)
    print()
    print("=" * 72)
    print("VERDICT: %s" % ("the served Odyssey chapter 9 IS PG #1727's Book IX"
                           if not FAILS else "FAILURES: %s" % FAILS))
    print("=" * 72)
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())
