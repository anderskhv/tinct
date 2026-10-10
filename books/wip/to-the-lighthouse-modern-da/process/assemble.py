import json,re,os,sys,collections
src=json.load(open('served-modern-en.json'))
bundles=json.load(open('bundles.json'))
TITLES={'The Window':'Vinduet','Time Passes':'Tiden går','The Lighthouse':'Fyret'}
SECT={'Part I — The Window':'Del I — Vinduet','Part II — Time Passes':'Del II — Tiden går','Part III — The Lighthouse':'Del III — Fyret'}
def norm(t):
    t=t.strip().replace('nogen havde fejlet','nogen havde begået en fejl')
    t=re.sub(r'(?<=[^\s»«›‹—])—(?=[^\s»«›‹—])',' — ',t)
    return t
fails=[];
final={}
for b in bundles:
    bid=b['id']
    out=json.load(open(f'out/{bid}.json'))
    rv={}
    if os.path.exists(f'review/{bid}.review.json'):
        for r in json.load(open(f'review/{bid}.review.json')): rv[(r['chapter'],r['index'])]=r
    elif '--partial' not in sys.argv: print('missing review',bid); continue
    for c in out:
        ps=[]
        for i,p in enumerate(c['paragraphs']):
            r=rv.get((c['number'],i))
            if r and r['verdict']=='FAIL':
                p=r['replacement']; fails.append({'bundle':bid,'chapter':c['number'],'index':i,'before':c['paragraphs'][i],'after':p})
            ps.append(norm(p))
        final[c['number']]=ps
chs=[]
for c in src['chapters']:
    if c['number'] not in final: continue
    m=re.match(r'(.*?) · (\d+)$',c['title']); 
    title=f"{TITLES[m.group(1)]} · {m.group(2)}" if m else TITLES.get(c['title'],c['title'])
    chs.append({'number':c['number'],'title':title,'section':SECT[c['section']],'paragraphs':final[c['number']]})
secs=[{'title':SECT[s['title']],'chapters':s['chapters']} for s in src['sections']]
json.dump({'chapters':chs,'sections':secs},open('candidate-da.json','w'),ensure_ascii=False,indent=2)
json.dump(fails,open('fails-applied.json','w'),ensure_ascii=False,indent=1)
print(len(chs),'chapters',sum(len(c['paragraphs']) for c in chs),'paragraphs',len(fails),'fails applied')
