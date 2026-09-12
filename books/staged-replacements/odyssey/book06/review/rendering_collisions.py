#!/usr/bin/env python3
"""`one_word_two_ways()` in the other direction, and across Books.

The package's `one_word_two_ways()` (`scripts/build_book04_v2.py`) keys on
**Butler's** side and runs inside **one** Book.  The drafter of Book 6 states
that the four calls it had to make by reading — `herbage`, `skilful`/`skilled`,
`scion`/`creature`, `doubted whether`/`thus in two minds` — are outside what
that check can see, and asks whether the class can be mechanized at all.

It can, and it needs two changes, each of which is one line of the idea:

 * **Run across Books, not inside one.**  `herbage` is Butler's word in Book 5
   and in Book 6; no single-Book check can compare its two renderings.
 * **Key on the CANDIDATE's side as well.**  The defect the drafter refused at
   `scion` is not one Butler word rendered two ways — it is one *rendering*
   made to carry two Butler words.  That is the arrow the existing check does
   not have, and it is the one that convicts `grass`.

The report is made readable by a single restriction, and the restriction is the
whole design: **only Butler's rare words count.**  A word Butler uses in three
paragraphs or fewer across the whole corpus is a word whose rendering is a
decision; `the` and `said` are not.  Nothing is exempted by hand.

Two arrows are printed:

  A. one Butler word -> two or more renderings, across Books  (the old check,
     widened)
  B. one rendering <- two or more Butler words, across Books  (the new one)

Arrow B is the one that has never been run, and it is the arrow the drafter
applied by hand at `scion`/`creature` and did not apply at `herbage`/`grass`.
"""
import json, re, difflib, sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from controls import control, summary                       # noqa: E402

ACCEPTED = [(1, "book01/candidate-v3.json"), (2, "book02/candidate-v5.json"),
            (3, "book03/candidate-v3.json"), (4, "book04/candidate-v3.json"),
            (5, "book05/candidate-v2.json"), (6, "book06/candidate-v1.json")]

NAME_MAP = {'ulysses': 'odysseus', 'minerva': 'athena', 'jove': 'zeus',
            'neptune': 'poseidon', 'mercury': 'hermes', 'saturn': 'cronus',
            'diana': 'artemis', 'euryclea': 'eurycleia', 'venus': 'aphrodite',
            'juno': 'hera', 'vulcan': 'hephaestus', 'ceres': 'demeter'}
RARE_MAX = 3          # paragraphs, across all six Books
MIN_LEN = 5           # letters


def toks(t):
    return [NAME_MAP.get(w, w)
            for w in re.findall(r"[a-z]+", t.replace("\n", " ").lower())]


def load(rel):
    d = json.loads((ROOT / rel).read_text(encoding="utf-8"))
    return [" ".join(p.split()) for p in d["paragraphs"]]


def build(books):
    """books: list of (n, src_paragraphs, cand_paragraphs)."""
    freq = defaultdict(int)
    for _, s, _ in books:
        for p in s:
            for w in set(toks(p)):
                freq[w] += 1
    rare = {w for w, n in freq.items() if n <= RARE_MAX and len(w) >= MIN_LEN}

    fwd, back = defaultdict(set), defaultdict(set)
    for n, s, c in books:
        for i, (sp, cp) in enumerate(zip(s, c), 1):
            a, b = toks(sp), toks(cp)
            sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
            for tag, i1, i2, j1, j2 in sm.get_opcodes():
                if tag == "equal":
                    for w in a[i1:i2]:
                        if w in rare:
                            fwd[w].add((w, "B%d-P%03d" % (n, i)))
                            back[w].add((w, "B%d-P%03d" % (n, i)))
                    continue
                if i2 - i1 > 4 or j2 - j1 > 4:
                    continue                     # a recast, not a rendering
                src_side = " ".join(a[i1:i2])
                cnd_side = " ".join(b[j1:j2])
                if not src_side or not cnd_side:
                    continue
                for w in a[i1:i2]:
                    if w in rare:
                        fwd[w].add((cnd_side, "B%d-P%03d" % (n, i)))
                for w in b[j1:j2]:
                    if len(w) >= MIN_LEN and any(x in rare for x in a[i1:i2]):
                        back[w].add((src_side, "B%d-P%03d" % (n, i)))
    return fwd, back


def report(fwd, back, show=True):
    # No cross-Book precondition on either arrow. The audit removed it: it was
    # on both arrows as first written, and it suppressed exactly the instance
    # arrow B exists to catch — Book 6 renders Butler's `herbage` as `grass`
    # 200 words after keeping Butler's own `grass`, and both are in ONE Book,
    # so a cross-Book filter threw the finding away. A collision inside one
    # Book is the same defect and is cheaper to repair.
    A = {w: v for w, v in fwd.items() if len({x for x, _ in v}) > 1}
    B = {w: v for w, v in back.items() if len({x for x, _ in v}) > 1}
    if show:
        print("ARROW A — one Butler word, two or more renderings, across Books")
        for w in sorted(A):
            print("  %-14s %s" % (w, "  |  ".join(
                "%s (%s)" % (x, p) for x, p in sorted(A[w]))))
        if not A:
            print("  none")
        print()
        print("ARROW B — one rendering, two or more Butler words, across Books")
        for w in sorted(B):
            print("  %-14s %s" % (w, "  |  ".join(
                "%s (%s)" % (x, p) for x, p in sorted(B[w]))))
        if not B:
            print("  none")
    return sorted(A), sorted(B)


def main():
    books = [(n, load("book%02d/source-book%d.json" % (n, n)), load(f))
             for n, f in ACCEPTED]
    fwd, back = build(books)
    A, B = report(fwd, back)

    # ------------------------------------------------------------- controls
    def render_twice(bs):
        """Arrow A's defect, planted: Butler's `everlasting` is kept as
        `everlasting` in Books 2, 5 and 6; make Book 6 say `eternal`."""
        out = [(n, s, list(c)) for n, s, c in bs]
        for n, s, c in out:
            if n == 6:
                c[3] = c[3].replace("everlasting home", "eternal home")
        return out

    def collide(bs):
        """Arrow B's defect, planted — and it is the exact call the drafter
        made by hand and refused: render Book 6's `scion` as `creature`, which
        is the edition's rendering of Butler's OWN `creature` in Books 4 and
        5. One rendering, two Butler words."""
        out = [(n, s, list(c)) for n, s, c in bs]
        for n, s, c in out:
            if n == 6:
                c[12] = c[12].replace("so fair a young woman as yourself",
                                      "so fair a creature as yourself")
        return out

    verdictA = lambda bs: report(*build(bs), show=False)[0]
    verdictB = lambda bs: report(*build(bs), show=False)[1]
    control("arrow A sees a Butler word rendered two ways across Books",
            books, render_twice(books), verdict=verdictA)
    control("arrow B sees one rendering made to carry two Butler words",
            books, collide(books), verdict=verdictB)
    control("arrow A does NOT move when only arrow B's defect is planted — "
            "the two arrows are two checks, not one written twice",
            books, collide(books), verdict=verdictA, expect_same=True)
    print()
    print(summary())


if __name__ == "__main__":
    main()
