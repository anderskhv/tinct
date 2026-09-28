#!/usr/bin/env python3
"""Read-only technical acceptance of pinned editorial packages; no live writes."""
import concurrent.futures, hashlib, json, re, urllib.request
from pathlib import Path
REF = "dde75840"
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "app/artifacts/held-repair-preflight"
OUT.mkdir(parents=True, exist_ok=True)
def get(url):
    req=urllib.request.Request(url,headers={"User-Agent":"Tinct-repair-preflight"})
    with urllib.request.urlopen(req,timeout=60) as r: return r.read()
def sha(raw): return hashlib.sha256(raw).hexdigest()
def remote(path): return get(f"https://raw.githubusercontent.com/anderskhv/tinct/{REF}/{path}")
handoff=remote("books/wip/CODEX-HANDOFF-2026-09-26.md").decode()
# Each table column keeps its candidate and expected digest together.
targets=[]
for section in handoff.split("### ")[1:]:
    lines=section.splitlines()
    pathline=next((s for s in lines if s.startswith("| Candidate path |")),None)
    hashline=next((s for s in lines if s.startswith("| SHA-256 |")),None)
    baseline=next((s for s in lines if s.startswith("| Replaces live SHA-256 |")),None)
    if not pathline or not hashline: continue
    paths=re.findall(r"`(books/wip/[^`]+\.json)`",pathline)
    hashes=re.findall(r"`([a-f0-9]{64})`",hashline)
    old=re.findall(r"`([a-f0-9]{64})`",baseline or "")
    assert len(paths)==len(hashes)==len(old),(paths,hashes,old)
    targets.extend(zip(paths,hashes,old))
assert len(targets)==18,len(targets)
def check(target):
    path,expected,old=target
    name=Path(path).name
    match=re.match(r"(.+)-(original-en|modern-en|modern-da|original-de)\.json$",name)
    assert match,name
    book,edition=match.groups()
    raw=remote(path); data=json.loads(raw)
    production=get("https://tinct.app/data/editions/"+name)
    current=(ROOT/"app/public/data/editions"/name).read_bytes()
    chapters=data["chapters"]
    numbers=[c["number"] for c in chapters]
    errors=[]
    if sha(raw)!=expected: errors.append("candidate hash mismatch")
    if sha(production)!=old: errors.append("production baseline changed")
    if sha(current)!=old: errors.append("main baseline changed")
    if numbers!=list(range(1,len(chapters)+1)): errors.append("chapter numbering")
    for c in chapters:
        if not isinstance(c["paragraphs"],list) or not all(isinstance(p,str) for p in c["paragraphs"]): errors.append("paragraph shape")
        if any("[TBD]" in p or "[untranslated]" in p.lower() for p in c["paragraphs"]): errors.append("placeholder")
    for section in data.get("sections",[]):
        if any(n not in numbers for n in section.get("chapters",[])): errors.append("invalid section chapter")
    olddata=json.loads(production)
    patches=json.loads(get(f"https://tinct.app/api/edition-patches?bookId={book}&editionKey={edition}"))
    (OUT/name).write_bytes(raw)
    return dict(book=book,edition=edition,path=path,sha256=sha(raw),productionSha256=sha(production),mainSha256=sha(current),
        chapters=len(chapters),paragraphs=sum(len(c["paragraphs"]) for c in chapters),
        countsBefore=[len(c["paragraphs"]) for c in olddata["chapters"]],
        countsAfter=[len(c["paragraphs"]) for c in chapters],patches=patches,errors=errors)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: results=list(pool.map(check,targets))
report={"sourceRef":REF,"mainCommit":__import__("os").environ.get("GITHUB_SHA"),"editions":results}
(OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
for r in results: print(r["book"],r["edition"],r["sha256"],r["chapters"],r["paragraphs"],"PASS" if not r["errors"] else r["errors"])
assert not any(r["errors"] for r in results),"See report.json"
