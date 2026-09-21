"""Freeze three existing-recording timing targets; no production writes."""
import json,sys
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import prodapi,audio_readiness
out=Path("artifacts/bella-sync-pilot-2026-09-21");out.mkdir(parents=True,exist_ok=True)
targets=[];report=[]
for book,ch in [("imitation-of-christ",76),("king-lear",3),("winters-tale",6)]:
    key="original-en"
    target={"bookId":book,"edition":key,"chapter":ch}
    code,_=prodapi.audio_object_size(f"{book}/{key}/ch{ch}/words.json")
    code_text,text=prodapi.edition_text(book,key)
    if code!=404 or code_text!=200:
        report.append({**target,"outcome":"skip","timingStatus":code,"textStatus":code_text});continue
    r=audio_readiness.assess(book,key,ch,text,99999)
    report.append(r)
    if r["outcome"] in ("ready","separator-gap"):targets.append(target)
(out/"targets.json").write_text(json.dumps(targets,indent=1))
(out/"preflight.json").write_text(json.dumps(report,indent=1))
print(json.dumps(report,indent=1))
if not targets:raise SystemExit("No verified pilot targets remain")
