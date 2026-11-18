import json, hashlib, re
from pathlib import Path
b='beyond-good-and-evil'
def read(f): return json.loads(Path(f).read_text())
def put(f,x): Path(f).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
enledger=read('modern-en-changes.json')
reasons={(x['chapter'],x['paragraph']):x['reason'] for x in enledger}
shared={
'da':{
'about':'Hvad får en filosof til at ville kende sandheden for enhver pris? Nietzsche vender spørgsmålet mod filosofferne selv. I ni dele skifter han mellem længere undersøgelser, korte stikpiller og tænkte samtaler. Han læser moralske domme som spor efter de mennesker, der fælder dem, og spørger, hvem der tør sætte nye værdier. Bogen udkom i 1886 med undertitlen »Et forspil til en fremtidig filosofi«.',
'length':'9 dele, aforismer 1–296 med tre tillæg og et slutdigt',
'angles':[('Læs filosoffen mellem linjerne','I § 6 kalder Nietzsche stor filosofi for en slags ufrivillige erindringer. Hvilke ønsker røber en tænker, netop når han mener at tale helt upersonligt?','Jeg vil læse argumenterne som spor efter den, der fremsætter dem.'),('Prøv en tanke af','Læg mærke til »hvis« i § 36. Nietzsche prøver tanken om viljen til magt af. Hvor langt rækker forsøget, og hvad beder han læseren tage for givet?','Jeg vil skelne mellem det, Nietzsche påstår, og det, han beder mig forestille mig.'),('Sammenlign måder at dømme på','I § 260 skelner Nietzsche mellem herremoral og slavemoral. De kan optræde side om side i samme menneske. Se efter, hvordan ordet »god« skifter betydning.','Jeg vil forstå, hvordan forskellige erfaringer kan give det samme ord forskellig vægt.'),('Lyt efter stemmeskiftene','Et argument kan slå over i en vittighed, og til sidst bliver bogen til et digt om en vært, der venter på venner. Hvad kan digtet sige, som argumentet ikke kan?','Jeg vil følge rytmen, ironien og skiftene mellem bogens stemmer.')],
'cast':[('Friedrich Nietzsche','Forfatteren','Han taler snart som psykolog, snart som modstander og snart som en, der lægger en tanke frem på prøve. Det betyder noget, hvem han taler til.'),('Herremoral','En måde at sætte værdier på','I § 260 bliver »god« til ud fra den fornemmes oplevelse af sig selv. Først derefter vender blikket sig mod det, der regnes for ringere.'),('Slavemoral','En anden måde at sætte værdier på','I Nietzsches fremstilling får hjælpsomhed, tålmodighed og venlighed vægt for dem, der må leve med andres magt.'),('Viljen til magt','En hypotese','I § 36 spørger Nietzsche, om kræfterne i verden kan forstås ud fra vores erfaring med drifter og vilje.'),('Den frie ånd','En tænkt læser og samtalepartner','At slippe en gammel overbevisning er én ting. At kunne få øje på sine nye bindinger er sværere.'),('Platon og Schopenhauer','Filosofiske modstandere','Nietzsche bruger blandt andet Platons billede af det gode og Schopenhauers opfattelse af viljen til at undersøge sine forgængeres antagelser.')],
'why':[('Hvad er sandheden værd?','Allerede i § 1 flytter spørgsmålet sig: Hvorfor vil vi hellere have sandhed end usikkerhed? Selv ønsket om et sikkert svar bliver noget, der skal undersøges.'),('Hvilken moral taler vi om?','I § 186 efterlyser Nietzsche beskrivelser og sammenligninger af forskellige former for moral. Ellers risikerer en filosof blot at begrunde de værdier, han kender i forvejen.'),('Når læseren gør modstand','Nietzsches udsagn om kvinder, rang og lydighed kan få læseren til at vende hans spørgsmål mod ham selv: Hvilke erfaringer og ønsker kommer til orde her?')]},
'en':{
'about':'Why would a philosopher want truth at any price? Nietzsche turns the question back on philosophers themselves. Across nine parts he moves between extended arguments, sharp asides, and imagined conversations. He reads moral judgments for what they reveal about the people making them and asks who might dare to create new values. The book appeared in 1886 with the subtitle “Prelude to a Philosophy of the Future.”',
'length':'9 parts, aphorisms 1–296 with three supplements, and a closing poem',
'angles':[('Read the philosopher between the lines','In § 6 Nietzsche calls great philosophy a kind of involuntary memoir. What desires might a thinker reveal precisely when he thinks he is speaking impersonally?','I want to read an argument for what it reveals about the person making it.'),('Try out a thought','Watch the conditionals in § 36. Nietzsche puts the will to power to the test. How far does the experiment go, and what does he ask us to assume?','I want to distinguish what Nietzsche asserts from what he asks me to imagine.'),('Compare ways of judging','In § 260 Nietzsche distinguishes master morality from slave morality. The two can coexist in one person. Watch how the word “good” changes its meaning.','I want to see how different experiences give the same word a different weight.'),('Listen for a change of voice','An argument can turn into a joke. The book ends with a poem about a host waiting for friends. What can the poem say that the argument cannot?','I want to follow the rhythm, the irony, and the shifts between voices.')],
'cast':[('Friedrich Nietzsche','Author','He speaks by turns as a psychologist, an opponent, and someone trying out a thought. Pay attention to whom he addresses.'),('Master morality','One way of setting values','In § 260 the noble person first calls something good out of a sense of personal worth. Only then does the contrast with what is judged inferior arise.'),('Slave morality','Another way of setting values','In Nietzsche’s account, helpfulness, patience, and kindness take on particular value for people who must live under the power of others.'),('The will to power','A hypothesis','In § 36 Nietzsche asks whether the forces of the world might be understood through our experience of drives and willing.'),('The free spirit','An imagined reader and companion','Breaking with an old conviction is one thing. Recognizing what binds you now is another.'),('Plato and Schopenhauer','Philosophical opponents','Plato’s conception of the good and Schopenhauer’s account of the will give Nietzsche occasions to examine the assumptions his predecessors made.')],
'why':[('What is truth worth?','In § 1 the question shifts: why do we want truth more than uncertainty? Even the wish for a certain answer becomes something to investigate.'),('Whose morality?','In § 186 Nietzsche calls for descriptions and comparisons of different moralities. Otherwise a philosopher may simply justify the values already familiar to him.'),('When the reader objects','Nietzsche’s remarks on women, rank, and obedience invite a reader to turn his own questions back on him: whose experiences and desires are finding a voice here?')]}}
def zipped(names,vals):return [dict(zip(names,v)) for v in vals]
titleledger=[];onledger=[];allchanges={};reps={}
for lang,info in shared.items():
 file=f'{b}-modern-{lang}.json';orig=read('source-'+file);d=read(file)
 if lang=='da': titles={8:'Kapitel 8 — Folk og fædreland'}; patches={'que des folies qui':'que de folies, qui','for at leve »vist«':'for at leve »med visdom«','»ufilosofisk« og »uvist«':'»ufilosofisk« og »uden visdom«','Lad os da forsøge at lære at tænke om angående den tyske dybde':'Lad os da forsøge at se på den tyske dybde med nye øjne','til råd Schlosser':'til embedsmanden Schlosser'}
 else: titles={3:'Chapter 3 — The Religious Nature',8:'Chapter 8 — Peoples and Fatherlands',10:'From High Mountains — Aftersong'};patches={'QUE DES FOLIES,':'QUE DE FOLIES,','imcleanliness':'uncleanness','cannot smell each other!':'cannot stand the smell of each other!'}
 for i,t in titles.items():d['chapters'][i]['title']=t
 changes=[]
 for i,(oc,c) in enumerate(zip(orig['chapters'],d['chapters']),1):
  assert c.keys()==oc.keys() and c['number']==oc['number'] and len(c['paragraphs'])==len(oc['paragraphs'])
  if oc['title']!=c['title']:titleledger.append(dict(lang=lang,chapter=i,before=oc['title'],after=c['title']))
  for j,t in enumerate(c['paragraphs'],1):
   old=oc['paragraphs'][j-1]
   for k,v in patches.items():t=t.replace(k,v)
   c['paragraphs'][j-1]=t
   if lang=='da':reps[f'{i}:{j}']=t
   if old!=t:changes.append(dict(chapter=i,paragraph=j,before=old,after=t,reason=reasons.get((i,j),'Correct the quoted French against the German critical edition.') if lang=='en' else 'Render the corresponding full German passage in contemporary Danish and preserve its reader slot.' if (i,j)!=(11,31) else 'Localize the Gutenberg end marker.'))
 put(file,d);allchanges[lang]=changes;put('changes.json' if lang=='da' else 'english-changes.json',changes)
 if lang=='en':put('modern-en-changes.json',changes)
 f=b+('.da' if lang=='da' else '')+'.json';old=read('source-'+f);new=dict(old)
 if lang=='da':new['title']='Hinsides godt og ondt'
 new.update(length=info['length'],about=info['about'],openingText=d['chapters'][0]['paragraphs'][0],angleCards=zipped(['title','text','angleObjective'],info['angles']),cast=zipped(['name','role','description'],info['cast']),whyItMatters=zipped(['title','body'],info['why']))
 assert new.keys()==old.keys()
 for k in old:
  if old[k]!=new[k]:onledger.append(dict(lang=lang,field=k,before=old[k],after=new[k]))
 put(f,new)
put('da-replacements.json',reps);put('title-changes.json',titleledger);put('onboarding-changes.json',onledger)
counts=[len(c['paragraphs']) for c in d['chapters']];assert counts==[2,23,21,18,123,18,10,25,17,37,31]
for lang in shared:
 dd=read(f'{b}-modern-{lang}.json');pp=dd['chapters'][-1]['paragraphs']
 for i in range(15): assert pp[2*i].strip().rstrip('.')==str(i+1) and len(pp[2*i+1].splitlines())==5
 assert all(x.strip() for c in dd['chapters'] for x in c['paragraphs'])
def sha(f):return hashlib.sha256(Path(f).read_bytes()).hexdigest()
prov={'criticalGerman':'https://www.nietzschesource.org/#eKGWB/JGB','independentGerman':'Projekt Gutenberg-DE, Jenseits von Gut und Böse (captured primary-de-2.html through primary-de-12.html)','historicalEnglish':'https://www.gutenberg.org/ebooks/4363','repositoryInputs':read('source-metadata.json'),'localEvidence':{f:sha(f) for f in ['critical-de.html','primary-en.html','german-units.json','german-witness-comparison.json','primary-en-comparison.json']}}
put('provenance.json',prov)
audit={'readerSlots':sum(counts),'slotsByChapter':counts,'numberedAphorisms':'1–296 plus 65a, 73a, 237a','combinedSlots':{'8:23':'236, 237, 237a','10:21':'277, 278','10:23':'280, 281, 282'},'poem':{'stanzas':15,'verseLines':75,'numberLabels':15,'closingSlot':'11:31 is the Gutenberg end marker, not a verse'},'noteSlots':['3:4','6:1','8:16','10:8','10:27'],'sourceComparison':'Critical German is the semantic authority; independent German and Zimmern English serve as witnesses.'}
put('primary-completeness-audit.json',audit)
review=dict(book=b,status='Prepared locally for native Danish final review; unpublished.',reviewedSlots=sum(counts),changedDanishParagraphs=len(allchanges['da']),changedEnglishParagraphs=len(allchanges['en']),changedTitles=len(titleledger),changedOnboardingFields=len(onledger),nativeRead='Pending; no sign-off claimed.',reviewPriorities=['Read the closing poem aloud; assess Danish rhythm and register.','Review technical contrasts between fornem, god, slet and ond; check irony in the aphorisms and attributed quotations.','Check the long sentences, especially §§ 203, 207, 211, 256 and 260.'])
put('REVIEW.json',review);put('state.json',dict(reviewedParagraphs=325,reviewedThrough='11:31',next='Native Danish editorial read',nativeReview='pending',prepared=True))
files=[f'{b}-modern-da.json',f'{b}-modern-en.json',b+'.da.json',b+'.json','REVIEW.json','provenance.json','primary-completeness-audit.json','changes.json','english-changes.json','title-changes.json','onboarding-changes.json','german-witness-comparison.json','primary-en-comparison.json','editorial-notes.json']
put('manifest.json',[dict(name=f,path=str(Path(f).resolve()),bytes=Path(f).stat().st_size,sha256=sha(f)) for f in files]);print(review)
