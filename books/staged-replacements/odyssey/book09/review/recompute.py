#!/usr/bin/env python3
"""Book 9 round 1 — every published figure recomputed from scratch.

Imports NOTHING from `scripts/`.  Definitions are taken from `GLOSSARY.md`
and from the prose of `scripts/checks.py`'s docstrings, and re-implemented
here, so that agreement is evidence and disagreement is a finding.
"""
import difflib
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
BOOK = HERE.parent
PKG = BOOK.parent

NAME_MAP = {'ulysses': 'odysseus', 'minerva': 'athena', 'jove': 'zeus',
            'neptune': 'poseidon', 'mercury': 'hermes', 'saturn': 'cronus',
            'diana': 'artemis', 'euryclea': 'eurycleia', 'venus': 'aphrodite',
            'juno': 'hera', 'vulcan': 'hephaestus', 'ceres': 'demeter'}


def toks(t):
    return [NAME_MAP.get(w, w)
            for w in re.findall(r"[a-z]+", t.replace("\n", " ").lower())]


def sentences(t):
    t = t.replace("\n", " ")
    return [s for s in re.split(r'(?<=[.!?])["”’\']?\s+', t) if s.strip()]


def matched(a, b):
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    return sum(x.size for x in sm.get_matching_blocks())


def agg_retention(src, cand):
    a, b = toks(" ".join(src)), toks(" ".join(cand))
    return matched(a, b) / len(a)


def order_retention(src, cand):
    n = d = 0
    for s, c in zip(src, cand):
        a, b = toks(s), toks(c)
        n += matched(a, b)
        d += len(a)
    return n / d


def bag_retention(src, cand):
    n = d = 0
    for s, c in zip(src, cand):
        A, B = Counter(toks(s)), Counter(toks(c))
        n += sum(min(k, B[w]) for w, k in A.items())
        d += sum(A.values())
    return n / d


WORD = re.compile(r"[A-Za-z]+(?:['’][A-Za-z]+)?")
RANK = {";": 3, ".": 2, ":": 2, "!": 2, "?": 2, ",": 1, "—": 1, "": 0}
DIVIDING = (";", ":", "—")


def marked(t):
    out = []
    for m in WORD.finditer(t):
        w = m.group(0).lower().replace("’", "'").split("'")[0]
        out.append((NAME_MAP.get(w, w), t[m.end():m.end() + 4]))
    return out


def mark_of(tail):
    for ch in tail:
        if ch in ";,.:!?—":
            return ch
        if ch in "”\"’')":
            continue
        break
    return ""


def internal_dashes(t):
    """Offsets of em dashes with a word on each side inside one sentence."""
    out, base = set(), 0
    for sent in sentences(t):
        i = t.find(sent, base)
        if i < 0:
            continue
        base = i + len(sent)
        for m in re.finditer("—", sent):
            if re.search(r"\w", sent[:m.start()]) and re.search(r"\w", sent[m.end():]):
                out.add(i + m.start())
    return out


def semis(ps):
    return sum(p.count(";") for p in ps)


def divmarks(ps):
    return sum(p.count(";") + p.count(":") + len(internal_dashes(p)) for p in ps)


def provenance(src, cand, marks):
    """(paragraph, candidate mark, Butler's strongest mark in the aligned span,
    the four candidate words ending at the mark)."""
    rows = []
    for i, (s, c) in enumerate(zip(src, cand), 1):
        S, C = marked(s), marked(c)
        sw = [w for w, _ in S]
        cw = [w for w, _ in C]
        sm = difflib.SequenceMatcher(a=cw, b=sw, autojunk=False)
        c2s = {}
        for a, b, n in sm.get_matching_blocks():
            for k in range(n):
                c2s[a + k] = b + k
        idash = internal_dashes(c) if "—" in marks else set()
        ends = [m.end() for m in WORD.finditer(c)]
        for j, (w, tail) in enumerate(C):
            mk = mark_of(tail)
            if mk not in marks:
                continue
            if mk == "—":
                pos = c.find("—", ends[j], ends[j] + 5)
                if pos not in idash:
                    continue
            before = [c2s[k] for k in range(j, -1, -1) if k in c2s]
            after = [c2s[k] for k in range(j + 1, len(C)) if k in c2s]
            A = before[0] if before else 0
            B = after[0] if after else len(S) - 1
            span = [mark_of(S[k][1]) for k in range(max(A, 0), min(B, len(S) - 1) + 1)]
            best = max(span, key=lambda m: RANK.get(m, 0)) if span else ""
            rows.append((i, mk, best, " ".join(cw[max(0, j - 3):j + 1])))
    return rows


def kept_added(src, cand, marks):
    rows = provenance(src, cand, marks)
    kept = sum(1 for r in rows if r[2] in marks)
    return kept, len(rows) - kept, rows


def profile(ps):
    ss = [s for p in ps for s in sentences(p)]
    return len(ss), sum(1 for s in ss if len(s.split()) >= 60)


def count_run(seq, run):
    L = len(run)
    return sum(1 for k in range(len(seq) - L + 1) if seq[k:k + L] == run)


def displaced_runs(s, c, minlen=4):
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
                if count_run(a, run) == 1 and count_run(b, run) == 1:
                    out.append((st, L, " ".join(run)))
                    hit = True
                    break
            if hit:
                break
        i = j
    return out


def main():
    cj = json.loads((BOOK / "candidate-v1.json").read_text())
    sj = json.loads((BOOK / "source-book9.json").read_text())
    sha = hashlib.sha256((BOOK / "candidate-v1.json").read_bytes()).hexdigest()
    # The served file hard-wraps; whitespace is normalized on load, exactly as
    # `checks.py` does, or `internal_dashes()` silently counts none of the
    # source's ten em dashes (see finding S-2).
    cand = [" ".join(p.split()) for p in cj["paragraphs"]]
    src = [" ".join(p.split()) for p in sj["paragraphs"]]
    assert len(cand) == len(src) == 44, (len(cand), len(src))

    print("candidate sha256:", sha)
    print("paragraphs:", len(cand))
    print()

    agg = agg_retention(src, cand)
    ordr = order_retention(src, cand)
    bag = bag_retention(src, cand)
    print("retention (aggregate-join, canonical) = %.5f" % agg)
    print("retention (order, per-paragraph)      = %.5f" % ordr)
    print("retention (bag, per-paragraph)        = %.5f" % bag)
    print("MOVE-GAP (bag - order)                = %.5f" % (bag - ordr))
    print()

    sn, s60 = profile(src)
    cn, c60 = profile(cand)
    print("sentences %d -> %d   raw D17 = %+.1f%%" % (sn, cn, 100.0 * (cn - sn) / sn))
    print("sixty-word %d -> %d" % (s60, c60))
    print()

    ss, cs = semis(src), semis(cand)
    k, a, rows = kept_added(src, cand, (";",))
    print("semicolons %d -> %d   kept %d + added %d" % (ss, cs, k, a))
    sd, cd = divmarks(src), divmarks(cand)
    kd, ad, drows = kept_added(src, cand, DIVIDING)
    print("dividing marks %d -> %d   kept %d + added %d" % (sd, cd, kd, ad))
    print()

    A, B = sn + ss, cn + cs
    print("NORM RATE (D20, semicolons both sides): %d -> %d = %+.1f%%"
          % (A, B, 100.0 * (B - A) / A))
    B2 = cn + k
    print("NORM RATE on Butler's pointing (D21):   %d -> %d = %+.1f%%"
          % (A, B2, 100.0 * (B2 - A) / A))
    A3, B3 = sn + sd, cn + cd
    print("NORM RATE, every dividing mark (D27):   %d -> %d = %+.1f%%"
          % (A3, B3, 100.0 * (B3 - A3) / A3))
    B4 = cn + kd
    print("NORM RATE, D27 on Butler's pointing:    %d -> %d = %+.1f%%  <-- COMPARED"
          % (A3, B4, 100.0 * (B4 - A3) / A3))
    print()

    sw = len(toks(" ".join(src)))
    cw = len(toks(" ".join(cand)))
    print("word ratio = %.5f  (%d -> %d)" % (cw / sw, sw, cw))
    print()

    dr = []
    for i, (s, c) in enumerate(zip(src, cand), 1):
        for st, L, run in displaced_runs(s, c):
            dr.append((i, run))
    print("displaced runs: %d" % len(dr))
    for i, run in dr:
        print("   B09-P%03d  <<%s>>" % (i, run))
    print()

    print("--- the %d candidate dividing marks, with Butler's mark there ---" % len(drows))
    for i, mk, best, ctx in drows:
        print("  B09-P%03d  %s   butler=%r   ...%s" % (i, mk, best or "(none)", ctx))
    print()
    print("--- Butler's %d dividing marks by paragraph ---" % sd)
    for i, p in enumerate(src, 1):
        n = p.count(";") + p.count(":") + len(internal_dashes(p))
        if n:
            print("  B09-P%03d  ;=%d :=%d dash=%d" % (i, p.count(";"), p.count(":"),
                                                     len(internal_dashes(p))))


if __name__ == "__main__":
    main()
