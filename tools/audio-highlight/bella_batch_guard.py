"""Independent cloud-job watchdog; never touches other owners."""
import os,json,time,sys,urllib.request,subprocess
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import runpod_guard
rid=os.environ["GITHUB_RUN_ID"];root=Path("artifacts/bella-completion-guard");root.mkdir(parents=True,exist_ok=True)
prefix="tinct-bella-completion-"+rid
key=os.environ["RUNPOD_API_KEY"]
start=time.monotonic();journal=[]
while time.monotonic()-start<45*60:
 r=subprocess.run([sys.executable,"tools/audio-highlight/runpod_guard.py","enforce","--owner-prefix",prefix,"--budget","15","--spent","2.19","--max-rate","1","--max-minutes","35","--json-out",str(root/"guard.json"),"--apply"],capture_output=True,text=True)
 print(r.stdout,flush=True)
 if r.returncode:print("guard poll failed",r.returncode,flush=True)
 req=urllib.request.Request(f"https://api.github.com/repos/anderskhv/tinct/actions/runs/{rid}/jobs",headers={"Authorization":"Bearer "+os.environ["GITHUB_TOKEN"],"User-Agent":"tinct-guard"})
 try:
  jobs=json.load(urllib.request.urlopen(req))["jobs"]
  alignment=next((j for j in jobs if j["name"]=="align"),None)
  if alignment and alignment["status"]=="completed":
   for p in runpod_guard.list_pods(key):
    if p["name"].startswith(prefix) and p["status"]!="EXITED":
     code,_=runpod_guard.stop_pod(key,p["id"],False);journal.append(dict(podId=p["id"],stopHTTP=code))
   break
 except Exception as e:print(type(e).__name__,flush=True)
 time.sleep(30)
else:
 for p in runpod_guard.list_pods(key):
  if p["name"].startswith(prefix) and p["status"]!="EXITED":
   code,_=runpod_guard.stop_pod(key,p["id"],False);journal.append(dict(podId=p["id"],stopHTTP=code))
(root/"cleanup.json").write_text(json.dumps(journal,indent=1))
