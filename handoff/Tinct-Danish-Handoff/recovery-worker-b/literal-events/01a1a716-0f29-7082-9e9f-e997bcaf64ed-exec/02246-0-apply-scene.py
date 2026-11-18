import json,pathlib,sys,hashlib
p=pathlib.Path(__file__).parent;n=int(sys.argv[1]);counts=[len(c['paragraphs'])for c in json.loads((p/'source-hamlet-original-en.json').read_text())['chapters']];batch=[]
for lang in ('da','en'):
 f=p/f'candidate-hamlet-modern-{lang}.json';d=json.loads(f.read_text());lf=p/('DANISH-REPAIRS.json'if lang=='da'else'ENGLISH-REPAIRS.json');a=json.loads(lf.read_text())if lf.exists()else[];spec=json.loads((p/f'scene-{n:02}-{lang}.json').read_text())
 if lang=='da':assert set(spec)==set(map(str,range(1,counts[n-1]+1)))
 for slot,changes in spec.items():
  i=int(slot)-1;s=d['chapters'][n-1]['paragraphs'][i]
  if lang=='da':changes=[[s,changes]]
  for old,new in changes:
   assert old in s,(lang,n,slot,old)
   if old!=new:a.append(dict(chapter=n,paragraph=i+1,before=old,after=new,reason='Full source-led scene review against PG1524: modern Danish dramatic voice/verse sense or clear English meaning repair.'));s=s.replace(old,new)
  d['chapters'][n-1]['paragraphs'][i]=s
 assert [len(c['paragraphs'])for c in d['chapters']]==counts
 batch.append((f,d,lf,a))
for f,d,lf,a in batch:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');lf.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
progress={'reviewed_scenes':list(range(1,n+1)),'reviewed_slots':sum(counts[:n]),'total_scenes':20,'total_slots':sum(counts),'native_review':'pending','no_release':True,'status':'in-progress'}
(p/'PROGRESS.json').write_text(json.dumps(progress,indent=2)+'\n');print(progress)
