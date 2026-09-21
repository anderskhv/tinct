"""Stage a current-text Bella repair with native token timing; never upload."""
import sys,json,hashlib,importlib.util,re,subprocess,dataclasses
from pathlib import Path
import numpy as np,soundfile as sf,torch
from huggingface_hub import hf_hub_download
from kokoro import KModel,KPipeline
sys.path.insert(0,"tools/audio-highlight")
import prodapi
root=Path("artifacts/bella-native-repair-pilot-2026-09-21");root.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location("existing_kokoro","app/tts/generate-audio-kokoro.py");old=importlib.util.module_from_spec(spec);spec.loader.exec_module(old)
repo="hexgrad/Kokoro-82M";revision="f3ff3571791e39611d31c381e3a41a3af07b4987"
files={n:hf_hub_download(repo,filename=n,revision=revision) for n in ["config.json","kokoro-v1_0.pth","voices/af_bella.pt"]}
torch.set_num_threads(4)
model=KModel(repo_id=repo,config=files["config.json"],model=files["kokoro-v1_0.pth"]).to("cpu").eval()
pipeline=KPipeline(lang_code="a",repo_id=repo,model=model)
run=dict(model=repo,revision=revision,voice="af_bella",speed=1,sampleRate=24000,fileHashes={n:hashlib.sha256(Path(p).read_bytes()).hexdigest() for n,p in files.items()},publication=False)
(root/"run.json").write_text(json.dumps(run,indent=1))
book,edition,ch="meditations","original-en",2
status,text=prodapi.edition_text(book,edition);assert status==200
chapter=next(c for c in text["chapters"] if c["number"]==ch)
(root/"source.json").write_text(json.dumps(chapter,ensure_ascii=False,indent=1))
key=f"{book}/{edition}/ch{ch}";sidecar=dict(bookId=book,editionKey=edition,chapter=ch,title=chapter["title"],method="kokoro-native-durations",voiceId="af_bella",paragraphs=[])
manifest=dict(chapter=ch,title=chapter["title"],voiceId="af_bella",modelRevision=revision,paragraphs=[])
for i,source in enumerate(chapter["paragraphs"]):
 clean=old.clean_text(source.replace("\n"," "));audio=[];tokens=[];offset=0
 for result in pipeline(clean,voice=files["voices/af_bella.pt"],speed=1):
  a=result.audio.detach().cpu().numpy();audio.append(a)
  for t in result.tokens:
   tokens.append(dict(text=t.text,whitespace=t.whitespace,start=None if t.start_ts is None else offset+float(t.start_ts),end=None if t.end_ts is None else offset+float(t.end_ts)))
  offset+=len(a)/24000
 (root/f"p{i}.native.json").write_text(json.dumps(dict(source=source,clean=clean,tokens=tokens),ensure_ascii=False,indent=1))
 assert audio,"no generated audio"
 samples=np.concatenate(audio);wav=root/f"p{i}.wav";sf.write(wav,samples,24000)
 # Reconstruct the tokenizer's exact character spans, then group them by source whitespace words.
 rendered="";spans=[]
 for t in tokens:
  start=len(rendered);rendered+=t["text"];end=len(rendered);rendered+=t["whitespace"]
  spans.append((start,end,t))
 expected=source.split();clean_words=clean.split();render_words=list(re.finditer(r"\S+",rendered))
 assert len(expected)==len(clean_words)==len(render_words),(i,len(expected),len(clean_words),len(render_words))
 assert [m.group() for m in render_words]==clean_words,(i,"tokenizer text changed")
 words=[]
 for raw,match in zip(expected,render_words):
  timed=[t for start,end,t in spans if start<match.end() and end>match.start() and t["start"] is not None and t["end"] is not None]
  assert timed,(i,raw,"missing native timing")
  words.append(dict(text=raw,start=round(min(t["start"] for t in timed),4),end=round(max(t["end"] for t in timed),4)))
 assert all(0<=w["start"]<w["end"]<=offset+.1 for w in words)
 mp3=root/f"p{i}.mp3"
 subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(wav),"-codec:a","libmp3lame","-b:a","128k",str(mp3)],check=True)
 sha=hashlib.sha256(mp3.read_bytes()).hexdigest();name=f"bella-repair-{sha[:16]}-p{i}.mp3";mp3.rename(root/name);wav.unlink()
 row=dict(paragraph=i,file=name,duration=offset,words=words)
 sidecar["paragraphs"].append(row);manifest["paragraphs"].append(row)
 (root/"words.candidate.json").write_text(json.dumps(sidecar,ensure_ascii=False,indent=1))
 (root/"manifest.candidate.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=1))
 print(i,len(expected),round(offset,2),sha,flush=True)
(root/"complete.json").write_text(json.dumps(dict(key=key,paragraphs=len(sidecar["paragraphs"]),words=sum(len(p["words"]) for p in sidecar["paragraphs"]),sourceSha256=hashlib.sha256(json.dumps(chapter,ensure_ascii=False,sort_keys=True).encode()).hexdigest()),indent=1))
