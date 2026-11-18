import pathlib,json,hashlib,copy
P=pathlib.Path(__file__).parent
sources={l:json.loads((P/f'source-peloponnesian-war-{l}.json').read_text()) for l in ['modern-da','modern-en']}
for lang in sources:
 d=copy.deepcopy(sources[lang]); edits=[]
 for f in sorted(P.glob('edits-*.json')):
  for e in json.loads(f.read_text()):
   if e['language']!=lang:continue
   c,s=e['chapter']-1,e['slot']-1; old=d['chapters'][c]['paragraphs'][s]
   assert old.count(e['before'])==1,(f,c,s,e['before'])
   new=old.replace(e['before'],e['after']); d['chapters'][c]['paragraphs'][s]=new
   edits.append(dict(e,beforeParagraph=old,afterParagraph=new))
 (P/f'candidate-peloponnesian-war-{lang}.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
 (P/('DANISH-REPAIRS.json' if lang=='modern-da' else 'ENGLISH-REPAIRS.json')).write_text(json.dumps(edits,ensure_ascii=False,indent=2)+'\n')
 print(lang,len(edits),'edits',len({(e['chapter'],e['slot']) for e in edits}),'slots')
