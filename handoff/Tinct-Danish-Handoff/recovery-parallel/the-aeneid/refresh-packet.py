from pathlib import Path
import json,hashlib
p=Path('/tmp/tinct-da-prep-20261104/the-aeneid')
def load(n):return json.loads((p/n).read_text())
def save(n,x):(p/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
j=load('candidate-the-aeneid-modern-da.json');orig=load('source-the-aeneid-original-en.json')
for i,c in enumerate(j['chapters'],1):
 a=(p/f'{i:02}.draft').read_text().strip().split('\n§\n');assert len(a)==len(orig['chapters'][i-1]['paragraphs']);assert all(a);c['paragraphs']=a
save('candidate-the-aeneid-modern-da.json',j);q=load('QA.json');q.update(danish_words=sum(len(x.split()) for c in j['chapters']for x in c['paragraphs']),english_repair_entries=len(load('ENGLISH-REPAIRS.json')),polish_entries=len(load('DANISH-POLISH.json')),followup='IX–XII fully reread; independent I–VIII corrections integrated as documented')
q['quote_warnings']=[]
for i,c in enumerate(j['chapters'],1):
 s='\n'.join(c['paragraphs']);assert '\u00ad' not in s
 if s.count('»')!=s.count('«'):q['quote_warnings'].append(i)
save('QA.json',q)
files=[x for x in p.iterdir() if x.is_file() and x.suffix!='.py' and x.name!='MANIFEST.json']
save('MANIFEST.json',dict(slug='the-aeneid',status='complete-local-editorial-candidate',native_review='pending',published=False,files={x.name:dict(bytes=x.stat().st_size,sha256=hashlib.sha256(x.read_bytes()).hexdigest())for x in sorted(files)}));print(q)
