from inspect_pairs import *
from collections import Counter
from math import log
def w(s):return re.findall('[a-z]+',s.lower().replace('’',"'"))
lens=[]
for n,(oc,dc,ec,wc) in enumerate(zip(*books),1):
 pairs=list(zip(oc['paragraphs'],ec['paragraphs'])); sets=[[Counter(w(v)) for v in pp] for pp in pairs];ct=Counter()
 for pp in sets:
  for s in pp:ct.update(s.keys())
 def sc(a,b):
  return sum(min(y,b.get(x,0))*log(2+len(sets)/ct[x]) for x,y in a.items())/(sum(y*log(2+len(sets)/ct[x]) for x,y in a.items())+.0001)
 for i,(o,e) in enumerate(sets):
  score=sc(o,e); alt=max(((sc(o,sets[j][1]),j) for j in range(max(0,i-4),min(i+5,len(sets))) if j!=i),default=(0,None))
  if sum(o.values())>=10:lens.append((round(score,2),n,i,alt,pairs[i][0][:80]))
put(p/'review'/'lexical-ranking.json',sorted(lens));print(*[x for x in sorted(lens)[:65]],sep='\n')
