import re, json, hashlib
import os; S=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
raw=open(f'{S}/source/pg15877-long-1862.txt','rb').read()
lines=raw.decode('utf-8').split('\n')
start=2128
end=next(i for i in range(start,len(lines)) if lines[i].strip()=='INDEXES.')
body=lines[start:end]
roman={'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10,'XI':11,'XII':12}
books={}; cur=None; buf=[]; in_fn=False; verse_secs=set()
def flush():
    global buf
    if cur is not None and buf:
        books[cur].append(' '.join(l.strip() for l in buf if l.strip()))
    buf=[]
for l in body:
    m=re.match(r'^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\.\s*$', l)
    if m: flush(); cur=roman[m.group(1)]; books[cur]=[]; in_fn=False; continue
    if cur is None: continue
    indented=bool(re.match(r'^\s{2,}\S', l)); blank=(l.strip()=='')
    if re.match(r'^\s+\[[A-Z]\]', l): in_fn=True; continue
    if in_fn:
        if indented or blank: continue
        in_fn=False
    if indented: verse_secs.add((cur,len(books[cur])+1))
    if re.match(r'^\d+\. ', l): flush()
    buf.append(l)
flush()
out={}
for b in sorted(books):
    secs=[]
    for i,s in enumerate(books[b]):
        t=s
        t=re.sub(r'\[[A-Z]\]','',t)
        t=t.replace('+','')
        t=re.sub(r'\[Illustration:[^\]]*\]','',t)
        t=re.sub(r'\[\[Greek: ([^\]]*)\]\]', r'(Greek: \1)', t)
        t=re.sub(r'\[Greek: ([^\]]*)\]', r'(Greek: \1)', t)
        t=t.replace('---','—').replace('--','—')
        t=re.sub(r'_([^_]*)_', r'\1', t)
        t=re.sub(r'\s+',' ',t).strip()
        t=re.sub(r'\s+([,;:.?!])', r'\1', t)
        t=t.replace(' )',')').replace('( ','(').replace('[ ','[').replace(' ]',']')
        if i==0 and not re.match(r'^\d+\. ',t): t='1. '+t
        m=re.match(r'^(\d+)\. ',t); assert m and int(m.group(1))==i+1, (b,i,t[:50])
        secs.append(t)
    out[b]=secs
counts=[len(out[b]) for b in sorted(out)]; print('section counts',counts,'total',sum(counts))
print('total words', sum(len(s.split()) for b in out for s in out[b]))
print('sections containing indented (verse) lines:', sorted(verse_secs))
for b,n in sorted(verse_secs): print(f'--- {b}.{n}:', out[b][n-1])
chapters=[{'number':b,'title':f'Book {b}','paragraphs':out[b]} for b in sorted(out)]
json.dump({'chapters':chapters}, open(f'{S}/meditations-original-en.staged.json','w'), ensure_ascii=False, indent=2)
allt=' '.join(s for b in out for s in out[b])
print('leftover checks: [X]', len(re.findall(r'\[[A-Z]\]',allt)), 'plus', allt.count('+'), 'Greek', len(re.findall(r'\(Greek:',allt)), 'underscore', allt.count('_'), 'dbl-hyphen', allt.count('--'), 'illustration', allt.count('[Illustration'))
