#!/usr/bin/env python3
"""Zero-token mechanical gate for one chapter of a modern-en candidate.

Usage: python3 books/wip/modern-en-repair/gate.py <book-id> <chapter-num> <candidate.json>

candidate.json is a JSON array of strings (one per source paragraph).
Checks, per paragraph, against original-en:
  - count matches
  - '?' and '!' counts match (rhetorical questions not flattened)
  - word count >= 75% of source (not condensed) and <= 140% (not padded)
  - not verbatim (normalised) for paragraphs >= 25 words
  - similarity <= 0.85 for paragraphs >= 25 words (not a light word-swap)
  - quote-mark count matches source (catches a dropped closing quote; note
    that an ODD count is legitimate in continuation-quote monologues)
  - proper-noun check: capitalised tokens in source appear in candidate
Exit 1 with a list of failing indices and reasons; exit 0 on PASS.
"""
import json, re, sys, difflib
book, ch, cand_path = sys.argv[1], int(sys.argv[2]), sys.argv[3]
src = json.load(open(f"app/public/data/editions/{book}-original-en.json"))["chapters"][ch-1]["paragraphs"]
cand = json.load(open(cand_path))
def norm(s): return re.sub(r"\s+"," ",s.replace("’","'").replace("“",'"').replace("”",'"').replace("‘","'")).strip()
fails=[]
if len(cand)!=len(src):
    print(f"FAIL count: candidate {len(cand)} vs source {len(src)}"); sys.exit(1)
for i,(s,c) in enumerate(zip(src,cand)):
    r=[]
    if not isinstance(c,str) or not c.strip(): r.append("empty")
    else:
        if s.count("?")!=c.count("?"): r.append(f"?-parity {s.count('?')}->{c.count('?')}")
        if s.count("!")!=c.count("!"): r.append(f"!-parity {s.count('!')}->{c.count('!')}")
        sq=s.count("\u201c")+s.count("\u201d")+s.count('"')
        cq=c.count("\u201c")+c.count("\u201d")+c.count('"')
        if sq!=cq: r.append(f"quote-parity {sq}->{cq}")
        sw,cw=len(s.split()),len(c.split())
        if sw>=8 and cw<0.75*sw: r.append(f"short {cw}/{sw}")
        if sw>=8 and cw>1.4*sw: r.append(f"long {cw}/{sw}")
        if sw>=25:
            if norm(s)==norm(c): r.append("verbatim")
            else:
                sim=difflib.SequenceMatcher(None,norm(s),norm(c)).ratio()
                if sim>0.85: r.append(f"light-touch sim={sim:.2f}")
        names={w.strip('.,;:!?"\'()') for w in s.split()[1:] if w[:1].isupper() and w.strip('.,;:!?"\'()').isalpha() and len(w)>2}
        names={n for n in names if n not in {"The","And","But","Then","There","This","That","What","When","Where","Why","How","Yes","No","Oh","Ah","Well","Now","Mr","Mrs","Miss","Sir"}}
        missing=[n for n in names if n not in c]
        if missing: r.append(f"names-missing {missing[:5]}")
    if r: fails.append((i,r))
if fails:
    for i,r in fails: print(f"FAIL para {i}: {'; '.join(r)}")
    print(f"\n{len(fails)}/{len(src)} paragraphs failed"); sys.exit(1)
print(f"PASS {book} ch{ch}: {len(src)} paragraphs")
