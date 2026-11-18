from pathlib import Path
import shutil,json,re,difflib,hashlib
from bs4 import BeautifulSoup
base=Path(__file__).resolve().parent
r=Path.home()/'Developer/Tinct'
def write(p,d): p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def read(p): return json.loads(p.read_text())
def txt(t): return ' '.join(t.get_text().split())
def toks(s): return re.findall(r'[^\W_]+',s.lower())
for p in [r/'books/wip/moby-dick/editions/moby-dick-modern-da.json',*[r/f'app/public/data/editions/moby-dick-{e}.json' for e in ['original-en','modern-en']],*[r/f'app/public/data/onboarding/{e}.json' for e in ['moby-dick','moby-dick.da']]]:
 shutil.copyfile(p,base/'source'/p.name)
s=BeautifulSoup((base/'source/gutenberg-2701.html').read_bytes(),'html.parser')
hs=[h for h in s.select('h2') if re.match(r'CHAPTER \d+\.|Epilogue',txt(h))]
assert len(hs)==136
ds=[read(base/f'source/moby-dick-{e}.json')['chapters'] for e in ['original-en','modern-en','modern-da']]
out=[]
for i,h in enumerate(hs):
 blocks=[]
 for sib in h.find_next_siblings():
  if sib.name in ['h2','section','footer'] or sib.get('id')=='pg-end-separator':break
  if txt(sib): blocks.append(txt(sib))
 cs=[d[i] for d in ds]; ps=[c['paragraphs'] for c in cs]; a=toks(' '.join(blocks));b=toks(' '.join(ps[0]));diff=difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes()
 gaps=[{'primary':' '.join(a[x:y]),'tinct':' '.join(b[z:v])} for op,x,y,z,v in diff if op!='equal' and max(y-x,v-z)>=3]
 out.append({'chapter':i+1,'title':txt(h),'source_words':len(a),'source_paragraphs':len(blocks),'retained_slots':len(ps[2]),'source_differences':gaps,'da_short':[j+1 for j,(o,d) in enumerate(zip(ps[0],ps[2])) if len(d)<len(o)*0.6 and len(o)>100]})
 write(base/'chapters'/f'{i+1:03}.json',{'chapter':i+1,'source':blocks,'original_en':cs[0],'modern_en':cs[1],'modern_da':cs[2],'scope':'source tokens and slot alignment audited; editorial review pending'})
write(base/'audit.json',out)
for v in out:
 if v['source_differences'] or v['da_short']: print(v['chapter'],v['source_differences'][:2],v['da_short'])
