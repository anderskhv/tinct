#!/usr/bin/env python3
"""**Blind spot 5, written.** A per-mark census of source against candidate,
and the decomposition of D17's raw splitting rate into *marks Butler already
wrote* and *divisions the draft actually made*.

`RESUME.md` §"What the checks would STILL not catch" item 5 says: *"Every mark
except the semicolon is unmeasured, in both directions… A per-mark census of
source against candidate is still four lines and still unwritten."* This is it,
plus the thing the census is FOR.

**Why the census alone is not enough.** Counting marks tells you 42 semicolons
became 0. It does not tell you what the 52 new sentences are made of. D20's
NORM RATE prices the semicolon and nothing else, so a colon cashed for a period
and an em dash cashed for a period both score as free division — exactly the
loophole S-1 found on the other side of the semicolon.

So the second measure here aligns every candidate sentence boundary back to the
source and asks what Butler had at that place:

  * `CASHED`   — Butler wrote `;` `:` or `—` there. The draft moved no clause;
                 it spent a mark Butler had already written.
  * `SPLIT`    — Butler wrote `,` or nothing there. This is real division.
  * `KEPT`     — Butler wrote `.` `!` or `?` there; the boundary is his.

Run: python3 book08/review/mark_census.py
"""
import difflib
import json
import re
from collections import Counter
from pathlib import Path

BOOK = Path(__file__).resolve().parent.parent
SRC = json.load(open(BOOK / "source-book8.json"))["paragraphs"]
CAND = json.load(open(BOOK / "candidate-v1.json"))["paragraphs"]

NAMES = {'ulysses': 'odysseus', 'minerva': 'athena', 'jove': 'zeus',
         'neptune': 'poseidon', 'mercury': 'hermes', 'saturn': 'cronus',
         'diana': 'artemis', 'euryclea': 'eurycleia', 'venus': 'aphrodite',
         'juno': 'hera', 'vulcan': 'hephaestus', 'ceres': 'demeter'}
WORD = re.compile(r"[A-Za-z]+(?:['’][A-Za-z]+)?")
MARKS = ";:,.!?—()“”"


def census(paras):
    c = Counter()
    for p in paras:
        for ch in p:
            if ch in MARKS:
                c[ch] += 1
    return c


def marked(t):
    """(normalized word, the mark that follows it or '') for every word."""
    out = []
    for m in WORD.finditer(t):
        w = m.group(0).lower().replace("’", "'").split("'")[0]
        tail = t[m.end():m.end() + 4]
        mk = ""
        for ch in tail:
            if ch in ";,.:!?—":
                mk = ch
                break
            if ch in "”\"’')":
                continue
            break
        out.append((NAMES.get(w, w), mk))
    return out


def boundary_provenance(src, cand):
    """For every SENTENCE-ENDING mark in the candidate, what Butler had at the
    aligned place. Same alignment construction as `semicolon_provenance()` in
    scripts/checks.py — a SequenceMatcher over the two word streams — so the
    two measures are commensurable; the difference is that this one asks the
    question of `.`/`!`/`?` instead of `;`."""
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
        for j, (w, mk) in enumerate(C):
            if mk not in (".", "!", "?"):   # NB: `"" in ".!?"` is True
                continue
            if j == len(C) - 1:
                continue                       # the paragraph's own full stop
            before = [c2s[k] for k in range(j, -1, -1) if k in c2s]
            after = [c2s[k] for k in range(j + 1, len(C)) if k in c2s]
            A = before[0] if before else 0
            B = after[0] if after else len(S) - 1
            span = [S[k][1] for k in range(max(A, 0), min(B, len(S) - 1) + 1)]
            if ";" in span:
                cls = "CASHED ;"
            elif ":" in span:
                cls = "CASHED :"
            elif "—" in span:
                cls = "CASHED —"
            elif any(m in span for m in (".", "!", "?")):
                cls = "KEPT"
            else:
                cls = "SPLIT"
            rows.append((i, cls, " ".join(cw[max(0, j - 4):j + 1])))
    return rows


def main():
    cs, cc = census(SRC), census(CAND)
    print("PER-MARK CENSUS — basis: all 50 paragraphs\n")
    print("  mark   Butler   candidate   delta")
    for ch in MARKS:
        if cs[ch] or cc[ch]:
            print("  %-5s  %6d   %9d   %+5d"
                  % (repr(ch)[1:-1], cs[ch], cc[ch], cc[ch] - cs[ch]))
    print()
    rows = boundary_provenance(SRC, CAND)
    k = Counter(r[1] for r in rows)
    print("DECOMPOSITION of the candidate's internal sentence boundaries "
          "(%d in 50 paragraphs)\n" % len(rows))
    for cls in ("KEPT", "CASHED ;", "CASHED :", "CASHED —", "SPLIT"):
        print("  %-10s %4d" % (cls, k[cls]))
    cashed = k["CASHED ;"] + k["CASHED :"] + k["CASHED —"]
    print()
    print("  Butler's own sentences:                192")
    print("  the candidate's:                       244   (+27.1%% raw D17)")
    print("  new boundaries:                        +52")
    print("  of which marks Butler already wrote:   %d" % cashed)
    print("  of which real division of his prose:   %d" % (52 - cashed))
    print()
    print("  => %.0f%% of the raw splitting rate is cashed pointing."
          % (100.0 * cashed / 52))
    print()
    print("  every CASHED : and CASHED — boundary, which NO measure in the "
          "package prices:")
    for i, cls, anc in rows:
        if cls in ("CASHED :", "CASHED —"):
            print("    B08-P%03d  %-10s  …%s ." % (i, cls, anc))


if __name__ == "__main__":
    main()
