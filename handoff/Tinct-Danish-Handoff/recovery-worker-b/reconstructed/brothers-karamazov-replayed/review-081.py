# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][80]
changes={1:[('hele bevisførelsen ført sammen','alle de afgivne og hørte forklaringer samlet'),('på behørig vis','på rette sted'),('uheldige udfald','skæbnesvangre udfald')],
2:[('forlade sig på','støtte sig til'),('en formssag','en formalitet'),('så fast fastslået','så sikkert fastslået'),('en så desperat sag','en så håbløs sag')],
3:[('mistænkte, at','anede, at'),('en sport','en leg'),('accepterede metoder','gængse advokatgreb')],
4:[('sprang forsvareren regulært på ham','gik forsvareren straks hårdt til ham'),('med lige så stor tillid','med samme sikkerhed'),('Karamazov-familiens familieliv','Karamazov-familiens forhold')],
5:[('nogen klart bevis','noget klart bevis'),('særegne fraseologi','særegne udtryksmåde'),('en kvik knægt, men dum og lidende','en begavet fyr, men dum og plaget af sygdom')],
6:[('i så nær opvartning på Deres herre','så tæt på Deres herre')],
7:[('Af hvad var den balsam — eller rettere afkog — lavet','Hvad indeholdt den balsam — eller rettere tinktur —'),('brugte den aften til at gnide Deres lændesmerter med i håb om at kurere dem','gned Deres smertende lænd med før sengetid den aften i håb om at helbrede den')],
8:[('safran','salvie')],
9:[('safran','salvie')],
10:[('røllike','vejbred')],
13:[('Etcetera','Og så videre')],
16:[('gnedet','gnubbet')],
18:[('et glas vin eller to','et lille snapseglas eller to')],
21:[('hvad der menes','hvad der var meningen')],
24:[('Ved De som en kendsgerning','Ved De med sikkerhed')],
28:[('Og hvilket år er det, anno Domini','Og hvilket år er det nu, efter Kristi fødsel')],
31:[('Jeg er en tjener','Jeg er en undergiven mand'),('mine bedre','mine overordnede')],
32:[('et gran af tvivl i sindet','en lille tvivlens orm i sindet'),('Men før Grigorij forlod','Forsvareren havde altså alligevel nået sit mål. Men før Grigorij forlod')],
33:[('plukket lusene af mig','kæmmet lusene af mig')],
40:[('De skader Dem selv i Deres dommeres mening','De skader selv Deres sag i dommernes øjne')],
41:[('et af de førende vidner, og en','et af de vigtigste vidner, og et'),('»blårhår«','»skureklud«')],
42:[('Ruslands fortrængte tilstand','Ruslands kaotiske tilstand'),('Rakitins diskurs','Rakitins fremstilling'),('sine ideer','dens tanker')],
43:[('af det høje i sine egne følelser','af sin egen høje ædelmodighed'),('tale noget foragteligt','tale noget foragtfuldt'),('holdte elskerinde','underholdte elskerinde')],
44:[('fromme dedikation','from dedikation'),('Den afdøde starets, fader Zosimas liv','Levnedsbeskrivelse af starets fader Zosima, hensovet i Gud')],
46:[('tage det bredeste syn på ethvert socialt spørgsmål','anlægge et bredt syn på ethvert samfundsfænomen'),('bredt udbredt','udbredt'),('betydelig tjeneste','en vis gavn'),('lære af Dem','spørge Dem om'),('madame Svetlova','fru Svetlova')],
48:[('i hast til at undskylde sig','skyndte sig at undskylde'),('underholdt _élite_ af den lokale ungdom','tog imod eliten af byens unge'),('Alexej','Aleksej'),('madame Svetlova','fru Svetlova')],
52:[('det høje idealisme','den ophøjede ædelhed'),('højtfølende','ædelsindede'),('ikke gik af uden','heller ikke forløb uden')],
53:[('opportunist','karrieremager')],
54:[('sagkyndige observation','forudgående »undersøgelse«')],
56:[('Hvem sagde, du ikke skulle fortælle det? Hvem taler du om?','Hvem sagde, at De ikke måtte fortælle det? Hvem taler De om?')],
58:[('kom slet ikke i stand','udeblev fuldstændig')],
59:[('udregnede næsten på fingrene','regnede nærmest på fingrene ud'),('efterlod han ikke nogen kvittering','efterlod han ikke sin underskrift'),('lagde det altsammen sammen','regnede det hele nøjagtigt sammen på kuglerammen')],
60:[('så klart som en mønt','helt ned til sidste kopek'),('»sine bedre«','»de overordnede«')],
61:[('han ikke ville huske det','han næppe kan huske det')],
62:[('indførte et frygteligt antal polske ord','blandede frygteligt mange polske ord ind'),('trods sine udflugter','trods sine undvigelser'),('udskiftet en anden bunke kort med den, han havde stillet til rådighed','byttet det sæt kort, han havde stillet til rådighed, ud med sit eget'),('havde snydt under spillet','havde snydt med et kort, mens han holdt banken')],
63:[('hvilket godt formål dette kunne tjene','hvilket større, afgørende formål det skulle tjene'),('ikke var en mand, der kom tilbage uden succes','ikke var typen, der vendte tomhændet hjem')]
}
for n,items in changes.items():
 for a,b in items:
  t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=81,paragraph=n,before=a,after=b,reason='Russian XII II page82 full comparison: herbs sage/plantain, glass size, missing conclusion32, repeated nickname, amount, card-swap direction, legal dialogue and contemporary Danish.'))
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
e=json.loads((p/'candidate-brothers-karamazov-modern-en.json').read_text());
for n in [7,8,9,10,18,32,41,44,46,53,56,59,60,62]:print(n,e['chapters'][80]['paragraphs'][n-1])
