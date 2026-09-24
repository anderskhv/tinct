#!/usr/bin/env python3
"""Explicit served-slot -> final-paragraph map (writes ../STRUCTURE-MAP.json and ../STRUCTURE-MAP.md)."""
import json,os,collections
H=os.path.dirname(os.path.abspath(__file__))
fin=json.load(open(os.path.join(H,'original-da-final.json')))
v2m=json.load(open(os.path.join(H,'structure-map.json')))       # served -> v2
served=json.load(open(os.path.join(H,'..','..','..','..','app/public/data/editions/fear-and-trembling-original-da.json')))
# v2 index -> final indices, per chapter
v2f=collections.defaultdict(list)
for c in fin['chapters']:
    for i,p in enumerate(c['paragraphs']):
        for v in p['v2']: v2f[(c['number'],v)].append(i)
# served -> v2 (list), plus removed
s2v=collections.defaultdict(list); removed={}
for m in v2m:
    o=tuple(m['old'])
    if m['new'] is None: removed[o]=m
    else: s2v[o].append(m['new'][1])
# final paragraph -> list of served slots
f2s=collections.defaultdict(list)
recs=[]
for c in served['chapters']:
    n=c['number']
    for i in range(len(c['paragraphs'])):
        o=(n,i)
        if o in removed:
            nid=removed[o]['note']
            fp=[k for k,p in enumerate(fin['chapters'][n-1]['paragraphs']) if any(x['id']==nid for x in p['notes'])]
            recs.append({'served':[n,i],'final':[],'relation':'removed','detail':f'slot contained only footnote text ({nid}); the note is attached to final ¶{fp[0]}','noteId':nid,'noteInFinal':[n,fp[0]]})
            continue
        fs=sorted({f for v in s2v[o] for f in v2f[(n,v)]})
        for f in fs: f2s[(n,f)].append(i)
        recs.append({'served':[n,i],'final':[[n,f] for f in fs]})
for r in recs:
    if r.get('relation')=='removed': continue
    n=r['served'][0]; fs=[f for _,f in r['final']]
    restored=any(p.get('restored') for f in fs for p in [fin['chapters'][n-1]['paragraphs'][f]])
    if len(fs)>1:
        extra=[f for f in fs if fin['chapters'][n-1]['paragraphs'][f].get('restored')]
        r['relation']='split'; r['detail']=(f'restored weaning passage from this slot now forms its own paragraph ¶{extra[0]}' if extra else 'printed paragraph break inside the served slot')
    else:
        f=fs[0]; srcs=f2s[(n,f)]
        if len(srcs)>1: r['relation']='joined'; r['detail']=f'final ¶{f} = served slots {srcs[0]}–{srcs[-1]} (page-break run-on in print)'
        else: r['relation']='identical-extent'; r['detail']=''
counts=collections.Counter(r['relation'] for r in recs)
out={'book':'fear-and-trembling','from':'served 232-slot structure (original-da / original-en / modern-en, all identical)','to':'final 184-paragraph printed structure (1895 ed., scan-verified)','counts':dict(counts),
     'chapterCounts':{'served':[len(c['paragraphs']) for c in served['chapters']],'final':[len(c['paragraphs']) for c in fin['chapters']]},'map':recs}
json.dump(out,open(os.path.join(H,'..','STRUCTURE-MAP.json'),'w'),ensure_ascii=False,indent=1)
print(counts, out['chapterCounts'])
