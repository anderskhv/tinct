from revise import *
def apply(c,end,items):
 x=load('modern-da.json')['chapters'][c-1]['paragraphs']
 e={}
 for i,pairs in items.items():
  t=x[i-1]
  for a,b in pairs:
   assert a in t,(i,a)
   t=t.replace(a,b)
  e[i]=t
 save(c,end,e)
