"""Prove old/current paragraph correspondences without changing served data."""
import collections,difflib,json,sys,re,urllib.request,hashlib
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import prodapi
out=Path("artifacts/bella-source-map-2026-09-21");out.mkdir(parents=True,exist_ok=True)
sources={"essays-montaigne":"f99cfa4a833bbe5e6cd5dcbec428966c0cb273cd","merry-wives-of-windsor":"1fd2dfceacc6e9ba84a19faa07da1d8d30b0d0e8","measure-for-measure":"1fd2dfceacc6e9ba84a19faa07da1d8d30b0d0e8","faust-part-1":"08c2971e4617df9b8876dff58bd8d31269952282","meditations":"bd6dbef360c5db6d2cb4c2a65e09461354ff966e"}
def flatten(ed):
 return [dict(chapter=c["number"],paragraph=i,text=p if isinstance(p,str) else p.get("text","")) for c in ed["chapters"] for i,p in enumerate(c["paragraphs"])]
def canonical(text):
 return re.sub(r"\s+"," ",text.replace("_","").replace("’","'").replace("‘","'").replace("“",'"').replace("”",'"')).strip()
summary=[]
for book,sha in sources.items():
 old=json.load(urllib.request.urlopen(f"https://raw.githubusercontent.com/anderskhv/tinct/{sha}/app/public/data/editions/{book}-original-en.json"))
 status,new=prodapi.edition_text(book,"original-en")
 assert status==200
 before,after=flatten(old),flatten(new)
 keys=[canonical(p["text"]) for p in before];nextkeys=[canonical(p["text"]) for p in after]
 matcher=difflib.SequenceMatcher(None,keys,nextkeys,autojunk=False)
 mapped={j1+k:i1+k for tag,i1,i2,j1,j2 in matcher.get_opcodes() if tag=="equal" for k in range(i2-i1)}
 # Every correspondence is order-preserving; duplicate text cannot jump backwards.
 manifests={};plans=[]
 for j,p in enumerate(after):
  row={**p,"source":None}
  if j in mapped:
   source=before[mapped[j]];ch=source["chapter"]
   if ch not in manifests:
    code,mf=prodapi.chapter_manifest(book,"original-en",ch);manifests[ch]=(code,mf)
   code,mf=manifests[ch]
   entry=next((q for q in (mf or {}).get("paragraphs",[]) if q.get("paragraph")==source["paragraph"]),None)
   oldchapter=next(c for c in old["chapters"] if c["number"]==ch)
   count=len([q for q in (mf or {}).get("paragraphs",[]) if q.get("paragraph",-1)>=0])
   row["source"]=dict(chapter=ch,paragraph=source["paragraph"],text=source["text"],file=(entry or {}).get("file"),manifestHTTP=code,oldParagraphCount=len(oldchapter["paragraphs"]),manifestParagraphCount=count,exactText=source["text"]==p["text"],structuralSourceMatch=count==len(oldchapter["paragraphs"]))
  plans.append(row)
 record=dict(bookId=book,edition="original-en",oldCommit=sha,oldParagraphs=len(before),currentParagraphs=len(after),matchedParagraphs=len(mapped),matchedWithStructuralSource=sum(bool(x["source"] and x["source"]["structuralSourceMatch"]) for x in plans),unmatchedParagraphs=len(after)-len(mapped),sourceAcousticallyVerified=False)
 (out/f"{book}.json").write_text(json.dumps(dict(summary=record,paragraphs=plans),indent=1,ensure_ascii=False))
 summary.append(record);(out/"summary.json").write_text(json.dumps(summary,indent=1))
 print(json.dumps(record),flush=True)
