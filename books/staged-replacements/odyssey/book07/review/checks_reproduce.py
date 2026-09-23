#!/usr/bin/env python3
"""Independent recomputation of every figure Book 7 publishes.

`scripts/checks.py` is the drafter's instrument and it is four days old.
Re-running it reproduces its own arithmetic and proves nothing about whether
the arithmetic is right.  This file recomputes every published figure from the
two JSON files with its **own** implementations, importing nothing from
`scripts/`, and then says where it agrees and where it does not.

It also does two things `checks.py` does not, both of which are about the
measures rather than about Book 7:

  * **The splitter is probed, not trusted.**  D17 fixes the Book 4 reviewer's
    splitter verbatim so the numbers stay comparable.  Comparable is not the
    same as correct: this file re-counts the sentences with two further
    splitters and reports the spread, so the reader can see how much of the
    published +25.2% is the measure and how much is the text.
  * **Every figure is recomputed on the basis stated (R-1)**, and the basis is
    printed on the row rather than in a heading.
"""
import json, re, sys, difflib
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
BOOK = HERE.parent
NAMES = {"ulysses": "odysseus", "minerva": "athena", "jove": "zeus",
         "neptune": "poseidon", "mercury": "hermes", "saturn": "cronus",
         "diana": "artemis", "euryclea": "eurycleia", "venus": "aphrodite",
         "juno": "hera", "vulcan": "hephaestus", "ceres": "demeter"}


def words(t):
    """Lower-cased alphabetic runs, with Butler's Roman names mapped onto the
    Greek forms D5 imposes, so a name change is not scored as a lost word."""
    return [NAMES.get(w, w) for w in re.findall(r"[a-z]+", t.lower())]


# ----------------------------------------------------------------- splitters
def split_package(t):
    """The Book 4 reviewer's splitter, reimplemented from D17's description
    rather than copied, so a typo in `checks.py` would show here as a
    disagreement."""
    t = " ".join(t.split())
    return [s for s in re.split(r'(?<=[.!?])["”’\']?\s+', t) if s.strip()]


def split_strict(t):
    """A sentence boundary only where terminal punctuation is followed by a
    capital or an opening quotation mark.  Refuses to break after an
    abbreviation followed by a lower-case word."""
    t = " ".join(t.split())
    return [s for s in re.split(r'(?<=[.!?])["”’\']?\s+(?=[“"A-Z])', t) if s.strip()]


def split_terminal_only(t):
    """The crudest form: every `.`/`!`/`?` followed by whitespace ends a
    sentence, quotation marks disregarded."""
    t = " ".join(t.split())
    return [s for s in re.split(r'(?<=[.!?])\s+', t) if s.strip()]


# ------------------------------------------------------------------ measures
def retention_aggregate(src, cand):
    a, b = words(" ".join(src)), words(" ".join(cand))
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    return sum(x.size for x in sm.get_matching_blocks()) / len(a)


def retention_per_para(src, cand):
    n = d = 0
    for s, c in zip(src, cand):
        a, b = words(s), words(c)
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        n += sum(x.size for x in sm.get_matching_blocks())
        d += len(a)
    return n / d


def retention_bag(src, cand):
    n = d = 0
    for s, c in zip(src, cand):
        a, b = Counter(words(s)), Counter(words(c))
        n += sum(min(k, b[w]) for w, k in a.items())
        d += sum(a.values())
    return n / d


def runs_displaced(src, cand, minlen=4):
    """Written independently of `displaced_runs()`: for each paragraph, take
    every maximal unaligned stretch of source tokens, and look for the longest
    sub-run of length >= minlen that occurs exactly once on each side."""
    found = []
    for idx, (s, c) in enumerate(zip(src, cand), 1):
        a, b = words(s), words(c)
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        keep = set()
        for blk in sm.get_matching_blocks():
            keep.update(range(blk.a, blk.a + blk.size))
        i = 0
        while i < len(a):
            if i in keep:
                i += 1
                continue
            j = i
            while j < len(a) and j not in keep:
                j += 1
            best = None
            for L in range(j - i, minlen - 1, -1):
                for st in range(i, j - L + 1):
                    run = a[st:st + L]
                    if once(a, run) and once(b, run):
                        best = (idx, L, " ".join(run))
                        break
                if best:
                    break
            if best:
                found.append(best)
            i = j
    return found


def once(seq, run):
    L, n = len(run), 0
    for k in range(len(seq) - L + 1):
        if seq[k:k + L] == run:
            n += 1
            if n > 1:
                return False
    return n == 1


def main():
    src = json.load(open(BOOK / "source-book7.json"))["paragraphs"]
    cand = json.load(open(BOOK / "candidate-v1.json"))["paragraphs"]
    assert len(src) == len(cand) == 29
    basis = "all 29 paragraphs"
    src_f = [" ".join(p.split()) for p in src]

    sw = sum(len(p.split()) for p in src_f)
    cw = sum(len(p.split()) for p in cand)
    print("BASIS ON EVERY ROW (R-1): %s\n" % basis)
    print("%-46s %s" % ("words, Butler → candidate", "%d → %d  ratio %.5f"
                        % (sw, cw, cw / sw)))

    ra = retention_aggregate(src_f, cand)
    rp = retention_per_para(src_f, cand)
    rb = retention_bag(src_f, cand)
    print("%-46s %.5f   [published 0.93943]" % ("retention, aggregate-join (canonical)", ra))
    print("%-46s %.5f   [published 0.93943]" % ("retention, per-paragraph (order)", rp))
    print("%-46s %.5f   [published 0.95220]" % ("retention, bag (order-blind)", rb))
    print("%-46s %.5f   [published 0.01277]" % ("MOVE-GAP = bag − order (D20)", rb - rp))
    print("%-46s %.5f" % ("  decomposition: substitution+loss = 1 − bag", 1 - rb))
    print("%-46s %.5f" % ("  and 1 − order must equal their sum", 1 - rp))

    scs = sum(p.count(";") for p in src_f)
    ccs = sum(p.count(";") for p in cand)
    print("\n%-46s %d → %d   [published 30 → 14]" % ("semicolons (D19)", scs, ccs))

    print("\nSENTENCE COUNTS — three splitters, because D17 fixes ONE of them")
    print("%-24s %-16s %-10s %-16s" % ("splitter", "Butler → cand", "raw rate", "NORM RATE"))
    for name, fn in (("package (D17)", split_package),
                     ("capital-required", split_strict),
                     ("terminal-only", split_terminal_only)):
        s_n = sum(len(fn(p)) for p in src_f)
        c_n = sum(len(fn(p)) for p in cand)
        raw = 100.0 * (c_n - s_n) / s_n
        a, b = s_n + scs, c_n + ccs
        print("%-24s %-16s %-10s %-16s"
              % (name, "%d → %d" % (s_n, c_n), "%+.1f%%" % raw,
                 "%+.1f%% (%d → %d)" % (100.0 * (b - a) / a, a, b)))

    s60 = sum(1 for p in src_f for s in split_package(p) if len(s.split()) >= 60)
    c60 = sum(1 for p in cand for s in split_package(p) if len(s.split()) >= 60)
    print("\n%-46s %d → %d   [published 7 → 0]" % ("sixty-word sentences", s60, c60))

    dr = runs_displaced(src_f, cand)
    print("\n%-46s %d   [published 1]" % ("displaced runs (>= 4 tokens)", len(dr)))
    for idx, L, run in dr:
        print("    B07-P%03d  %d tokens  «%s»" % (idx, L, run))

    longs = [(i, len(s.split()), s) for i, p in enumerate(cand, 1)
             for s in split_package(p) if len(s.split()) >= 40]
    print("\n%-46s %d   [published 17]" % ("candidate sentences of 40+ words", len(longs)))

    # per-paragraph ratios, the length floor MIN_PARA_RATIO gates on
    floors = sorted(((len(c.split()) / len(s.split()), i)
                     for i, (s, c) in enumerate(zip(src_f, cand), 1)))
    print("%-46s %.4f at B07-P%03d" % ("lowest per-paragraph word ratio", floors[0][0], floors[0][1]))

    ident = [i for i, (s, c) in enumerate(zip(src_f, cand), 1) if s == c]
    print("%-46s %s" % ("paragraphs byte-identical to Butler", ident or "none"))


if __name__ == "__main__":
    main()
