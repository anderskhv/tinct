from inspect_pairs import *
import collections,math
vecs=collections.Counter()
def toks(t):return re.findall('[a-z]{3,}',t.lower())
for b in books[0]:
 for para in b['paragraphs']:vecs.update(set(toks(para)))
def clauses(t):return re.split(r'(?<=[.!?;])\s+|(?<=,—)\s*',t)
def score(t,s):
 a=toks(t);b=set(toks(s));w=lambda x: math.log(1+3835/(1+vecs[x]));return sum(w(x) for x in a if x in b)/(sum(w(x) for x in a)+.00001)
ls=[]
for n,(o,e) in enumerate(zip(books[0],books[2]),1):
 for i,(x,y) in enumerate(zip(o['paragraphs'],e['paragraphs'])):
  for direction,l,r in [('missing',x,y),('addition',y,x)]:
   for cl in clauses(l):
    if len(toks(cl))>=7:ls.append((round(score(cl,r),2),n,i,direction,cl))
put(p/'review'/'phrase-candidates.json',sorted(ls))
for row in sorted(ls):
 if row[0]>.33:break
 print(*row[:4],row[-1][:155])
