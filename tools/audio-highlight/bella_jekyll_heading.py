"""Repair the observed speaker-name heading using transcript context, without changing audio."""
import json,sys,hashlib
from pathlib import Path
import torch,whisper
sys.path.insert(0,"tools/audio-highlight")
sys.path.insert(0,"tools/audio-highlight/aligner")
import prodapi,cloud_cohort,cloud_probe
from observed_heading_repair import recover
root=Path("artifacts/bella-jekyll-heading-2026-09-21");root.mkdir(parents=True,exist_ok=True)
work=Path("/tmp/bella-jekyll");work.mkdir(exist_ok=True)
target=dict(bookId="jekyll-and-hyde",edition="original-en",chapter=9)
e=cloud_cohort.build(target,work,"existing-timing-heading-repair",{})
assert "dropped" not in e,e
(root/"cohort.json").write_text(json.dumps([e],indent=1))
status,candidate,old=prodapi.chapter_words(target["bookId"],target["edition"],9);assert status==200
(root/"previous-words.json").write_bytes(old)
p=next(p for p in e["paragraphs"] if p["index"]==33)
assert p["sha256"]=="90725a350dbc35335c5dc39e5d0c62745ca51518bbbf83ac5e111c26914f8b26"
torch.set_num_threads(4);small=whisper.load_model("small",device="cpu")
attempts=[];chosen=None
for prompt in [None,"The speaker's name is Dr. Hastie Lanyon. HASTIE LANYON."]:
 kwargs=dict(language="en",word_timestamps=True,temperature=0,fp16=False,condition_on_previous_text=False)
 if prompt:kwargs["initial_prompt"]=prompt
 result=small.transcribe(str(work/p["path"]),**kwargs)
 heard=[dict(raw=w["word"].strip(),start=w["start"],end=w["end"]) for s in result["segments"] for w in s.get("words",[])]
 fixed=recover(p["text"],heard)
 attempts.append(dict(prompt=prompt,heard=heard,recovered=fixed))
 (root/"attempts.json").write_text(json.dumps(attempts,indent=1))
 if fixed:chosen=fixed;break
assert chosen,"Context recognition did not establish all source words; diagnostics preserved"
entry=next(x for x in candidate["paragraphs"] if x["paragraph"]==33);entry["words"]=chosen["words"]
body=(json.dumps(candidate,ensure_ascii=False,indent=1)+"\n").encode();(root/"words.candidate.json").write_bytes(body)
del small
base=whisper.load_model("base",device="cpu")
probe=cloud_probe.probe_chapter(base,e,candidate,work,True)
probe=json.loads(json.dumps(probe,default=lambda x:x.item() if hasattr(x,"item") else x.tolist()))
probe["candidate_sha256"]=hashlib.sha256(body).hexdigest();probe["previous_sha256"]=hashlib.sha256(old).hexdigest()
(root/"probe.json").write_text(json.dumps(probe,indent=1))
print(probe["criterion_met"],probe["within_300ms"],probe["max_delta"])
assert probe["criterion_met"]
