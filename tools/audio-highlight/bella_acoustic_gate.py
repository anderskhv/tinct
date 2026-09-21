import json
from pathlib import Path
root=Path("artifacts/bella-sync-pilot-2026-09-21")
cases=[("winter","winters-tale",6,"out"),("imitation","imitation-of-christ",76,"replay")]
ready=[];report=[]
for label,book,ch,folder in cases:
    probes=json.loads((root/f"probe-{label}.json").read_text())
    good=len(probes)==1 and probes[0]["criterion_met"]
    row={"bookId":book,"edition":"original-en","chapter":ch,"criterionMet":good}
    report.append(row)
    if good:ready.append({**{k:row[k] for k in ("bookId","edition","chapter")},"path":str(root/f"{folder}/{book}/original-en/ch{ch}/auto/words.candidate.json")})
(root/"acoustically-accepted.json").write_text(json.dumps(ready,indent=1))
(root/"acoustic-summary.json").write_text(json.dumps(report,indent=1))
print(json.dumps(report,indent=2))
