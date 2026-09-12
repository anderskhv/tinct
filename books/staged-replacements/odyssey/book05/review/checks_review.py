#!/usr/bin/env python3
"""Book 5 — the package's mechanical checks, RE-RUN by the reviewer from the
frozen files.  Nothing here is taken from the drafter's report."""
import json, re, difflib, hashlib, os, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
B5 = os.path.abspath(os.path.join(HERE, ".."))
PKG = os.path.abspath(os.path.join(B5, ".."))

NAME_MAP = {'ulysses': 'odysseus', 'minerva': 'athena', 'jove': 'zeus',
            'neptune': 'poseidon', 'mercury': 'hermes', 'saturn': 'cronus',
            'diana': 'artemis', 'euryclea': 'eurycleia', 'venus': 'aphrodite',
            'juno': 'hera', 'vulcan': 'hephaestus', 'mycene': 'mycenae',
            'ceres': 'demeter'}

def toks(t):
    return [NAME_MAP.get(w, w)
            for w in re.findall(r"[a-z]+", t.replace("\n", " ").lower())]

def token_retention(src, cand):
    s = toks(" ".join(src)); c = toks(" ".join(cand))
    sm = difflib.SequenceMatcher(a=s, b=c, autojunk=False)
    return sum(b.size for b in sm.get_matching_blocks()) / len(s)

def sentences(t):
    t = t.replace("\n", " ")
    return [s for s in re.split(r'(?<=[.!?])["”’\']?\s+', t) if s.strip()]

def sentence_profile(paragraphs):
    ss = [s for p in paragraphs for s in sentences(p)]
    return len(ss), sum(1 for s in ss if len(s.split()) >= 60)

def words(t):
    return len(t.replace("\n", " ").split())

def main():
    src = json.load(open(os.path.join(B5, "source-book5.json")))["paragraphs"]
    cand = json.load(open(os.path.join(B5, "candidate-v1.json")))["paragraphs"]
    raw = open(os.path.join(B5, "candidate-v1.json"), "rb").read()
    print("candidate sha256:", hashlib.sha256(raw).hexdigest())
    print("paragraphs:", len(src), "->", len(cand))

    sw = sum(words(p) for p in src); cw = sum(words(p) for p in cand)
    print(f"words {sw} -> {cw}, ratio {cw/sw:.5f}")
    print(f"retention {token_retention(src, cand):.5f}")

    sn, s60 = sentence_profile(src); cn, c60 = sentence_profile(cand)
    print(f"sentences {sn} -> {cn} ({100.0*(cn-sn)/sn:+.1f}%)")
    print(f"60+ word sentences {s60} -> {c60} "
          f"({100.0*(s60-c60)/s60:.0f}% broken)")

    # D17 gate as build_book04_v2 states it
    weakest = 5.5
    ok_rate = 100.0*(cn-sn)/sn >= weakest/2
    ok_60 = (c60/s60) <= 0.75 if s60 else True
    print(f"D17 gate: rate {'PASS' if ok_rate else 'FAIL'}, "
          f"60+ survival {c60}/{s60}={c60/s60:.2f} {'PASS' if ok_60 else 'FAIL'}")

    # byte-identical paragraphs (candidate vs Butler)
    ident = [i+1 for i,(a,b) in enumerate(zip(src,cand)) if a == b]
    print("byte-identical candidate paragraphs:", ident or "none")

    # near-identical: >=40 words and <=2 word-level edits
    print("near-identical (>=40 src words, <=4 word-level edits):")
    for i,(a,b) in enumerate(zip(src,cand),1):
        aw = a.replace("\n"," ").split(); bw = b.replace("\n"," ").split()
        if len(aw) < 40: continue
        sm = difflib.SequenceMatcher(a=aw, b=bw, autojunk=False)
        edits = sum(max(i2-i1, j2-j1) for tag,i1,i2,j1,j2 in sm.get_opcodes()
                    if tag != "equal")
        if edits <= 4:
            print(f"   B05-P{i:03d}: {len(aw)} words, {edits} word-level edits")

    # quotation-mark census
    for nm, t in (("source", src), ("candidate", cand)):
        o = sum(p.count("“") for p in t); c2 = sum(p.count("”") for p in t)
        unbal = [i+1 for i,p in enumerate(t)
                 if p.count("“") != p.count("”")]
        print(f"{nm}: opening {o}, closing {c2}, unbalanced paragraphs {unbal}")
    print("ASCII quote/apostrophe in candidate:",
          sum(p.count('"')+p.count("'") for p in cand))

    # name census
    for w in ("Ulysses","Minerva","Jove","Neptune","Mercury","Diana","Ceres",
              "Odysseus","Athena","Zeus","Poseidon","Hermes","Artemis","Demeter"):
        n = sum(len(re.findall(r"\b"+w+r"\b", p)) for p in cand)
        m = sum(len(re.findall(r"\b"+w+r"\b", p)) for p in src)
        if n or m: print(f"  name {w:10s} source {m:3d}  candidate {n:3d}")

    # heaven census
    for w in ("heaven","heavens","Heaven"):
        a = sum(len(re.findall(r"\b"+w+r"\b", p)) for p in src)
        b = sum(len(re.findall(r"\b"+w+r"\b", p)) for p in cand)
        print("  %s: source %d  candidate %d" % (w, a, b))

    # connectives
    for w in ("Thereon","On this","whereon","at which","on which","Then","At this","At that"):
        print(f"  connective {w!r}: source "
              f"{sum(p.count(w) for p in src)}  candidate {sum(p.count(w) for p in cand)}")

    # British spellings left behind
    brit = ["honour","colour","towards","ploughed","skilful","harbour","neighbour",
            "favour","splendour","behaviour","travelled","marvellous","defence"]
    for b in brit:
        n = sum(len(re.findall(r"\b"+b, p, re.I)) for p in cand)
        if n: print(f"  !! British spelling in candidate: {b} x{n}")

    # compounds: every open two-word sequence in the candidate whose closed
    # form is also a word used in the package, plus a hand list
    watch = ["sea shore","sea water","sea god","sea goddess","half way","mid ocean",
             "river bed","hill side","sandal wood","sweet smelling","yard arm",
             "goat skin","home sickness","day time","foot hold","sea gull",
             "seashore","seawater","halfway","mid-ocean","riverbed","hillside",
             "sandalwood","sweet-smelling","yardarm","goatskin","homesickness",
             "daytime","foothold","seagull","fire-seed","well-found","well found"]
    print("compound census (source -> candidate):")
    for w in watch:
        a = sum(len(re.findall(r"\b"+re.escape(w)+r"\b", p, re.I)) for p in src)
        b = sum(len(re.findall(r"\b"+re.escape(w)+r"\b", p, re.I)) for p in cand)
        if a or b: print(f"   {w:16s} src {a}  cand {b}")

if __name__ == "__main__":
    main()
