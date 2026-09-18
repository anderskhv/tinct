#!/usr/bin/env python3
"""Stage source + baseline-v2 chapter files for repair: python3 stage_chapters.py 338 339 340"""
import json,sys,hashlib,os
R='books/wip/war-and-peace-repair'; os.makedirs(f'{R}/repair',exist_ok=True)
o=json.load(open('app/public/data/editions/war-and-peace-original-en.json'))['chapters']
n=json.load(open(f'{R}/consistency/modern-en-consistency-candidate.json'))['chapters']
sha=lambda p: hashlib.sha256(open(p,'rb').read()).hexdigest()[:16]
for a in sys.argv[1:]:
    ch=int(a); c=o[ch-1]; m=n[ch-1]; assert c['number']==ch==m['number'] and len(c['paragraphs'])==len(m['paragraphs'])
    for tag,e in (('source',c),('baseline',m)):
        fp=f'{R}/repair/ch{ch}-{tag}.json'; json.dump({'number':e['number'],'title':e['title'],'paragraphs':e['paragraphs']},open(fp,'w'),ensure_ascii=False,indent=1)
    print(f"ch{ch}: {len(c['paragraphs'])} paras | source {sha(f'{R}/repair/ch{ch}-source.json')} | baseline-v2 {sha(f'{R}/repair/ch{ch}-baseline.json')} | opens: {c['paragraphs'][0][:50]!r}")
