import json,pathlib,hashlib,collections
p=pathlib.Path(__file__).parent;results={}
o=json.loads((p/'source-anna-karenina-original-en.json').read_text());counts=[len(c['paragraphs'])for c in o['chapters']]
for l,lf in [('da','DANISH-REPAIRS.json'),('en','ENGLISH-REPAIRS.json')]:
 d=json.loads((p/f'source-anna-karenina-modern-{l}.json').read_text());a=json.loads((p/lf).read_text());cand=json.loads((p/f'candidate-anna-karenina-modern-{l}.json').read_text())
 for j,e in enumerate(a):
  c=d['chapters'][e['chapter']-1];i=e['paragraph']-1;assert e['before'] in c['paragraphs'][i],(l,j,e);c['paragraphs'][i]=c['paragraphs'][i].replace(e['before'],e['after'])
 assert d==cand,l
 assert [len(c['paragraphs'])for c in cand['chapters']]==counts
 assert all(s.strip()for c in cand['chapters']for s in c['paragraphs'])
 assert [c['number']for c in cand['chapters']]==list(range(1,240))
 gf='anna-karenina'+('.da'if l=='da'else'')+'.json';g=json.loads((p/f'source-{gf}').read_text());ga=json.loads((p/f'GUIDE-REPAIRS-{l}.json').read_text())
 for e in ga:assert g[e['field']]==e['before'];g[e['field']]=e['after']
 assert g==json.loads((p/f'candidate-{gf}').read_text())
 assert g['openingText']==cand['chapters'][0]['paragraphs'][0]
 results[l]={'body_exact_replay':True,'guide_exact_replay':True,'repair_entries':len(a),'distinct_changed_slots':len(set((e['chapter'],e['paragraph'])for e in a)),'chapters':239,'slots':sum(counts),'nonempty':True,'source_slot_parity':True,'title_number_unchanged':all((x['title'],x['number'])==(y['title'],y['number'])for x,y in zip(cand['chapters'],json.loads((p/f'source-anna-karenina-modern-{l}.json').read_text())['chapters']))}
results['limits']=['Not native signoff','No application render/integration validation','No independent complete second-person review','Chapter232 editorial edition/order decision unresolved','Specialist language flags retained in handoff']
(p/'REPLAY-QA-FINAL.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');print(json.dumps(results,ensure_ascii=False))
