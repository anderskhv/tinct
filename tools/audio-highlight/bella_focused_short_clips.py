import sys,json,hashlib,urllib.request,dataclasses,traceback
from pathlib import Path
import torch,whisper
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio
from huggingface_hub import snapshot_download
sys.path.insert(0,"tools/audio-highlight");sys.path.insert(0,"tools/audio-highlight/aligner")
import trial,cloud_cohort,cloud_probe,publish_timings
from observed_heading_repair import recover
book,ch,indices=[("pride-and-prejudice",2,[10]),("communist-manifesto",4,[13,21])][int(sys.argv[1])]
key=f"{book}/original-en/ch{ch}";root=Path("artifacts/bella-focused-short-clips-2026-09-21")/book/str(ch);root.mkdir(parents=True,exist_ok=True);work=Path("/tmp/short-clips")
def get(ref,folder,n):return urllib.request.urlopen(f"https://raw.githubusercontent.com/anderskhv/tinct/{ref}/artifacts/{folder}/{book}/{ch}/{n}",timeout=90).read()
def prior(n):return get("codex/bella-focused-collected-20260921","bella-focused-acoustic-2026-09-21",n)
def write(n,j):(root/n).write_text(json.dumps(j,indent=1,ensure_ascii=False,default=lambda x:x.item() if hasattr(x,"item") else x.tolist()))
def main():
 oldco=json.loads(prior("cohort.json"))[0]
 e=cloud_cohort.build(dict(bookId=book,edition="original-en",chapter=ch),work,"focused-short-clips",{})
 assert "dropped" not in e
 assert [(p["index"],p["text"],p["sha256"]) for p in e["paragraphs"]]==[(p["index"],p["text"],p["sha256"]) for p in oldco["paragraphs"]]
 write("cohort.json",[e])
 cand=json.loads(prior("initial-candidate.json"))
 for i in json.loads(prior("failed-paragraphs.json")):
  if i in indices:continue
  d=json.loads(prior(f"p{i}.medium.json"));r=next(a for a in d["attempts"] if a["mode"]==d["selected_mode"])
  assert not r["rejection_reasons"]
  words=r["candidate_words"]
  if not any(w["end"]>w["start"] for w in words):
   fixed=recover(next(p["text"] for p in e["paragraphs"] if p["index"]==i),r["heard_words"]);assert fixed,i;words=fixed["words"]
  next(p for p in cand["paragraphs"] if p["paragraph"]==i)["words"]=words
 path=snapshot_download("Systran/faster-whisper-medium.en",revision="a29b04bd15381511a9af671baec01072039215e3",local_dir="/tmp/medium")
 assert trial.tree_hash(Path(path))=="2cb92e2f7d762a12ad0b3b5360cd93f78bb20b7181be86e253db854a29d41572"
 model=WhisperModel(path,device="cpu",compute_type="int8",cpu_threads=4)
 records=[];fixed=[]
 for i in indices:
  p=next(x for x in e["paragraphs"] if x["index"]==i)
  prompts=[p["text"].replace("_",""),"The spoken text is: "+p["text"].replace("_","")]
  for prompt in prompts:
   segments,_=model.transcribe(decode_audio(str(work/p["path"])),language="en",word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=prompt)
   heard=[dict(raw=w.word.strip(),start=w.start,end=w.end) for s in segments for w in s.words or []]
   result=recover(p["text"],heard)
   records.append(dict(paragraph=i,prompt=prompt,heard=heard,recovered=result));write("diagnostics.json",records)
   if not result:continue
   next(x for x in cand["paragraphs"] if x["paragraph"]==i)["words"]=result["words"];fixed.append(i);break
 assert fixed==indices,dict(fixed=fixed,needed=indices)
 del model
 assert not publish_timings.validate_candidate(cand,book,"original-en",ch)
 for p in e["paragraphs"]:
  words=next(x["words"] for x in cand["paragraphs"] if x["paragraph"]==p["index"])
  assert [w["text"] for w in words]==trial.lib.chapter_words_from_text(p["text"].replace("\n"," "))
  assert any(w["end"]>w["start"] for w in words)
 body=(json.dumps(cand,indent=1,ensure_ascii=False)+"\n").encode();(root/"words.candidate.json").write_bytes(body);candidateHash=hashlib.sha256(body).hexdigest()
 torch.set_num_threads(4);probes=[]
 for name in ["base","small"]:
  if book=="pride-and-prejudice":
   # Reuse independent recognition only after every frozen audio hash matched above.
   probe=json.loads(get("codex/bella-focused-context-20260921","bella-focused-context-2026-09-21",name+"-probe.json"))
   anchors=[]
   for a in probe["all_exact_match_anchors"]:
    w=next(p for p in cand["paragraphs"] if p["paragraph"]==a["paragraph"])["words"][a["word"]]
    assert w["text"]==a["text"]
    anchors.append(dict(a,candidate_start=w["start"],candidate_end=w["end"],max_delta=max(abs(w["start"]-a["probe_start"]),abs(w["end"]-a["probe_end"]))))
   ids=sorted({round(i*(len(anchors)-1)/29) for i in range(30)});selected=[anchors[i] for i in ids]
   within=sum(a["max_delta"]<=.3 for a in selected)
   probe.update(all_exact_match_anchors=anchors,selected_anchors=selected,within_300ms=within,selected_count=len(selected),max_delta=max(a["max_delta"] for a in selected),criterion_met=len(selected)>=30 and within/len(selected)>=.95 and all(a["max_delta"]<=1 for a in selected),reusedRecognitionAudioHashesVerified=True)
  else:
   model=whisper.load_model(name,device="cpu")
   class Decoded:
    def transcribe(self,path,**kwargs):return model.transcribe(decode_audio(str(path),sampling_rate=16000),**kwargs)
   probe=cloud_probe.probe_chapter(Decoded(),e,cand,work,True);probe["model_sha256"]=trial.sha(Path.home()/f".cache/whisper/{name}.pt");del model
  probe["candidate_sha256"]=candidateHash;write(name+"-probe.json",probe)
  probes.append(dict(model=name,passGate=bool(probe["criterion_met"]),within=int(probe["within_300ms"]),maxDelta=float(probe["max_delta"])))
 result=dict(key=key,status="acoustic-pass" if all(p["passGate"] for p in probes) else "acoustic-fail",candidateSha256=candidateHash,changedParagraphs=indices,probes=probes)
 write("result.json",result);print(json.dumps(result),flush=True)
try:main()
except Exception as e:write("error.json",dict(key=key,error=type(e).__name__+": "+str(e),traceback=traceback.format_exc()));raise
