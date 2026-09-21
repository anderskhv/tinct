"""Stronger-model escalation for known failures; read-only production inputs."""
import json,sys,time,hashlib,types
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight/aligner")
import trial,cloud_probe
from faster_whisper import WhisperModel
import torch,whisper
root=Path("artifacts/bella-completion-2026-09-21");root.mkdir(parents=True,exist_ok=True)
cohortpath=Path("/tmp/bella-cohort/cohort.json")
cohort=json.loads(cohortpath.read_text())
modelpath=Path("/tmp/bella-medium")
pin=trial.tree_hash(modelpath)
trial.write(root/"run.json",dict(started=time.time(),model="medium.en",revision="a29b04bd15381511a9af671baec01072039215e3",modelTreeSha256=pin,helperSha256=trial.sha(trial.lib.__file__),runnerSha256=trial.sha(__file__),cohortSha256=trial.sha(cohortpath),upload=False))
args=types.SimpleNamespace(input=cohortpath,model_sha256=pin,device="cpu",compute_type="int8")
model=WhisperModel(str(modelpath),device="cpu",compute_type="int8",cpu_threads=4,local_files_only=True)
report=[]
for entry in cohort:
    directory=root/"out"/entry["key"]/"auto";context={}
    trial.execute_arm(lambda:trial.process_arm(model,args,entry,"auto",directory,context),directory,entry,"auto",context)
    candidate=directory/"words.candidate.json"
    if candidate.exists():
        obj=json.loads(candidate.read_text());obj["model"]="medium.en";trial.write(candidate,obj)
    row=json.loads((directory/"chapter.json").read_text())
    report.append(row);trial.write(root/"alignment-summary.json",report)
    print(entry["key"],row["status"],row.get("reasons"),flush=True)
del model
torch.set_num_threads(4)
probe=whisper.load_model("base",device="cpu")
probes=[];accepted=[]
for entry in cohort:
    directory=root/"out"/entry["key"]/"auto"
    state=json.loads((directory/"chapter.json").read_text())
    if state["status"]!="candidate_requires_acoustic_review":continue
    path=directory/"words.candidate.json"
    result=cloud_probe.probe_chapter(probe,entry,json.loads(path.read_text()),cohortpath.parent,True)
    result["candidate_sha256"]=trial.sha(path)
    result["model_sha256"]=trial.sha(Path.home()/".cache/whisper/base.pt")
    probes.append(result);trial.write(root/"probes.json",probes)
    if result["criterion_met"]:
        book,edition,ch=entry["key"].split("/")
        accepted.append(dict(bookId=book,edition=edition,chapter=int(ch[2:]),path=str(path)))
    trial.write(root/"accepted.json",accepted)
    print(entry["key"],result["within_300ms"],result["selected_count"],result["criterion_met"],flush=True)
