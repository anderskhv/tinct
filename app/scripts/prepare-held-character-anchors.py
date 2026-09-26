#!/usr/bin/env python3
"""Stage exact-only character anchor projections; unresolved anchors block adoption."""
import copy,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/"app/artifacts/held-repair-preflight"
def sha(s):return hashlib.sha256(s.encode()).hexdigest()
def u16slice(s,a,b):return s.encode("utf-16-le")[a*2:b*2].decode("utf-16-le")
def norm(s):return __import__("re").sub(" {2,}"," ",s.replace("\n"," "))
report=[]
for book in ["macbeth","as-you-like-it","jerusalem"]:
 path=ROOT/f"app/public/data/characters/{book}.v1.json"
 if not path.exists():continue
 card=json.loads(path.read_text());maps=json.loads((OUT/f"{book}.coordinates.json").read_text())
 errors=[];moved=0
 for edition,data in card["editions"].items():
  if edition not in maps["editions"]:continue
  m=maps["editions"][edition]
  assert data["sourceSha256"]==m["beforeSha256"],(book,edition,"stale card baseline")
  final=json.loads((OUT/f"{book}-{edition}.json").read_text())
  paras={c["number"]:[norm(p) for p in c["paragraphs"]] for c in final["chapters"]}
  def walk(value,location):
   global moved
   if isinstance(value,list):return [walk(v,location+f"/{i}") for i,v in enumerate(value)]
   if not isinstance(value,dict):return value
   if "chapterNumber" in value and "paragraphIndex" in value:
    key=f'{value["chapterNumber"]}.{value["paragraphIndex"]}';entry=m["entries"].get(key)
    if not entry or entry["operation"]=="removed":
     errors.append({"edition":edition,"location":location,"coordinate":key,"reason":"removed or missing source anchor"});return value
    result=copy.deepcopy(value)
    for field in ["offset","throughOffset","startOffset","endOffset"]:
     if field not in value:continue
     old=value[field]
     matches=[op for op in entry["chars"] if op[0]=="equal" and op[1]<=old<=op[2]]
     if not matches:
      errors.append({"edition":edition,"location":location,"coordinate":key,"reason":"anchor intersects rewritten text","field":field});return value
     op=matches[0] if field in ["endOffset","throughOffset"] else matches[-1]
     result[field]=op[3]+old-op[1]
    if "text" in value and "startOffset" in value and "endOffset" in value:
     oldquote=u16slice(entry["oldText"],value["startOffset"],value["endOffset"])
     newquote=u16slice(paras[entry["chapter"]][entry["paragraph"]],result["startOffset"],result["endOffset"])
     if oldquote!=newquote:
      errors.append({"edition":edition,"location":location,"coordinate":key,"reason":"mention quote changed"});return value
    result["chapterNumber"]=entry["chapter"];result["paragraphIndex"]=entry["paragraph"]
    moved+=int(result!=value);return result
   return {k:walk(v,location+"/"+k) for k,v in value.items()}
  for key in ["characters","mentions","ignoredContextMatches"]:
   if key in data:data[key]=walk(data[key],key)
  data["sourceSha256"]=m["afterSha256"];data["chapterCount"]=len(paras);data["paragraphCount"]=sum(map(len,paras.values()))
  data["paragraphHashes"]={str(k):[sha(p) for p in v] for k,v in paras.items()}
 # Never emit a seemingly release-ready card when any anchor is unresolved.
 if not errors:
  card["contentVersion"]="held-repair-2026-09-26.1"
  (OUT/f"{book}.characters.json").write_text(json.dumps(card,ensure_ascii=False,separators=(",",":"))+"\n")
 report.append({"book":book,"movedAnchors":moved,"ready":not errors,"unresolved":errors})
(OUT/"character-anchor-report.json").write_text(json.dumps(report,indent=2)+"\n")
for row in report:print(row["book"],"ready",row["ready"],"moved",row["movedAnchors"],"unresolved",len(row["unresolved"]))
