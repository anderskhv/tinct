import sys,json,hashlib,urllib.request,dataclasses,traceback
from pathlib import Path
import numpy as np
import torch,whisper
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio
from huggingface_hub import snapshot_download
sys.path.insert(0,"tools/audio-highlight");sys.path.insert(0,"tools/audio-highlight/aligner")
import trial,cloud_cohort,cloud_probe,publish_timings
from observed_heading_repair import recover
TARGETS=[("communist-manifesto",4,[13,21])]
book,ch,indices=TARGETS[int(sys.argv[1])];key=f"{book}/original-en/ch{ch}"
root=Path("artifacts/bella-focused-heading-2026-09-21")/book/str(ch);root.mkdir(parents=True,exist_ok=True)
work=Path("/tmp/context");work.mkdir(exist_ok=True)
def write(n,j):(root/n).write_text(json.dumps(j,indent=1,ensure_ascii=False,default=lambda x:x.item() if hasattr(x,"item") else x.tolist()))
def get(n):
 return urllib.request.urlopen(f"https://raw.githubusercontent.com/anderskhv/tinct/codex/bella-focused-collected-20260921/artifacts/bella-focused-acoustic-2026-09-21/{book}/{ch}/"+n,timeout=90).read()
def main():
 oldco=json.loads(get("cohort.json"))[0]
 e=cloud_cohort.build(dict(bookId=book,edition="original-en",chapter=ch),work,"focused-context",{})
 assert "dropped" not in e
 assert [(p["index"],p["text"],p["sha256"]) for p in e["paragraphs"]]==[(p["index"],p["text"],p["sha256"]) for p in oldco["paragraphs"]]
 write("cohort.json",[e])
 cand=json.loads(get("initial-candidate.json"))
 # Recover other paragraphs already accepted by the medium retry.
 for index in json.loads(get("failed-paragraphs.json")):
  if index in indices:continue
  diagnostic=json.loads(get(f"p{index}.medium.json"))
  selected=next(a for a in diagnostic["attempts"] if a["mode"]==diagnostic["selected_mode"])
  assert not selected["rejection_reasons"]
  words=selected["candidate_words"]
  if not any(w["end"]>w["start"] for w in words):
   fixed=recover(next(p["text"] for p in e["paragraphs"] if p["index"]==index),selected["heard_words"])
   assert fixed,index
   words=fixed["words"]
  next(p for p in cand["paragraphs"] if p["paragraph"]==index)["words"]=words
 path=snapshot_download("Systran/faster-whisper-medium.en",revision="a29b04bd15381511a9af671baec01072039215e3",local_dir="/tmp/medium")
 mh=trial.tree_hash(Path(path));assert mh=="2cb92e2f7d762a12ad0b3b5360cd93f78bb20b7181be86e253db854a29d41572"
 model=WhisperModel(path,device="cpu",compute_type="int8",cpu_threads=4)
 records=[];fixed=[]
 for index in indices:
  p=next(x for x in e["paragraphs"] if x["index"]==index)
  if book=="the-awakening":
   r=trial.paragraph(model,work/p["path"],p["text"],"auto",root/f"p{index}.medium.json",configuration=dict(modelTreeSha256=mh,device="cpu",compute="int8"))
   assert not r["rejection_reasons"]
   alt=r["candidate_words"]
   anchors=[a for a in json.loads(get("probe.json"))["all_exact_match_anchors"] if a["paragraph"]==index]
   def score(words):
    ds=[max(abs(words[a["word"]]["start"]-a["probe_start"]),abs(words[a["word"]]["end"]-a["probe_end"])) for a in anchors]
    return [sum(d>.3 for d in ds),max(ds,default=0),sum(ds)]
   target=next(x for x in cand["paragraphs"] if x["paragraph"]==index)
   decision=dict(paragraph=index,oldScore=score(target["words"]),newScore=score(alt),modelTreeSha256=mh)
   write("paragraph-selection.json",decision)
   if decision["newScore"]>=decision["oldScore"]:raise ValueError("Whole-paragraph alternative did not improve anchor agreement")
   target["words"]=alt;fixed.append(index);continue
  parts=[x for x in e["paragraphs"] if index-1<=x["index"]<=index+1]
  audios=[decode_audio(str(work/x["path"]),sampling_rate=16000) for x in parts]
  position=next(i for i,x in enumerate(parts) if x["index"]==index)
  offset=sum(len(a) for a in audios[:position])/16000;duration=len(audios[position])/16000;end=offset+duration
  joined=np.concatenate(audios)
  for label,prompt in [("unprompted",None),("full-context"," ".join(x["text"] for x in parts))]:
   kwargs=dict(language="en",word_timestamps=True,vad_filter=False,condition_on_previous_text=False)
   if prompt:kwargs["initial_prompt"]=prompt
   segments,_=model.transcribe(joined,**kwargs)
   raw=[dict(raw=w.word.strip(),start=w.start,end=w.end) for s in segments for w in s.words or []]
   heard=[trial.lib.HeardWord(w["raw"],max(0,w["start"]-offset),min(duration,w["end"]-offset)) for w in raw if offset<=(w["start"]+w["end"])/2<end]
   recovered=recover(p["text"],[dataclasses.asdict(h) for h in heard])
   r=dict(paragraph=index,mode=label,prompt=prompt,offset=offset,duration=duration,heard=[dataclasses.asdict(h) for h in heard],raw=raw,recovered=recovered)
   records.append(r);write("context-diagnostics.json",records)
   if not recovered:continue
   next(x for x in cand["paragraphs"] if x["paragraph"]==index)["words"]=recovered["words"]
   fixed.append(index);break
 assert fixed==indices,dict(fixed=fixed,needed=indices)
 del model
 assert not publish_timings.validate_candidate(cand,book,"original-en",ch)
 for p in e["paragraphs"]:
  words=next(x["words"] for x in cand["paragraphs"] if x["paragraph"]==p["index"])
  assert [w["text"] for w in words]==trial.lib.chapter_words_from_text(p["text"].replace("\n"," "))
 body=(json.dumps(cand,indent=1,ensure_ascii=False)+"\n").encode();(root/"words.candidate.json").write_bytes(body)
 torch.set_num_threads(4);probes=[]
 for name in ["base","small"]:
  model=whisper.load_model(name,device="cpu")
  class Decoded:
   def transcribe(self,path,**kwargs):return model.transcribe(decode_audio(str(path),sampling_rate=16000),**kwargs)
  probe=cloud_probe.probe_chapter(Decoded(),e,cand,work,True)
  probe["model"]="OpenAI Whisper "+name+" CPU, unprompted";probe["candidate_sha256"]=hashlib.sha256(body).hexdigest();probe["model_sha256"]=trial.sha(Path.home()/f".cache/whisper/{name}.pt")
  write(name+"-probe.json",probe);probes.append(dict(model=name,passGate=probe["criterion_met"],within=probe["within_300ms"],maxDelta=probe["max_delta"]));del model
 result=dict(key=key,status="acoustic-pass" if all(p["passGate"] for p in probes) else "acoustic-fail",candidateSha256=hashlib.sha256(body).hexdigest(),changedParagraphs=indices,probes=probes)
 write("result.json",result);print(json.dumps(result),flush=True)
try:main()
except Exception as e:
 write("error.json",dict(key=key,error=type(e).__name__+": "+str(e),traceback=traceback.format_exc()));raise
