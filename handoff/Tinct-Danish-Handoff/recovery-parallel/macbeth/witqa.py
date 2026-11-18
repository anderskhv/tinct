from prep import *
import difflib,bisect
w=(p/'witness.txt').read_text().split('*** END OF')[0]
sc=re.split(r'^SCENE [IVX]+\.[^\n]*\n',w,flags=re.M)[1:]
norm=lambda s:re.findall(r'[^\W_]+',s.casefold())
vars=[]
for j,(c,t) in enumerate(zip(en,sc),1):
 slots=[norm(s) for s in c['paragraphs']];bounds=[];a=[]
 for s in slots:bounds.append(len(a));a+=s
 b=norm(re.sub(r'^ACT [IVX]+\s*$','',t,flags=re.M))
 for op,l,h,x,y in difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes():
  if op=='equal':continue
  pass
  n=bisect.bisect_right(bounds,l);idx=l-bounds[n-1];vars.append({'scene':j,'slot':n,'offset':idx,'kind':op,'repoTokens':' '.join(a[l:h]),'missingWitnessTokens':' '.join(b[x:y]),'context':' '.join(a[l-5:l])+' | '+' '.join(a[l:l+5])})
 print(j,len(a),len(b))
wr('source-witness-variants.json',vars)
for v in vars:print(v['scene'],v['slot'],v['offset'],v['missingWitnessTokens'],v['context'])
