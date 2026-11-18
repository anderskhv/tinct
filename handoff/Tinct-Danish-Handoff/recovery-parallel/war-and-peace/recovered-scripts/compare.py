from collate import *
import unicodedata,difflib
a=read('modern-en.json')['chapters'];o=read('upstream/original-en.json')['chapters']
def norm(s):return re.findall(r'[a-z0-9]+',''.join(x for x in unicodedata.normalize('NFKD',s.lower()) if not unicodedata.combining(x)))
flags=[]
for ci,(x,y) in enumerate(zip(a,o),1):
 for pi,(p,q) in enumerate(zip(x['paragraphs'],y['paragraphs']),1):
  v,w=norm(p),norm(q)
  m=difflib.SequenceMatcher(None,w,v,autojunk=False)
  skip=max((i2-i1 for tag,i1,i2,j1,j2 in m.get_opcodes() if tag!='equal'),default=0)
  loss=max((i2-i1-(j2-j1) for tag,i1,i2,j1,j2 in m.get_opcodes()),default=0)
  if loss>=10 or (len(w)>40 and skip>=35):flags.append(dict(chapter=ci,paragraph=pi,unmatched=skip,netloss=loss,length=len(w),ratio=len(p)/len(q)))
put('english-inspection.json',sorted(flags,key=lambda r:-r['netloss']))
print(len(flags));print([(r['chapter'],r['paragraph'],r['netloss']) for r in sorted(flags,key=lambda r:-r['netloss'])[:140]])
