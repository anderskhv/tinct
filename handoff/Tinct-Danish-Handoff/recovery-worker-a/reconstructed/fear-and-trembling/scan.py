from pathlib import Path
import json,re,unicodedata,difflib,xml.etree.ElementTree as E
r=E.parse('primary-da.xml')
for e in r.iter():e.tag=e.tag.rsplit('}',1)[-1]
def plain(e):
 s=e.text or ''
 for c in e:
  if c.tag in ['rdg','note','figure','ptr','pb','lb','fw','anchor','del']:v=''
  elif c.tag=='app':
   l=c.find('lem');v=plain(l) if l is not None else plain(c)
  elif c.tag=='choice':
   l=next(iter(c));v=plain(l)
  else:v=plain(c)
  s+=v+(c.tail or '')
 return re.sub(r'\s+',' ',s).strip() if e.tag in ['p','head','note'] else s
ds=r.find('.//body').findall('div'); secs=[ds[2],ds[3],ds[4],*ds[5].findall('div'),ds[6]]
units=[[plain(p) for p in d.iter('p') if plain(p)] for d in secs];notes=[plain(p) for p in r.find('.//body').findall('note')];print([(len(x),sum(len(p.split()) for p in x)) for x in units],len(notes))
Path('critical-chapters.json').write_text(json.dumps(units,indent=2,ensure_ascii=False));Path('critical-notes.json').write_text(json.dumps(notes,indent=2,ensure_ascii=False))
def words(s):
 w=re.findall(r'[\wæøåÆØÅ]+',s,re.U);return w
def norm(w):
 w=w.lower()
 for a,b in [('aa','å'),('kj','k'),('gj','g'),('ei','ej'),('øi','øj'),('ai','aj'),('qv','kv'),('ph','f'),('th','t'),('ch','k'),('dt','t'),('nd','n'),('ee','e'),('ie','i'),('aa','å'),('ii','i'),('ou','u'),('æ','e'),('aa','å')]:w=w.replace(a,b)
 return w
src=json.load(open('source-fear-and-trembling-modern-da.json'))['chapters']
flags=[]
for i,(u,v) in enumerate(zip(units,src),1):
 a=words(' '.join(u));b=words(' '.join(v['paragraphs']));s=difflib.SequenceMatcher(None,list(map(norm,a)),list(map(norm,b)),autojunk=False)
 for k,x,y,m,n in s.get_opcodes():
  if max(y-x,n-m)>22:flags.append([i,k,y-x,n-m,' '.join(a[x:y])[:150],' '.join(b[m:n])[:150]])
Path('alignment-flags.json').write_text(json.dumps(flags,indent=2,ensure_ascii=False));print(*flags,sep='\n')
