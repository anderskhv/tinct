# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][69]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=70,paragraph=n,before=a,after=b,reason='Full Russian XI I page71 comparison; contemporary Danish, psychological state, loan documents, named details and coherent callback to Mitya’s dream.'))
changes={1:[('katedralpladsen','domkirkepladsen'),('enkefru Morozov','enkefru Morozova'),('for at bringe beskeder til Mitja','i ærinder for Mitja'),('En udtrykssikker fasthed og forstandig målbevidsthed var trådt frem i hendes ansigt','Hendes blik havde fået en ny fasthed og klarhed'),('en standhaftig, fin, ydmyg beslutsomhed, som intet kunne ryste, kunne ses i hende','hun viste en urokkelig, ydmyg, men god og uigenkaldelig beslutsomhed')],
2:[('blinkede med den gamle hævnlystne ild','glimtede med en ildevarslende ild'),('endda havde fantaseret','endda havde talt i vildelse')],
3:[('En pakke spillekort, der var givet til et parti »tåber«, lå på bordet','Der lå spillekort på bordet, delt ud til et parti durak, »fjols«'),('bomulds-nathue','bomuldsnathue'),('og var tydeligt','og var tydeligvis'),('eksistens','tilstedeværelse')],
6:[('Mr. Kalganov','hr. Kalganov')],
7:[('Fenja og hendes bedstemor, kokken','Fenja og hendes mor, Grusjenkas kokkepige'),('for at holde sig fra at dvæle ved sin sorg','for ikke at dvæle ved sin sorg'),('fandt ham nødvendig','ikke kunne undvære ham')],
10:[('vi har haft en uvejr om de piroger','der har været et frygteligt røre om de piroger'),('Jeg lader dem være hos fangevogteren','Jeg lægger dem hos fangevogteren')],
13:[('Hvorfor holder du ham?','Hvorfor forsørger du ham?'),('Så du er begyndt at holde ham','Så du er begyndt at forsørge ham'),('jaloux over min spisen og søvn','jaloux både når han spiser, og når han sover')],
15:[('egger','ægger'),('ligegyldigt','åndsfraværende')],
16:[('særligt bekymret','særligt oprevet')],
17:[('Du siger, han er bekymret — men hvor bekymret er jeg ikke!','Du siger, han er oprevet — men hvor oprevet er jeg så ikke!')],
21:[('Tys, Maksimusjka','Ti nu stille, Maksimusjka'),('vodka','urtebitter')],
22:[('bruge Deres godhed på folk mere nyttige end mig','vise Deres godhed mod mennesker, der er mere brug for end mig')],
23:[('Æh, alle har en nytte, Maksimusjka — hvordan kan nogen sige, hvem der er den mest nyttige?','Åh, der er brug for alle, Maksimusjka — og hvem kan vide, hvem der er mest brug for?'),('den polakker','den polak')],
24:[('en kvittering for beløbet','et gældsbrev på beløbet'),('sådanne kvitteringer','sådanne gældsbreve'),('en kvittering underskrevet','et gældsbrev underskrevet'),('få hoved eller hale i det','få hoved og hale i det')],
25:[('båret af sted med fra Mitja','vundet fra Mitja'),('overrasket over at finde dem modtage hende','overrasket over, at de modtog hende'),('den største punktlighed','de mest omstændelige høflighedsformer')],
26:[('et dusin piroger','en halv snes piroger')],
27:[('Det vil jeg ikke fortælle ham for noget','Det fortæller jeg ham under ingen omstændigheder')],
30:[('har også et heftigt hjerte','har selv et hårdt hjerte'),('bestilt en læge','hentet en læge'),('den lærdeste også','den allermest kyndige'),('så meget desto mere skam over ham','skamløse menneske'),('jeg er den, der er skyld i det først','jeg var skyld i det før ham')],
34:[('hvordan vil han blive dømt?','hvordan kommer retssagen til at foregå?'),('stå op for ham','forsvare ham')],
40:[('ruinere ham','ødelægge ham')],
42:[('gik i retning af at bevise, at han gjorde det','fik det til at se ud, som om han havde gjort det'),('og på kroen også — før, folk havde hørt ham sige det','og det, folk tidligere havde hørt på værtshuset')],
43:[('en frygtelig ophobning af beviser','kommet frygtelig mange vidneudsagn')],
44:[('døren var åben','døren var ulåst')],
46:[('om et lille barn — om et eller andet barn','om »den lille« — et eller andet barn'),('Hvorfor er det lille barn fattigt?','Hvorfor er den lille fattig?'),('Det er for det lille barn','Det er for den lille'),('Hvad det betød, hvilket lille barn','Hvad det betød, hvem den lille var'),('Hvad er dette lille barn?','Hvem er denne »lille«?')],
47:[('Det må være Rakitin, der har været på besøg hos ham for nylig','Rakitin er af en eller anden grund begyndt at besøge ham så ofte')],
50:[('Sikke en pige jeg er! Slynger det bare ud!','Sådan er jeg! Nu har jeg plapret løs!'),('Han galoperede herfra fra Moskva','Han skyndte sig jo hertil fra Moskva'),('han kom hemmeligt','han kom i hemmelighed')],
53:[('strider rundt','går frem og tilbage'),('med højre hånd','med en finger på højre hånd')],
54:[('bekymret','oprevet')],
55:[('bekymret','oprevet')],
57:[('Få sat mig til ro, så jeg ved det værste, der venter mig','Giv mig dødsstødet, så jeg dog kender min forbandede skæbne')],
58:[('det er noget med dig at gøre','det har noget med dig at gøre')],
61:[('Sig mig det på din samvittighed — sig mig det værste','Svar ærligt — skær mig bare i hjertet')],
63:[('så gennemskuelig','så åbenmundet')],
65:[('pille hans hemmelighed ud af ham','presse hans hemmelighed ud af ham'),('har lovet at fortælle dig','har lovet at fortælle dig den')],
66:[('i sådan en sindstilstand','i den tilstand')]}
for n,pairs in changes.items():
 for a,b in pairs:fix(n,a,b)
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');g=json.loads((p/'PROGRESS.json').read_text());g.update(danish_repairs=len(r),partial_chapter={'chapter':70,'danish_paragraphs_reviewed':'1–66','english_followup':'pending','remaining_paragraphs':'none'});(p/'PROGRESS.json').write_text(json.dumps(g,indent=2)+'\n');print(len(r))
