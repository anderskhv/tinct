import os,json,sys,hashlib
from pathlib import Path
import torch,whisper
sys.path.insert(0,"tools/audio-highlight/aligner")
import cloud_probe,cloud_cohort
root=Path("artifacts/bella-completion-wave02-2026-09-21");out=root/"review";out.mkdir(exist_ok=True)
shard=int(os.environ["SHARD"]);count=7
targets=json.loads((root/"candidates.json").read_text())[shard::count]
old={e["key"]:e for p in (root/"pods").glob("*/cohort/cohort.json") for e in json.loads(p.read_text())}
work=Path("/tmp/bella-review-"+str(shard));work.mkdir(exist_ok=True)
torch.set_num_threads(4);model=whisper.load_model("base",device="cpu")
records=[];editions={}
for t in targets:
 try:
  e=cloud_cohort.build(t,work,"independent-review",editions);assert "dropped" not in e,e
  assert [(p["index"],p["text"],p["sha256"]) for p in e["paragraphs"]]==[(p["index"],p["text"],p["sha256"]) for p in old[e["key"]]["paragraphs"]]
  candidate=Path(t["path"]);r=cloud_probe.probe_chapter(model,e,json.loads(candidate.read_text()),work,False)
  r["candidate_sha256"]=hashlib.sha256(candidate.read_bytes()).hexdigest()
  r["model_sha256"]=hashlib.sha256((Path.home()/".cache/whisper/base.pt").read_bytes()).hexdigest()
  r=json.loads(json.dumps(r,default=lambda x:x.item() if hasattr(x,"item") else x.tolist()))
  records.append(dict(target=t,cohort=e,probe=r))
  print(e["key"],r["criterion_met"],r["within_300ms"],r["max_delta"],flush=True)
 except Exception as error:records.append(dict(target=t,error=type(error).__name__+": "+str(error)))
 (out/f"shard-{shard}.json").write_text(json.dumps(records,indent=1))
