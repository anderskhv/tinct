"""Context recognition plus whole-paragraph model selection; no fabricated timings."""
import copy,dataclasses,hashlib,json,sys,types,time
from pathlib import Path
import numpy as np
import torch,whisper
from faster_whisper import WhisperModel
sys.path.insert(0,"tools/audio-highlight/aligner")
sys.path.insert(0,"tools/audio-highlight")
import trial,roman_reference_alignment as roman,cloud_probe,publish_timings
lib=trial.lib
root=Path("artifacts/bella-context-repair-2026-09-21");root.mkdir(parents=True,exist_ok=True)
work=Path("/tmp/bella-cohort");cohort=json.loads((work/"cohort.json").read_text())
def write(path,obj):
 path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(json.dumps(obj,indent=2,default=lambda x:x.item() if hasattr(x,"item") else x.tolist()))
oldco=json.loads(Path("artifacts/bella-sync-pilot-2026-09-21/cohort.json").read_text())
for e in cohort:
 old=next(x for x in oldco if x["key"]==e["key"])
 assert [(p["text"],p["sha256"]) for p in old["paragraphs"]]==[(p["text"],p["sha256"]) for p in e["paragraphs"]]
# Choose complete paragraph alignments, not individual timestamps, against every saved anchor.
small=json.loads(Path("artifacts/bella-sync-pilot-2026-09-21/replay/imitation-of-christ/original-en/ch76/auto/words.candidate.json").read_text())
medium=json.loads(Path("artifacts/bella-completion-2026-09-21/out/imitation-of-christ/original-en/ch76/auto/words.candidate.json").read_text())
baseprobe=json.loads(Path("artifacts/bella-sync-pilot-2026-09-21/probe-imitation.json").read_text())[0]
chosen=copy.deepcopy(small);selection=[]
for p in chosen["paragraphs"]:
 i=p["paragraph"];alternative=next(q for q in medium["paragraphs"] if q["paragraph"]==i)
 anchors=[a for a in baseprobe["all_exact_match_anchors"] if a["paragraph"]==i]
 def score(para):
  ds=[]
  for a in anchors:
   w=para["words"][a["word"]];assert w["text"]==a["text"]
   ds.append(max(abs(w["start"]-a["probe_start"]),abs(w["end"]-a["probe_end"])))
  return [sum(x>.3 for x in ds),max(ds,default=9),sum(ds)/max(1,len(ds))]
 selected="small.en";before=score(p);after=score(alternative)
 if alternative["alignment"]["matchRatio"]>=.85 and after<before:
  p.update(copy.deepcopy(alternative));selected="medium.en"
 selection.append(dict(paragraph=i,selectedModel=selected,smallScore=before,mediumScore=after,anchors=len(anchors)))
for f in ["expectedWords","heardWords","matchedWords"]:chosen["alignment"][f]=sum(p["alignment"][f] for p in chosen["paragraphs"])
chosen["alignment"]["matchRatio"]=chosen["alignment"]["matchedWords"]/chosen["alignment"]["expectedWords"]
chosen["model"]="per-paragraph small.en/medium.en"
assert all(p["alignment"]["matchRatio"]>=.85 for p in chosen["paragraphs"])
assert not publish_timings.validate_candidate(chosen,"imitation-of-christ","original-en",76)
dest=root/"out/imitation-of-christ/original-en/ch76/auto/words.candidate.json";write(dest,chosen)
write(root/"paragraph-selection.json",selection)
# Recompute unchanged base criterion over the same complete anchor set and sample indexes.
allanchors=[]
for a in baseprobe["all_exact_match_anchors"]:
 w=next(p for p in chosen["paragraphs"] if p["paragraph"]==a["paragraph"])["words"][a["word"]]
 allanchors.append(dict(a,candidate_start=w["start"],candidate_end=w["end"],max_delta=max(abs(w["start"]-a["probe_start"]),abs(w["end"]-a["probe_end"]))))
indices=sorted({round(i*(len(allanchors)-1)/29) for i in range(30)})
sel=[allanchors[i] for i in indices];within=sum(a["max_delta"]<=.3 for a in sel)
basepass=len(sel)>=30 and within/len(sel)>=.95 and max(a["max_delta"] for a in sel)<=1
write(root/"reused-base-probe.json",dict(criterion_met=basepass,within_300ms=within,selected_count=len(sel),selected_anchors=sel,all_exact_match_anchors=allanchors,audioHashesVerified=True))
print("imitation reused base probe",basepass,within,flush=True)
# Diagnose the short spoken reply with neighboring audio context, retaining its measured offset.
e=next(x for x in cohort if x["key"]=="king-lear/original-en/ch3")
parts=[next(p for p in e["paragraphs"] if p["index"]==i) for i in [1,2,3]]
audios=[whisper.load_audio(str(work/p["path"])) for p in parts]
offset=len(audios[0])/16000;end=offset+len(audios[1])/16000
joined=np.concatenate(audios)
model=WhisperModel("/tmp/bella-medium",device="cpu",compute_type="int8",cpu_threads=4,local_files_only=True)
records=[]
for label,prompt in [("unprompted",None),("full-context", " ".join(p["text"] for p in parts))]:
 kwargs=dict(language="en",word_timestamps=True,vad_filter=False,condition_on_previous_text=False)
 if prompt:kwargs["initial_prompt"]=prompt
 segments,_=model.transcribe(joined,**kwargs)
 raw=[dict(text=w.word,start=w.start,end=w.end,probability=w.probability) for s in segments for w in s.words or []]
 heard=[lib.HeardWord(w["text"].strip(),max(0,w["start"]-offset),min(end-offset,w["end"]-offset)) for w in raw if offset<=(w["start"]+w["end"])/2<end]
 expected=trial.acoustic_tokens(parts[1]["text"]);result=lib.align_tokens_detailed(expected,heard)
 record=dict(mode=label,offset=offset,end=end,raw=raw,heard=[dataclasses.asdict(h) for h in heard],stats=dataclasses.asdict(result.stats),words=result.words)
 records.append(record);write(root/"lear-context-diagnostics.json",records)
 print("lear context",label,result.stats,flush=True)
 if result.stats.match_ratio>=.85:
  candidate=json.loads(Path("artifacts/bella-completion-2026-09-21/out/king-lear/original-en/ch3/auto/words.candidate.json").read_text())
  para=next(p for p in candidate["paragraphs"] if p["paragraph"]==2)
  para["words"]=trial.restore_source_tokens(result.words,lib.chapter_words_from_text(parts[1]["text"]),expected)
  para["alignment"].update(expectedWords=result.stats.expected_words,heardWords=result.stats.heard_words,matchedWords=result.stats.matched_words,matchRatio=result.stats.match_ratio)
  for f in ["expectedWords","heardWords","matchedWords"]:candidate["alignment"][f]=sum(p["alignment"][f] for p in candidate["paragraphs"])
  candidate["alignment"]["matchRatio"]=candidate["alignment"]["matchedWords"]/candidate["alignment"]["expectedWords"]
  assert not publish_timings.validate_candidate(candidate,"king-lear","original-en",3)
  write(root/"out/king-lear/original-en/ch3/auto/words.candidate.json",candidate)
  break
del model
# Fresh independent third check, after paragraph selection; source recordings unchanged.
torch.set_num_threads(4)
probe=whisper.load_model("small",device="cpu")
probes=[];accepted=[]
for e in cohort:
 p=root/"out"/e["key"]/"auto/words.candidate.json"
 if not p.exists():continue
 result=cloud_probe.probe_chapter(probe,e,json.loads(p.read_text()),work,True)
 result["model"]="OpenAI Whisper small CPU unprompted";result["model_sha256"]=trial.sha(Path.home()/".cache/whisper/small.pt");result["candidate_sha256"]=trial.sha(p)
 probes.append(result);write(root/"probes.json",probes)
 if result["criterion_met"] and (not e["key"].startswith("imitation") or basepass):
  b,ed,ch=e["key"].split("/");accepted.append(dict(bookId=b,edition=ed,chapter=int(ch[2:]),path=str(p)))
 write(root/"accepted.json",accepted)
 print("fresh probe",e["key"],result["criterion_met"],result["within_300ms"],flush=True)
