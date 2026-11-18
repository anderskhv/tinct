import json,re,collections
from pathlib import Path
D=lambda k:json.load(open('source-walden-'+k+'.json'))['chapters']
d,o,e=[D(x) for x in ['modern-da','original-en','modern-en']]
for c,(dt,ot,et) in enumerate(zip(d,o,e),1):
 hits=[]
 for j,(p,a,b) in enumerate(zip(dt['paragraphs'],ot['paragraphs'],et['paragraphs']),1):
  if re.search(r'\b(?:mile?s?|mil|rod[ms]?|indiansk|ulke?|pout|skovmurmeldyr|lommerne|mudderkat|skovhøne|pund|engelske mil)\b',p,re.I):
   x=re.findall(r'.{0,22}\b(?:mile?s?|mil|rod[ms]?|indiansk|ulke?|pout|skovmurmeldyr|lommerne|mudderkat|skovhøne|engelske mil)\b.{0,22}',p,re.I)
   if x:hits.append((j,x))
 print(c,str(hits)[:1200])
