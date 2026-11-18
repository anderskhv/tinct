from pathlib import Path
from bs4 import BeautifulSoup
import json,ast,re
R=Path(__file__).parent
s=BeautifulSoup((R/'source/gutenberg-15.html').read_bytes(),'html.parser');h=[t for t in s.select('h3') if 'EXTRACTS' in t.get_text()][-1];o=[];b=[]
for t in h.find_next_siblings():
 if t.find('h2'):break
 if t.name=='hr':continue
 if 'right' in t.get('class',[]):o.append({'en':'\n'.join(b),'credit':' '.join(t.get_text().split())});b=[];continue
 v=' '.join(t.get_text().split())
 if v:b.append(v)
assert len(o)==76
(R/'source/extracts-15.json').write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
# Exact historical inline changes extracted as literal data, then reviewed.
calls=json.loads(next(R.parent.glob('*15-14-05*.calls.json')).read_text());record=next(e for e in calls if e['ordinal']==443)
s=record['input'].split('e=[',1)[1].split('\nv=',1)[0];items=ast.literal_eval('['+s)
items += [('en',91,26,'he was a Cologne manufacturer before','he used to make eau de cologne'),('en',96,7,'With the hatch lifted off the top of the works, there was now a wide hearth in front of them.','The hatch cover, lifted off the works and set down in front, now served as a broad hearth.'),('en',132,12,'the dry nourishment of my soil!','the dry nourishment of my soul!')]
(R/'qa/semantic-edits.json').write_text(json.dumps([dict(language=l,chapter=n,slot=j,before=a,after=b) for l,n,j,a,b in items],ensure_ascii=False,indent=2)+'\n')
p=R/'prose.txt';s=p.read_text().replace('Det er en fed nat til det.','det er en fed nat til det.').replace('Det er lige natten til det.','det er lige natten til det.').replace('64|i stævnen|i stævnen\n','').replace('en dyb høl i åen','et dybt høl i åen').replace('54|Kære mine herrer|Mine kære herrer\n','');p.write_text(s)
p=R/'assemble.py';s=p.read_text().replace("orig=verse[k].get_text().strip()","orig=verse[k].get_text().replace('\\r\\n','\\n').strip()").replace("q=special_da.get((n,j),q)","q=special_da.get((n,j),q)\n    q=longer.get(f'{n}.{j}',q)").replace('candidates={','longer=load("qa/passages-da.json")\ncandidates={');p.write_text(s)
