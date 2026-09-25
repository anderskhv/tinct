#!/usr/bin/env python3
"""Integrate the independently accepted bounded Lighthouse package. No generation."""
import hashlib, importlib.util, json, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
REF = "175a90f02db376a18a994856903a1b21e36f92a3"
PKG = "books/wip/to-the-lighthouse"
STAGE = ROOT / "books/wip/to-the-lighthouse-followup"
def fetch(path):
    return urllib.request.urlopen(urllib.request.Request(f"https://raw.githubusercontent.com/anderskhv/tinct/{REF}/{PKG}/{path}", headers={"User-Agent":"Tinct-release"}),timeout=60).read()
def sha(raw): return hashlib.sha256(raw).hexdigest()
def write(path, raw):
    p=ROOT/path; p.parent.mkdir(parents=True,exist_ok=True); p.write_bytes(raw)
def dump(data): return (json.dumps(data,ensure_ascii=False,indent=2)+"\n").encode()
spec=importlib.util.spec_from_file_location("reviewed",ROOT/"app/scripts/prepare-reviewed-editions.py")
reviewed=importlib.util.module_from_spec(spec); spec.loader.exec_module(reviewed)
original=fetch("editions/to-the-lighthouse-original-en.json")
before=fetch("editions/to-the-lighthouse-modern-en.json")
assert sha(original)=="1662e69cd2781083e2332aeddd1e0c340446bdf2f7929c95da0d008e65b8d4f8"
assert sha(before)=="17c56b3d069214329a1f636bc7ad0286e38576d70ebe7921affc431f90149205"
modern=(STAGE/"editions/to-the-lighthouse-modern-en.json").read_bytes()
a,b=json.loads(before),json.loads(modern)
delta=[(c["number"],i) for c,n in zip(a["chapters"],b["chapters"],strict=True) for i,(p,q) in enumerate(zip(c["paragraphs"],n["paragraphs"],strict=True)) if p!=q]
assert delta==[(25,3),(26,1),(27,0),(40,10)]
assert len(b["chapters"])==42 and sum(len(c["paragraphs"]) for c in b["chapters"])==495
card,report=reviewed.reanchor(json.loads(fetch("characters/characters.v1.json")),before,modern,"2026-09-25.1",allow_alias_changes=False)
assert not report["droppedMentions"],report
old="A bracketed passage reports that she died the summer after her wedding, of an illness connected with childbirth."
new="A bracketed passage reports that she died the same summer as her wedding, of some illness connected with childbirth."
for edition in card["editions"].values():
    prue=next(c for c in edition["characters"] if c["id"]=="prue")
    snapshots=[s for s in prue["snapshots"] if s["body"]==old]
    assert len(snapshots)==1
    assert snapshots[0]["availableAt"]["chapterNumber"]==25 and snapshots[0]["availableAt"]["paragraphIndex"]==3
    snapshots[0]["body"]=new
outputs={
"app/public/data/editions/to-the-lighthouse-original-en.json":original,
"app/public/data/editions/to-the-lighthouse-modern-en.json":modern,
"app/public/data/onboarding/to-the-lighthouse.json":fetch("onboarding/to-the-lighthouse.json"),
"app/public/data/editions/to-the-lighthouse-threads.json":fetch("characters/to-the-lighthouse-threads.json"),
"app/public/data/characters/to-the-lighthouse.v1.json":dump(card),
"books/characters/to-the-lighthouse/characters.v1.json":dump(card),
"books/characters/to-the-lighthouse/editorial.json":(STAGE/"characters/editorial.json").read_bytes(),
"books/wip/to-the-lighthouse-followup/characters/characters.v1.json":dump(card),
}
for path,raw in outputs.items(): write(path,raw)
report.update({"baseline":REF,"hashes":{p:sha(raw) for p,raw in outputs.items()},"changedParagraphs":delta})
write("books/wip/to-the-lighthouse-followup/INTEGRATION.json",dump(report))
print(json.dumps(report,indent=2))
