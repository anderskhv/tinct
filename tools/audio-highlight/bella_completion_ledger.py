"""Reconcile remaining retained-English timings with every preserved attempt."""
import json,sys,collections,urllib.request,os,datetime
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import runpod_guard
out=Path("artifacts/bella-completion-ledger-2026-09-21");out.mkdir(parents=True,exist_ok=True)
url="https://raw.githubusercontent.com/anderskhv/tinct/codex/bella-sync-repair-20260921/artifacts/bella-sync-2026-09-21/chapters.json"
rows=json.load(urllib.request.urlopen(url))
history=collections.defaultdict(list)
for path in Path("artifacts").glob("audio-highlight-run*/pods/*/collect-report.json"):
    obj=json.loads(path.read_text())
    def visit(o):
        if isinstance(o,list):
            for v in o:visit(v)
        elif isinstance(o,dict):
            if o.get("key") and "/" in str(o["key"]):
                history[o["key"]].append(dict(path=str(path),record=o))
            else:
                for v in o.values():
                    if isinstance(v,(list,dict)):visit(v)
    visit(obj)
holds=json.loads(Path("artifacts/audio-highlight-cloud-resume-2026-09-16/quarantine.json").read_text())
holdkeys={f"{x['bookId']}/{x['edition']}/ch{x['chapter']}":x for x in holds["chapters"] if x.get("hold")=="content"}
pending=[];summary=collections.Counter()
for row in rows:
    if row["edition"]=="modern-en" or row["state"]=="timings-pass-structural":continue
    key=f"{row['bookId']}/{row['edition']}/ch{row['chapter']}"
    row["priorAttempts"]=history.get(key,[])
    row["contentHold"]=holdkeys.get(key)
    row["nextAction"]="source-and-audio-repair"
    if row["state"]=="timings-missing" and row.get("readiness",{}).get("outcome") in ("ready","separator-gap"):
        row["nextAction"]="stronger-recognition" if row["priorAttempts"] else "first-current-alignment"
    if row["contentHold"]:row["nextAction"]="resolve-content-hold"
    summary[row["nextAction"]]+=1;pending.append(row)
(out/"pending.json").write_text(json.dumps(pending,indent=1))
(out/"summary.json").write_text(json.dumps(dict(asOf=datetime.datetime.now(datetime.timezone.utc).isoformat(),pending=len(pending),actions=summary,historyKeys=len(history)),indent=1))
key=os.environ.get("RUNPOD_API_KEY")
provider={"credentialsAvailable":bool(key),"launch":False}
if key:
    provider["pods"]=runpod_guard.list_pods(key)
    code,data=runpod_guard._call("GET","/billing/pods",key)
    provider["billingHTTP"]=code
    if code==200:
        records=data if isinstance(data,list) else data.get("data",[])
        recent=[r for r in records if str(r.get("time",""))>="2026-09-16"]
        provider["billingRowsSinceSeptember16"]=len(recent)
        provider["allAccountBilledSinceSeptember16"]=round(sum(float(r.get("amount",0)) for r in recent),4)
        provider["conservativeCarryForward"]=round(1+sum(float(r.get("amount",0)) for r in recent),4)
        provider["lastBillingTime"]=max((str(r.get("time","")) for r in records),default=None)
(out/"provider-preflight.json").write_text(json.dumps(provider,indent=1))
print(json.dumps(dict(actions=summary,provider=provider),indent=1))
