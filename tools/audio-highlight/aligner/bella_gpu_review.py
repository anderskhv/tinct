"""Same independent base checkpoint and anchor rules, executed on the bounded GPU."""
import sys,json,hashlib
from pathlib import Path
import torch,whisper
import cloud_probe
cohort_dir,out=map(Path,sys.argv[1:]);cohort=json.loads((cohort_dir/"cohort.json").read_text())
torch.set_num_threads(4);model=whisper.load_model("base",device="cuda")
model_hash=hashlib.sha256((Path.home()/".cache/whisper/base.pt").read_bytes()).hexdigest()
results=[];accepted=[]
for e in cohort:
 p=out/e["key"]/"auto"/"words.candidate.json"
 if not p.exists():continue
 try:
  r=cloud_probe.probe_chapter(model,e,json.loads(p.read_text()),cohort_dir,False)
  r["model"]="OpenAI Whisper base CUDA fp32, unprompted"
  r["model_sha256"]=model_hash;r["candidate_sha256"]=hashlib.sha256(p.read_bytes()).hexdigest()
  r=json.loads(json.dumps(r,default=lambda x:x.item() if hasattr(x,"item") else x.tolist()))
  results.append(r)
  if r["criterion_met"]: accepted.append({"key":e["key"],"path":str(p.relative_to(out)),"sha256":r["candidate_sha256"]})
  print(e["key"],r["criterion_met"],r["within_300ms"],r["max_delta"],flush=True)
 except Exception as exc:
  results.append({"key":e["key"],"criterion_met":False,"error":type(exc).__name__+": "+str(exc)})
 (out/"probes.json").write_text(json.dumps(results,indent=1))
 (out/"acoustically-accepted.json").write_text(json.dumps(accepted,indent=1))
