from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path
import hashlib,json,re,struct
P=Path(__file__).resolve().parent
def read(f):return json.loads((P/f).read_text())
def write(f,d):(P/f).write_text(json.dumps(d,ensure_ascii=False,indent=1)+'\n')
def hashfile(f):return hashlib.sha256((P/f).read_bytes()).hexdigest()
def udf(s):return [n[0] for n in struct.iter_unpack('<H',s.encode('utf-16-le'))]
def clean(s):return re.sub(r'\b_([^_\n]+)_\b',r'\1',s,flags=re.ASCII)
def ops(a,b):
 z=SequenceMatcher(None,a,b,autojunk=False).get_opcodes()
 assert all(a[x:y]==b[k:l] for t,x,y,k,l in z if t=='equal')
 assert sum(y-x for t,x,y,k,l in z)==len(a) and sum(l-k for t,x,y,k,l in z)==len(b)
 return z
v={'bookId':'middlemarch','bookUnits':88,'structuralComparison':'Recovery checked chapter and paragraph alignment to pinned original; independent Caldwell witness comparison was recorded historically but has not been rerun during recovery.','editions':{},'nativeDanishSignOff':'pending'}
mapping={'revision':'local-middlemarch-20261105','bookId':'middlemarch','baselineRef':(P/'reference/commit.txt').read_text().strip(),'editions':{}}
rec=read('changes.json')
for lg in ['da','en']:
 k='modern-'+lg
 before=read('reference/'+k+'.json');after=read(k+'.json');updated=read('reference/'+k+'.json')
 for r in rec:
  if r['language']!=lg:continue
  l=updated['chapters'][r['unit']-1]['paragraphs'];j=r['paragraphIndex'];assert l[j]==r['before'];l[j]=r['after']
 assert updated==after
 eb={'beforeSha256':hashfile('reference/'+k+'.json'),'afterSha256':hashfile(k+'.json'),'paragraphCountsBefore':{},'paragraphCountsAfter':{},'entries':{}}
 for a,b in zip(before['chapters'],after['chapters']):
  n=a['number'];assert n==b['number'] and a['title']==b['title'] and len(a['paragraphs'])==len(b['paragraphs'])
  if lg=='da':assert b==read(f'chapters/{n:03d}.json')
  for l in ['Before','After']:eb['paragraphCounts'+l][n]=len(a['paragraphs'])
  for i,(x,y) in enumerate(zip(a['paragraphs'],b['paragraphs'])):
   if x==y:continue
   ux,uy=udf(x),udf(y);wx,wy=clean(x).split(),clean(y).split()
   eb['entries'][f'{n}.{i}']=dict(chapter=n,paragraph=i,operation='rewrite',oldText=x,oldChars=len(ux),newChars=len(uy),chars=ops(ux,uy),oldWords=len(wx),newWords=len(wy),words=ops(wx,wy))
 mapping['editions'][k]=eb
 v['editions'][k]=dict(paragraphs=sum(eb['paragraphCountsAfter'].values()),wordCount=sum(len(p.split()) for c in after['chapters'] for p in c['paragraphs']),changedParagraphs=len(eb['entries']),changedUnits=len(set(x['chapter'] for x in eb['entries'].values())),ledgerReplays=True)
assert len(after['chapters'])==88
write('bookmark-map.json',mapping);write('verification.json',v)
