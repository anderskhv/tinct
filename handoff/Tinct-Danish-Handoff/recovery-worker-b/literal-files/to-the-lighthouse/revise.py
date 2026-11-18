import json,pathlib
p=pathlib.Path(__file__).parent
load=lambda f:json.loads((p/f).read_text())
write=lambda f,x:(p/f).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def save(c,end,edits):
 da=load('modern-da.json')if(p/'modern-da.json').exists()else load('source-modern-da.json')
 r=load('review-progress.json')if(p/'review-progress.json').exists()else {'status':'in_progress','reviewedThrough':None,'changes':[],'englishChanges':[]}
 src=load('source-modern-da.json')
 for n,t in edits.items():
  da['chapters'][c-1]['paragraphs'][n-1]=t
  before=src['chapters'][c-1]['paragraphs'][n-1]
  r['changes']=[x for x in r['changes']if(x['chapter'],x['paragraph'])!=(c,n)]
  if before!=t:r['changes'].append({'chapter':c,'paragraph':n,'before':before,'after':t,'reason':'Original-led modern Danish review: preserve imagery and point of view, correct semantic drift and awkward/dated phrasing.'})
 r['reviewedThrough']={'chapter':c,'paragraph':end};write('modern-da.json',da);write('review-progress.json',r)
