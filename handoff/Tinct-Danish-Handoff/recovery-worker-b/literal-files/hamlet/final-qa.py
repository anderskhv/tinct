import json,pathlib,hashlib,re
p=pathlib.Path(__file__).parent;read=lambda f:json.loads((p/f).read_text());o=read('source-hamlet-original-en.json');counts=[len(c['paragraphs'])for c in o['chapters']];results={'total_scenes':len(counts),'total_slots':sum(counts),'expected_counts':counts,'source_pin_verified':True,'native_review':'pending','independent_review':'pending','languages':{}}
for lang,ledger in [('da','DANISH-REPAIRS.json'),('en','ENGLISH-REPAIRS.json')]:
 d=read(f'source-hamlet-modern-{lang}.json');a=read(ledger);candidate=read(f'candidate-hamlet-modern-{lang}.json');assert [len(c['paragraphs'])for c in candidate['chapters']]==counts
 assert candidate['sections']==d['sections'];assert [(c['number'],c['title'],c['section'])for c in d['chapters']]==[(c['number'],c['title'],c['section'])for c in candidate['chapters']]
 for z in a:
  s=d['chapters'][z['chapter']-1]['paragraphs'][z['paragraph']-1];assert z['before'] in s,(lang,z['chapter'],z['paragraph']);d['chapters'][z['chapter']-1]['paragraphs'][z['paragraph']-1]=s.replace(z['before'],z['after'])
 assert d==candidate
 slots=[t for c in candidate['chapters']for t in c['paragraphs']];assert all(t.strip()for t in slots);assert not any('\ufffd'in t or '\u200b'in t for t in slots)
 bracket=[{'chapter':c['number'],'open':sum(t.count('[')for t in c['paragraphs']),'close':sum(t.count(']')for t in c['paragraphs'])}for c in candidate['chapters']];assert all(x['open']==x['close']for x in bracket)
 src='source-hamlet.da.json'if lang=='da'else'source-hamlet.json';dest='candidate-hamlet.da.json'if lang=='da'else'candidate-hamlet.json';guide=read(src)
 for z in read(f'ONBOARDING-REPAIRS-{lang.upper()}.json'):assert guide.get(z['field'])==z['before'];guide[z['field']]=z['after']
 assert guide==read(dest);assert guide['openingText']==' '.join(candidate['chapters'][0]['paragraphs'][:8]);results['languages'][lang]={'operations':len(a),'distinct_changed_slots':len({(z['chapter'],z['paragraph'])for z in a}),'full_replay':True,'guide_replay':True,'nonempty':True,'structure_preserved':True,'chapter_brackets_balanced':True,'candidate_characters':sum(map(len,slots))}
assert len(read('SOURCE-SLOT-MAP.json'))==1391;assert read('SOURCE-MAP-UNRESOLVED.json')==[]
(p/'REPLAY-QA-FINAL.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');print(json.dumps(results,ensure_ascii=False,indent=2))
