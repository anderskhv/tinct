from pathlib import Path
import json,hashlib,shutil
root=Path(__file__).parents[1];src=root/'recovery-worker-b/event-literal-files/gilgamesh';out=root/'recovery-parent/reconstructed/gilgamesh';out.mkdir(parents=True,exist_ok=True)
def put(n,v):(out/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def pairs(p):
 result=[]
 text=p.read_text()
 if p.name=='tablet-01.pairs':text=text.replace('en skøge','en prostitueret kvinde')
 if p.name=='tablet-12.pairs':
  a="It wasn't merciless Nergal, the one who crouches in wait, who seized him. It was the earth alone.";text=text.replace(a+' '+a,a)
 if p.name=='tablet-11.pairs':text=text.replace('Brother could not tell brother from brother','A brother could not recognize his own brother').replace('“Utnapishtim said to his wife, ‘Human troubles trouble you too!','Utnapishtim said to his wife, “Human troubles trouble you too!').replace("the time he sleeps.’ She baked","the time he sleeps.” She baked").replace('the strong man woke.”','the strong man woke.')
 if p.name=='tablet-06.pairs':text=text.replace('lapisblåt stenmateriale','blå sten').replace('en uvejrsstorm og en stormvind','et uvejr og en stormvind')
 for block in text.strip().split('\n\n'):
  lines=block.splitlines();assert len(lines)==2
  result.append([v.replace('\\n','\n') for v in lines])
 return result
g=pairs(src/'guide-content.pairs');counts=[]
for i,lang in enumerate(['da','en']):
 chapters=[]
 for idx,p in enumerate(sorted(src.glob('tablet-*.pairs')),1):
  a=pairs(p);chapters.append({'number':idx,'title':('Tavle ' if i==0 else 'Tablet ')+a[0][i].replace('. ',' — ',1),'paragraphs':[v[i] for v in a[1:]]})
 put('candidate-gilgamesh-modern-'+lang+'.json',{'chapters':chapters})
 d=dict(bookId='gilgamesh',title=g[0][i],author=g[1][i],era=g[2][i],length=['12 tavler','12 tablets'][i],estimatedTime=['Ca. 1 time','About 1 hour'][i],openingChapterLabel=chapters[0]['title'],openingText=chapters[0]['paragraphs'][0],about=g[3][i])
 for key,(start,end,fields) in {'angleCards':(4,8,['title','text','angleObjective']),'cast':(8,14,['name','role','description']),'whyItMatters':(14,17,['title','body'])}.items():
  d[key]=[]
  for row in g[start:end]:
   vals=row[i].split('|');assert len(vals)==len(fields);d[key].append(dict(zip(fields,vals)))
 d['acclaim']=[];put('candidate-gilgamesh'+('.da' if i==0 else '')+'.json',d)
 shape=[len(c['paragraphs']) for c in chapters];assert shape==[22,9,19,5,8,13,7,6,6,13,24,13];counts.append({'language':lang,'paragraphs':sum(shape),'words':sum(len(p.split()) for c in chapters for p in c['paragraphs'])})
shutil.copyfile(src/'HANDOFF.txt',out/'HANDOFF.txt')
put('RECOVERY-VALIDATION.json',{'method':'Reassembled literal paired texts and guide data with original deterministic formatting, no regenerated prose.','counts':counts,'historicalCountsMatch':counts[0]['words']==12734 and counts[1]['words']==13085,'releaseStatus':'Separate Thompson edition integration required; cannot replace existing253slot composite in-place.','sourceWitnessStatus':'Original facsimile not recovered in this packet; historical source review documented in HANDOFF.','nativeReview':'pending'})
put('RECOVERED-MANIFEST.json',{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in out.glob('candidate-*.json')});print(counts)
