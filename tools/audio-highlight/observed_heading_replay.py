import json,sys,hashlib,urllib.request
from pathlib import Path
import whisper,torch
sys.path.insert(0,"tools/audio-highlight/aligner")
from observed_heading_repair import recover
root=Path("artifacts/bella-heading-repair-2026-09-21");root.mkdir(parents=True,exist_ok=True)
base="https://raw.githubusercontent.com/anderskhv/tinct/987da01166ab69e958ac6c6bb4403a797d9cb72e/artifacts/bella-completion-batch-2026-09-21/"
def read(path):return urllib.request.urlopen(base+path).read()
key="war-and-peace/original-en/ch281";folder="pods/tinct-bella-completion-35595402721/out/"+key+"/auto/"
candidate=json.loads(read(folder+"words.candidate.json"))
diag=json.loads(read(folder+"p10.diagnostic.json"));selected=next(a for a in diag["attempts"] if a["mode"]==diag["selected_mode"])
source="MOSCOW, OCTOBER 30, 1812";fixed=recover(source,selected["heard_words"]);assert fixed
for p in candidate["paragraphs"]:
 if p["paragraph"]==10:p["words"]=fixed["words"]
cohort=next(e for e in json.loads(read("review-cohort.json")) if e["key"]==key)
p=next(p for p in cohort["paragraphs"] if p["index"]==10)
url="https://tinct.app/api/audio-file?path="+key+"/p10.mp3"
audio=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"tinct-audio-highlight-audit/1.0"})).read()
assert hashlib.sha256(audio).hexdigest()==p["sha256"]
path=Path("/tmp/bella-heading.mp3");path.write_bytes(audio)
torch.set_num_threads(4);model=whisper.load_model("small",device="cpu")
probe=model.transcribe(str(path),language="en",word_timestamps=True,condition_on_previous_text=False,temperature=0,fp16=False)
heard=[dict(raw=w["word"].strip(),start=w["start"],end=w["end"]) for s in probe["segments"] for w in s.get("words",[])]
independent=recover(source,heard);assert independent
deltas=[max(abs(a["start"]-b["start"]),abs(a["end"]-b["end"])) for a,b in zip(fixed["words"],independent["words"])]
assert len(deltas)==4 and max(deltas)<=.3,deltas
body=(json.dumps(candidate,ensure_ascii=False,indent=1)+"\n").encode()
(root/"words.candidate.json").write_bytes(body)
evidence=dict(key=key,paragraph=10,source=source,recovered=fixed,independent=independent,deltas=deltas,criterion_met=True,candidateSha256=hashlib.sha256(body).hexdigest(),audioSha256=p["sha256"],model="OpenAI Whisper small CPU unprompted",originalChapterProbeRun=35596348457)
(root/"evidence.json").write_text(json.dumps(evidence,indent=1))
print(json.dumps(evidence),flush=True)
