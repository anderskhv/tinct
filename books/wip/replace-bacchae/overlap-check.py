#!/usr/bin/env python3
"""Independence check between a candidate edition and a PROTECTED reference edition.

Compares two Tinct edition JSON files ({"chapters":[{"number","title","paragraphs":[...]}]}) and reports
paragraphs of the candidate that share a run of N or more consecutive identical words with ANY text of the
reference file. Prints ONLY coordinates and counts, never reference wording, so a writing agent can use it
without reading the protected text.

Usage: python3 overlap-check.py <candidate.json> <protected-reference.json> [<another-reference.json> ...] [--n 10]
Exit code 1 if any paragraph is flagged.
Pass criterion for publication: ZERO paragraphs flagged at N=10; fewer than 1% of paragraphs at N=8, all of them
short unavoidable formulas (names, stock phrases).
"""
import argparse, json, re, sys

tok = lambda s: re.findall(r"[a-z0-9']+", s.lower().replace("’", "'").replace("‘", "'"))

def words(path):
    out = []
    for c in json.load(open(path, encoding="utf-8"))["chapters"]:
        for p in c["paragraphs"]:
            out += tok(p)
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("candidate"); ap.add_argument("reference", nargs="+")
    ap.add_argument("--n", type=int, default=10)
    a = ap.parse_args()
    grams = set()
    for r in a.reference:
        w = words(r)
        grams |= {tuple(w[i:i + a.n]) for i in range(len(w) - a.n + 1)}
    ch = json.load(open(a.candidate, encoding="utf-8"))["chapters"]
    flagged, total = [], 0
    for ci, c in enumerate(ch, 1):
        for pi, p in enumerate(c["paragraphs"], 1):
            total += 1
            t = tok(p); mark = [False] * len(t)
            for i in range(len(t) - a.n + 1):
                if tuple(t[i:i + a.n]) in grams:
                    for k in range(i, i + a.n): mark[k] = True
            if any(mark): flagged.append((ci, pi, sum(mark)))
    print(f"N={a.n}: {len(flagged)}/{total} paragraphs share a run of >= {a.n} words with the reference")
    for ci, pi, w in flagged: print(f"  chapter {ci} paragraph {pi}: {w} words inside shared runs")
    sys.exit(1 if flagged else 0)

if __name__ == "__main__": main()
