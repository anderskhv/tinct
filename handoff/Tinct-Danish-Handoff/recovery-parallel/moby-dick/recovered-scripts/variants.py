from bs4 import BeautifulSoup
from pathlib import Path
import json,re,difflib
s=BeautifulSoup(Path('source/gutenberg-15.html').read_bytes(),'html.parser'); cs=json.load(open('source/moby-dick-original-en.json'))['chapters']; out=[]
for h,c in zip(s.select('div.chapter'),cs):
 b=[]
 for t in h.find_next_siblings():
  if t.select_one('h2') or t.name=='footer':break
  for z in t.select('.pagenum'): z.decompose()
  b.append(' '.join(t.get_text().split()))
 def toks(s):return re.findall(r'[^\W_]+',s.lower())
 a=toks(' '.join(b));o=toks(' '.join(c['paragraphs'])); gaps=[]
 for k,i,j,x,y in difflib.SequenceMatcher(None,a,o,autojunk=False).get_opcodes():
  if k!='equal' and max(j-i,y-x)>2:gaps.append([i,' '.join(a[max(0,i-6):i]),' '.join(a[i:j]),' '.join(o[x:y]),' '.join(a[j:j+7])])
 if gaps:out.append([c['number'],gaps])
json.dump(out,open('source-15-variants.json','w'),indent=2,ensure_ascii=False)
for n,g in out:print(n,str(g)[:800])
