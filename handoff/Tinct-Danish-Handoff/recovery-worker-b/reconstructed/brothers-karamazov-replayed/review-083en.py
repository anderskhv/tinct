# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent
changes={
1:[('sit rivaliseri','sin rivalisering'),('afviste med indignation forslaget','afviste harmdirrende antagelsen'),('rivaliseriet','rivaliseringen')],
5:[('i et yderste øjeblik ... i et øjeblik af raseri','i en yderlig situation ... i et øjebliks afsky')],
7:[('at jeg gjorde.','at jeg gjorde det.')],
9:[('den fuldstændige oprigtighed af Deres overbevisning','at Deres overbevisning er fuldt oprigtig'),('højst individuelt','yderst særegent'),('den foreløbige undersøgelse','forundersøgelsen'),('den foreløbige forundersøgelse','forundersøgelsen')],
10:[('den foreløbige forundersøgelse','forundersøgelsen'),('af mig selv','på eget initiativ')],
12:[('Jeg blev ledt til at gøre det af min bror Dmitris ord.','Jeg pegede på ham ud fra det, min bror Dmitri havde sagt.')],
15:[('Er det alt det bevis, De har?','Er det alle Deres beviser?')],
17:[('Og af Smerdjakovs skyld','Og for Smerdjakovs skyld')],
19:[('var stærkt skuffende','var dybt skuffende'),('ekstraordinære beviser','helt usædvanlige beviser')],
20:[('sin krydsforhør','sit krydsforhør')],
21:[('en omstændighed, som jeg fuldstændig havde glemt selv','noget, som jeg også selv helt havde glemt')],
22:[('Og åbenbart først nu, for første gang, ramt af en idé, fortalte han ivrigt,','Tydeligvis grebet af en tanke, der først nu var faldet ham ind, fortalte han ivrigt,'),('at han måtte finde i sit hjerte styrken','at han i sit hjerte kunne finde styrken'),('hvori han havde femten hundrede rubler','som de femten hundrede rubler var syet ind i')],
24:[('i lynende hast','i al hast'),('fremlagde varmt sin teori','fremsatte ivrigt den formodning'),('hvis hun samtykkede','hvis hun sagde ja')],
27:[('den foreløbige forundersøgelse','forundersøgelsen'),('Og hvilken tortur, hvilken tortur den gæld har været for ham!','Og hvor har han lidt, hvor har han lidt under den gæld!')],
28:[('Havde den anklagede syntes at pege på noget?','Virkede det virkelig, som om den tiltalte pegede på noget?')],
31:[('Således endte','Så sluttede'),('en lille smule bevis, en blot antydning af et bevis','et ganske lille bevis, næsten kun antydningen af et bevis'),('den foreløbige forundersøgelse','forundersøgelsen'),('Med rødmende ansigt bevægede han sig','Med blussende ansigt gik han')],
32:[('noget ekstraordinært','noget usædvanligt'),('ved hendes indtræden','da hun kom ind'),('Hun talte blødt','Hun talte stille'),('på den forståelse','på den betingelse'),('Han havde ikke behov for at bekymre sig om den gæld bagefter.','Det var unødvendigt, at han bagefter pinte sig sådan over den gæld.')],
34:[('hans uegennytte','at han ikke var pengegrisk'),('de uheldige tre tusind rubler','de ulyksalige tre tusind rubler'),('Jeg var engang ham skyldig for økonomisk hjælp på mere end tre tusind, og jeg tog imod den','Jeg fik engang selv et lån af ham på mere end tre tusind, og jeg tog imod det')],
35:[('sin krydsforhør','sit krydsforhør')],
36:[('Fandt det sted ikke her, men','Var det ikke et andet sted, her i'),('her i i begyndelsen','begyndelsen'),('de fire tusind rubler','de fem tusind rubler'),('hendes »bukken til jorden for ham«','at hun »bøjede sig helt ned til jorden for ham«')],
37:[('og hendes bukken til jorden, og hendes grund','hvordan hun havde bøjet sig helt ned til jorden, og hvorfor'),('Hun skjulte det gavmildt','Storsindet fortiede hun det'),('Det var noget uhyrligt!','Det var dybt rystende!'),('Retssalen var tavs og spændt for at fange hvert ord.','Retssalen sad åndeløs og fangede hvert ord.'),('foragteligt stolt','foragtfuldt stolt'),('selvopgivelse','selvopofrelse'),('i hans favør','til hans fordel'),('sidste fire tusind','sidste fem tusind'),('jeg havde en pinefuld anelse i hjertet','mit hjerte snørede sig smerteligt sammen')],
38:[('den mest højt agtede af vores damer','selv de mest ansete af vores damer'),('hædrende','ædelt')],
39:[('have undladt at forstå','have undgået at forudse'),('sandheden af hendes historie','sandheden i hendes historie'),('sidste fire tusind','sidste fem tusind'),('for usammenhængende','svær at forene'),('anklagen om tyveri','anklagen om røveri'),('Men da hun var færdig, råbte han pludselig med hulkende stemme:','Men da hun var færdig, rakte han armene mod hende og råbte pludselig med hulkende stemme:')],
41:[('fordømt','dømt')],
43:[('anbefalet til nåde','behandlet med mildhed')],
44:[('glatte, lydløse gang','rolige, glidende og lydløse gang'),('let svajende holdning','lette svajen'),('Hun så stadigt','Hun så vedholdende'),('foragtelige og nysgerrige blikke','foragtfulde og nysgerrige blikke'),('I et øjeblik','Det ene øjeblik'),('vred, foragtelig og rå','vred, foragtfuld og rå')],
52:[('forsøgte at betage mig','prøvede at lokke mig')],
53:[('moderere sit sprog','dæmpe sine udtryk')],
54:[('Vi tager til Sibirien sammen!','Vi går i straffearbejde sammen!')],
55:[('Han er ikke den mand, der fortæller en løgn.','Han er ikke sådan en mand, der lyver.')],
56:[('sin krydsforhør','sit krydsforhør'),('for at bringe Aleksej Fjodorovitj Karamazov for at se Dem','for at føre Aleksej Fjodorovitj Karamazov hen til Dem')],
57:[('hånede Grusjenka','snerrede Grusjenka'),('mest til luksus','mest til fornøjelser')],
60:[('havde vidst af det','havde kendt til det'),('stavnsbåndet','livegenskabet'),('foragtelige øjne','foragtfulde blikke')]
}
# Correct the question directly rather than retain the source translation’s tangled inversion.
changes[36][0:2]=[('Fandt det sted ikke her, men i begyndelsen af Deres bekendtskab?','Det var altså et andet sted, dengang De lige havde lært hinanden at kende?')]
for lang,items in [('en',{
5:[('in a moment of fury','in a moment of revulsion')],
22:[('with the fifteen hundred roubles in it','with the fifteen hundred roubles sewn inside')],
28:[('The prosecutor, of course, objected.','The prosecutor, of course, intervened.')],
36:[('four thousand','five thousand')],
37:[('four thousand','five thousand')],
38:[('the most respected of our ladies declared','even the most respected of our ladies declared')],
39:[('four thousand','five thousand'),('the charge of theft','the charge of robbery'),('he suddenly cried out in a sobbing voice:','he stretched his arms toward her and suddenly cried out in a sobbing voice:')],
54:[('We’ll go to Siberia together!','We’ll go to penal servitude together!')]
})]:
 f=p/f'candidate-brothers-karamazov-modern-{lang}.json';d=json.loads(f.read_text());rfile=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rfile.read_text());c=d['chapters'][82]
 for n,pairs in items.items():
  for a,b in pairs:
   t=c['paragraphs'][n-1]
   if a not in t and n==27 and a=='den foreløbige forundersøgelse':continue
   assert a in t,(lang,n,a)
   c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=83,paragraph=n,before=a,after=b,reason='Full Russian XII IV page84 comparison: source wording, restored details, formal address and modern Danish idiom. Russian narrator says five thousand here; Garnett normalizes to four thousand.'))
 f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rfile.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
