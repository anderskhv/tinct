import pathlib,json,re
p=pathlib.Path(__file__).parent
for lang in ['da','en']:
 f=p/f'candidate-brothers-karamazov-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text())
 def change(c,n,a,b,reason):
  t=c['paragraphs'][n-1];assert a in t,(lang,c['number'],n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=c['number'],paragraph=n,before=a,after=b,reason=reason))
 if lang=='da':
  for sec in d['sections']:
   for cn in sec['chapters']:
    c=d['chapters'][cn-1];a=c['section'];b=sec['title'];c['section']=b
    if a!=b:r.append(dict(chapter=cn,field='section',before=a,after=b,reason='Translate retained English chapter-level section label; match Danish section index.'))
  for c in d['chapters']:
   for n,t in enumerate(c['paragraphs'],1):
    for a,b in [('Khokhlakov','Hohlakov'),('Krassotkin','Krasotkin')]:
     if a in c['paragraphs'][n-1]:change(c,n,a,b,'Consistent Danish names across complete novel.')
    t=c['paragraphs'][n-1];b=re.sub(r'(^|[.!?] )fru\b',lambda m:m[1]+'Fru',t)
    if b!=t:change(c,n,t,b,'Sentence-initial capital after prior title modernization.')
  change(d['chapters'][51],72,'bande mig','bande ad mig','Modern Danish idiom.')
  change(d['chapters'][63],4,'kattepelskraven','en krave af pelssælskind','Russian котик in fur context = fur seal; dictionary witness recorded separately.')
  change(d['chapters'][63],4,'med en krave','med en krave','No substantive change; retained grammatical article.') if False else None
  change(d['chapters'][72],39,'Sikken lille fod, minsandten,\nhævet bare lidt i kanten!','Sikke dog en lille fod,\nkun en smule hævet!','Remove invented localized edge swelling added for rhyme; preserve intentionally poor mock verse, meaning and four-line slot.')
  change(d['chapters'][95],50,'dine idiotiske','Deres idiotiske','Complete formal address agreement.')
 else:
  change(d['chapters'][63],4,'catskin collar','fur-seal collar','Russian котик in fur context = fur seal; dictionary witness recorded separately.')
  change(d['chapters'][56],32,'Be patient, humble, hold thy peace.','Endure, be humble, and be silent.','Align repeated poem quotation with slot57.61 and modern English register.')
  for c in d['chapters']:
   for n,t in enumerate(c['paragraphs'],1):
    for a,b in [('investigating lawyer','investigating magistrate'),('Investigating lawyer','Investigating magistrate')]:
     if a in t:change(c,n,a,b,'Judicial investigating magistrate is not counsel; consistent institutional role.')
 f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
(p/'SOURCE-NOTE-064.json').write_text(json.dumps({'chapter':64,'paragraph':4,'source':'меховым воротником из какого-то котика','repair':'catskin / kattepels → fur-seal / pelssælskind','dictionary':'Малый академический словарь, котик, marine mammal and its fur; example Воротник из котика','url':'https://gufo.me/amp/dict/mas/котик','review':'Contextual sense verified; retain for independent review.'},ensure_ascii=False,indent=2)+'\n')
