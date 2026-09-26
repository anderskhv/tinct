#!/usr/bin/env python3
"""Prepare and prove coordinate maps; never write live editions or account data."""
import difflib,hashlib,json,re,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"app/artifacts/held-latest-reconciliation"
report=json.loads((OUT/"report.json").read_text())
def fetch(path):
 with urllib.request.urlopen("https://raw.githubusercontent.com/anderskhv/tinct/dde75840/"+path,timeout=60) as r:return json.load(r)
def u16(s):return len(s.encode("utf-16-le"))//2
def norm(s):return re.sub(" {2,}"," ",s.replace("\n"," "))
def ops(a,b,chars=False):
 aa=list(a) if chars else a.split();bb=list(b) if chars else b.split()
 result=[]
 for tag,i,j,k,l in difflib.SequenceMatcher(None,aa,bb,autojunk=False).get_opcodes():
  if tag=="equal": assert aa[i:j]==bb[k:l]
  result.append([tag,u16(a[:i]) if chars else i,u16(a[:j]) if chars else j,u16(b[:k]) if chars else k,u16(b[:l]) if chars else l])
 return result
def latest(path):
 with urllib.request.urlopen("https://raw.githubusercontent.com/anderskhv/tinct/a5e89816/"+path,timeout=60) as r:return json.load(r)
heading=latest("books/wip/jerusalem-heading-fragment-fix/PARAGRAPH-MAP.json")
deleted_headings={"1.55","1.87","1.132","1.307","8.235"}
discourse=latest("books/wip/discourse-on-inequality-frontmatter-repair/CHANGELOG.json")
maps={};summary=[]
for row in report["editions"]:
 book,edition=row["book"],row["edition"]
 if book=="faust-part-1":continue # Replacement identity must not acquire a guessed map.
 name=Path(row["path"]).name
 raw=(ROOT/"app/public/data/editions"/name).read_bytes()
 assert hashlib.sha256(raw).hexdigest()==row["productionSha256"]
 old=json.loads(raw);new=json.loads((OUT/name).read_bytes())
 before={c["number"]:c["paragraphs"] for c in old["chapters"]}
 after={c["number"]:c["paragraphs"] for c in new["chapters"]}
 mapping=None
 if book in ["macbeth","as-you-like-it","jerusalem"]:
  mapping=fetch(f"books/wip/{book}-completeness-repair/PARAGRAPH-MAP.json")
 if book=="discourse-on-inequality":
  mapping={}
  for change in discourse:
   if change["edition"]==("original-en" if edition=="modern-da" else edition) and change["old_index_or_null"] is not None:
    mapping[f'{change["chapter"]}.{change["old_index_or_null"]}']=f'{change["chapter"]}.{change["new_index"]}'
 entries={};removed=0;changed=0
 for ch,paras in before.items():
  for pi,p in enumerate(paras):
   key=f"{ch}.{pi}"
   target=mapping.get(key,key) if mapping is not None else key
   if book=="as-you-like-it" and key not in mapping:target=None
   if book=="jerusalem":target=None if target in deleted_headings else heading.get(target,target)
   if book=="paradise-lost":target=f"{ch}.{pi+(3 if ch==1 else 1)}"
   if target is None:
    # No target assertion: both projection APIs return unresolved for empty op lists.
    entries[key]={"chapter":1,"paragraph":0,"operation":"removed","oldText":norm(p),"oldWords":len(norm(p).split()),"newWords":0,"oldChars":u16(norm(p)),"newChars":0,"words":[],"chars":[]}
    removed+=1;continue
   assert isinstance(target,str),(book,key,target)
   nc,np=map(int,target.split("."))
   assert nc in after and 0<=np<len(after[nc]),(book,edition,key,target)
   a,b=norm(p),norm(after[nc][np])
   if a!=b:changed+=1
   # Include unchanged paragraphs too: legacy notes need positive exact identity evidence.
   entries[key]={"chapter":nc,"paragraph":np,"operation":"keep" if a==b else "replace","oldText":a,"oldWords":len(a.split()),"newWords":len(b.split()),"oldChars":u16(a),"newChars":u16(b),"words":ops(a,b),"chars":ops(a,b,True)}
 assert len(entries)==sum(map(len,before.values()))
 m=maps.setdefault(book,{"bookId":book,"revision":"held-repair-2026-09-26.1","editions":{}})
 m["editions"][edition]={"beforeSha256":row["productionSha256"],"afterSha256":row["sha256"],"paragraphCountsBefore":{str(k):len(v) for k,v in before.items()},"paragraphCountsAfter":{str(k):len(v) for k,v in after.items()},"entries":entries}
 summary.append({"book":book,"edition":edition,"sourceParagraphs":len(entries),"changedText":changed,"removedUnresolved":removed})
for book,m in maps.items():(OUT/(book+".coordinates.json")).write_text(json.dumps(m,ensure_ascii=False,separators=(",",":"))+"\n")
(OUT/"coordinate-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
print(json.dumps(summary,indent=2))
