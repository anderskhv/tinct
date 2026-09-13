#!/usr/bin/env python3
"""Independent recomputation of every published Book 8 figure.

Imports NOTHING from scripts/. Every measure is re-derived from its written
definition in GLOSSARY.md / the ledger, not from the package's code.
Basis: all 50 paragraphs of book08/source-book8.json vs book08/candidate-v1.json.
"""
import difflib, json, re, sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
BOOK = HERE.parent
PKG = BOOK.parent

NAMES = {'ulysses':'odysseus','minerva':'athena','jove':'zeus','neptune':'poseidon',
         'mercury':'hermes','saturn':'cronus','diana':'artemis','euryclea':'eurycleia',
         'venus':'aphrodite','juno':'hera','vulcan':'hephaestus','ceres':'demeter'}

def toks(t):
    return [NAMES.get(w, w) for w in re.findall(r"[a-z]+", t.replace("\n"," ").lower())]

def sents(t):
    t = t.replace("\n"," ")
    return [s for s in re.split(r'(?<=[.!?])["”’\']?\s+', t) if s.strip()]

def load(p):
    return json.load(open(BOOK / p))['paragraphs']

SRC = load('source-book8.json')
CAND = load('candidate-v1.json')
assert len(SRC) == len(CAND) == 50, (len(SRC), len(CAND))

# ---- retention, aggregate-join form
def agg_retention(a_paras, b_paras):
    a, b = toks(" ".join(a_paras)), toks(" ".join(b_paras))
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    return sum(x.size for x in sm.get_matching_blocks()) / len(a)

def order_retention(a_paras, b_paras):
    num = den = 0
    for s, c in zip(a_paras, b_paras):
        a, b = toks(s), toks(c)
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        num += sum(x.size for x in sm.get_matching_blocks()); den += len(a)
    return num/den

def bag_retention(a_paras, b_paras):
    num = den = 0
    for s, c in zip(a_paras, b_paras):
        A, B = Counter(toks(s)), Counter(toks(c))
        num += sum(min(n, B[w]) for w,n in A.items()); den += sum(A.values())
    return num/den

RET = agg_retention(SRC, CAND)
ORD = order_retention(SRC, CAND)
BAG = bag_retention(SRC, CAND)
MOVEGAP = BAG - ORD

# ---- sentence profile / D17
def profile(paras):
    ss = [s for p in paras for s in sents(p)]
    return len(ss), sum(1 for s in ss if len(s.split()) >= 60)

SN, S60 = profile(SRC)
CN, C60 = profile(CAND)
RAW = 100.0*(CN-SN)/SN

# ---- semicolons
SSEMI = sum(p.count(';') for p in SRC)
CSEMI = sum(p.count(';') for p in CAND)

# ---- kept/added by my own alignment (independent of checks.py's method)
WORD = re.compile(r"[A-Za-z]+(?:['’][A-Za-z]+)?")
RANK = {';':3,'.':2,':':2,'!':2,'?':2,',':1,'—':1,'':0}
def marked(t):
    out=[]
    for m in WORD.finditer(t):
        w=m.group(0).lower().replace('’',"'").split("'")[0]
        out.append((NAMES.get(w,w), t[m.end():m.end()+4]))
    return out
def mark_of(tail):
    for ch in tail:
        if ch in ';,.:!?—': return ch
        if ch in '”"’\')': continue
        break
    return ''
def provenance(src, cand):
    rows=[]
    for i,(s,c) in enumerate(zip(src,cand),1):
        S,C = marked(s), marked(c)
        sw=[w for w,_ in S]; cw=[w for w,_ in C]
        sm=difflib.SequenceMatcher(a=cw,b=sw,autojunk=False)
        c2s={}
        for a,b,n in sm.get_matching_blocks():
            for k in range(n): c2s[a+k]=b+k
        for j,(w,tail) in enumerate(C):
            if mark_of(tail)!=';': continue
            before=[c2s[k] for k in range(j,-1,-1) if k in c2s]
            after=[c2s[k] for k in range(j+1,len(C)) if k in c2s]
            A=before[0] if before else 0
            B=after[0] if after else len(S)-1
            span=[mark_of(S[k][1]) for k in range(max(A,0), min(B,len(S)-1)+1)]
            best=max(span,key=lambda m:RANK.get(m,0)) if span else ''
            rows.append((i," ".join(cw[max(0,j-3):j+1]),best))
    return rows
PROV = provenance(SRC,CAND)
KEPT = sum(1 for r in PROV if r[2]==';')
ADDED = len(PROV)-KEPT

# ---- NORM RATE, published form and Butler-pointing form
NA, NB = SN+SSEMI, CN+CSEMI
NORM_PUB = 100.0*(NB-NA)/NA
BA, BB = SN+SSEMI, CN+KEPT
NORM_BUT = 100.0*(BB-BA)/BA

# ---- displaced runs
def count_run(seq, run):
    L=len(run); return sum(1 for k in range(len(seq)-L+1) if seq[k:k+L]==run)
def displaced(s,c,minlen=4):
    a,b=toks(s),toks(c)
    sm=difflib.SequenceMatcher(a=a,b=b,autojunk=False)
    aligned=set()
    for blk in sm.get_matching_blocks(): aligned.update(range(blk.a,blk.a+blk.size))
    out=[];i=0
    while i<len(a):
        if i in aligned: i+=1; continue
        j=i
        while j<len(a) and j not in aligned: j+=1
        for L in range(j-i, minlen-1, -1):
            hit=False
            for st in range(i,j-L+1):
                run=a[st:st+L]
                if count_run(a,run)==1 and count_run(b,run)==1:
                    out.append((st,L," ".join(run))); hit=True; break
            if hit: break
        i=j
    return out
DISP = [(i,r) for i,(s,c) in enumerate(zip(SRC,CAND),1) for r in displaced(s,c)]

if __name__ == '__main__':
    print(f"BASIS: all 50 paragraphs")
    print(f"retention (aggregate-join) = {RET:.5f}")
    print(f"order retention            = {ORD:.5f}")
    print(f"bag retention              = {BAG:.5f}")
    print(f"MOVE-GAP                   = {MOVEGAP:.5f}")
    print(f"displaced runs             = {len(DISP)}")
    print(f"sentences                  = {SN} -> {CN}  raw D17 = {RAW:+.1f}%")
    print(f"sixty-word                 = {S60} -> {C60}")
    print(f"semicolons                 = {SSEMI} -> {CSEMI}")
    print(f"candidate semicolons kept/added = {KEPT} + {ADDED}")
    print(f"NORM RATE (published form)      = {NORM_PUB:+.1f}%  ({NA} -> {NB})")
    print(f"NORM RATE (Butler's pointing)   = {NORM_BUT:+.1f}%  ({BA} -> {BB})")
