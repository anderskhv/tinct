from review import *
from bs4 import BeautifulSoup
def save(p,v):Path(p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def plain(t):return re.sub(r'\s+',' ',t.get_text()).strip()
s=BeautifulSoup(Path('source/gutenberg-15.html').read_bytes(),'html.parser'); h=s.select('h3')[-1]
eng=[];body=[]
for t in h.find_next_siblings():
 if t.find('h2'):break
 if t.name=='hr':continue
 cl=t.get('class',[])
 if 'right' in cl or 'right-container' in cl:
  raw=plain(t)
  for a,b in [('ofExtending','of Extending'),('theFrench','the French'),('Etchingsof','Etchings of'),('Taking andRetaking','Taking and Retaking'),('theSperma','the Sperma'),('Africa.Harris','Africa. Harris'),('1671.Harris','1671. Harris'),('Lucian.“','Lucian. “')]:raw=raw.replace(a,b)
  eng.append({'text':'\n'.join(body),'credit':raw});body=[]
 elif t.select('.stanza'):
  body.append('\n\n'.join('\n'.join(plain(line) for line in stanza.find_all(recursive=False)) for stanza in t.select('.stanza')))
 elif plain(t):body.append(plain(t))
assert len(eng)==80 and not body
save('source/extracts-15-separated.json',eng)
f=load('front-matter-en.json');d=load('front-matter-da.json')
f[2]['paragraphs']=f[2]['paragraphs'][:4]+[t['text']+' — '+t['credit'] for t in eng]
f[1]['paragraphs']=[p.replace(' .','.').replace(' ;',';') for p in f[1]['paragraphs']]
for j in [58,65,66,67]:pass
assert len(f[2]['paragraphs'])==len(d[2]['paragraphs'])
save('front-matter-en.json',f)
