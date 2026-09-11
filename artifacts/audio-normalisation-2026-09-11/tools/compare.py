"""Byte and per-paragraph comparison of two words.candidate.json files."""
import json,sys,hashlib
a,b=sys.argv[1],sys.argv[2]
ra,rb=open(a,'rb').read(),open(b,'rb').read()
print('sha256',hashlib.sha256(ra).hexdigest(),hashlib.sha256(rb).hexdigest(),'IDENTICAL' if ra==rb else 'DIFFER')
if ra!=rb:
    ja,jb=json.loads(ra),json.loads(rb)
    pa={p['paragraph']:p for p in ja['paragraphs']};pb={p['paragraph']:p for p in jb['paragraphs']}
    for i in sorted(set(pa)|set(pb)):
        x,y=pa.get(i),pb.get(i)
        if x is None or y is None: print(' p%d present only in one'%i);continue
        if x['words']!=y['words'] or x.get('alignment')!=y.get('alignment'):
            print(' p%d words %s alignment %s -> %s'%(i,'same' if x['words']==y['words'] else 'DIFFER',x.get('alignment'),y.get('alignment')))
    ka={k:v for k,v in ja.items() if k!='paragraphs'};kb={k:v for k,v in jb.items() if k!='paragraphs'}
    if ka!=kb: print(' top-level',ka,'->',kb)
