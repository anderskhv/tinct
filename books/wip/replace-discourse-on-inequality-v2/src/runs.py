#!/usr/bin/env python3
"""runs.py <modern.json> <N> <allow.json>... -- ref1 ref2 ... : print MY candidate's flagged runs (own text, exact substrings)
by paragraph. Reference text itself is never printed; only the candidate's words that coincide with it.
Optional env ONLY_CH=<n> restricts to one chapter."""
import json, re, sys, os
TOK = re.compile(r"[a-z0-9']+")
def norm(s): return s.lower().replace("’", "'").replace("‘", "'")
args = sys.argv[1:]
cand = args[0]; n = int(args[1]); rest = args[2:]
i = rest.index('--'); allow = rest[:i]; refs = rest[i + 1:]
def words(p): return [w for c in json.load(open(p, encoding='utf-8'))['chapters'] for q in c['paragraphs'] for w in TOK.findall(norm(q))]
grams = set()
for r in refs:
    w = words(r); grams |= {tuple(w[k:k + n]) for k in range(len(w) - n + 1)}
for r in allow:
    w = words(r); grams -= {tuple(w[k:k + n]) for k in range(len(w) - n + 1)}
only = os.environ.get('ONLY_CH')
tot = 0
for ci, c in enumerate(json.load(open(cand, encoding='utf-8'))['chapters'], 1):
    if only and int(only) != ci: continue
    for pi, p in enumerate(c['paragraphs'], 1):
        ms = list(TOK.finditer(norm(p))); t = [m.group() for m in ms]; mark = [False] * len(t)
        for k in range(len(t) - n + 1):
            if tuple(t[k:k + n]) in grams:
                for j in range(k, k + n): mark[j] = True
        if any(mark):
            tot += 1
            out = []; j = 0
            while j < len(t):
                if mark[j]:
                    k = j
                    while k < len(t) and mark[k]: k += 1
                    out.append(p[ms[j].start():ms[k - 1].end()]); j = k
                else: j += 1
            print(f'ch{ci} p{pi}:', ' || '.join(out))
print('flagged paragraphs:', tot)
