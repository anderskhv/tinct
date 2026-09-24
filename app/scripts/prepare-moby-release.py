#!/usr/bin/env python3
"""Publish only the accepted Moby-Dick body repair; structural work stays separate."""
import argparse, copy, csv, importlib.util, io, json, re, subprocess, urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location("prepare",Path(__file__).with_name("prepare-reviewed-editions.py"))
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
BASE="1bd1bfb3a1cbd03ed070ca733cbcd442a40bae27"
REVIEW="3a10dc242b959bb71f770295ac43cf403583899f"
FOLDER="books/wip/green-moby-dick"
BOOK="moby-dick";REVISION="2026-09-24.1"
BEFORE="2ab04dd727bbe5804b7acf1d05f578cfed5aef17c08d7d72b6db9101f8c1763c"
AFTER="1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c"
def fetch(ref,path):
 return urllib.request.urlopen(urllib.request.Request(f"https://raw.githubusercontent.com/anderskhv/tinct/{ref}/{path}",headers={"User-Agent":"Tinct-reviewed-release"}),timeout=45).read()
parser=argparse.ArgumentParser();parser.add_argument("--verify",action="store_true");args=parser.parse_args()
target=ROOT/f"app/public/data/editions/{BOOK}-modern-en.json"
cardpath=ROOT/f"app/public/data/characters/{BOOK}.v1.json"
before=fetch(BASE,f"app/public/data/editions/{BOOK}-modern-en.json")
after=fetch(REVIEW,FOLDER+"/candidate.json")
assert p.digest(before)==BEFORE and p.digest(after)==AFTER
assert fetch(REVIEW,FOLDER+"/baseline-live-modern-en.json")==before
original=(ROOT/f"app/public/data/editions/{BOOK}-original-en.json").read_bytes()
assert p.digest(original)=="30974242d9ee3eae074671da0b424c0ef5d8b00258acf43cf27d92905136c952"
assert original==fetch(REVIEW,FOLDER+"/source.json")
a,b=json.loads(before),json.loads(after)
assert {k:v for k,v in a.items() if k!="chapters"}=={k:v for k,v in b.items() if k!="chapters"}
assert len(a["chapters"])==len(b["chapters"])==136
changed=[]
for x,y in zip(a["chapters"],b["chapters"],strict=True):
 assert {k:v for k,v in x.items() if k!="paragraphs"}=={k:v for k,v in y.items() if k!="paragraphs"}
 assert len(x["paragraphs"])==len(y["paragraphs"])
 changed.extend((x["number"],i) for i,(u,v) in enumerate(zip(x["paragraphs"],y["paragraphs"])) if u!=v)
assert len(changed)==1614 and sum(len(c["paragraphs"]) for c in b["chapters"])==2432
rows=list(csv.DictReader(io.StringIO(fetch(REVIEW,FOLDER+"/accepted-paragraph-hashes.tsv").decode()),delimiter="\t"))
assert rows==[{"coord":f"{c['number']}.{i}","sha256_16":p.digest(s)[:16]} for c in b["chapters"] for i,s in enumerate(c["paragraphs"])]
previous=json.loads(fetch(BASE,f"app/public/data/characters/{BOOK}.v1.json"))
asset=copy.deepcopy(previous)
impact=json.loads(fetch(REVIEW,FOLDER+"/character-card-impact.json"))
assert impact["pinnedModernEnSha256"]==BEFORE
key=lambda m:tuple(m[f] for f in ("characterId","chapterNumber","paragraphIndex","text"))
gone={key(m) for m in impact["goneMentions"]}
assert len(gone)==7
mentions=asset["editions"]["modern-en"]["mentions"]
removed=[m for m in mentions if key(m) in gone]
assert len(mentions)==1779 and len(removed)==7 and {key(m) for m in removed}==gone
asset["editions"]["modern-en"]["mentions"]=[m for m in mentions if key(m) not in gone]
asset,report=p.reanchor(asset,before,after,REVISION,allow_alias_changes=False)
assert not report["droppedMentions"],report["droppedMentions"]
assert len(asset["editions"]["modern-en"]["mentions"])==1772
for ed,block in asset["editions"].items():
 if ed!="modern-en":
  assert block==previous["editions"][ed];continue
 paragraphs=p.paragraphs(b)
 def check(q,field):
  t=paragraphs[str(q["chapterNumber"])][q["paragraphIndex"]]
  p.codepoint(t,q[field])
 for m in block["mentions"]:
  check(m,"startOffset");check(m,"endOffset")
  t=paragraphs[str(m["chapterNumber"])][m["paragraphIndex"]]
  assert t[p.codepoint(t,m["startOffset"]):p.codepoint(t,m["endOffset"])]==m["text"]
 for c in block["characters"]:
  check(c["firstMention"],"offset");check(c["roleVisibleAt"],"offset")
  for snapshot in c["snapshots"]:
   check(snapshot["availableAt"],"offset")
   for e in snapshot.get("evidence",[]):
    if "throughOffset" in e:check(e,"throughOffset")
service=ROOT/"app/src/services/characters/characterCards.ts"
service_text,count=re.subn(r"('moby-dick':\s*\{\s*editions:\s*EN,\s*revision:\s*)'[^']+'",lambda m:m.group(1)+repr(REVISION),service.read_text())
assert count==1
out=(json.dumps(asset,ensure_ascii=False,indent=2)+"\n").encode()
receipt={"reviewRef":REVIEW,"acceptedSha256":AFTER,"retainedMentions":1772,"acceptedRemovedMentions":removed,"reanchor":report,"scope":"Accepted body repair only; no title-fragment renumbering, frontmatter, new identity binding or audio."}
reportpath=ROOT/"books/wip/moby-release-20260924-report.json"
if args.verify:
 assert target.read_bytes()==after and cardpath.read_bytes()==out
 assert service.read_text()==service_text
 assert json.loads(reportpath.read_bytes())==receipt
else:
 target.write_bytes(after);cardpath.write_bytes(out);service.write_text(service_text)
 subprocess.run(["node","scripts/split-edition-chapters.cjs","moby-dick-modern-en"],cwd=ROOT/"app",check=True)
 reportpath.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n")
shards=ROOT/"app/public/data/editions-chapters/moby-dick-modern-en"
manifest=json.loads((shards/"manifest.json").read_bytes())
assert len(manifest["chapters"])==136
for entry,ch in zip(manifest["chapters"],b["chapters"],strict=True):
 assert entry["number"]==ch["number"] and entry["title"]==ch["title"] and entry["paragraphCount"]==len(ch["paragraphs"])
 assert json.loads((shards/entry["path"]).read_bytes())==ch
print(json.dumps({"accepted":AFTER,"mentions":1772,"shardsVerified":136},indent=2))
