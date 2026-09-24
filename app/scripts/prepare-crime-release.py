#!/usr/bin/env python3
"""Prepare accepted Crime text using the independently reviewed exact-span ledger."""
import argparse, copy, csv, importlib.util, io, json, re, urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location("prepare",Path(__file__).with_name("prepare-reviewed-editions.py"))
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
BASE="1bd1bfb3a1cbd03ed070ca733cbcd442a40bae27"
REVIEW="debcc8c2b48f352c3e143e5e3aca84de73c6f7b8"
IDENTITY="7844093c26a06aa17fd058f1ebf1f3a8e284bdb1"
FOLDER="books/wip/green-crime-and-punishment"
BOOK="crime-and-punishment"
REVISION="2026-09-24.1"
BEFORE="914bcdfae396792477d90f788ce30ed684732dc89eb4abc76d4c126a9c963834"
AFTER="18be4155497ebdf78013d1a26ce2fad86839aaa00c036cf9970954af550888eb"
def fetch(ref,path):
 return urllib.request.urlopen(urllib.request.Request(f"https://raw.githubusercontent.com/anderskhv/tinct/{ref}/{path}",headers={"User-Agent":"Tinct-reviewed-release"}),timeout=45).read()
parser=argparse.ArgumentParser();parser.add_argument("--verify",action="store_true");args=parser.parse_args()
target=ROOT/f"app/public/data/editions/{BOOK}-modern-en.json"
cardpath=ROOT/f"app/public/data/characters/{BOOK}.v1.json"
before=fetch(BASE,f"app/public/data/editions/{BOOK}-modern-en.json")
after=fetch(REVIEW,FOLDER+"/candidate.json")
card_raw=fetch(BASE,f"app/public/data/characters/{BOOK}.v1.json")
assert p.digest(before)==BEFORE and p.digest(after)==AFTER
assert p.digest(card_raw)=="2125526c56769e4f09be387f6d5dc2e974dc9aca7fb931115fb893da34706d98"
assert fetch(REVIEW,FOLDER+"/baseline-live-modern-en.json")==before
original_source=(ROOT/f"app/public/data/editions/{BOOK}-original-en.json").read_bytes()
assert original_source==fetch(REVIEW,FOLDER+"/source.json")
assert p.digest(original_source)=="6609777b2dfca00fa10c7d0f4d2599b2b617f029f8a1689714ce96c60627a978"
a,b=json.loads(before),json.loads(after)
assert {k:v for k,v in a.items() if k!="chapters"}=={k:v for k,v in b.items() if k!="chapters"}
assert len(a["chapters"])==len(b["chapters"])==41
changed=[]
for x,y in zip(a["chapters"],b["chapters"],strict=True):
 assert {k:v for k,v in x.items() if k!="paragraphs"}=={k:v for k,v in y.items() if k!="paragraphs"}
 assert len(x["paragraphs"])==len(y["paragraphs"])
 changed.extend((x["number"],i) for i,(u,v) in enumerate(zip(x["paragraphs"],y["paragraphs"])) if u!=v)
assert len(changed)==1270 and sum(len(c["paragraphs"]) for c in b["chapters"])==3904
rows=list(csv.DictReader(io.StringIO(fetch(REVIEW,FOLDER+"/accepted-paragraph-hashes.tsv").decode()),delimiter="\t"))
assert rows==[{"coord":f"{c['number']}.{i}","sha256":p.digest(s),"changed":str(int((c["number"],i) in changed))} for c in b["chapters"] for i,s in enumerate(c["paragraphs"])]
ledger_raw=fetch(IDENTITY,"books/wip/crime-character-identity-review/ledger/final-mapping.jsonl")
assert p.digest(ledger_raw)=="de97a831ffd388325eed5d00314f11453e7e9b886ae72e0fa29cdde6b1ece547"
ledger=[json.loads(line) for line in ledger_raw.splitlines()]
assert len(ledger)==438 and all(r["independentReview"]["agreesWithLead"] for r in ledger)
key=lambda m:(m["characterId"],m["chapterNumber"],m["paragraphIndex"],m["startOffset"])
decisions={}
for row in ledger:
 k=(row["characterId"],row["chapterNumber"],row["paragraphIndex"],row["existingMention"]["startOffset"])
 assert k not in decisions
 assert row["finalSpan"]==row["independentReview"]["finalCandidateSpan"]
 decisions[k]=row
impact=json.loads(fetch(REVIEW,FOLDER+"/character-card-impact.json"))
suggestions={(m["characterId"],m["chapter"],m["paragraph"],m["oldStart"]):m for m in impact["mentions"] if m["status"]=="same-text-relocated"}
assert len(suggestions)==1431 and len(set(suggestions)|set(decisions))==1869
asset=json.loads(card_raw);previous=copy.deepcopy(asset)
block=asset["editions"]["modern-en"]
old,new=p.paragraphs(a),p.paragraphs(b)
assert block["sourceSha256"]==BEFORE
assert block["paragraphHashes"]=={k:[p.digest(s) for s in v] for k,v in old.items()}
def text(paragraphs,q):return paragraphs[str(q["chapterNumber"])][q["paragraphIndex"]]
def span(paragraph,m):return paragraph[p.codepoint(paragraph,m["startOffset"]):p.codepoint(paragraph,m["endOffset"])]
mapped={};drops=[];used=set()
for m in block["mentions"]:
 k=key(m);oa,nb=text(old,m),text(new,m)
 assert span(oa,m)==m["text"]
 if k in decisions:
  r=decisions[k];used.add(k)
  assert r["existingMention"]=={f:m[f] for f in ("startOffset","endOffset","text")}
  assert p.digest(oa)==r["evidence"]["liveParagraphSha256"] and p.digest(nb)==r["evidence"]["candidateParagraphSha256"]
  if r["finalDecision"]=="drop":
   assert r["entryId"]=="M01" and (m["chapterNumber"],m["paragraphIndex"])==(8,120)
   drops.append(m);continue
  assert r["finalDecision"]=="map"
  n={**m,**r["finalSpan"]}
 elif k in suggestions:
  r=suggestions[k];used.add(k)
  assert m["text"]==r["text"]==r["newText"]
  n={**m,"startOffset":r["suggestedNewStart"],"endOffset":r["suggestedNewEnd"]}
 else:
  assert oa==nb
  n=copy.deepcopy(m)
 assert n["characterId"]==m["characterId"] and span(nb,n)==n["text"]
 assert n["endOffset"]>n["startOffset"]
 mapped[k]=n
assert used==set(suggestions)|set(decisions) and len(drops)==1 and len(mapped)==3663
assert len({(m["chapterNumber"],m["paragraphIndex"],m["startOffset"],m["endOffset"],m["characterId"]) for m in mapped.values()})==3663
anchors=[]
def project(q,character_id,field="offset"):
 oa,nb=text(old,q),text(new,q);offset=q[field]
 candidates=[m for m in previous["editions"]["modern-en"]["mentions"] if m["characterId"]==character_id and m["chapterNumber"]==q["chapterNumber"] and m["paragraphIndex"]==q["paragraphIndex"] and m["endOffset"]==offset]
 endpoint="endOffset"
 if not candidates:
  candidates=[m for m in previous["editions"]["modern-en"]["mentions"] if m["characterId"]==character_id and m["chapterNumber"]==q["chapterNumber"] and m["paragraphIndex"]==q["paragraphIndex"] and m["startOffset"]==offset]
  endpoint="startOffset"
 if candidates:
  values={mapped[key(m)][endpoint] for m in candidates if key(m) in mapped}
  assert len(values)==1
  value=values.pop();method="accepted mention boundary"
 else:value=p.project(oa,nb,offset);method="right-biased verified text projection"
 p.codepoint(nb,value)
 if oa!=nb:anchors.append({"characterId":character_id,"before":q.copy(),"field":field,"after":value,"method":method})
 q[field]=value
for c in block["characters"]:
 project(c["firstMention"],c["id"]);project(c["roleVisibleAt"],c["id"])
 for s in c["snapshots"]:
  project(s["availableAt"],c["id"])
  for e in s.get("evidence",[]):
   if "throughOffset" in e:project(e,c["id"],"throughOffset")
block["mentions"]=list(mapped.values())
block["sourceSha256"]=AFTER
block["paragraphHashes"]={k:[p.digest(s) for s in v] for k,v in new.items()}
asset["contentVersion"]=REVISION
for ed in asset["editions"]:
 if ed!="modern-en":assert asset["editions"][ed]==previous["editions"][ed]
service=ROOT/"app/src/services/characters/characterCards.ts"
service_text,count=re.subn(r"('crime-and-punishment':\s*\{\s*editions:\s*EN,\s*revision:\s*)'[^']+'",lambda m:m.group(1)+repr(REVISION),service.read_text())
assert count==1
out=(json.dumps(asset,ensure_ascii=False,indent=2)+"\n").encode()
receipt={"candidateSha256":AFTER,"identityRef":IDENTITY,"ledgerSha256":p.digest(ledger_raw),"retainedMentions":len(mapped),"droppedMentions":drops,"anchors":anchors,"scope":"Accepted exact identity mappings only. Existing allusive binding and card prose preserved. Confirmed Svidrigailov early-snapshot spoiler still requires a separate content-owner patch before release."}
report=ROOT/"books/wip/crime-release-20260924-report.json"
if args.verify:
 assert target.read_bytes()==after and cardpath.read_bytes()==out
 assert service.read_text()==service_text
 assert json.loads(report.read_bytes())==receipt
else:
 target.write_bytes(after);cardpath.write_bytes(out);service.write_text(service_text)
 report.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"candidate":AFTER,"retained":len(mapped),"dropped":len(drops),"anchors":len(anchors)},indent=2))
