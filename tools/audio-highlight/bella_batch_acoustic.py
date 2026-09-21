"""Independently check every passing GPU candidate against its frozen recordings."""
import json,sys,hashlib
from pathlib import Path
import torch,whisper
sys.path.insert(0,"tools/audio-highlight/aligner")
import cloud_cohort,cloud_probe
root=Path("artifacts/bella-completion-batch-2026-09-21")
targets=json.loads((root/"candidates.json").read_text())
work=Path("/tmp/bella-batch-review");work.mkdir(parents=True,exist_ok=True)
old={}
for p in (root/"pods").glob("*/cohort/cohort.json"):
 for e in json.loads(p.read_text()):old[e["key"]]=e
editions={};cohort=[]
for target in targets:
 e=cloud_cohort.build(target,work,"independent-review",editions)
 assert "dropped" not in e,e
 previous=old[e["key"]]
 assert [(p["index"],p["text"],p["sha256"]) for p in e["paragraphs"]]==[(p["index"],p["text"],p["sha256"]) for p in previous["paragraphs"]]
 cohort.append(e)
torch.set_num_threads(4);model=whisper.load_model("base",device="cpu")
records=[];accepted=[]
for target,e in zip(targets,cohort):
 path=Path(target["path"])
 result=cloud_probe.probe_chapter(model,e,json.loads(path.read_text()),work,False)
 result["candidate_sha256"]=hashlib.sha256(path.read_bytes()).hexdigest()
 result["model_sha256"]=hashlib.sha256((Path.home()/".cache/whisper/base.pt").read_bytes()).hexdigest()
 result=json.loads(json.dumps(result,default=lambda x:x.item() if hasattr(x,"item") else x.tolist()))
 records.append(result);(root/"probes.json").write_text(json.dumps(records,indent=1))
 if result["criterion_met"]:accepted.append(dict(target,candidateSha256=result["candidate_sha256"]))
 (root/"accepted.json").write_text(json.dumps(accepted,indent=1))
 print(e["key"],result["criterion_met"],result["within_300ms"],result["max_delta"],flush=True)
(root/"review-cohort.json").write_text(json.dumps(cohort,indent=1))
