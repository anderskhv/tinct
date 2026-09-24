#!/usr/bin/env python3
"""Integrate the two pinned accepted Odyssey editions and existing card identities."""
import copy, csv, importlib.util, io, json, re, urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location("prepare",Path(__file__).with_name("prepare-reviewed-editions.py"))
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
BASE="b91d4b8d8ceab2e3379cb6a83174ce97c7c47aec"
REVIEW="0a76d6ce725af920a01afcbb86237d28c3529696"
CLEAN="7994156f131a0c382e3f1372518dcb55a44eaade"
FOLDER="books/staged-replacements/odyssey/edition"
REVISION="2026-09-24.1"
HASHES={
 "original-en":("da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07","0cc76350232962d4c4f1eb7216f14515fc1910f94f666695d2a595d4e6980"),
 "modern-en":("813127d77b4041f613a11b46e50890f46519252782188a6a1156ebc050898cdc","bd05c7f43da64bfe4ad9908531f2a1434e79acc8635ca54cb1ad39942e9afc9c"),
}
def fetch(ref,path):
 req=urllib.request.Request(f"https://raw.githubusercontent.com/anderskhv/tinct/{ref}/{path}",headers={"User-Agent":"Tinct-release-preflight"})
 return urllib.request.urlopen(req,timeout=45).read()
before={ed:(ROOT/f"app/public/data/editions/odyssey-{ed}.json").read_bytes() for ed in HASHES}
after={ed:fetch(CLEAN,f"books/wip/featured-source-cleanup/odyssey/odyssey-{ed}.json") for ed in HASHES}
assert after["modern-en"]==fetch(REVIEW,FOLDER+"/odyssey-modern-en.candidate.json")
changed={}
for ed,(was,accepted) in HASHES.items():
 assert p.digest(before[ed])==was and p.digest(after[ed])==accepted
 a,b=json.loads(before[ed]),json.loads(after[ed])
 assert len(a["chapters"])==len(b["chapters"])==24
 assert sum(len(c["paragraphs"]) for c in b["chapters"])==1027
 titles=[];changes=[]
 for x,y in zip(a["chapters"],b["chapters"]):
  assert x["number"]==y["number"] and len(x["paragraphs"])==len(y["paragraphs"])
  assert x.keys()==y.keys()=={"number","title","paragraphs"}
  if x["title"]!=y["title"]:titles.append(x["number"])
  changes.extend((x["number"],i) for i,(old,new) in enumerate(zip(x["paragraphs"],y["paragraphs"])) if old!=new)
 if ed=="original-en":
  assert titles==[] and changes==[(3,37)]
  assert b["chapters"][2]["paragraphs"][37]=="Now when the sun had set and darkness was over the land,"
 else:
  assert titles==[9,17,19,20,22,23] and len(changes)==1011
 changed[ed]=changes
rows=list(csv.DictReader(io.StringIO(fetch(REVIEW,FOLDER+"/accepted-paragraph-hashes.tsv").decode()),delimiter="\t"))
expected=[{"chapter":str(c["number"]),"paragraph_index":str(i),"sha256_raw":p.digest(s),"sha256_prose_reader_v1":p.digest(p.normalize(s))} for c in json.loads(after["modern-en"])["chapters"] for i,s in enumerate(c["paragraphs"])]
assert rows==expected
cardpath=ROOT/"app/public/data/characters/odyssey.v1.json"
original=json.loads(cardpath.read_bytes())
asset=copy.deepcopy(original)
impact=json.loads(fetch(REVIEW,FOLDER+"/character-card-impact.json"))
assert impact["before_sha256"]==HASHES["modern-en"][0] and impact["after_sha256"]==HASHES["modern-en"][1]
fields=["characterId","chapterNumber","paragraphIndex","startOffset","endOffset","text"]
key=lambda m:tuple(m[k] for k in fields)
rejected={key(m) for m in impact["dropped"]}
assert len(rejected)==30
mentions=asset["editions"]["modern-en"]["mentions"]
assert len(mentions)==662 and rejected <= {key(m) for m in mentions}
asset["editions"]["modern-en"]["mentions"]=[m for m in mentions if key(m) not in rejected]
# Existing reviewed spellings only; no new character or alias is introduced.
asset,report=p.reanchor(asset,before["modern-en"],after["modern-en"],REVISION,allow_alias_changes=True)
assert not report["droppedMentions"], report["droppedMentions"]
assert len(asset["editions"]["modern-en"]["mentions"])==632
block=asset["editions"]["original-en"]
assert block["sourceSha256"]==HASHES["original-en"][0]
old=p.paragraphs(json.loads(before["original-en"]))
new=p.paragraphs(json.loads(after["original-en"]))
assert block["paragraphHashes"]=={k:[p.digest(s) for s in v] for k,v in old.items()}
removed=[m for m in block["mentions"] if m["chapterNumber"]==3 and m["paragraphIndex"]==37]
assert len(removed)==1 and removed[0]["characterId"]=="nestor" and removed[0]["startOffset"]==57
block["mentions"]=[m for m in block["mentions"] if m not in removed]
block["sourceSha256"]=HASHES["original-en"][1]
block["paragraphHashes"]={k:[p.digest(s) for s in v] for k,v in new.items()}
if "paragraphCount" in block: block["paragraphCount"]=1027
for ed,block in asset["editions"].items():
 if ed not in HASHES:
  assert block==original["editions"][ed];continue
 paragraphs=p.paragraphs(json.loads(after[ed]))
 assert block["sourceSha256"]==p.digest(after[ed])
 def check(q,field):
  text=paragraphs[str(q["chapterNumber"])][q["paragraphIndex"]]
  p.codepoint(text,q[field])
 for m in block["mentions"]:
  check(m,"startOffset");check(m,"endOffset")
  text=paragraphs[str(m["chapterNumber"])][m["paragraphIndex"]]
  assert text[p.codepoint(text,m["startOffset"]):p.codepoint(text,m["endOffset"])]==m["text"]
 for c in block["characters"]:
  check(c["firstMention"],"offset");check(c["roleVisibleAt"],"offset")
  for s in c["snapshots"]:
   check(s["availableAt"],"offset")
   for e in s.get("evidence",[]):
    if "throughOffset" in e:check(e,"throughOffset")
service=ROOT/"app/src/services/characters/characterCards.ts"
text,count=re.subn(r"(odyssey:\s*\{\s*editions:\s*EN,\s*revision:\s*)'[^']+'",lambda m:m.group(1)+repr(REVISION),service.read_text())
assert count==1
for ed,raw in after.items():(ROOT/f"app/public/data/editions/odyssey-{ed}.json").write_bytes(raw)
cardpath.write_text(json.dumps(asset,ensure_ascii=False,indent=2)+"\n")
service.write_text(text)
receipt={"reviewRef":REVIEW,"cleanupRef":CLEAN,"revision":REVISION,"sha256":{k:p.digest(v) for k,v in after.items()},"changed":{k:len(v) for k,v in changed.items()},"retained":{ed:len(asset["editions"][ed]["mentions"]) for ed in HASHES},"acceptedRejectedModernMentions":impact["dropped"],"removedOriginalSpliceMention":removed,"reanchor":report,"scope":"Paired accepted English text and card compatibility; no new identity decisions, no user-data writes, no synthesis."}
(ROOT/"books/wip/odyssey-release-20260924-report.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({k:receipt[k] for k in ("sha256","changed","retained")},indent=2))
