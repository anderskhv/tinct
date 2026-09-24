#!/usr/bin/env python3
"""Build the final reading structure (v3 = printed paragraphing) from original-da-v2.json and
printed-paragraphs.json (scan-derived). Joins v2 paragraphs that are run-ons in print, splits the
7 printed paragraphs the parse merged, records section dividers, restores verse lineation.
Writes original-da-final.json and final-structure-map.json (served slot -> final paragraph)."""
import json,os
H=os.path.dirname(os.path.abspath(__file__))
v2=json.load(open(os.path.join(H,'original-da-v2.json')))
pp=json.load(open(os.path.join(H,'printed-paragraphs.json')))
smap2=json.load(open(os.path.join(H,'structure-map.json')))
VERSE={(7,39):['Ich, roh','Vor leicht','Ich, so','Geschändet','Entstellt','In diese','Gemacht,','Dass Hunde'],
       (7,60):['Wer bat','Zu Füssen','Wer sprach von Bruderpflicht']}
nobreak={(b['chapter'],b['after']) for b in pp['boundaries'] if not b['printedBreak']}
internal={}
for ib in pp['internalBreaks']: internal.setdefault((ib['chapter'],ib['paragraph']),[]).append(ib)
secbefore={}
for s in pp['sectionBreaks']:
    if s.get('type') in ('rule','asterism','ornament','divider') and 'after' in s:
        secbefore[(s['chapter'],s['after']+1)]=s['type']
out={'source':v2['source'],'structure':'final (printed paragraphing, scan-verified)','chapters':[]}
v2tofinal={}  # (ch,v2idx) -> [final indices]
for c in v2['chapters']:
    ch=c['number']; units=[]
    for i,p in enumerate(c['paragraphs']):
        text=p['text']; notes=p['notes']
        if (ch,i)==(7,39) and not text.startswith('…'): text='… '+text
        if (ch,i) in VERSE:
            for starter in VERSE[(ch,i)][1:]:
                k=text.index(' '+starter); text=text[:k]+'\n'+text[k+1:]
        pieces=[]; offs=sorted(ib['charOffset'] for ib in internal.get((ch,i),[]))
        prev=0
        for o in offs:
            assert text[o:].startswith(internal[(ch,i)][[x['charOffset'] for x in internal[(ch,i)]].index(o)]['startsWith'][:12]),(ch,i,text[o:o+30])
            pieces.append(text[prev:o].rstrip()); prev=o
        pieces.append(text[prev:])
        for j,piece in enumerate(pieces):
            pn=[n for n in notes if n['anchorAfter'] and n['anchorAfter'].split()[-1] in piece and (len(pieces)==1 or n['anchorAfter'][-25:] in piece)]
            joined = j==0 and (ch,i-1) in nobreak and units
            if joined:
                u=units[-1]; sep='' if u['text'].endswith('-') else ' '
                u['text']=u['text']+sep+piece; u['notes']+=pn; u['v2'].append(i)
            else:
                units.append({'sectionHeading':p.get('sectionHeading') if j==0 else None,
                              'dividerBefore':secbefore.get((ch,i)) if j==0 else None,
                              'text':piece,'notes':list(pn),'v2':[i],'restored':p.get('restored',False) and j==0})
            v2tofinal.setdefault((ch,i),[]).append(len(units)-1)
    # sanity: all notes placed exactly once
    ids=[n['id'] for u in units for n in u['notes']]; exp=[n['id'] for p in c['paragraphs'] for n in p['notes']]
    assert sorted(ids)==sorted(exp),(ch,ids,exp)
    out['chapters'].append({'number':ch,'title':c['title'],'paragraphs':units})
fm=[]
for m in smap2:
    o=tuple(m['old'])
    if m['new'] is None: fm.append({'servedSlot':list(o),'final':None,'action':m['action'],'note':m['note'],'noteNowInFinal':v2tofinal[(o[0],m['noteNowIn'][1])]})
    else:
        f=v2tofinal[(m['new'][0],m['new'][1])]
        fm.append({'servedSlot':list(o),'final':[o[0],f[0]] if len(f)==1 else [o[0],f],'action':m['action']})
json.dump(out,open(os.path.join(H,'original-da-final.json'),'w'),ensure_ascii=False,indent=1)
json.dump({'servedToFinal':fm,'v2ToFinal':{f'{k[0]}.{k[1]}':v for k,v in v2tofinal.items()}},open(os.path.join(H,'final-structure-map.json'),'w'),ensure_ascii=False,indent=1)
print([len(c['paragraphs']) for c in out['chapters']],sum(len(c['paragraphs']) for c in out['chapters']))
