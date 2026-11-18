# -*- coding: utf-8 -*-
import pathlib,json,re
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][71]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=72,paragraph=n,before=a,after=b,reason='Full Russian XI III page73 comparison: modern Danish, exact actions/timing, formal address, moral versus emotional language, intrusive fantasies kept in character voice.'))
a=c['title'];c['title']='III. En lille djævel';r.append(dict(chapter=72,field='title',before=a,after=c['title'],reason='Idiomatic Danish diminutive title.'))
changes={1:[('halvt lænet i den invalidestol','halvt tilbagelænet i den stol'),('blegt og gusten','blegt og gustent')],
2:[('i timevis','i to timer')],
4:[('lyttet','lyttet ved døren'),('Jeg vil ikke undskylde','Jeg beder ikke om forladelse')],
6:[('Lige nu reflekterede jeg, for tredevte gang, hvor godt det er','Jeg sad netop igen og tænkte, for tredivte gang, på hvor godt det er'),('en seddel til at bringe til den mand','et brev at bringe til den mand'),('sandelig levere','helt sikkert aflevere'),('fyrretyveårig','fyrreårig')],
8:[('åbenhjertigt','troskyldigt')],
9:[('Åbenhjertigheden','Det troskyldige')],
16:[('fortælle dig en længsel, jeg har','fortælle dig om et ønske, jeg har')],
17:[('Er du forelsket i uorden?','Er du begyndt at holde af kaos?')],
18:[('uorden','kaos'),('sætte ild på','sætte ild til')],
19:[('Hun viftede med hånden med et afskyfuldt udtryk','Hun slog hånden afværgende ud i afsky')],
20:[('Det er dit luksuriøse liv','Du lever i overflod')],
23:[('din munk','din afdøde munk'),('»Ak, tal ikke, sig ingenting,« viftede hun med hånden mod ham','»Åh, tal ikke, sig ingenting!« Hun viftede afværgende med hånden mod ham'),('Du har sagt mig','Du har fortalt mig'),('hvorfor gøre ingenting','hvorfor bare sidde her'),('vi vil holde et føl','så har vi et lille føl')],
25:[('gjort kur til mig','erklæret mig sin kærlighed'),('sno snurretoppe','snurre en top')],
27:[('han vil snos op og sættes i gang','han skal sættes i gang og snurre rundt')],
29:[('i den næste verden','i det hinsides')],
30:[('så støt på hende','betragtede hende indgående')],
31:[('sætte ild på','sætte ild til')],
32:[('sætte ild på','sætte ild til')],
34:[('Du tager ondt for godt','Du tager det onde for det gode')],
37:[('finde det ud','opdage det')],
38:[('Det ved jeg ikke.','Sådan er det.'),('sætte ild på','sætte ild til')],
42:[('er et lille ønske om at gøre det i det også','også er lidt trang til det')],
44:[('selv om i de gamle dage sjov og munterhed aldrig havde forladt hende','selv om spøg og munterhed tidligere aldrig havde forladt hende')],
46:[('hader ondt','hader det onde')],
50:[('bliver dømt nu','skal for retten nu')],
52:[('elsker de simpelthen det. Jeg for én elsker det','elsker de det. Jeg er den første til at elske det')],
58:[('med virkelig overdreven forbavselse','med en næsten overdreven forbavselse')],
60:[('usædvanligt slået','dybt rystet')],
65:[('da han blev dømt','ved retssagen'),('inden for fire timer','efter fire timer')],
67:[('ananas_kompot_','ananaskompot')],
68:[('gusten ansigt','gustne ansigt')],
69:[('den lille ting','den lille dreng'),('ananas_kompot_','ananaskompot'),('bønfaldt ham _særligt_ om at komme','bad ham om _endelig_ at komme'),('Hun rejste sig op på sofaen, hendes øjne blinkede','Hun rettede sig op på sofaen med lynende øjne')],
76:[('Den person opførte sig hæderligt','Den mand var ærlig over for dig')],
78:[('ananas_kompot_','ananaskompot')],
79:[('blinkende øjne','lynende øjne')],
83:[('Lise syntes at bide tænderne sammen','sagde Lise nærmest skærende tænder'),('Barnet med de afskårne fingre er rart','Det med barnet med de afskårne fingre er rart')],
86:[('varmt','inderligt')],
91:[('uden undtagelse _af nogen_','uden at undtage _nogen_'),('jeg hader ham','jeg hader')],
93:[('Hils Mitja fra mig','Kys Mitja fra mig')],
94:[('et bittesmå brev','et lillebitte brev')],
96:[('åbnede Lise slåen, åbnede den lidt','trak Lise slåen fra og åbnede døren på klem'),('gik hun blødt, langsomt, hen','gik hun stille og langsomt hen'),('satte sig op i den og så indtrængende','satte sig rank i den og stirrede'),('sværtede finger','sortnede finger')],
97:[('Jeg er et elendigt menneske, elendigt, elendigt, elendigt!','Ussel, ussel, ussel, ussel!')]}
for n,pairs in changes.items():
 for a,b in pairs:fix(n,a,b)
# The former betrothed pair still use formal Russian address; retain it in Danish.
for n,t in enumerate(c['paragraphs'],1):
 if n in [1,7,13,19,44,60,68,84,94,96,97]:continue
 parts=re.split(r'(›.*?‹)',t)
 for i,s in enumerate(parts):
  if s.startswith('›'):continue
  for a,b in [('du','De'),('Du','De'),('dig','Dem'),('din','Deres'),('dit','Deres'),('dine','Deres')]:s=re.sub(r'\b'+a+r'\b',b,s)
  parts[i]=s
 b=''.join(parts)
 if b!=t:fix(n,t,b)
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');g=json.loads((p/'PROGRESS.json').read_text());g.update(danish_repairs=len(r),partial_chapter={'chapter':72,'danish_paragraphs_reviewed':'1–97','english_followup':'pending','remaining_paragraphs':'none'});(p/'PROGRESS.json').write_text(json.dumps(g,indent=2)+'\n');print(len(r))
