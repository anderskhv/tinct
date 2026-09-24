#!/usr/bin/env python3
"""Verify accepted bytes, paragraph coverage and character compatibility without inference."""
import argparse, hashlib, json, re, subprocess, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
def sha(raw): return hashlib.sha256(raw).hexdigest()
def read_at(ref, path): return subprocess.check_output(["git", "show", f"{ref}:{path}"], cwd=ROOT)
def fetch(ref, path):
    req = urllib.request.Request(f"https://raw.githubusercontent.com/anderskhv/tinct/{ref}/{path}", headers={"User-Agent": "Tinct-release-verification"})
    return urllib.request.urlopen(req, timeout=45).read()
def norm(s): return re.sub(r" {2,}", " ", s.replace("\n", " "))
def u16(s): return len(s.encode("utf-16-le")) // 2
p = argparse.ArgumentParser()
p.add_argument("--config", required=True)
p.add_argument("--baseline", required=True)
args = p.parse_args()
config = json.loads((ROOT / args.config).read_text())
results = []
for item in config["books"]:
    book = item["id"]
    base = item.get("sourceDirectory", f"books/wip/green-{book}").rstrip("/") + "/"
    target = f"app/public/data/editions/{book}-modern-en.json"
    raw = (ROOT / target).read_bytes()
    old_raw = read_at(args.baseline, target)
    assert sha(raw) == item["accepted"] and sha(old_raw) == item["before"]
    assert fetch(config["sourceRef"], base + "candidate.json") == raw
    assert fetch(config["sourceRef"], base + item.get("baselineFile", "baseline-live-modern-en.json")) == old_raw
    source_path = f"app/public/data/editions/{book}-original-en.json"
    source = (ROOT / source_path).read_bytes()
    assert source == read_at(args.baseline, source_path) == fetch(config["sourceRef"], base + "source.json")
    accepted, old = json.loads(raw), json.loads(old_raw)
    hashes = fetch(config["sourceRef"], base + item.get("paragraphHashesFile", "accepted-paragraph-hashes.tsv")).decode().splitlines()
    header = hashes.pop(0).split("\t")
    rows = [line.split("\t") for line in hashes]
    assert all(len(row) == len(header) for row in rows)
    if header == ["section", "paragraph", "sha256"]:
        assert rows == [[str(ch["number"]), str(i+1), sha(text.encode())] for ch in accepted["chapters"] for i,text in enumerate(ch["paragraphs"])]
    else:
        assert header in (["coord", "sha256_16"], ["ref", "sha256_16"], ["id", "section", "sha256_16"])
        hashes = [row[0] + "\t" + row[header.index("sha256_16")] for row in rows]
        assert hashes == [f"{ch['number']}.{i}\t{sha(text.encode())[:16]}" for ch in accepted["chapters"] for i,text in enumerate(ch["paragraphs"])]
    changed = []
    assert len(accepted["chapters"]) == item["chapters"]
    for a,b in zip(old["chapters"], accepted["chapters"], strict=True):
        assert {k:v for k,v in a.items() if k != "paragraphs"} == {k:v for k,v in b.items() if k != "paragraphs"}
        assert len(a["paragraphs"]) == len(b["paragraphs"])
        changed.extend((b["number"], i+1, before, after) for i,(before,after) in enumerate(zip(a["paragraphs"],b["paragraphs"])) if before != after)
    assert len(changed) == item["changed"]
    assert sum(len(ch["paragraphs"]) for ch in accepted["chapters"]) == item["paragraphs"]
    if item.get("changesFile"):
        evidence = json.loads(fetch(config["sourceRef"], base + item["changesFile"]))
        source_chapters = {ch["number"]:ch["paragraphs"] for ch in json.loads(source)["chapters"]}
        assert [(r["section"],r["paragraph"],r["before"],r["after"]) for r in evidence] == changed
        assert all(r["source"] == source_chapters[r["section"]][r["paragraph"]-1] for r in evidence)
    card_path = f"app/public/data/characters/{book}.v1.json"
    card = json.loads((ROOT / card_path).read_bytes())
    previous = json.loads(read_at(args.baseline, card_path))
    assert card["contentVersion"] == config["revision"]
    for edition, block in card["editions"].items():
        if edition != "modern-en":
            assert block == previous["editions"][edition]
            continue
        assert block["sourceSha256"] == sha(raw)
        paras = {str(ch["number"]): [norm(text) for text in ch["paragraphs"]] for ch in accepted["chapters"]}
        assert block["paragraphHashes"] == {k: [sha(s.encode()) for s in v] for k,v in paras.items()}
        def point(q, field="offset"):
            text = paras[str(q["chapterNumber"])][q["paragraphIndex"]]
            value = q[field]
            assert isinstance(value, int) and 0 <= value <= u16(text)
            text.encode("utf-16-le")[:value*2].decode("utf-16-le")
        ids = {c["id"] for c in block["characters"]}
        for mention in block["mentions"]:
            assert mention["characterId"] in ids
            point(mention, "startOffset"); point(mention, "endOffset")
            text = paras[str(mention["chapterNumber"])][mention["paragraphIndex"]].encode("utf-16-le")
            assert text[2*mention["startOffset"]:2*mention["endOffset"]].decode("utf-16-le") == mention["text"]
        for current, prior in zip(block["characters"], previous["editions"][edition]["characters"], strict=True):
            assert {k:v for k,v in current.items() if k not in ("firstMention","roleVisibleAt","snapshots")} == {k:v for k,v in prior.items() if k not in ("firstMention","roleVisibleAt","snapshots")}
            point(current["firstMention"]); point(current["roleVisibleAt"])
            for s, was in zip(current["snapshots"], prior["snapshots"], strict=True):
                assert {k:v for k,v in s.items() if k not in ("availableAt","evidence")} == {k:v for k,v in was.items() if k not in ("availableAt","evidence")}
                point(s["availableAt"])
                for e in s.get("evidence", []):
                    if "throughOffset" in e: point(e, "throughOffset")
    results.append({"book": book, "sha256": sha(raw), "paragraphHashesVerified": len(hashes), "mentionsVerified": len(card["editions"]["modern-en"]["mentions"]), "originalUnchanged": True, "cardProseUnchanged": True})
print(json.dumps(results, indent=2))
