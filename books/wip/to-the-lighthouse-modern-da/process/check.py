import json,re,sys,os
src={c['number']:c for c in json.load(open('served-modern-en.json'))['chapters']}
bad=0
for b in json.load(open('bundles.json')):
    f=f"out/{b['id']}.json"
    if not os.path.exists(f): continue
    out=json.load(open(f))
    if [c['number'] for c in out]!=b['chapters']: print(b['id'],'chapter mismatch'); bad+=1; continue
    for c in out:
        s=src[c['number']]['paragraphs']; p=c['paragraphs']
        if len(s)!=len(p): print(b['id'],c['number'],'para count',len(s),len(p)); bad+=1; continue
        for i,(x,y) in enumerate(zip(s,p)):
            if not y.strip(): print(b['id'],c['number'],i,'empty'); bad+=1
            if re.search(r'[“”‘’"]',y): print(b['id'],c['number'],i,'english quotes'); bad+=1
            if x.count('[')!=y.count('[') or x.count('(')!=y.count('('): print(b['id'],c['number'],i,'bracket/paren count differ')
            if x.count('\n')!=y.count('\n'): print(b['id'],c['number'],i,'newline count differ'); bad+=1
            r=len(y.split())/max(1,len(x.split()))
            if len(x.split())>15 and not 0.7<r<1.3: print(b['id'],c['number'],i,'length ratio',round(r,2))
            sp=lambda t:(' — ' in t, '—' in t.replace(' — ',''))
    print(b['id'],'ok checked')
print('bad',bad)
