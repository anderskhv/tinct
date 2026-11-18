# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][72]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=73,paragraph=n,before=a,after=b,reason='Russian XI IV page74 full comparison; contemporary Danish and source jokes, exact names, omitted head/ideas sentence, unabridged satirical poem.'))
changes={1:[('Det begyndte at blive skummelt','Det var endda begyndt at skumre'),('Sager blev håndteret i vores lille by, som de gøres overalt ellers','Hos os i den lille by gik det, som det går alle andre steder'),('få samtaler med Mitja ved at gå gennem','besøge Mitja ved at overholde'),('formaliteterne ikke blev slækket','man ikke ligefrem slækkede på formaliteterne'),('Så meget at','Det gik så vidt, at'),('praktisk talt foregik _tête-à-tête_','foregik næsten under fire øjne')],
2:[('Mikhail Mikhajlovitj','Mikhail Makarovitj'),('et mere og mere mildt syn på ham','mere og mere med mildhed på ham'),('kommet til ulykke','gået til grunde'),('en af de mest fortrolige bekendte af','en af de nærmeste bekendte til'),('hang altid rundt om deres hus','rendte hos dem hver dag'),('Han gav også undervisning i fængselsinspektørens hjem, en samvittighedsfuld mand i udførelsen af sine pligter, men venlig af sind','Han gav desuden undervisning hjemme hos fængselsinspektøren, en godmodig gammel mand, som dog passede sin tjeneste strengt'),('oftest om hellige emner','i almindelighed om »visdom«'),('alt blev gjort let','det hele blev ordnet')],
3:[('kom han ind på Rakitin','stødte han på Rakitin'),('pelsforede overfrakke','overfrakke med pelskrave')],
6:[('en flok slavedrivere','en flok slaveejeryngel')],
7:[('»Forbandet — sådan er de alle!« vendte han sig mod Aljosja','»For fanden — sådan er de alle sammen!« Han vendte sig mod Aljosja')],
9:[('Store venner med Rakitin?','Venner med Mikhail?'),('som en bandit','som en slyngel'),('det er forbi med mig nu','nu er det ude med mit hoved')],
11:[('Er du virkelig så håbløs','Har du virkelig helt opgivet håbet')],
12:[('da jeg sagde, det var forbi med mig. Hvorfor','da jeg sagde, det var ude med mit hoved. Det er ikke hovedet, det er ude med, men det, der var inde i det. Hvorfor')],
14:[('Etik! Hvad er etik?','Efik! Hvad er efik?')],
15:[('Etik?','Efik?')],
18:[('kritik med en opbyggelig tendens','kritik med en ædel retning'),('lave en karriere for sig selv','gøre karriere'),('lave karriere','gøre karriere'),('Forbandet etik','Fanden tage efikken'),('Det gør ondt i mit hjerte at se på dig','Mit hjerte skælver ved synet af dig')],
24:[('_De ideabus non est disputandum_','_De tankibus non est disputandum_ — tanker kan ikke diskuteres'),('Jeg kan godt slå mig op som klassicist, ser du','Så er også jeg da trådt ind i klassicismen')],
25:[('Hvorfor er det forbi med dig?','Hvorfor er du fortabt?')],
26:[('Hvorfor er det forbi med mig?','Hvorfor er jeg fortabt?'),('taget som helhed','hvis man tager det hele under ét')],
28:[('de små haler af de nerver','disse nervers små haler'),('billede og lignelse','billede og lighed'),('Rakitin forklarede','Mikhail forklarede'),('et nyt menneske rejser sig','et nyt menneske kommer')],
30:[('de skjuler det. De lyver. De foregiver','de skjuler det. De lyver. De spiller komedie'),('En klog mand ved, hvor han skal gå','En klog mand forstår at sno sig'),('du har stukket benet i klemme, begået et mord','du har begået et mord og er havnet i fælden'),('Et rent svin','Et vaskeægte svin')],
32:[('sætte ens personlighed i modsætning til ens virkelighed','sætte sin personlighed i modsætning til sin virkelighed')],
33:[('Nej, jeg gør ikke','Nej, det gør jeg ikke')],
38:[('en helt historie','en hel historie'),('købe et hus','købe et grundmuret hus'),('der starter jeg en avis','der begynder jeg at udgive en avis'),('ikke for enken, men for de hundrede','ikke efter enken, men efter de hundrede'),('Hun nærmer sig','Hun giver efter'),('Perkhotin fejer alt foran sig','Pjotr Iljitj Perkhotin har fået overtaget'),('den tåbelige gamle nudel','den tåbelige kone'),('forsvare oplysning selv i det','klemme samfundsbekymring ind selv i et fjollet vers'),('Om bedring af min hjertes genstands hævede fod','Til bedring for min udkårnes syge fod')],
39:[(c['paragraphs'][38],'Sikken lille fod, minsandten,\nhævet bare lidt i kanten!\nLæger kommer til og kurerer,\nforbinder og maltrakterer.')],
40:[(c['paragraphs'][39],'Det er ikke fødder, jeg savner —\ndem må Pusjkin prise i fred.\nDet er hovedet, jeg savner,\nsom ingen idéer fatter et kvæk.')],
41:[(c['paragraphs'][40],'Lidt var hovedet begyndt at fatte,\nmen så kom foden i vejen.\nLad nu blot den fod blive rask,\nså hovedet igen kan forstå.')],
42:[('meget snild','rigtig spøgefuld'),('en progressiv idé','noget »samfundsmæssigt«')],
43:[('et afsnit','en artikel')],
44:[('afsnittet','artiklen')],
45:[('Disse afsnit','Disse artikler'),('indrømmede','bekræftede')]}
for n,pairs in changes.items():
 for a,b in pairs:
  if a in c['paragraphs'][n-1]:fix(n,a,b)
  elif n==28 and a=='et nyt menneske rejser sig':fix(n,'Et nyt menneske rejser sig','Et nyt menneske kommer')
  else:raise AssertionError((n,a))
# Improve the second stanza without inventing mental decline absent from source.
fix(40,'som ingen idéer fatter et kvæk','som slet ikke fatter idéer')
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');g=json.loads((p/'PROGRESS.json').read_text());g.update(danish_repairs=len(r),partial_chapter={'chapter':73,'danish_paragraphs_reviewed':'1–45','english_followup':'pending','remaining_paragraphs':'46–97'});(p/'PROGRESS.json').write_text(json.dumps(g,indent=2)+'\n');print(len(r))
