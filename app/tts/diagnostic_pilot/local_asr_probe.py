"""Bounded cached-model probe; machine evidence, not independent listening."""
import difflib,hashlib,json,re,time
from pathlib import Path
import torch,whisper
ROOT=Path(__file__).resolve().parents[3];OUT=ROOT/'output/word-timing-diagnostic-pilot-2026-09-10'
model_path=Path.home()/'.cache/whisper/base.pt'
assert model_path.exists(),'Use existing model only; no implicit download'
torch.set_num_threads(4);model=whisper.load_model(str(model_path),device='cpu');results=[]
def tokens(s):return re.findall(r'\w+',s.lower())
for ch,pi in [(1,0),(2,0),(1,3),(2,11)]:
 e=json.loads((OUT/'chapters'/f'essays-montaigne__original-en__ch{ch}.json').read_text());r=next(r for r in e['audio_samples'] if r['paragraph']==pi)
 source=json.loads((OUT/'editions/essays-montaigne-original-en.json').read_text());chapter=next(c for c in source['chapters'] if c['number']==ch)
 start=time.monotonic();heard=model.transcribe(r['local_path'],language='en',fp16=False,temperature=0,condition_on_previous_text=False)
 matches=sorted([dict(paragraph=i,ratio=difflib.SequenceMatcher(None,tokens(p),tokens(heard['text']),autojunk=False).ratio(),text=p) for i,p in enumerate(chapter['paragraphs'])],key=lambda x:-x['ratio'])[:3]
 results.append(dict(key=e['key'],paragraph=pi,audio_sha256=r['sha256'],model='cached OpenAI Whisper base CPU',model_sha256=hashlib.sha256(model_path.read_bytes()).hexdigest(),seconds=time.monotonic()-start,transcript=heard['text'],segments=heard['segments'],expected=r['text'],best_source_matches=matches,independent_listening=False))
 (OUT/'local-asr-probe.json').write_text(json.dumps(results,indent=2))
 print(ch,pi,heard['text'],[(m['paragraph'],round(m['ratio'],3)) for m in matches],flush=True)
