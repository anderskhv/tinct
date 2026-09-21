import json,sys,hashlib
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import prodapi
root=Path("artifacts/bella-completion-wave02-2026-09-21")
cohort={e["cohort"]["key"]:e["cohort"] for p in (root/"review").glob("shard-*.json") for e in json.loads(p.read_text()) if "cohort" in e}
fixtures=[]
for t in json.loads((root/"review/accepted.json").read_text()):
 b,ed,ch=t["bookId"],t["edition"],t["chapter"];key=f"{b}/{ed}/ch{ch}"
 body=Path(t["path"]).read_bytes();assert hashlib.sha256(body).hexdigest()==t["candidateSha256"]
 status,text=prodapi.edition_text(b,ed);assert status==200
 paragraphs=next(c for c in text["chapters"] if int(c["number"])==ch)["paragraphs"]
 assert paragraphs==[p["text"] for p in cohort[key]["paragraphs"]]
 status,manifest=prodapi.chapter_manifest(b,ed,ch);assert status==200
 fixtures.append(dict(key=key,paragraphs=paragraphs,manifest=manifest,sidecar=json.loads(body),embedded=False))
import urllib.request
base="https://raw.githubusercontent.com/anderskhv/tinct/878354336cb8f2cbcfae431a4093ffe4ff5fcad6/artifacts/bella-jekyll-heading-2026-09-21/"
def read(name):return json.load(urllib.request.urlopen(base+name))
t=dict(bookId="jekyll-and-hyde",edition="original-en",chapter=9)
entry=read("cohort.json")[0];sidecar=read("words.candidate.json")
status,text=prodapi.edition_text(t["bookId"],t["edition"]);assert status==200
paragraphs=next(c for c in text["chapters"] if int(c["number"])==9)["paragraphs"]
assert paragraphs==[p["text"] for p in entry["paragraphs"]]
status,manifest=prodapi.chapter_manifest(t["bookId"],t["edition"],9);assert status==200
fixtures.append(dict(key=entry["key"],paragraphs=paragraphs,manifest=manifest,sidecar=sidecar,embedded=False))
out=Path("artifacts/bella-reader-data-check-2026-09-21");out.mkdir(exist_ok=True)
(out/"fixtures.json").write_text(json.dumps(fixtures))
