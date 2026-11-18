import json,pathlib,sys
p=pathlib.Path(__file__).parent;n=int(sys.argv[1]);spec=json.load(open(p/f'review-{n:03}.json'));pack=[]
for lang,key in [('da','DANISH'),('en','ENGLISH')]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.load(open(f));rf=p/f'{key}-REPAIRS.json';r=json.load(open(rf));c=d['chapters'][n-1]
 for sn,pairs in spec.get(lang,{}).items():
  for a,b in pairs:
   assert a in c['paragraphs'][int(sn)-1],(lang,sn,a)
   c['paragraphs'][int(sn)-1]=c['paragraphs'][int(sn)-1].replace(a,b);r.append(dict(chapter=n,paragraph=int(sn),before=a,after=b,reason=spec['reason']))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
(p/f'SOURCE-NOTES-{n:03}.txt').write_text(spec['notes']+'\n')
