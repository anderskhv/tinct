"""Review and conditionally publish the single verified Macbeth canary."""
import importlib.util,json,hashlib,sys
from pathlib import Path
ROOT=Path('/Users/andershvelplund/Documents/Projects/Tinct');OUT=ROOT/'output/word-timing-diagnostic-pilot-2026-09-10';key='macbeth/original-en/ch1';directory=OUT/'cpu-canary-run01'/key/'auto'
def main():
 probe=next(e for e in json.loads((OUT/'independent-probe.json').read_text()) if e['key']==key)
 assert probe['criterion_met'] and probe['selected_count']>=30
 chapter=json.loads((directory/'chapter.json').read_text());assert chapter['status']=='candidate_requires_acoustic_review'
 candidate=json.loads((directory/'words.candidate.json').read_text());totals=dict(expectedWords=0,heardWords=0,matchedWords=0)
 for p in candidate['paragraphs']:
  d=json.loads((directory/f"p{p['paragraph']}.diagnostic.json").read_text());selected=next(a for a in d['attempts'] if a['mode']==d['selected_mode']);assert not selected['rejection_reasons'];assert p['words']==selected['candidate_words'];stats=selected['stats']
  p['alignment']=dict(expectedWords=stats['expected_words'],heardWords=stats['heard_words'],matchedWords=stats['matched_words'],matchRatio=selected['match_ratio'],bias=d['selected_mode'])
  for field in totals:totals[field]+=p['alignment'][field]
 candidate.update(model='small.en',language='en',alignment=dict(**totals,matchRatio=totals['matchedWords']/totals['expectedWords'],minimumParagraphRatio=.85,bias='auto',biasRetryBelow=1.0))
 publication=OUT/'publication';dest=publication/'recovered'/key/'words.json';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(candidate,indent=2,ensure_ascii=False))
 spec=importlib.util.spec_from_file_location('recovery',ROOT/'output/audio-recovery-publication-2026-09-09/recover.py');rec=importlib.util.module_from_spec(spec);spec.loader.exec_module(rec);rec.OUT=publication
 item=dict(pod='local-cpu-canary',key=key+'/words.json',sha256=hashlib.sha256(dest.read_bytes()).hexdigest());result=rec.audit(item);(publication/'audit.json').write_text(json.dumps([result],indent=2));print('audit errors',result['errors'],flush=True);assert not result['errors']
 if '--publish' in sys.argv:rec.publish([result],'publication.json')
if __name__=='__main__':main()
