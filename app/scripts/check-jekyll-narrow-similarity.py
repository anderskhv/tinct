#!/usr/bin/env python3
"""Narrow Jekyll correction: keep the full-book threshold visible; reject regression."""
import importlib.util, json, hashlib, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("classifier", ROOT / "books/classify-modern-en.py")
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
book = "jekyll-and-hyde"
base_ref = "b91d4b8d8ceab2e3379cb6a83174ce97c7c47aec"
path = f"app/public/data/editions/{book}-modern-en.json"
before_raw = subprocess.check_output(["git","show",f"{base_ref}:{path}"],cwd=ROOT)
assert hashlib.sha256(before_raw).hexdigest() == "f2cf24e93c77b354a9fa617d3440b6daaa09acd36e6fdb1df236469ac570a5ae"
after_raw = (ROOT/path).read_bytes()
assert hashlib.sha256(after_raw).hexdigest() == "7bcc0ee81b68635f017b8324fab9dc2e4cc3fc0febb827e0431ce876a2d0ac6b"
source = m.load(book,"original-en")["chapters"]
def metrics(raw):
    target = json.loads(raw)["chapters"]
    assert len(source) == len(target)
    total = sum(sum(len(p.split()) for p in ch["paragraphs"]) for ch in source)
    mean = sum(m.chapter_similarity(a,b)*sum(len(p.split()) for p in a["paragraphs"]) for a,b in zip(source,target))/total
    light = sum(m.chapter_similarity(a,b) >= .85 for a,b in zip(source,target))/len(source)
    long = [(p,q) for a,b in zip(source,target) for p,q in zip(a["paragraphs"],b["paragraphs"]) if len(p)>=80]
    identical = sum(p==q for p,q in long)/len(long)
    assert all(len(a["paragraphs"])==len(b["paragraphs"]) for a,b in zip(source,target))
    assert not any(m.is_wrapped(q) or m.is_truncation(p,q) for a,b in zip(source,target) for p,q in zip(a["paragraphs"],b["paragraphs"]))
    return {"weightedSimilarity":mean,"lightChapterRate":light,"identicalLongParagraphRate":identical}
before, after = metrics(before_raw), metrics(after_raw)
assert all(after[k] <= before[k] for k in before), (before,after)
assert after["lightChapterRate"] <= .05 and after["identicalLongParagraphRate"] <= .05
print(json.dumps({"book":book,"scope":"one accepted paragraph; not whole-book gate certification","before":before,"after":after,"wholeBookSimilarityGatePass":after["weightedSimilarity"] <= .75,"noRegression":True},indent=2))
