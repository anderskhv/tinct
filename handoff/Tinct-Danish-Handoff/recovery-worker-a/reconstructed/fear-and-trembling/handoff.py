from pathlib import Path
import hashlib,json,re
b='fear-and-trembling'
def get(f):return json.loads(Path(f).read_text())
def put(f,x):Path(f).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def sha(f):return hashlib.sha256(Path(f).read_bytes()).hexdigest()
on={
'da':('Frygt og bæven','Forord, fire variationer over Abraham, en lovtale, en indledning, tre filosofiske problemer og en epilog','Søren Kierkegaard udgav bogen i 1843 under navnet Johannes de silentio. Johannes vender tilbage til det øjeblik i Første Mosebog, hvor Abraham løfter kniven over Isak. Han begynder med fire forskellige måder at fortælle rejsen til Morija på. Ingen af dem gør Abraham lettere at forstå. Senere spørger han, hvordan man kan holde Abraham for troens far, når det etiske sprog kalder hans hensigt mord.',[
('Hør de fire fortællinger','Læg mærke til, hvem der mister noget i hver version af rejsen. Efter hver fortælling følger et billede af en mor, der vænner sit barn fra brystet. Hvad ændrer sig fra det ene billede til det næste?','Jeg vil læse de fire fortællinger hver for sig, før jeg sammenligner dem.'),
('Følg den dobbelte bevægelse','Johannes kan forestille sig at give afkald på Isak. Hvad han ikke kan begribe, er, hvordan Abraham samtidig kan tro, at han får ham igen. Se efter, hvor forskellen viser sig i fortællingen om den unge mand og prinsessen.','Jeg vil forstå, hvad der adskiller den uendelige resignation fra troen.'),
('Se, hvem der kan forklare sig','Agamemnon kan henvise til, at hele folkets skæbne er på spil. Isak er derimod Abrahams egen søn, og Abraham kan ikke pege på et fælles gode, som hans handling skal tjene.','Jeg vil sammenligne Abraham med de tragiske helte på det punkt, hvor de skal stå til ansvar.'),
('Lyt til den, der taler','Johannes skifter mellem lovtale, spøg og argument. Han insisterer på, at han kan beundre Abraham uden selv at kunne handle som ham.','Jeg vil lægge mærke til, hvornår Johannes bekender noget om sig selv, og hvornår han stiller et spørgsmål til mig.')],[
('Abraham','Faderen','På vejen til Morija skal han både elske Isak og være rede til at ofre ham. Det er denne samtidighed, Johannes bliver ved med at vende tilbage til.'),
('Isak','Løftets barn','Han er sønnen, Abraham og Sara har ventet på. Hans spørgsmål om offerlammet fremkalder Abrahams eneste svar til ham på vejen.'),
('Sara','Isaks mor','I de fire fortællinger ser hun efter de rejsende, kysser sin søn eller løber ham i møde. I det tredje problem spørger Johannes, hvad Abraham skylder hende at fortælle.'),
('Johannes de silentio','Den pseudonyme fortæller','Han taler i eget navn. Han kan beskrive troens bevægelser og siger åbent, at han ikke selv kan foretage dem.'),
('Agamemnon og Ifigenia','Den tragiske helt og hans datter','Agamemnons offer i Aulis giver Johannes et modstykke til Abraham. Datteren kan forstå, hvad en far, der handler for hele folket, mener at skylde det.'),
('Troens ridder','En tænkt samtidsskikkelse','Johannes forestiller sig en mand på søndagstur, der glæder sig til et stegt lammehoved. Hvad der foregår i hans tro, kan man ikke aflæse af hans gang eller appetit.')],[
('Prøv fortællingen på dens sværeste sted','Det er let at sige, at Abraham gav Gud det bedste, han havde. Johannes beder os sætte navnet Isak tilbage i sætningen. Så får også en fars pligt over for sit barn en stemme.'),
('Tag tavsheden alvorligt','Brudgommen i Delfi, Agnete og havmanden og tvivleren Faust viser vidt forskellige grunde til at tie. Med dem som baggrund bliver det mere præcist, hvad Johannes mener, når han siger, at Abraham ikke kan tale.'),
('Læs uden at kende udfaldet på forhånd','Vi ved, at vædderen står på bjerget. Abraham har endnu hverken set den eller hævet kniven. Den forskel beder Johannes os blive ved længe nok til at mærke.')]),
'en':('Fear and Trembling','A preface, four variations on Abraham, a eulogy, a preliminary outpouring, three philosophical problems, and an epilogue','Søren Kierkegaard published this book in 1843 as Johannes de silentio. Johannes keeps returning to the moment in Genesis when Abraham raises the knife over Isaac. He begins with four different ways of telling the journey to Moriah. None makes Abraham easier to understand. Later he asks how Abraham can be called the father of faith when the ethical description of what he intends to do is murder.',[
('Listen to the four tellings','Notice who loses something in each version of the journey. Each is followed by an image of a mother weaning her child. What changes from one image to the next?','I want to read each telling on its own before comparing them.'),
('Follow the double movement','Johannes can imagine giving Isaac up. What he cannot grasp is how Abraham can also believe that he will get Isaac back. Look for the distinction in the story of the young man and the princess.','I want to understand the difference between infinite resignation and faith.'),
('Ask who can explain himself','Agamemnon can point to the fate of a whole people. Isaac is Abraham’s own son, and Abraham can name no common good that his act would serve.','I want to compare Abraham with the tragic heroes at the moment they must answer for what they do.'),
('Listen to the speaker','Johannes moves between praise, jokes, and argument. He insists that he can admire Abraham without being able to act as Abraham did.','I want to notice when Johannes admits something about himself and when he puts a question to me.')],[
('Abraham','The father','On the road to Moriah he must love Isaac and be ready to offer him up. It is the coexistence of those two things that keeps drawing Johannes back.'),
('Isaac','The promised child','He is the son for whom Abraham and Sarah have waited. His question about the lamb draws Abraham’s one recorded reply to him on the journey.'),
('Sarah','Isaac’s mother','Across the four tellings, she watches the travelers depart, kisses her son, or runs out to meet them. The third problem asks what Abraham owes it to her to say.'),
('Johannes de silentio','The pseudonymous narrator','He speaks in his own name. He can describe the movements of faith and freely admits that he cannot make them himself.'),
('Agamemnon and Iphigenia','A tragic hero and his daughter','The sacrifice at Aulis provides a contrast with Abraham. A daughter can understand what a father believes he owes to the whole people.'),
('The knight of faith','An imagined contemporary','Johannes pictures a man on a Sunday outing looking forward to a roasted lamb’s head. Neither his gait nor his appetite gives his faith away.')],[
('Put the son back into the story','It is easy to say that Abraham gave God the best he had. Johannes asks us to put Isaac’s name back in that sentence. A father’s duty to his child then makes a claim of its own.'),
('Take silence seriously','The bridegroom of Delphi, Agnes and the merman, and Faust the doubter have very different reasons for keeping silent. Their stories sharpen the question of what Johannes means when he says that Abraham cannot speak.'),
('Read before the outcome is known','We know that the ram is on the mountain. Abraham has neither seen it nor raised the knife yet. Johannes asks us to stay with that difference long enough to feel it.')])}
ls={};ons=[];ts=[];enr=get('english-reasons.json')
for l,(title,length,about,cards,cast,why) in on.items():
 fn=b+'-modern-'+l+'.json';src=get('source-'+fn);new=get(fn);ledger=[]
 for i,(sc,c) in enumerate(zip(src['chapters'],new['chapters']),1):
  assert sc.keys()==c.keys() and sc['number']==c['number'] and len(sc['paragraphs'])==len(c['paragraphs'])
  if sc['title']!=c['title']:ts.append(dict(language=l,chapter=i,before=sc['title'],after=c['title']))
  for j,(a,z) in enumerate(zip(sc['paragraphs'],c['paragraphs']),1):
   assert z.strip() and '__NOTE' not in z
   if a!=z:ledger.append(dict(chapter=i,paragraph=j,before=a,after=z,reason='Modernize directly from the Danish original; retain the narrative voice, argument and reader position.' if l=='da' else enr[f'{i}:{j}']))
 ls[l]=ledger;put('changes.json' if l=='da' else 'english-changes.json',ledger)
 fn=b+('.da' if l=='da' else '')+'.json';s=get('source-'+fn);o=dict(s)
 def arr(ks,vs):return [dict(zip(ks,x)) for x in vs]
 o.update(title=title,length=length,about=about,openingText=new['chapters'][0]['paragraphs'][0],angleCards=arr(['title','text','angleObjective'],cards),cast=arr(['name','role','description'],cast),whyItMatters=arr(['title','body'],why))
 assert o.keys()==s.keys()
 for k in o:
  if o[k]!=s[k]:ons.append(dict(language=l,field=k,before=s[k],after=o[k]))
 put(fn,o)
put('title-changes.json',ts);put('onboarding-changes.json',ons)
d=get(b+'-modern-da.json');en=get(b+'-modern-en.json');n=get('critical-notes.json')
where=[['4:3'],['4:22'],['4:23'],['5:32'],['6:25'],['7:17'],['7:16'],['7:21','7:24'],['7:29'],['7:35'],['7:37'],['7:39'],['7:51'],['7:68'],['7:80'],['7:84'],['8:5'],['8:6']]
notelist=[]
for k,pieces in enumerate(where):
 txt=[]
 for s in pieces:
  i,j=map(int,s.split(':'));v=d['chapters'][i-1]['paragraphs'][j-1];assert '_Forfatterens note:_ ' in v;txt.append(v.split('_Forfatterens note:_ ')[1].strip())
 notelist.append(dict(number=k+1,danishSlots=pieces,critical=n[k],modernDanish=txt))
put('authorial-notes-audit.json',notelist)
notes=get('source-footnotes-en.json')['footnotes']
for x in notes:assert x['after'] in en['chapters'][x['chapter']-1]['paragraphs'][x['paragraph']]
assert len(notes)==18
da_counts=[len(x['paragraphs']) for x in d['chapters']];en_counts=[len(x['paragraphs']) for x in en['chapters']]
assert da_counts==[5,13,17,42,32,29,88,6] and en_counts==[4,15,14,35,29,22,61,4]
assert len(ls['da'])==232
srcs=get('source-metadata.json')
for f,s in srcs.items():
 bb=Path(f).read_bytes();assert hashlib.sha1(b'blob '+str(len(bb)).encode()+b'\x00'+bb).hexdigest()==s['sha'];s['sha256']=sha(f)
fm=get('footnote-meta.json');srcs['source-footnotes-en.json']=dict(sha=fm['sha'],sha256=sha('source-footnotes-en.json'),url=fm['html_url'])
critical='https://raw.githubusercontent.com/kb-dk/SKS_tei/e29d5b9ea97109179c6d5205fb44ddc4e6fa3a83/data/v1.9/fb/'
put('provenance.json',dict(criticalEdition='https://tekster.kb.dk/text/sks-fb-txt-root',verifiedPublication='1843, Johannes de silentio',original=critical+'txt.xml',originalSha256=sha('primary-da.xml'),apparatus=critical+'kom.xml',apparatusSha256=sha('primary-commentary-da.xml'),repositoryWitnesses=srcs))
audit=dict(danishCounts=da_counts,englishCounts=en_counts,authorNotes=18,englishFootnoteAnchorsMatched=18,modernDanishAuthorNotes='Included inline or in dedicated existing reader slots; note 8 is one authorial note in two existing slots.',structuralChecks=['Four numbered variants and one weaning passage after each','Both quoted Shakespeare poems retained','Title, subtitle, pseudonymous byline, German epigraph, main narrative and epilogue checked against SKS','Chapter and paragraph counts verified independently per edition; existing DA and EN have distinct layouts.'],restorations=['Second and third weaning refrains, previously absent','Missing author-note material, including discussion of passion, Lessing, wish and duty, and most of the ironist’s passage','Completed prose broken by inline notes and corrected the Danish reading tale (speak), formerly tabe (lose), in the Delphi episode.'])
put('primary-completeness-audit.json',audit)
review=dict(book=b,state='Complete local editorial draft; native Danish final read pending.',danishParagraphsReviewed=sum(da_counts),danishParagraphsChanged=len(ls['da']),englishParagraphsCompared=sum(en_counts),englishParagraphsChanged=len(ls['en']),authorNotesVerified=18,titleChanges=len(ts),onboardingFieldsChanged=len(ons),reviewPriorities=['Compare the four deliberately different accounts and their weaning images aloud.','Check the narrator’s repeated technical terms den enkelte, det almene, anfægtelse, in particular the difference between trial and temptation.','Decide whether to display the Danish author notes in a dedicated note interface; the draft preserves them in the reader text.','The section title Først må jeg lette mit hjerte renders the figurative sense of Expectoration; the original title remains in the historical edition.'],humanSignoff='pending',release='Unpublished')
put('REVIEW.json',review);put('state.json',dict(prepared=True,reviewedDanishSlots=232,englishCompared=184,sections=8,notes=18,nativeReview='pending',next='Native Danish final read'))
files=[b+'-modern-da.json',b+'-modern-en.json',b+'.json',b+'.da.json','REVIEW.json','provenance.json','primary-completeness-audit.json','changes.json','english-changes.json','title-changes.json','onboarding-changes.json','authorial-notes-audit.json','front-matter.json']
put('manifest.json',[dict(name=f,path=str(Path(f).resolve()),bytes=Path(f).stat().st_size,sha256=sha(f)) for f in files]);print(review)
