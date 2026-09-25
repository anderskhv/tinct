#!/usr/bin/env python3
"""Build technical coordinate migration evidence from pinned accepted editions.
No translation or identity decisions. Generated data is staged, never published.
"""
import csv, difflib, hashlib, io, json, re, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
BASE = "b91d4b8d8ceab2e3379cb6a83174ce97c7c47aec"
CLEAN = "7994156f131a0c382e3f1372518dcb55a44eaade"
CLARITY = "88ebdd4c9779fe45871ce87777c5dd6a8e48dac0"
CONFIG = {
 "pride-and-prejudice": {
  "acceptedRef": "e004aad94981ccd203f7d603588d38392158cff5",
  "final": {"original-en":"6d968f00645655554e44156a16a2713a3c1f60e74cb533d56aa5231847ca183c","modern-en":"6c80aa42dd44707774a6049d2a17bbfaf61806751e6f0cf5536b8837dabfc463"},
  "counts": [61,2053],
 },
 "jane-eyre": {
  "acceptedRef": "d47d80f8e849819c67b4879f925d1493619478e3",
  "final": {"original-en":"d05d18103f439a8267be407ac8e6d44068236c262321f386174050bbf2109257","modern-en":"0488dac58943afde5be0b7e1105206429e2fc0a887462ff753057081e096dff6"},
  "counts": [38,4034],
 },
}
def fetch(ref,path):
 req=urllib.request.Request(f"https://raw.githubusercontent.com/anderskhv/tinct/{ref}/{path}",headers={"User-Agent":"Tinct-coordinate-preflight"})
 return urllib.request.urlopen(req,timeout=45).read()
def digest(raw): return hashlib.sha256(raw if isinstance(raw,bytes) else raw.encode()).hexdigest()
def normalize(text): return re.sub(" {2,}"," ",text.replace("\n"," "))
def u16(text): return len(text.encode("utf-16-le"))//2
def paras(raw): return {c["number"]:c["paragraphs"] for c in json.loads(raw)["chapters"]}
def char_ops(a,b,shift):
 aa=list(a);bb=list(b)
 return [[tag,u16(a[:i]),u16(a[:j]),shift+u16(b[:k]),shift+u16(b[:l])] for tag,i,j,k,l in difflib.SequenceMatcher(None,aa,bb,autojunk=False).get_opcodes()]
def word_ops(a,b,shift):
 aa=re.findall(r"\S+",a);bb=re.findall(r"\S+",b)
 return [[tag,i,j,shift+k,shift+l] for tag,i,j,k,l in difflib.SequenceMatcher(None,aa,bb,autojunk=False).get_opcodes()]
out=ROOT/"books/wip/structure-migration-20260924"
out.mkdir(parents=True,exist_ok=True)
summary=[]
for book,cfg in CONFIG.items():
 folder=f"books/wip/featured-source-cleanup/{book}"
 raw_map=fetch(CLEAN,folder+"/paragraph-map.tsv").decode()
 rows=list(csv.DictReader(io.StringIO("\n".join(s for s in raw_map.splitlines() if not s.startswith("#"))),delimiter="\t"))
 mapping={(int(r["old_chapter"]),int(r["old_index"])):r for r in rows}
 changes=json.loads(fetch(CLEAN,folder+"/CHANGES.json"))
 duplicates={(c["edition"],tuple(map(int,c["at"].split(".")))):tuple(map(int,c["duplicate_of"].split("."))) for c in changes if c["op"]=="delete"}
 result={"revision":"structure-2026-09-24.1","bookId":book,"baselineRef":BASE,"acceptedStructureRef":CLEAN,"editions":{}}
 for edition in ["original-en","modern-en"]:
  old_raw=fetch(BASE,f"app/public/data/editions/{book}-{edition}.json")
  final_raw=fetch(CLEAN,f"{folder}/{book}-{edition}.json")
  if book=="jane-eyre" and edition=="modern-en":
   patch=json.loads(fetch(CLARITY,"books/wip/jane-eyre-targeted-clarity-review/PATCH.json"))
   base=patch["bases"]["corrected"]
   assert digest(final_raw)==base["sha256"]
   before_patch=paras(final_raw)
   final_text=final_raw.decode()
   assert len(patch["changes"])==1
   for change in patch["changes"]:
    at=change["coordinates"]["corrected"]
    assert before_patch[at["chapter"]][at["paragraph"]]==change["old"]
    assert digest(change["old"])==change["oldParagraphSha256"]
    assert digest(change["new"])==change["newParagraphSha256"]
    old_literal=json.dumps(change["old"],ensure_ascii=False)
    new_literal=json.dumps(change["new"],ensure_ascii=False)
    assert final_text.count(old_literal)==1
    final_text=final_text.replace(old_literal,new_literal,1)
   final_raw=final_text.encode()
   assert digest(final_raw)==base["patchedSha256"]
   after_patch=paras(final_raw)
   assert [(ch,pi) for ch in before_patch for pi,p in enumerate(before_patch[ch]) if p!=after_patch[ch][pi]]==[(34,139)]
   result["acceptedClarityRef"]=CLARITY
  assert digest(final_raw)==cfg["final"][edition]
  old,final=paras(old_raw),paras(final_raw)
  stage=old if edition=="original-en" else paras(fetch(cfg["acceptedRef"],f"books/wip/green-{book}/candidate.json"))
  assert old.keys()==stage.keys()==final.keys()
  assert all(len(old[ch])==len(stage[ch]) for ch in old)
  assert [len(final),sum(map(len,final.values()))]==cfg["counts"]
  entries={}
  for ch,paragraphs in old.items():
   for pi,text in enumerate(paragraphs):
    row=mapping.get((ch,pi))
    op=row["op"] if row else "keep"
    if op=="delete":
     dc,di=duplicates[(edition,(ch,pi))]
     targetrow=mapping.get((dc,di))
     assert not targetrow or targetrow["op"]!="delete"
     nc,np=(int(targetrow["new_chapter"]),int(targetrow["new_index"])) if targetrow else (dc,di)
    else:
     nc,np=(int(row["new_chapter"]),int(row["new_index"])) if row else (ch,pi)
    a=normalize(text);full=normalize(final[nc][np])
    char_shift=0;word_shift=0;b=full
    if op in ("merge-head","merge-tail"):
     b=normalize(stage[ch][pi])
     if op=="merge-tail":
      head=normalize(stage[ch][pi-1])
      assert full==head+" "+b
      char_shift=u16(head)+1
      word_shift=len(re.findall(r"\S+",head))
      assert char_shift==int(row["offset_shift_"+edition.replace("-","_")])
     else:
      assert full.startswith(b+" ")
    if (nc,np)==(ch,pi) and a==full: continue
    cop=char_ops(a,b,char_shift);wop=word_ops(a,b,word_shift)
    # Every equal interval must round-trip exactly in the final paragraph.
    for tag,i,j,k,l in cop:
     if tag=="equal": assert a.encode("utf-16-le")[2*i:2*j]==full.encode("utf-16-le")[2*k:2*l]
    aw=re.findall(r"\S+",a);nw=re.findall(r"\S+",full)
    for tag,i,j,k,l in wop:
     if tag=="equal": assert aw[i:j]==nw[k:l]
    entries[f"{ch}.{pi}"]={"chapter":nc,"paragraph":np,"operation":op,"oldText":a,"oldHash":digest(a),"newHash":digest(full),"oldWords":len(aw),"newWords":len(nw),"oldChars":u16(a),"newChars":u16(full),"chars":cop,"words":wop}
  result["editions"][edition]={"beforeSha256":digest(old_raw),"afterSha256":digest(final_raw),"paragraphCountsBefore":{str(k):len(v) for k,v in old.items()},"paragraphCountsAfter":{str(k):len(v) for k,v in final.items()},"entries":entries}
 data=(json.dumps(result,ensure_ascii=False,separators=(",",":"))+"\n").encode()
 (out/f"{book}.json").write_bytes(data)
 summary.append({"book":book,"sha256":digest(data),"bytes":len(data),"entries":{k:len(v["entries"]) for k,v in result["editions"].items()}})
(out/"SUMMARY.json").write_text(json.dumps(summary,indent=2)+"\n")
print(json.dumps(summary,indent=2))
