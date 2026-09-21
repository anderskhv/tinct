"""Read-only inventory of apparently present timings with no timed spoken words."""
import concurrent.futures,collections,datetime,json,sys,urllib.request
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import prodapi
root=Path("artifacts/bella-zero-span-audit-2026-09-21");root.mkdir(parents=True,exist_ok=True)
url="https://raw.githubusercontent.com/anderskhv/tinct/codex/bella-sync-repair-20260921/artifacts/bella-sync-2026-09-21/chapters.json"
rows=[r for r in json.load(urllib.request.urlopen(url)) if r["edition"]!="modern-en" and r["state"]=="timings-pass-structural"]
def check(r):
 b,e,ch=r["bookId"],r["edition"],r["chapter"];key=f"{b}/{e}/ch{ch}"
 try:
  status,d,_=prodapi.chapter_words(b,e,ch)
  if status!=200 or not d:return {"key":key,"error":"timings unavailable"}
  gaps=[]
  for p in d.get("paragraphs",[]):
   words=p.get("words",[])
   if words and not any(w["end"]>w["start"] for w in words):
    gaps.append(dict(paragraph=p["paragraph"],file=p["file"],words=len(words),text=" ".join(w["text"] for w in words)))
  return dict(key=key,paragraphs=gaps) if gaps else None
 except Exception as exc:return dict(key=key,error=type(exc).__name__)
issues=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
 for i,result in enumerate(pool.map(check,rows)):
  if result:issues.append(result)
  if i%200==0:print(i,"checked",len(issues),"with zero spans/errors",flush=True)
summary=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),chaptersChecked=len(rows),chaptersWithZeroSpans=sum("paragraphs" in x for x in issues),zeroSpanParagraphs=sum(len(x.get("paragraphs",[])) for x in issues),errors=sum("error" in x for x in issues),note="Zero spans are suspects, not proof of missing spoken highlighting; silent headings/markup require audio adjudication.")
(root/"summary.json").write_text(json.dumps(summary,indent=1));(root/"issues.json").write_text(json.dumps(issues,indent=1))
print(json.dumps(summary))
