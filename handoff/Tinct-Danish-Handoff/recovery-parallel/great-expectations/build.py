from inspect_pairs import *
outputs={}
for lang,baseline,previous in [('da','wip-da','modern-da'),('en','modern-en','modern-en')]:
 out={'chapters':get(src/(baseline+'.json'))['chapters']};old=get(src/(previous+'.json'))['chapters'];ledger=[]
 for ix,c in enumerate(out['chapters'],1):
  base=list(c['paragraphs']); cf=p/'changes'/f'{ix}-{lang}.tsv'
  if cf.exists():
   seen=set()
   for line in cf.read_text().splitlines():
    i,t=line.split('\t',1);i=int(i)%len(base);assert i not in seen and t.strip();seen.add(i);c['paragraphs'][i]=t
  for i,(a,b,t) in enumerate(zip(old[ix-1]['paragraphs'],base,c['paragraphs'])):
   if a!=t:ledger.append(dict(chapter=ix,paragraphIndex=i,before=a,after=t,reason=('source and oral-voice edit' if t!=b else 'retained editorial WIP Danish variant')))
  put(p/'chapters'/f'{ix:03}-{lang}.json',c)
 outputs[lang]=out;put(p/('modern-'+lang+'.json'),out);put(p/('modern-'+lang+'-ledger.json'),ledger)
