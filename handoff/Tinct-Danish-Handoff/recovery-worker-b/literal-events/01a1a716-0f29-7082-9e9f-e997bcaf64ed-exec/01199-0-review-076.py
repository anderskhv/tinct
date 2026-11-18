# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][75]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=76,paragraph=n,before=a,after=b,reason='Russian XI VII page77 full comparison: Smerdyakov accusation register, material details, drunken letter, attribution of suspicion, contemporary Danish.'))
changes={1:[('delt i to af en gang, på den ene side hvoraf Marja Kondratjevna og hendes mor boede, og på den anden Smerdjakov','med to stuer adskilt af en forstue; i den ene boede Marja Kondratjevna og hendes mor, og i den anden Smerdjakov alene'),('om som en ven eller som logerende','om han boede gratis eller betalte'),('langt overlegen sig selv','et menneske, der stod langt over dem')],
2:[('Væggene var muntre med blåt tapet','Væggene var pyntet med blåt tapet'),('to bænke langs hver væg','to bænke langs væggene'),('en potte pelargonie på hvert af de to små vinduer','en potte med pelargonier i hver af de to små vindueskarme'),('stilebog','skrivehæfte'),('en flad jernlysestage','en lav støbejernslysestage')],
3:[('slog Ivan med det samme','bemærkede Ivan med det samme'),('regulært ondskabsfuldt','direkte ondskabsfuldt')],
5:[('Tag frakken af,','Tag De frakken af,'),('indrømmede Smerdjakov','gav Smerdjakov ham lov')],
7:[('strengt og impulsivt','strengt og fremfusende')],
9:[('fjantede ud med','vrøvlede om')],
10:[('ringeagtede enhver omsvøb eller indirekte snak','foragtede alle omsvøb og antydninger')],
11:[('Dette mente jeg dengang, og dette er grunden til, at jeg sagde det: at De, idet De på forhånd vidste om dette mord på Deres egen far, overlod ham til sin skæbne, og at folk derefter ikke måtte drage nogen grim slutning om Deres følelser — og måske om noget andet også — det er det, jeg lovede ikke at fortælle myndighederne.','Det, jeg mente dengang, og grunden til, at jeg sagde det, var dette: De kendte på forhånd til mordet på Deres egen far og lod ham blive tilbage som offer. For at folk så ikke skulle drage ufordelagtige slutninger om Deres følelser — og måske om noget andet også — lovede jeg at lade være med at fortælle myndighederne det.')],
14:[('Jeg er fuldkommen i besiddelse af alle mine evner.','Jeg er ved mine fulde fem.')],
17:[('dit stinkende uvæsen','din stinkende slyngel')],
18:[('ønskede Deres fars død meget kraftigt','brændende ønskede Deres fars død')],
19:[('slog ham af al kraft på skulderen','slog ham af al kraft med knytnæven på skulderen'),('Et øjeblik efter var hans ansigt','Et øjeblik efter var Smerdjakovs ansigt'),('en syg mand','en svag mand'),('tørrede han øjnene med et meget snavset blåternet lommetørklæde','dækkede han øjnene med sit helt tilsnottede blåternede bomuldslommetørklæde')],
21:[('Hver linje','Hvert træk')],
23:[('sagde Smerdjakov vredt','sagde Smerdjakov såret'),('føle Dem på tænderne','sætte Dem på prøve')],
24:[('Føle på hvad?','Prøve hvad?')],
25:[('blev myrdet eller ej','snarest blev myrdet eller ej')],
27:[('Det var dig, der myrdede ham?','Det var dig, der myrdede ham!')],
28:[('foragteligt','foragtfuldt')],
31:[('føle Dem på tænderne','sætte Dem på prøve')],
34:[('Hvad nu igen!','Jaså!')],
37:[('mindst fyrre tusind til at komme til hver af jer','knap fyrre tusind til hver af jer'),('ikke ville have efterladt jer tre to rubler imellem jer','ikke ville have efterladt jer tre så meget som to rubler tilsammen')],
40:[('alle adelens rettigheder','alle sine adelsrettigheder'),('Alexej','Aleksej')],
41:[('hvis jeg dengang havde regnet med nogen, ville det have været med dig','hvis jeg dengang havde sat min lid til nogen, ville det have været dig')],
46:[('om De vil','tænk engang')],
50:[('sentensagtige','belærende'),('hvad enten det er det fulde franske Republik','selv i den mest fuldkomne franske republik')],
51:[('stilebogen','skrivehæftet')],
52:[('for det tilfælde, at jeg en dag skulle komme','når jeg tænker på, at jeg måske en dag selv kan komme')],
53:[('hvis jeg ikke slår dig ihjel','hvis jeg ikke allerede har banket dig ihjel')],
59:[('uden at svare yderligere på Smerdjakov','uden at svare Smerdjakov mere'),('Der var en lys måne på himlen.','Månen lyste klart på himlen.'),('for hundrede gang','for hundredende gang')],
60:[('hvor meget hun forsøgte at lulle ham','hvor meget hun talte ham til ro'),('pirrede ham til det','tilskyndede ham til det')],
61:[('åbnede en æske','låste et skrin op'),('afgørende bevis','matematisk bevis'),('ved vejkrydset','ude på marken'),('Det var som talen af en fuld mand','Det var som en fuld mands tale'),('ekstraordinær hede','usædvanlig iver'),('et snavset stykke almindeligt papir af den billigste slags','en snavset lap almindeligt skrivepapir af dårlig kvalitet'),('der var tal kradset på bagsiden af det','der stod en regning på bagsiden'),('hans druknede ordrigdom','hans berusede ordstrøm'),('den sidste linje','de sidste linjer')],
62:[('Hvis jeg så skal i Sibirien for det','Om jeg så skal i straffearbejde for det'),('Bedre Sibirien end din kærlighed','Hellere straffearbejde end din kærlighed'),('se ikke foragteligt','se ikke foragtfuldt på mig'),('for at holde stand snarere end at udholde din stolthed','for at holde sig oprejst og slippe for at udholde din stolthed'),('indhyllet i blod','tilsølet med blod')],
64:[('et logisk bevis','et matematisk bevis'),('Mistanken slog i øvrigt aldrig Ivan','Det faldt i øvrigt aldrig Ivan ind'),('hans håner','hans hån'),('undrede han sig regulært over, hvordan han kunne have været så frygtelig plaget af sine mistanker','undrede han sig ligefrem over, hvordan Smerdjakovs mistanker havde kunnet krænke ham så smertefuldt')],
65:[('som var ham så hadefulde','som han hadede så stærkt'),('fordi han var sin fars morder','fordi han havde dræbt deres far')],
66:[('et ømt sted, der stadig var tilbage i hans hjerte','en rift i hans hjerte, der ikke ville hele'),('Hele','Hele'),('hele dette ømme sted','hele denne rift'),('Noget meget dybt syntes at brænde og rådne i hans sjæl.','Noget fjernt, men brændende, nagede hans sjæl.')],
67:[('Da Ivan, efter sin samtale med Aljosja, pludselig besluttede sig med hånden på sin lejligheds klokke, til at gå til Smerdjakov, adlød han et pludseligt og særegent indfald af forargelse.','Da Ivan efter sin samtale med Aljosja stod med hånden på klokken til sin bolig og pludselig besluttede at gå til Smerdjakov, fulgte han en særlig forargelse, som med ét var blusset op i hans bryst.'),('havde kunnet lade de ord passere','havde kunnet lade de ord gå upåtalt hen')]
}
changes[66]=[x for x in changes[66] if x[0]!=x[1]]
for n,items in changes.items():
 for a,b in items:fix(n,a,b)
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print('DA76',len(r))
e=json.loads((p/'candidate-brothers-karamazov-modern-en.json').read_text())
for n in [2,19,23,25,27,37,50,53,61,62,64,66]:print(n,e['chapters'][75]['paragraphs'][n-1])
