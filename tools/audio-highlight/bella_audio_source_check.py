"""Read-only acoustic checks for genuinely mismatched source and zero-span suspects."""
import sys,json,hashlib,urllib.request,difflib
from pathlib import Path
import torch,whisper
sys.path.insert(0,"tools/audio-highlight")
sys.path.insert(0,"tools/audio-highlight/aligner")
import prodapi
import pinned_words_sidecar_lib_v4 as lib
root=Path("artifacts/bella-audio-source-check-2026-09-21");root.mkdir(parents=True,exist_ok=True)
torch.set_num_threads(4);model=whisper.load_model("small",device="cpu");records=[]
targets=[("jekyll-and-hyde","original-en",9,33,None),("bible","web-en",1062,5,None),("meditations","original-en",1,0,"bd6dbef360c5db6d2cb4c2a65e09461354ff966e"),("meditations","original-en",1,1,"bd6dbef360c5db6d2cb4c2a65e09461354ff966e"),("faust-part-1","original-en",1,0,"08c2971e4617df9b8876dff58bd8d31269952282"),("faust-part-1","original-en",1,1,"08c2971e4617df9b8876dff58bd8d31269952282")]
def norm(text):return [lib.normalize_token(x) for x in text.split() if lib.normalize_token(x)]
def best_match(text,edition):
 heard=norm(text);best=(0,None)
 for c in edition["chapters"]:
  for i,p in enumerate(c["paragraphs"]):
   ratio=difflib.SequenceMatcher(None,heard,norm(p),autojunk=False).ratio()
   if ratio>best[0]:best=(ratio,dict(chapter=c["number"],paragraph=i,text=p))
 return dict(ratio=best[0],match=best[1])
for b,e,ch,p,old in targets:
 key=f"{b}/{e}/ch{ch}";status,manifest=prodapi.chapter_manifest(b,e,ch)
 r=next((x for x in manifest["paragraphs"] if x["paragraph"]==p),None)
 if not r:records.append(dict(key=key,paragraph=p,error="no recording entry"));continue
 status,audio=prodapi.audio_object(key+"/"+r["file"]);assert status==200
 path=Path("/tmp/bella-source-check.mp3");path.write_bytes(audio)
 result=model.transcribe(str(path),language="en",word_timestamps=True,condition_on_previous_text=False,temperature=0,fp16=False)
 words=[dict(raw=w["word"].strip(),start=w["start"],end=w["end"]) for s in result["segments"] for w in s.get("words",[])]
 status,current=prodapi.edition_text(b,e);assert status==200
 row=dict(key=key,paragraph=p,file=r["file"],duration=r["duration"],audioSha256=hashlib.sha256(audio).hexdigest(),heard=result["text"],heardWords=words,currentBest=best_match(result["text"],current))
 if old:
  historical=json.load(urllib.request.urlopen(f"https://raw.githubusercontent.com/anderskhv/tinct/{old}/app/public/data/editions/{b}-{e}.json"))
  row["oldCommit"]=old;row["oldBest"]=best_match(result["text"],historical)
 records.append(row);(root/"results.json").write_text(json.dumps(records,indent=1));print(json.dumps(row),flush=True)
