import json,urllib.request,sys,collections
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import prodapi
root=Path("artifacts/bella-remap-wave02-2026-09-21");root.mkdir(parents=True,exist_ok=True)
targets=[]
for book in ["essays-montaigne","merry-wives-of-windsor","measure-for-measure"]:
 data=json.load(urllib.request.urlopen(f"https://raw.githubusercontent.com/anderskhv/tinct/codex/bella-source-map-20260921/artifacts/bella-source-map-2026-09-21/{book}.json"))
 groups=collections.defaultdict(list)
 for p in data["paragraphs"]:groups[p["chapter"]].append(p)
 for ch,rows in groups.items():
  if all(p.get("source") and p["source"]["structuralSourceMatch"] for p in rows):
   targets.append(dict(bookId=book,edition="original-en",chapter=ch,words=sum(len(p["text"].split()) for p in rows)))
chosen=[];words=0
for row in sorted(targets,key=lambda x:x["words"]):
 if len(chosen)>=40:break
 if words+row["words"]>30000:continue
 key=f'{row["bookId"]}/{row["edition"]}/ch{row["chapter"]}'
 if prodapi.audio_object_size(key+"/words.json")[0]!=404:continue
 chosen.append({k:row[k] for k in ("bookId","edition","chapter")});words+=row["words"]
(root/"batch.json").write_text(json.dumps(chosen,indent=1))
print(len(chosen),"mapped chapters",words,"words",flush=True)
if not chosen:raise SystemExit("No mapped chapters")
