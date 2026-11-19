#!/usr/bin/env python3
"""Jekyll modern-en release: reject any similarity regression against the text it replaces.

2026-09-24 pinned the narrow one-paragraph correction (f2cf24e9... at b91d4b8d -> 7bcc0ee8...), which
could not pass the whole-book gate. 2026-10-21 (approved by Anders) moved the pin to the accepted
whole-book repair (7bcc0ee8... at 5f4da80b -> 640dc4ea...), which passes it, so the gate is asserted too.
Record: books/wip/modern-en-release-20261021/RELEASE-2.md."""
import importlib.util, json, hashlib, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("classifier", ROOT / "books/classify-modern-en.py")
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
book = "jekyll-and-hyde"
base_ref = "5f4da80b255686187bd2b1477dcd9599e6344c0d"
path = f"app/public/data/editions/{book}-modern-en.json"
before_raw = subprocess.check_output(["git","show",f"{base_ref}:{path}"],cwd=ROOT)
assert hashlib.sha256(before_raw).hexdigest() == "7bcc0ee81b68635f017b8324fab9dc2e4cc3fc0febb827e0431ce876a2d0ac6b"
after_raw = (ROOT/path).read_bytes()
assert hashlib.sha256(after_raw).hexdigest() == "640dc4ea5d7d56f4b015b000404b5275c5cf9223b9979ed6bfb3765155c4883d"
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
assert after["weightedSimilarity"] <= .75, after
print(json.dumps({"book":book,"scope":"accepted whole-book modern-en repair, text-2026-10-21.2","before":before,"after":after,"wholeBookSimilarityGatePass":True,"noRegression":True},indent=2))
