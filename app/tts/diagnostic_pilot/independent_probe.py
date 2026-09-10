"""Unprompted cached base-model agreement check; not human timing certification."""
import difflib,hashlib,json,time
from pathlib import Path
import torch,whisper
import pinned_words_sidecar_lib as lib
ROOT=Path('/Users/andershvelplund/Documents/Projects/Tinct');OUT=ROOT/'output/word-timing-diagnostic-pilot-2026-09-10';RUN=OUT/'cpu-canary-run01'
def main():
 modelpath=Path.home()/'.cache/whisper/base.pt';assert modelpath.exists();torch.set_num_threads(4);model=whisper.load_model(str(modelpath),device='cpu');results=[]
 for e in json.loads((OUT/'cpu-canary.json').read_text()):
  candidate=json.loads((RUN/e['key']/'auto/words.candidate.json').read_text());anchors=[];records=[]
  for p in e['paragraphs']:
   path=OUT/p['path'];assert hashlib.sha256(path.read_bytes()).hexdigest()==p['sha256'];start=time.monotonic();result=model.transcribe(str(path),language='en',fp16=False,temperature=0,condition_on_previous_text=False,word_timestamps=True)
   heard=[w for s in result['segments'] for w in s.get('words',[])];words=next(r['words'] for r in candidate['paragraphs'] if r['paragraph']==p['index']);ops=difflib.SequenceMatcher(None,[lib.canonical_alignment_token(w['text']) for w in words],[lib.canonical_alignment_token(w['word']) for w in heard],autojunk=False).get_opcodes()
   for tag,i1,i2,j1,j2 in ops:
    if tag=='equal':
     for i in range(i1,i2):
      w=words[i];h=heard[j1+i-i1];anchors.append(dict(paragraph=p['index'],word=i,text=w['text'],candidate_start=w['start'],probe_start=h['start'],candidate_end=w['end'],probe_end=h['end']))
   records.append(dict(paragraph=p['index'],seconds=time.monotonic()-start,raw_segments=result['segments']))
  indexes=sorted({round(i*(len(anchors)-1)/29) for i in range(30)}) if anchors else [];selected=[anchors[i] for i in indexes]
  for a in selected:a['max_delta']=max(abs(a['candidate_start']-a['probe_start']),abs(a['candidate_end']-a['probe_end']))
  within=sum(a['max_delta']<=.3 for a in selected);r=dict(key=e['key'],model='cached OpenAI Whisper base CPU, unprompted',model_sha256=hashlib.sha256(modelpath.read_bytes()).hexdigest(),human_listening=False,raw=records,all_exact_match_anchors=anchors,selected_anchors=selected,within_300ms=within,selected_count=len(selected),max_delta=max([a['max_delta'] for a in selected],default=None),criterion_met=len(selected)>=30 and within/len(selected)>=.95 and all(a['max_delta']<=1 for a in selected))
  results.append(r);(OUT/'independent-probe.json').write_text(json.dumps(results,indent=2,default=lambda v:v.item() if hasattr(v,"item") else v.tolist()));print(e['key'],within,'/',len(selected),'max',r['max_delta'],flush=True)
if __name__=='__main__':main()
