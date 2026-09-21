"""Narrow cloud-only recovery and alignment; no production writes."""
import sys,json,hashlib,urllib.request,traceback
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight");sys.path.insert(0,"tools/audio-highlight/aligner")
import prodapi,cloud_cohort,cloud_probe,trial,publish_timings
from observed_heading_repair import recover
TARGETS=[("don-quixote",52),("pride-and-prejudice",2),("the-awakening",12),("candide",26),("federalist-papers",48),("federalist-papers",84),("beyond-good-and-evil",5),("nicomachean-ethics",7),("communist-manifesto",4)]
book,ch=TARGETS[int(sys.argv[1])];key=f"{book}/original-en/ch{ch}"
root=Path("artifacts/bella-focused-acoustic-2026-09-21")/book/str(ch);root.mkdir(parents=True,exist_ok=True)
work=Path("/tmp/focused");work.mkdir(exist_ok=True)
def write(name,obj):
 (root/name).write_text(json.dumps(obj,indent=1,ensure_ascii=False,default=lambda x:x.item() if hasattr(x,"item") else x.tolist()))
def get(ref,path):return urllib.request.urlopen("https://raw.githubusercontent.com/anderskhv/tinct/"+ref+"/"+path,timeout=90).read()
def sha(b):return hashlib.sha256(b).hexdigest()
def main():
 import torch,whisper
 from faster_whisper import WhisperModel
 from faster_whisper.audio import decode_audio
 from huggingface_hub import snapshot_download
 torch.set_num_threads(4)
 pending=json.loads(get("codex/bella-completion-ledger-20260921","artifacts/bella-completion-ledger-2026-09-21/pending.json"))
 prior=next(r for r in pending if r["bookId"]==book and r["edition"]=="original-en" and r["chapter"]==ch)
 write("prior.json",prior)
 e=cloud_cohort.build(dict(bookId=book,edition="original-en",chapter=ch),work,"focused-retention",{})
 assert "dropped" not in e,e
 write("cohort.json",[e])
 candidate=None; recovery=[]
 for attempt in prior["priorAttempts"]:
  arm=attempt["record"].get("arms",{}).get("auto",{})
  path=arm.get("sidecar","").replace("/home/user/tinct/","")
  if not path:continue
  try:
   old=json.loads(get("codex/bella-completion-ledger-20260921",path))
   prefix=path.split("/out/")[0]
   co=json.loads(get("codex/bella-completion-ledger-20260921",prefix+"/cohort/cohort.json"))
   oe=next(x for x in co if x["key"]==key)
   assert [(p["index"],p["text"],p["sha256"]) for p in e["paragraphs"]]==[(p["index"],p["text"],p["sha256"]) for p in oe["paragraphs"]]
   candidate=old;recovery.append(dict(path=path,outcome="reused"));break
  except Exception as exc:recovery.append(dict(path=path,outcome=type(exc).__name__+": "+str(exc)))
 write("recovery.json",recovery)
 smallpath=snapshot_download("Systran/faster-whisper-small.en")
 small=WhisperModel(smallpath,device="cpu",compute_type="int8",cpu_threads=4)
 provenance=dict(smallModelPath=smallpath,smallTreeSha256=trial.tree_hash(Path(smallpath)),helper="v7",helperSha256=trial.sha(trial.lib.__file__),trialSha256=trial.sha(trial.__file__),device="cpu",compute="int8",gate=.85)
 write("configuration.json",provenance)
 failed=[]
 if candidate is None:
  passed=[]
  for p in e["paragraphs"]:
   r=trial.paragraph(small,work/p["path"],p["text"],"auto",root/f"p{p['index']}.diagnostic.json",configuration=provenance)
   passed.append((p["index"],p["file"],r["candidate_words"]))
   if r["rejection_reasons"] or not any(w["end"]>w["start"] for w in r["candidate_words"]):failed.append(p["index"])
  candidate=trial.lib.build_sidecar(book,"original-en",ch,e["title"],passed)
 else:
  failed=[r["paragraph"] for r in arm.get("reasons",[])]
  failed.extend(p["paragraph"] for p in candidate["paragraphs"] if not any(w["end"]>w["start"] for w in p["words"]))
 write("initial-candidate.json",candidate);write("failed-paragraphs.json",failed)
 del small
 if failed:
  mediumPath=snapshot_download("Systran/faster-whisper-medium.en",revision="a29b04bd15381511a9af671baec01072039215e3")
  modelHash=trial.tree_hash(Path(mediumPath))
  assert modelHash=="2cb92e2f7d762a12ad0b3b5360cd93f78bb20b7181be86e253db854a29d41572",modelHash
  medium=WhisperModel(mediumPath,device="cpu",compute_type="int8",cpu_threads=4)
  unresolved=[]
  for index in sorted(set(failed)):
   p=next(p for p in e["paragraphs"] if p["index"]==index)
   try:
    r=trial.paragraph(medium,work/p["path"],p["text"],"auto",root/f"p{index}.medium.json",configuration=dict(modelTreeSha256=modelHash,device="cpu",compute="int8"))
    words=r["candidate_words"]
    if not any(w["end"]>w["start"] for w in words):
     fixed=recover(p["text"],r["heard_words"])
     if fixed:words=fixed["words"]
    if r["rejection_reasons"] or not any(w["end"]>w["start"] for w in words):
     unresolved.append(dict(paragraph=index,reasons=r["rejection_reasons"],text=p["text"],heard=r["heard_words"]));continue
    next(x for x in candidate["paragraphs"] if x["paragraph"]==index)["words"]=words
   except Exception as exc:unresolved.append(dict(paragraph=index,error=type(exc).__name__+": "+str(exc)))
  write("unresolved.json",unresolved)
  del medium
  if unresolved:write("result.json",dict(key=key,status="unresolved-recognition",unresolved=unresolved));return
 body=(json.dumps(candidate,ensure_ascii=False,indent=1)+"\n").encode();(root/"words.candidate.json").write_bytes(body)
 failures=publish_timings.validate_candidate(candidate,book,"original-en",ch)
 texts={p["index"]:p["text"] for p in e["paragraphs"]}
 for p in candidate["paragraphs"]:
  expected=trial.lib.chapter_words_from_text(texts[p["paragraph"]].replace("\n"," "))
  if expected!=[w["text"] for w in p["words"]]:failures.append(f"exact tokens p{p['paragraph']}")
  if not any(w["end"]>w["start"] for w in p["words"]):failures.append(f"zero-only p{p['paragraph']}")
 write("validation.json",failures)
 if failures:write("result.json",dict(key=key,status="validation-failed",failures=failures));return
 base=whisper.load_model("base",device="cpu")
 class Decoded:
  def transcribe(self,path,**kwargs):return base.transcribe(decode_audio(str(path),sampling_rate=16000),**kwargs)
 probe=cloud_probe.probe_chapter(Decoded(),e,candidate,work,True)
 probe["candidate_sha256"]=sha(body);probe["model_sha256"]=sha((Path.home()/".cache/whisper/base.pt").read_bytes())
 write("probe.json",probe)
 write("result.json",dict(key=key,status="acoustic-pass" if probe["criterion_met"] else "acoustic-fail",candidateSha256=sha(body),within=probe["within_300ms"],maxDelta=probe["max_delta"]))
 print(key,probe["criterion_met"],probe["within_300ms"],probe["max_delta"],flush=True)
try:main()
except Exception as exc:
 write("error.json",dict(key=key,error=type(exc).__name__+": "+str(exc),traceback=traceback.format_exc()));raise
