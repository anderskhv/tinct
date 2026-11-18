from collate import *
import sys
da=read('modern-da.json')['chapters'];en=read('modern-en.json')['chapters'];o=read('upstream/original-en.json')['chapters'];cs=read('change-record.json')
candidates=[]
for f in (D/'chapters').glob('semantic-*.json'):
 c=int(f.stem.split('-')[1])
 for r in json.loads(f.read_text()):
  p=r['paragraph'];s=r['source'];q=o[c-1]['paragraphs'][p-1];t=da[c-1]['paragraphs'][p-1]
  if r['language']!='da' or len(s)<40 or any(x['chapter']==c and x['paragraph']==p and x['language']=='da' for x in cs):continue
  score=r['score'];ratio=len(t)/len(q)
  if score<.26 or (ratio<.85 and score<.42):
   rank=score+max(-.25,min(.05,ratio-.9))+(0 if len(s)>65 else .06)
   candidates.append((rank,c,p,score,round(ratio,2),s,t))
seen=set()
for row in sorted(candidates):
 rank,c,p,score,ratio,s,t=row
 if (c,p) in seen:continue
 seen.add((c,p))
 print(f'{c}.{p} {score} {ratio}',s[:125],' | ',t[:120])
 if len(seen)>=int(sys.argv[1]):break
