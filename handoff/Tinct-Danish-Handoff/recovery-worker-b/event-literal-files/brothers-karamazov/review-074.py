# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][73]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=74,paragraph=n,before=a,after=b,reason='Full Russian XI V page75 comparison: formal address and consequential switch to intimate du; omitted sentence, image, distance, speech register and contemporary Danish.'))
changes={1:[('steg op ad trappen','gik ind på trappen'),('genkendte han ham som sin bror','genkendte han sin bror')],
4:[('hun er oprevet','hun er »oprevet«')],
5:[('En dør blev øjeblikkeligt slået op ovenfor','En dør ovenfor blev pludselig slået op')],
6:[('Alexej','Aleksej'),('kommer du','kommer De')],
8:[('Kom op','Kom indenfor'),('og du, Ivan Fjodorovitj, du må komme tilbage, du må. Hører du?','og De, Ivan Fjodorovitj, De skal komme tilbage, De skal! Hø-rer De!')],
11:[('Undskyld, jeg beholder frakken på','Tillad mig at beholde frakken på')],
12:[('Sæt dig, Alexej','Sæt Dem, Aleksej'),('havde slået ham som særligt smuk','havde forekommet ham usædvanlig smuk')],
14:[('At du skulle skåne dig selv','At De skulle skåne Dem selv'),('der gik mellem jer','der skete mellem Dem'),('dengang I først lærte hinanden at kende','dengang De først lærte hinanden at kende')],
15:[('Sig det, Alexej','Sig det, Aleksej')],
17:[('Både dig selv og ham','Både Dem selv og ham')],
18:[('Det glæder mig at høre','Netop'),('snerrede hun ondskabsfuldt','sagde hun hårdt og ondt')],
19:[('Du kender mig endnu ikke, Alexej','De kender mig endnu ikke, Aleksej'),('vil du trampe mig ned under fødderne','får De lyst til at trampe mig ned')],
20:[('Du vil','De vil')],
21:[('for hundrede gang','for hundredende gang')],
22:[('Aljosja studsede over hendes tone. Han havde ikke anet en sådan fortrolighed mellem dem.','Aljosja fór sammen, da han hørte hende sige _du_. Han havde ikke engang anet, at de stod i et sådant forhold til hinanden.')],
23:[('afbrød Ivan samtalen','skar Ivan af')],
25:[('Følg efter ham! Indhent ham! Lad ham ikke være alene et øjeblik!','Gå efter ham! Indhent ham! Lad ham ikke være alene et øjeblik!'),('i en forhastet hvisken','hviskende og hastigt'),('Ved du ikke','Ved De ikke'),('Lægen har sagt det','Det har lægen fortalt mig')],
27:[('»Hvad vil du?« vendte Ivan sig hurtigt mod Aljosja, da han så ham komme løbende.','»Hvad vil du?« Ivan vendte sig brat mod Aljosja, da han så ham komme løbende.')],
28:[('Jeg sad lige og så på dit ansigt','Jeg så på dit ansigt deroppe hos hende')],
30:[('Alexej','Aleksej'),('med en tone af den enkleste nysgerrighed','med den mest ligefremme nysgerrighed')],
36:[('tænker','tænker')],
38:[('foragteligt','foragtfuldt')],
40:[('letfærdige kvinder','løsagtige kvinder')],
41:[('med en bedrøvet stemme','med sorg i stemmen'),('Jeg havde håbet at høre noget fra dig','Jeg kunne jo ikke lade være med at give dig hendes brev. Tværtimod havde jeg håbet at høre noget fra dig')],
42:[('Alexej','Aleksej')],
46:[('Om hun skal redde Mitja eller ødelægge ham.','Om hun skal vise sig som Mitjenkas frelser eller hans ødelægger.')],
51:[('gav genlyd smerteligt','gav en smertefuld genlyd')],
52:[('Hvilket bevis kan hun fremlægge','Hvad kan hun afgive forklaring om')],
53:[('utvetydigt beviser','med matematisk sikkerhed beviser')],
56:[('gentog Aljosja varmt','gentog Aljosja ivrigt')],
58:[('efter din mening','efter Deres mening')],
59:[('udtalte Aljosja','sagde Aljosja')],
68:[('Er du vanvittig?','Taler du i vildelse?'),('Hans øjne var fæstnet på Aljosja','Hans blik borede sig ind i Aljosja')],
71:[('adlydende en uimodståelig befaling','som om han adlød en uimodståelig befaling')],
76:[('begyndte at føle sig urolig','nu var ved at blive bange')],
78:[('Pludselig syntes han at standse sig selv.','Men pludselig syntes han at beherske sig.'),('grin','smil')],
79:[('Jeg siger dig én gang for alle — det var ikke dig. Hører du, én gang for alle!','Jeg siger dig dette for resten af dit liv: _Det var ikke dig!_ Hører du, for resten af dit liv!')],
81:[('Alexej','Aleksej'),('det ved du udmærket','det ved De udmærket'),('med dig','med Dem'),('Jeg beder dig','Jeg beder Dem'),('dit logi','Deres logi'),('Du gør klogt i særligt at passe på ikke at komme i nærheden af mig i dag! Hører du?','Og vogt Dem især for at besøge mig i dag! Hører De?')],
83:[('så henvend dig til mig før nogen anden','så tænk først og fremmest på mig')],
84:[('i et hus hos nogle håndværksfolk','hos en småborgerfamilie'),('boede et stykke vej derfra','boede ret langt derfra'),('en døv, gigtplaget gammel kone','en ældgammel, helt døv og gigtplaget kone'),('Han ordnede alt selv i det ene værelse','Han gjorde selv rent i det værelse')],
85:[('slap han klokken, vendte sig om med en forbandelse','slap han klokken, spyttede og vendte om'),('Han gik halvanden mil','Han gik hen mod den modsatte ende af byen, omtrent to verst fra sit hjem,'),('en pludselig og uimodståelig tilskyndelse','en pludselig og uimodståelig tanke')]
}
del changes[36]
for n,items in changes.items():
 for a,b in items:fix(n,a,b)
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print('DA74',len(r))
e=json.loads((p/'candidate-brothers-karamazov-modern-en.json').read_text())
for n in [18,22,41,46,52,53,58,79,81,83,84,85]:print(n,e['chapters'][73]['paragraphs'][n-1])
