import json,urllib.request,sys
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import prodapi,audio_readiness
root=Path("artifacts/bella-completion-batch-2026-09-21");root.mkdir(parents=True,exist_ok=True)
url="https://raw.githubusercontent.com/anderskhv/tinct/codex/bella-completion-ledger-20260921/artifacts/bella-completion-ledger-2026-09-21/pending.json"
rows=json.load(urllib.request.urlopen(url))
rows=sorted([x for x in rows if x["nextAction"]=="first-current-alignment"],key=lambda x:x.get("durationSeconds",999999))
targets=[];seconds=0;report=[]
for row in rows:
 if len(targets)>=20:break
 if seconds+row.get("durationSeconds",0)>7200:continue
 b,e,ch=row["bookId"],row["edition"],row["chapter"]
 if prodapi.audio_object_size(f"{b}/{e}/ch{ch}/words.json")[0]!=404:continue
 status,text=prodapi.edition_text(b,e)
 if status!=200:continue
 readiness=audio_readiness.assess(b,e,ch,text,99999)
 report.append(readiness)
 if readiness["outcome"] not in ("ready","separator-gap"):continue
 targets.append(dict(bookId=b,edition=e,chapter=ch))
 seconds+=row.get("durationSeconds",0)
(root/"batch.json").write_text(json.dumps(targets,indent=1));(root/"readiness.json").write_text(json.dumps(report,indent=1))
print(len(targets),"chapters",round(seconds/3600,2),"audio hours",flush=True)
if not targets:raise SystemExit("No batch candidates")
