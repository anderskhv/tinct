import json,re,collections,math
from pathlib import Path
def rd(f):return json.loads(Path(f).read_text())
def wr(f,d):Path(f).write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
o,e=[rd(f)['chapters'] for f in ('source-walden-original-en.json','walden-modern-en.partial.json')]
def terms(s):
 out=[]
 for w in re.findall(r"[a-zA-Z]{3,}",s.lower()):
  w=re.sub(r'(?:ing|ed|es|s)$','',w)
  if w not in stop:out.append(w)
 return set(out)
stop=set('about above after again along also among and any are around because been before being both but can could did does each even ever for from had has have her his how into its man may more most not now only other our out over she some than that the their them then there these they thi thi thos this tho those through too upon very was way well were what when where which while who will with would you your'.split())
freq=collections.Counter();allrows=[]
for c,(x,y) in enumerate(zip(o,e),1):
 for i,(a,b) in enumerate(zip(x['paragraphs'],y['paragraphs']),1):
  allrows.append((c,i,a,b));freq.update(terms(a)|terms(b))
audit=[];sus=[]
for c,i,a,b in allrows:
 aw=terms(a);bw=terms(b)
 weights=lambda t:sum(math.log(503/(1+freq[w])) for w in t)
 sentences=[s.strip() for s in re.split(r'(?<=[.?!;])\s+',a) if len(s.split())>=7]
 signals=[]
 for s in sentences:
  t=terms(s)
  if len(t)>=4:
   f=weights(t&bw)/(weights(t) or 1)
   if f<0.40: signals.append((round(f,2),s))
 for f,s in signals:sus.append((f,c,i,s))
 aNum=re.findall(r'\b\d+(?:\.\d+)?[¼½¾]?',a); bNum=re.findall(r'\b\d+(?:\.\d+)?[¼½¾]?',b)
 audit.append({'slot':f'{c}:{i}','originalWords':len(a.split()),'modernEnglishWords':len(b.split()),'tokenFiguresAbsentVerbatim':[v for v in aNum if v not in bNum],'lowLexicalOverlapSegments':signals})
wr('english-slot-audit.json',audit)
print(len(sus),'segment flags; lowest scores')
for f,c,i,s in sorted(sus)[:50]:print(f,c,i,s[:100])
