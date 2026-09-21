"""Fill a missing native span from observed speech, then independently check the complete new recording."""
import sys,json,hashlib
from pathlib import Path
import torch,whisper
sys.path.insert(0,"tools/audio-highlight/aligner")
import pinned_words_sidecar_lib_v4 as lib
import cloud_probe
root=Path("artifacts/bella-native-repair-pilot-2026-09-21")
source=json.loads((root/"source.json").read_text());candidate=json.loads((root/"words.candidate.json").read_text())
torch.set_num_threads(4);small=whisper.load_model("small",device="cpu");repairs=[]
for p in candidate["paragraphs"]:
 result=small.transcribe(str(root/p["file"]),language="en",word_timestamps=True,temperature=0,condition_on_previous_text=False,fp16=False)
 heard=[lib.HeardWord(w["word"].strip(),w["start"],w["end"]) for s in result["segments"] for w in s.get("words",[])]
 detail=lib.align_tokens_detailed(source["paragraphs"][p["paragraph"]].split(),heard)
 repairs.append(dict(paragraph=p["paragraph"],matchRatio=detail.stats.match_ratio,observed=len(detail.observed),words=len(detail.words),raw=result))
 (root/"observed-repair-progress.json").write_text(json.dumps(repairs,indent=1,default=lambda x:x.item() if hasattr(x,"item") else x.tolist()))
 assert detail.stats.match_ratio>=.97,(p["paragraph"],detail.stats)
 assert len(detail.words)==len(p["words"])
 for i in range(len(p["words"])):
  if i in detail.observed:p["words"][i]=detail.words[i]
  else:assert p["words"][i]["start"] is not None and p["words"][i]["end"] is not None
 p["nativeMissing"]=[]
(root/"native-gap-repairs.json").write_text(json.dumps(repairs,indent=1,default=lambda x:x.item() if hasattr(x,"item") else x.tolist()))
entry=dict(key="meditations/original-en/ch2",group="current-text-Bella-repair",title=source["title"],text_paragraph_count=len(source["paragraphs"]),paragraphs=[])
for p in candidate["paragraphs"]:
 body=(root/p["file"]).read_bytes()
 entry["paragraphs"].append(dict(index=p["paragraph"],file=p["file"],path=p["file"],text=source["paragraphs"][p["paragraph"]],sha256=hashlib.sha256(body).hexdigest(),bytes=len(body),duration=p["duration"],manifest_duration=p["duration"]))
(root/"cohort.json").write_text(json.dumps([entry],indent=1))
body=(json.dumps(candidate,ensure_ascii=False,indent=1)+"\n").encode();(root/"words.reviewed.json").write_bytes(body)
del small
base=whisper.load_model("base",device="cpu")
probe=cloud_probe.probe_chapter(base,entry,candidate,root,True)
probe=json.loads(json.dumps(probe,default=lambda x:x.item() if hasattr(x,"item") else x.tolist()))
probe["candidate_sha256"]=hashlib.sha256(body).hexdigest()
(root/"probe.json").write_text(json.dumps(probe,indent=1))
print(probe["criterion_met"],probe["within_300ms"],probe["max_delta"],flush=True)
if probe["criterion_met"]:
 manifest=json.loads((root/"manifest.candidate.json").read_text());manifest["paragraphs"]=candidate["paragraphs"]
 (root/"manifest.reviewed.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=1))
 (root/"accepted.json").write_text(json.dumps(dict(key=entry["key"],candidateSha256=probe["candidate_sha256"],voice="af_bella",source="current published edition"),indent=1))
else:raise SystemExit("Native timing sample needs further repair; audio preserved")
