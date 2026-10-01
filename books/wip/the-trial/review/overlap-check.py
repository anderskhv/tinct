#!/usr/bin/env python3
"""Independence check for The Trial modern-en.

Counts runs of N or more consecutive identical words shared between the candidate modern-en and a
reference English translation that must NOT be copied (David Wyllie's, Project Gutenberg #7849,
copyrighted). The script prints ONLY paragraph coordinates and counts, never reference wording,
so a rewriting agent can use it without reading the reference text.

Usage: python3 overlap-check.py <path-to-modern-en.json> [--n 10] [--ref-cache /tmp/ref.txt]
Pass criterion for publication: zero paragraphs with a shared run of N=10 or more words, and at most
a handful (< 1%) with N=8, all of them short dialogue formulas.
"""
import argparse, json, os, re, sys, urllib.request

URL = "https://www.gutenberg.org/cache/epub/7849/pg7849.txt"
tok = lambda s: re.findall(r"[a-z0-9']+", s.lower().replace("’", "'"))

def load_ref(cache):
    if cache and os.path.exists(cache):
        raw = open(cache, encoding="utf-8").read()
    else:
        raw = urllib.request.urlopen(URL, timeout=60).read().decode("utf-8")
        if cache:
            open(cache, "w", encoding="utf-8").write(raw)
    a = raw.find("Chapter One"); b = raw.find("*** END OF THE PROJECT GUTENBERG")
    return tok(raw[a:b])

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("modern"); ap.add_argument("--n", type=int, default=10)
    ap.add_argument("--ref-cache", default="/tmp/trial-ref-cache.txt")
    a = ap.parse_args()
    ref = load_ref(a.ref_cache)
    grams = {tuple(ref[i:i + a.n]) for i in range(len(ref) - a.n + 1)}
    ch = json.load(open(a.modern))["chapters"]
    flagged = []
    total = 0
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
