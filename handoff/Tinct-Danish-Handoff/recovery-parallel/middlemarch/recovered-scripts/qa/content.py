from pathlib import Path
from collections import Counter
import math,re,json
P=Path(__file__).resolve().parents[1]
def ed(k):return json.loads((P/'reference'/(k+'.json')).read_text())['chapters']
o,m=ed('original-en'),ed('modern-en'); common=set('the and she with her him that but them there these which were would might from their should enough between thought those well seemed every upon could said very much been came made what then into they some have more being without went only could since because such this than himself herself very still must else myself little another such there through under when only about also other some very things think nothing again never even most less having know felt down time herself myself many will been himself been itself until than same own for what with before like much most look quite'.split())
def tok(s):return {re.sub(r'(?:ing|ed|s)$','',t) for t in re.findall(r'[a-z]{3,}',s.lower()) if t not in common}
allpars=[p for c in o for p in c['paragraphs']];df=Counter(t for p in allpars for t in tok(p))
rows=[]
for n,(O,M) in enumerate(zip(o,m),1):
 for j,(src,mod) in enumerate(zip(O['paragraphs'],M['paragraphs'])):
  masked=re.sub(r'\b(Mrs?|Dr|St|Sts|Rev|Messrs)\.',r'\1¶',src)
  for sent in re.split(r'(?<=[.?!])\s+|(?<=[;])\s+(?=[a-z])',masked):
   sent=sent.replace('¶','.');a=tok(sent);b=tok(mod)
   if len(a)<8:continue
   wt=lambda t:math.log(1+len(allpars)/(1+df[t]))
   score=sum(wt(t) for t in a&b)/sum(wt(t) for t in a)
   if score<.35:rows.append({'unit':n,'paragraphIndex':j,'score':round(score,3),'sentence':sent,'candidate':mod})
(P/'qa/english-lexical-triage.json').write_text(json.dumps(sorted(rows,key=lambda v:v['score']),ensure_ascii=False,indent=1))
for x in sorted(rows,key=lambda v:v['score'])[:24]:print(x['unit'],x['paragraphIndex'],x['sentence'][:210],x['candidate'][:80])
