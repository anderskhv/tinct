#!/usr/bin/env python3
"""Separating a cashed semicolon from a moved clause — Book 6, round 1.

The drafter states its own weakness: 23 of Book 6's 32 added sentences are at
most a semicolon rewritten as a period (the S-1 shape of Book 5's round 1),
and it offers *retention* — 0.93669, below Book 5 v1's 0.94211 — as evidence
that the remainder is real modernization, on the argument that "division costs
no retention, so a lower figure means clauses moved."

**That inference does not follow, and this module is why.** Retention loss has
two independent sources and D17 was written about the first of them: a
thorough vocabulary swap with no syntax work at all lowers retention exactly
as clause movement does. A single retention number cannot tell them apart, so
it cannot be the evidence that the drafter's remaining nine sentences are real.

Two measures are built here, each answering one half of the question, and each
audited under D18 before it is used.

**1. NORM RATE — the semicolon-normalized splitting rate.**  D17's raw rate
counts a semicolon rewritten as a period at full value.  Normalize BOTH sides
by adding each text's own semicolon count to its own sentence count: a
semicolon and a period then score the same, on both sides, and the operation
that converts one to the other is worth exactly zero.  What is left is
division Butler's own pointing did not already supply.

**2. MOVE-GAP — order retention subtracted from bag retention.**  Order
retention is the package's canonical measure (monotone alignment).  Bag
retention asks the same question order-blind: does the candidate paragraph
hold a copy of this source token at all?  Substitution and deletion cost the
same in both, so they cancel; a token that survives but has changed position
is retained in the bag and lost in the alignment, and only that shows in the
difference.  MOVE-GAP is therefore the fraction of Butler's words that the
candidate keeps but *relocates* — clause movement, with the vocabulary
component divided out.

The retention deficit then decomposes, with no residue:

    1 - order_retention  =  (1 - bag_retention)  +  (bag - order)
                         =   substitution+loss   +   MOVE-GAP

**3. Displaced runs** — a corroborating, non-statistical witness: a run of >=4
consecutive source tokens, occurring exactly once in the source paragraph and
exactly once in the candidate paragraph, which survives verbatim but falls
outside the monotone alignment.  Butler's clause, kept, relocated, named in
words rather than counted.

**The audit found a defect in the rule as first written, as the last four did.**
Displaced runs as first written carried no occurrence guard, and Book 6 is a
Book of repeated formulas (`son of`, `the daughter of`, `and the`).  Without
the guard the second copy of a repeated run read as a relocation of the first,
and the check reported movement in paragraphs where the alignment had simply
picked the other copy.  The guard — exactly one occurrence on each side — is
what makes the witness a witness.  A second defect: MOVE-GAP must be computed
PER PARAGRAPH and summed, never on the aggregate join, or a token deleted in
one paragraph is "found" in another and the bag term is inflated.
"""
import json, re, difflib, sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from controls import control, declare_blind, summary          # noqa: E402

NAME_MAP = {'ulysses': 'odysseus', 'minerva': 'athena', 'jove': 'zeus',
            'neptune': 'poseidon', 'mercury': 'hermes', 'saturn': 'cronus',
            'diana': 'artemis', 'euryclea': 'eurycleia', 'venus': 'aphrodite',
            'juno': 'hera', 'vulcan': 'hephaestus', 'ceres': 'demeter'}


def toks(t):
    return [NAME_MAP.get(w, w)
            for w in re.findall(r"[a-z]+", t.replace("\n", " ").lower())]


def sentences(t):
    """The Book 4 round-1 reviewer's splitter, verbatim, so the numbers stay
    comparable with every figure the package has published."""
    t = t.replace("\n", " ")
    return [s for s in re.split(r'(?<=[.!?])["”’\']?\s+', t) if s.strip()]


def norm_rate(src, cand):
    """Measure 1. Returns (src_sent, cand_sent, raw%, src_norm, cand_norm, norm%)."""
    ss = sum(len(sentences(p)) for p in src)
    cs = sum(len(sentences(p)) for p in cand)
    sn = ss + sum(p.count(";") for p in src)
    cn = cs + sum(p.count(";") for p in cand)
    return (ss, cs, 100.0 * (cs - ss) / ss, sn, cn, 100.0 * (cn - sn) / sn)


def order_retention(src, cand):
    """Per paragraph and summed — see the audit note in the docstring."""
    num = den = 0
    for s, c in zip(src, cand):
        a, b = toks(s), toks(c)
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        num += sum(x.size for x in sm.get_matching_blocks())
        den += len(a)
    return num / den


def bag_retention(src, cand):
    num = den = 0
    for s, c in zip(src, cand):
        a, b = Counter(toks(s)), Counter(toks(c))
        num += sum(min(n, b[w]) for w, n in a.items())
        den += sum(a.values())
    return num / den


def move_gap(src, cand):
    """Measure 2."""
    return bag_retention(src, cand) - order_retention(src, cand)


def _count(seq, run):
    L, n = len(run), 0
    for k in range(len(seq) - L + 1):
        if seq[k:k + L] == run:
            n += 1
    return n


def displaced_runs(s, c, minlen=4):
    """Measure 3, with the occurrence guard the audit added."""
    a, b = toks(s), toks(c)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    aligned = set()
    for blk in sm.get_matching_blocks():
        aligned.update(range(blk.a, blk.a + blk.size))
    out, i = [], 0
    while i < len(a):
        if i in aligned:
            i += 1
            continue
        j = i
        while j < len(a) and j not in aligned:
            j += 1
        for L in range(j - i, minlen - 1, -1):
            hit = False
            for st in range(i, j - L + 1):
                run = a[st:st + L]
                if _count(a, run) == 1 and _count(b, run) == 1:
                    out.append((st, L, " ".join(run)))
                    hit = True
                    break
            if hit:
                break
        i = j
    return out


def load(rel):
    d = json.loads((ROOT / rel).read_text(encoding="utf-8"))
    return [" ".join(p.split()) for p in d["paragraphs"]]


# ---------------------------------------------------------------- the audit
def audit(src, cand):
    """Every control under D18: the mutation changed the input AND the
    measure's verdict changed."""
    def cash_a_semicolon(ps):
        out = list(ps)
        for i, p in enumerate(out):
            if ";" in p:
                out[i] = p.replace("; ", ". ", 1)
                break
        return out

    def divide_at_a_comma(ps):
        out = list(ps)
        for i, p in enumerate(out):
            if ", and " in p:
                out[i] = p.replace(", and ", ". And ", 1)
                break
        return out

    def swap_two_clauses(ps):
        """Real clause movement: reverse the halves of the longest paragraph
        about its middle comma, leaving every word in place."""
        i = max(range(len(ps)), key=lambda k: len(ps[k].split()))
        w = ps[i].split()
        h = len(w) // 2
        out = list(ps)
        out[i] = " ".join(w[h:] + w[:h])
        return out

    def swap_vocabulary(ps):
        """Substitution with no movement: 25 words replaced by words that
        appear nowhere in either text."""
        out, n = list(ps), 0
        for i, p in enumerate(out):
            w = p.split()
            for k in range(len(w)):
                if len(w[k]) > 6 and w[k].isalpha() and n < 25:
                    w[k] = "zzqx%d" % n
                    n += 1
            out[i] = " ".join(w)
            if n >= 25:
                break
        return out

    def drop_a_clause(ps):
        i = max(range(len(ps)), key=lambda k: len(ps[k].split()))
        w = ps[i].split()
        out = list(ps)
        out[i] = " ".join(w[:len(w) // 2 - 12] + w[len(w) // 2:])
        return out

    r5 = lambda x: round(x, 5)

    # --- measure 1, NORM RATE
    control("NORM RATE: a real division at a comma raises it",
            cand, divide_at_a_comma(cand),
            verdict=lambda ps: r5(norm_rate(src, ps)[5]))
    control("NORM RATE: cashing a semicolon leaves it EXACTLY where it was",
            cand, cash_a_semicolon(cand),
            verdict=lambda ps: r5(norm_rate(src, ps)[5]),
            expect_same=True)          # positive control — the whole point
    control("NORM RATE (raw D17 rate, same mutation) DOES move — so the two "
            "measures are not the same measure",
            cand, cash_a_semicolon(cand),
            verdict=lambda ps: r5(norm_rate(src, ps)[2]))

    # --- measure 2, MOVE-GAP
    control("MOVE-GAP: moving a clause without changing a word raises it",
            cand, swap_two_clauses(cand),
            verdict=lambda ps: r5(move_gap(src, ps)))
    control("MOVE-GAP: order retention falls under pure substitution too — "
            "which is why retention alone cannot answer the question",
            cand, swap_vocabulary(cand),
            verdict=lambda ps: r5(order_retention(src, ps)))
    declare_blind("MOVE-GAP under pure substitution",
                  because="substitution costs bag and order retention the same "
                          "amount, so it cancels in the difference — that is "
                          "the measure working, not failing, and it is the one "
                          "mutation whose verdict must NOT move",
                  carried_by="order_retention() itself, the control above, "
                             "which falls from 0.93669 under the same mutation")
    control("MOVE-GAP: deleting a clause is loss, not movement — it must not "
            "be counted as recasting",
            cand, drop_a_clause(cand),
            verdict=lambda ps: r5(move_gap(src, ps)))

    # --- measure 3, displaced runs
    control("displaced runs: a moved clause is named",
            cand, swap_two_clauses(cand),
            verdict=lambda ps: sum(len(displaced_runs(a, b))
                                   for a, b in zip(src, ps)))
    declare_blind("a clause moved wholly inside one aligned block, or built "
                  "only from tokens that repeat in the paragraph",
                  because="the occurrence guard the audit added — exactly one "
                          "copy on each side — suppresses a relocation whose "
                          "words Butler also uses elsewhere in the paragraph",
                  carried_by="MOVE-GAP, which is a fraction of all tokens and "
                             "carries no uniqueness precondition")


def main():
    books = [(1, "candidate-v2.json"), (2, "candidate-v2.json"),
             (3, "candidate-v2.json"), (4, "candidate-v2.json"),
             (5, "candidate-v1.json"), (5, "candidate-v2.json"),
             (6, "candidate-v1.json")]
    src6 = load("book06/source-book6.json")
    cand6 = load("book06/candidate-v1.json")
    audit(src6, cand6)
    print(summary())
    print()
    print("%-22s %9s %9s %9s %9s %9s" %
          ("Book", "rawD17", "NORMrate", "order", "bag", "MOVEGAP"))
    for bk, f in books:
        s = load("book%02d/source-book%d.json" % (bk, bk))
        c = load("book%02d/%s" % (bk, f))
        nr = norm_rate(s, c)
        o, b = order_retention(s, c), bag_retention(s, c)
        print("%-22s %+8.1f%% %+8.1f%% %9.5f %9.5f %9.5f"
              % ("Book %d %s" % (bk, f.replace("candidate-", "").replace(".json", "")),
                 nr[2], nr[5], o, b, b - o))
    print()
    print("Book 6, per paragraph — added sentences against semicolons cashed")
    print("%-6s %5s %7s %9s %8s %s" %
          ("id", "words", "semis", "sent", "MOVEGAP", "beyond-semicolon"))
    free = real = 0
    for i, (a, b) in enumerate(zip(src6, cand6), 1):
        ss, cs = len(sentences(a)), len(sentences(b))
        cashed = a.count(";") - b.count(";")
        beyond = (cs - ss) - cashed
        free += cashed
        real += beyond
        at, bt = toks(a), toks(b)
        sm = difflib.SequenceMatcher(a=at, b=bt, autojunk=False)
        o = sum(x.size for x in sm.get_matching_blocks()) / len(at)
        ca, cb = Counter(at), Counter(bt)
        bg = sum(min(n, cb[w]) for w, n in ca.items()) / len(at)
        dr = displaced_runs(a, b)
        print("B06-P%03d %4d %3d->%-2d %4d->%-4d %+8.4f %+3d  %s"
              % (i, len(a.split()), a.count(";"), b.count(";"), ss, cs,
                 bg - o, beyond,
                 "; ".join("«%s»" % t for _, _, t in dr) if dr else ""))
    print("\nsemicolons cashed: %d   sentence boundaries beyond them: %d"
          % (free, real))


if __name__ == "__main__":
    main()
