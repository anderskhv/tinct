import json
from pathlib import Path
P=Path('/tmp/tinct-da-prep-20261104/vindication-rights-of-woman')
def save(ch,start,texts,reason='Full original-led revision into current Danish, preserving argument, quotation, emphasis and source meaning.'):
 d=json.loads((P/'modern-da.json').read_text());r=json.loads((P/'review-progress.json').read_text());s=json.loads((P/'source-modern-da.json').read_text())
 for j,t in enumerate(texts,start-1):
  before=s['chapters'][ch-1]['paragraphs'][j]
  d['chapters'][ch-1]['paragraphs'][j]=t
  found=next((x for x in r['changes'] if x['chapter']==ch and x['paragraph']==j+1),None)
  if before!=t:
   entry=dict(chapter=ch,paragraph=j+1,before=before,after=t,reason=reason)
   if found:found.update(entry)
   else:r['changes'].append(entry)
 r['progress']={'chapter':ch,'paragraph':start+len(texts)-1}
 if r['progress']['paragraph']==len(d['chapters'][ch-1]['paragraphs']) and ch not in r['reviewedChapters']:r['reviewedChapters'].append(ch)
 (P/'modern-da.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(P/'review-progress.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
 print(r['progress'])
