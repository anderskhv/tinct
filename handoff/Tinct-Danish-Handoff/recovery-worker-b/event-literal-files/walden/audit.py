import json,re,difflib,collections
from pathlib import Path
from bs4 import BeautifulSoup
def rd(f):return json.loads(Path(f).read_text())
def save(f,v):Path(f).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
s=BeautifulSoup(Path('primary-thoreau.html').read_bytes(),'html.parser')
ds=[rd('source-walden-'+l+'.json')['chapters'] for l in ['original-en','modern-en','modern-da']]
def w(t):return re.findall(r'\w+',t.casefold().replace('æ','ae').replace('œ','oe').replace('_',''))
aud=[];features=[]
for i,o in enumerate(ds[0],1):
 a=s.find(id=f'chap{i+1:02}').parent.parent;f=a.find('h2');f.extract();texts=[]
 for t in a.find_all(recursive=False):
  if t.name=='p' and (t.find('br') or t.get('class') or t.find('img')) or t.name not in ['p','hr']:
   features.append({'chapter':i,'htmlTag':t.name,'class':t.get('class'),'text':t.get_text(' ',strip=True),'html':str(t)})
  texts.append(t.get_text(' ',strip=True))
 primary=w(' '.join(texts));corpus=w(' '.join(o['paragraphs']));mt=difflib.SequenceMatcher(None,primary,corpus,autojunk=True);flags=[]
 for typ,x,y,z,h in mt.get_opcodes():
  if typ!='equal' and max(y-x,h-z)>7: flags.append([typ,y-x,h-z,' '.join(primary[x:y])[:250],' '.join(corpus[z:h])[:250]])
 aud.append(dict(chapter=i,slots=len(o['paragraphs']),primaryWords=len(primary),originalReaderWords=len(corpus),flags=flags))
save('primary-comparison.json',aud);save('primary-special-blocks.json',features)
print([(a['chapter'],a['primaryWords'],a['originalReaderWords'],len(a['flags'])) for a in aud]);print(collections.Counter((x['htmlTag'],str(x['class'])) for x in features))
for i,c in enumerate(ds[0]):
 for j,p in enumerate(c['paragraphs']):
  if 'img' in p or '|' in p or re.search(r'\$[0-9]',p) and len(p)<650:print(i+1,j+1,p[:118])
