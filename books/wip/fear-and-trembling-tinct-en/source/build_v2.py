#!/usr/bin/env python3
"""Build the v2 reading structure from original-da-corrected.json (served 232-slot alignment).
v2 changes (see ../STRUCTURE-MAP.md):
  * ch2: the weaning passages after variations II and III become their own paragraphs (as printed).
  * ch7: the nine served slots that contained only footnote text are removed; their note text joins
    the note list of the slot holding the marker (multi-part notes re-joined in order).
Writes original-da-v2.json and structure-map.json."""
import json,os
H=os.path.dirname(os.path.abspath(__file__))
d=json.load(open(os.path.join(H,'original-da-corrected.json')))
SPLITS={(2,6):'Naar Barnet er blevet stort',(2,8):'Naar Barnet skal vænnes fra, da er ei heller'}
out={'source':d['source'],'structure':'v2','chapters':[]}; smap=[]
for c in d['chapters']:
    paras=[]; pend={}
    for sl in c['slots']:
        key=(c['number'],sl['index'])
        own=[n for n in sl['notes'] if n.get('ownSlot')]
        if own and not sl['text'].strip():
            for n in own:
                smap.append({'old':[c['number'],sl['index']],'new':None,'action':'removed: footnote-only slot','note':n['id'],'part':n.get('part'),'anchorSlotOld':n['anchorSlot']})
                pend.setdefault(n['id'],[]).append(n)
            continue
        base={'sectionHeading':sl.get('sectionHeading'),'text':sl['text'],'notes':[dict(n) for n in sl['notes']],'sourceSlots':[sl['index']]}
        if key in SPLITS:
            k=sl['text'].index(SPLITS[key]); a,b=sl['text'][:k].rstrip(),sl['text'][k:]
            base['text']=a; paras.append(base)
            smap.append({'old':list(key),'new':[c['number'],len(paras)-1],'action':'kept (weaning passage split off into next paragraph)'})
            paras.append({'sectionHeading':None,'text':b,'notes':[],'sourceSlots':[sl['index']],'restored':True})
            smap.append({'old':list(key),'new':[c['number'],len(paras)-1],'action':'new paragraph: restored weaning passage (printed as its own paragraph after an asterism)'})
        else:
            paras.append(base); smap.append({'old':list(key),'new':[c['number'],len(paras)-1],'action':'kept'})
    # attach own-slot notes to their anchor paragraph (by old anchor slot)
    oldnew={tuple(m['old']):m['new'] for m in smap if m['new'] and m['old'][0]==c['number'] and m['action']!='new paragraph: restored weaning passage (printed as its own paragraph after an asterism)'}
    for nid,parts in pend.items():
        anchor_old=parts[0]['anchorSlot']; newi=oldnew[(c['number'],anchor_old)][1]
        tgt=paras[newi]; existing=[n for n in tgt['notes'] if n['id']==nid]
        allparts=sorted(existing+parts,key=lambda n:n.get('part') or 0)
        merged=dict(allparts[0]); merged['text']=' '.join(x['text'] for x in allparts)
        for k in ('ownSlot','part','partsTotal'): merged.pop(k,None)
        merged['servedSlots']=sorted({x.get('slot',None) for x in []}) or None
        tgt['notes']=[n for n in tgt['notes'] if n['id']!=nid]+[merged]
    for m in smap:
        if m.get('note') in pend and m['old'][0]==c['number']: m['noteNowIn']=[c['number'],oldnew[(c['number'],m['anchorSlotOld'])][1]]
    out['chapters'].append({'number':c['number'],'title':c['title'],'paragraphs':paras})
json.dump(out,open(os.path.join(H,'original-da-v2.json'),'w'),ensure_ascii=False,indent=1)
json.dump(smap,open(os.path.join(H,'structure-map.json'),'w'),ensure_ascii=False,indent=1)
print([len(c['paragraphs']) for c in out['chapters']], sum(len(c['paragraphs']) for c in out['chapters']))
print(sum(len(p['notes']) for c in out['chapters'] for p in c['paragraphs']),'notes')
