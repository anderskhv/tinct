# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][68]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=69,paragraph=n,before=a,after=b,reason='Full Russian X VII page70 comparison; modern Danish, medical title contrast, bell-name pun, spitting action, formal address and scriptural allusion.'))
changes={1:[('indpakket i sin pels og med hatten','svøbt i pelsfrakken og med kasketten'),('undskyldende bukkende','mens han bukkede og næsten vred sig for ham')],
3:[('Jeg kan ikke hjælpe det','Hvad skal jeg gøre'),('sin sædvanlige mine af betydningsfuldhed','sin sædvanlige myndige stemme')],
5:[('De må være forberedt på alt','For-be-red Dem på alt'),('i eftertrykkelige, skarpe toner','skarpt og med tryk på hver stavelse')],
7:[('gav-nli-ge','gavn-li-ge')],
10:[('han slog hænderne ud, omfattende sine omgivelser','han slog ud med begge hænder mod omgivelserne')],
11:[('en seddel til ham','en anbefaling til ham'),('til mentalspecialisten Lepelletier','til psykiateren Lepelletiers klinik')],
12:[('træ-vægge','tømmervægge')],
13:[('til min beklagelse','til min beklagelse')],
14:[('apoteker','læge')],
16:[('Det er Perezvons herre — bekymr Dem ikke om mig','Det er Perezvons herre, læge — bekymr Dem ikke om min person')],
17:[('Perezvon?','Klokkeklang?')],
18:[('Han hører klokken, men hvor den er, kan han ikke fortælle. Farvel, vi mødes igen i Syrakus.','Han hører nok en klokke, men ved ikke, hvor den hænger. Farvel, læge, vi ses i Syrakus.')],
19:[('Lægen fløj i et forfærdeligt raseri','Lægen blev pludselig rasende')],
20:[('bemærk ham ikke','tag Dem ikke af ham'),('Bemærk ham ikke','Tag Dem ikke af ham')],
22:[('apoteker','læge')],
23:[('du siger et ord til, vil jeg ikke have mere med dig at gøre','De siger ét eneste ord til, bryder jeg med Dem for altid')],
24:[('Der er kun ét menneske','Læge, der er kun ét menneske'),('dette er den mand','det er dette menneske')],
25:[('så, med en forbandelse, gik han hurtigt ud til vognen','så spyttede han og gik hurtigt ud til vognen')],
26:[('tavse hulken','tavse hulk')],
27:[('Hvor jeg er ked af det for dig!','Hvor har jeg ondt af dig!')],
29:[('skjulte sit ansigt på sin fars skulder','gemte ansigtet mod sin fars skulder')],
31:[('Tys, gamle ven','Ti stille, gamle ven')],
33:[('stadig omfavnende hinanden','stadig i hinandens arme')],
36:[('Hvor er det skade','Hvor er det ærgerligt'),('for hele dagen, for hele aftenen','hele resten af dagen, hele aftenen')],
38:[('du må endelig holde dit ord','De må endelig holde Deres ord')],
39:[('skamfuld over det','flov over det')],
41:[('bed tænderne sammen','skar tænder'),('da gid min tunge —','så lad min tunge klæbe —'),('Han brast af i en hulken','Ordene druknede i et hulk'),('med absurde klynkende skrig','med mærkelige, skingre hvin')],
43:[('Kommer du selv?','Kommer De selv?')],
46:[('gid —','så lad mig rammes —')],
47:[('Sørg for at komme','De må endelig komme'),('med ren rasen','helt rasende')]}
for n,pairs in changes.items():
 for a,b in pairs:
  if a!=b:fix(n,a,b)
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
f=p/'candidate-brothers-karamazov-modern-en.json';d=json.loads(f.read_text());r=json.loads((p/'ENGLISH-REPAIRS.json').read_text());changes=[(5,'You must be ready for anything','Pre-pare for anything'),(5,'stressing each word','stressing each syllable'),(11,'to the mental specialist Lepelletier','to the psychiatrist Lepelletier’s clinic'),(14,'apothecary','medic'),(16,'I’m Perezvon’s master. Don’t mind me','I’m Perezvon’s master, medic. Don’t concern yourself with who I am'),(17,'Perezvon?','Ringing?'),(18,'Good-by, we’ll meet','Good-by, medic, we’ll meet'),(24,'Only one man','Medic, only one person'),(25,'Then, with a curse, he hurried','Then he spat and hurried'),(41,'may my tongue—','may my tongue cling—')]
for n,a,b in changes:
 t=d['chapters'][68]['paragraphs'][n-1];assert a in t,(n,a);d['chapters'][68]['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=69,paragraph=n,before=a,after=b,reason='Russian X VII: precise syllabic delivery, clinic, lesser medical title lekar not pharmacist, partial hearing of dog-name ringing, spit not curse, scriptural verb restored.'))
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'ENGLISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
