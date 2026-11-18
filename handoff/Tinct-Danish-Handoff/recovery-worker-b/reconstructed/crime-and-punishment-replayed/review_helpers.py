from pathlib import Path
import json
p=Path(__file__).parent
def rd(f):return json.loads((p/f).read_text())
def wr(f,o):(p/f).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def fixes(lang,c,i,reps):
 doc=rd('modern-'+lang+'.json');s=doc['chapters'][c-1]['paragraphs'][i-1]
 for a,b in reps:
  assert a in s,(c,i,a)
  s=s.replace(a,b)
 doc['chapters'][c-1]['paragraphs'][i-1]=s;wr('modern-'+lang+'.json',doc)
def setslot(lang,c,i,s):
 doc=rd('modern-'+lang+'.json');doc['chapters'][c-1]['paragraphs'][i-1]=s;wr('modern-'+lang+'.json',doc)
def ledger():
 original=rd('source-original-en.json')
 for lang in ['da','en']:
  a=rd('source-modern-'+lang+'.json');b=rd('modern-'+lang+'.json');ls=[]
  for c,(x,y) in enumerate(zip(a['chapters'],b['chapters']),1):
   assert len(x['paragraphs'])==len(y['paragraphs'])
   for i,(s,t) in enumerate(zip(x['paragraphs'],y['paragraphs']),1):
    if s!=t:ls.append({'chapter':c,'slot':i,'original':original['chapters'][c-1]['paragraphs'][i-1],'before':s,'after':t})
  wr('working-'+lang+'-changes.json',ls)
