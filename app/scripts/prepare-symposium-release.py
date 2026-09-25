#!/usr/bin/env python3
"""Pinned completeness integration; no translation generation or global gate override."""
import csv, hashlib, importlib.util, io, json, re, urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
STAGE=ROOT/"books/wip/symposium-publication-20260925"
BASE="447a7a650b9aec567251a638dc85b303d3b10477"
REF="bebe95b42aa2ecaf77c7625602712e3a91ad376b"
PKG="books/wip/symposium-completeness-repair"
REV="symposium-completeness-2026-09-25.1"
def fetch(ref,path):
 return urllib.request.urlopen(urllib.request.Request(f"https://raw.githubusercontent.com/anderskhv/tinct/{ref}/{path}",headers={"User-Agent":"Tinct-release"}),timeout=60).read()
def sha(x): return hashlib.sha256(x if isinstance(x,bytes) else x.encode()).hexdigest()
def dump(x): return (json.dumps(x,ensure_ascii=False,indent=2)+"\n").encode()
def norm(x): return re.sub(" {2,}"," ",x.replace("\n"," "))
def u16(x): return len(x.encode("utf-16-le"))//2
def write(p,x):
 p=ROOT/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(x)
def paras(raw): return {c["number"]:c["paragraphs"] for c in json.loads(raw)["chapters"]}
impact=json.loads(fetch(REF,PKG+"/impact/character-card-impact.json"))
rows=list(csv.DictReader(io.StringIO("\n".join(l for l in fetch(REF,PKG+"/mapping/paragraph-map.tsv").decode().splitlines() if not l.startswith("#"))),delimiter="\t"))
assert len(rows)==217
changes=json.loads(fetch(REF,PKG+"/mapping/changed-paragraph-ops.json"))["paragraphs"]
card=json.loads((STAGE/"characters.reviewed.json").read_bytes())
mapping={"revision":REV,"bookId":"symposium","editions":{}}
outputs={};raws={}
for ed in ("original-en","modern-en"):
 before=fetch(BASE,f"app/public/data/editions/symposium-{ed}.json")
 after=fetch(REF,PKG+f"/candidate/symposium-{ed}.json")
 cfg=impact["editions"][ed]
 assert sha(before)==cfg["baselineSourceSha256"]
 assert sha(after)==cfg["candidateSourceSha256"]
 old,new=paras(before),paras(after)
 assert [len(new[i]) for i in range(1,9)]==[49,8,12,10,18,13,69,47]
 entries={}
 for row in rows:
  ch,pi,nc,ni=[int(row[k]) for k in ("old_chapter","old_index","new_chapter","new_index")]
  a,b=old[ch][pi],new[nc][ni]
  suffix=ed.replace("-","_")
  assert sha(a)==row["old_sha256_"+suffix] and sha(b)==row["new_sha256_"+suffix]
  a,b=norm(a),norm(b);aw,bw=a.split(),b.split()
  if a==b:
   cops=[["equal",0,u16(a),0,u16(b)]];wops=[["equal",0,len(aw),0,len(bw)]]
  else:
   change=next(c for c in changes if c["edition"]==ed and c["old"]==f"{ch}.{pi}")
   assert norm(change["oldText"])==a and norm(change["newText"])==b
   cops,wops=change["chars"],change["words"]
  for tag,i,j,k,l in cops:
   if tag=="equal":assert a.encode("utf-16-le")[i*2:j*2]==b.encode("utf-16-le")[k*2:l*2]
  for tag,i,j,k,l in wops:
   if tag=="equal":assert aw[i:j]==bw[k:l]
  # All paragraphs carry original context, including unchanged ones.
  entries[f"{ch}.{pi}"]={"chapter":nc,"paragraph":ni,"operation":row["op"],"oldText":a,"oldHash":sha(a),"newHash":sha(b),"oldWords":len(aw),"newWords":len(bw),"oldChars":u16(a),"newChars":u16(b),"chars":cops,"words":wops}
 mapping["editions"][ed]={"beforeSha256":sha(before),"afterSha256":sha(after),"paragraphCountsBefore":{str(k):len(v) for k,v in old.items()},"paragraphCountsAfter":{str(k):len(v) for k,v in new.items()},"entries":entries}
 block=card["editions"][ed]
 assert block["sourceSha256"]==sha(after)
 block["paragraphHashes"]={str(ch):[sha(norm(p)) for p in ps] for ch,ps in new.items()}
 block["paragraphCount"]=226
 for mention in block["mentions"]:
  text=norm(new[mention["chapterNumber"]][mention["paragraphIndex"]]).encode("utf-16-le")
  assert text[2*mention["startOffset"]:2*mention["endOffset"]].decode("utf-16-le")==mention["text"],mention
 outputs[f"app/public/data/editions/symposium-{ed}.json"]=after
 raws[ed]=(before,after)
card_raw=dump(card)
outputs["app/public/data/characters/symposium.v1.json"]=card_raw
outputs["books/characters/symposium/characters.v1.json"]=card_raw
outputs["books/wip/symposium-publication-20260925/characters.compiled.json"]=card_raw
for kind in ("positions","highlights"):
 outputs[f"app/public/data/edition-migrations/symposium.{kind}.json"]=dump(mapping)
# Bundled map protects synchronous startup/offline validation, including legacy readers.
outputs["app/src/data/symposiumCoordinateMap.json"]=dump(mapping)
threads_raw=fetch(BASE,"app/public/data/editions/symposium-threads.json")
proposal=json.loads(fetch(REF,PKG+"/impact/proposed-threads-corrections.json"))
assert sha(threads_raw)==proposal["baseline"]["threadsSha256"]
text=threads_raw.decode()
for c in proposal["threads"]:
 if c["priority"]!="recommended":continue
 a,b=json.dumps(c["old"],ensure_ascii=False),json.dumps(c["new"],ensure_ascii=False)
 assert text.count(a)==1
 text=text.replace(a,b,1)
outputs["app/public/data/editions/symposium-threads.json"]=text.encode()
# Record the unchanged global gate and verify the explicitly authorized exception.
spec=importlib.util.spec_from_file_location("classifier",ROOT/"books/classify-modern-en.py")
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def metrics(index):
 source=json.loads(raws["original-en"][index])["chapters"];target=json.loads(raws["modern-en"][index])["chapters"]
 assert len(source)==len(target)==8
 assert all(len(a["paragraphs"])==len(b["paragraphs"]) for a,b in zip(source,target))
 n=sum(len(p.split()) for ch in source for p in ch["paragraphs"])
 sims=[m.chapter_similarity(a,b) for a,b in zip(source,target)]
 long=[(p,q) for a,b in zip(source,target) for p,q in zip(a["paragraphs"],b["paragraphs"]) if len(p)>=80]
 return {"weightedSimilarity":sum(s*sum(len(p.split()) for p in a["paragraphs"]) for s,a in zip(sims,source))/n,"lightChapterRate":sum(s>=.85 for s in sims)/8,"identicalLongParagraphRate":sum(p==q for p,q in long)/len(long),"wrapped":sum(m.is_wrapped(q) for b in target for q in b["paragraphs"]),"truncated":sum(m.is_truncation(p,q) for a,b in zip(source,target) for p,q in zip(a["paragraphs"],b["paragraphs"]))}
before,after=metrics(0),metrics(1)
assert round(before["weightedSimilarity"],3)==.877 and round(after["weightedSimilarity"],3)==.866
assert before["weightedSimilarity"]>.75 and after["weightedSimilarity"]>.75
assert all(after[k]<=before[k] for k in before),(before,after)
approval={"approvedBy":"Anders (explicit task instruction, 2026-09-25)","scope":"Symposium completeness repair only; not accessibility certification","authorization":"I authorize a narrowly scoped exception for this completeness repair only, provided you verify the recorded pre-existing failure and the final repair’s non-regression.","packageCommit":REF,"baselineCommit":BASE,"before":before,"after":after,"noRegression":True,"wholeBookSimilarityGatePass":False,"globalGateUnchanged":True,"textHashes":{ed:{"before":sha(pair[0]),"after":sha(pair[1])} for ed,pair in raws.items()}}
outputs["books/wip/symposium-publication-20260925/SIMILARITY-APPROVAL.json"]=dump(approval)
for path,raw in outputs.items():write(path,raw)
write("books/wip/symposium-publication-20260925/INTEGRATION.json",dump({"revision":REV,"hashes":{p:sha(v) for p,v in outputs.items()},"paragraphs":226,"oldParagraphsPreserved":217,"modernMeaningCorrections":["3.3","3.7","3.8"],"similarity":approval}))
print(json.dumps(approval,indent=2))
