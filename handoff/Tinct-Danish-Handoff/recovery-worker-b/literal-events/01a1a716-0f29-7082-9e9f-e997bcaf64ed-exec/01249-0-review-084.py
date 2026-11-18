# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent
changes={
1:[('Jeg kan bemærke','Jeg bør nævne'),('ikke kunne fremtræde','ikke kunne møde frem')],
2:[('Hovedvidnerne','De vigtigste vidner'),('som sandsynligvis havde lidt information at give efter alt det, der var blevet givet','som næppe kunne fortælle noget særligt efter alt det, der allerede var kommet frem'),('ekstraordinær langsomhed','påfaldende langsomhed'),('gjorde et pinligt indtryk','gjorde et smerteligt indtryk'),('et jordagtigt udtryk','noget jordslået')],
3:[('han var et vidne uden ed','han ikke skulle aflægge ed som vidne'),('hans ansigt slappede gradvist af i et smil','et smil bredte sig langsomt over hans ansigt')],
6:[('kiggede efter retstjeneren overalt','søgte med øjnene efter retstjeneren')],
7:[('Bekymrer Dem ikke','Vær ikke urolig')],
17:[('Jeg vil stå op, hvis jeg har lyst, og jeg vil ikke, hvis jeg ikke har.','Har jeg løst, springer jeg op, har jeg løst, la’r jeg vær.'),('De prøvede at få hendes sarafan på for at føre hende til kirken for at blive gift','De gik efter hende med en sarafan, en slags kjole, eller var det et skørt, så hun kunne rejse sig, få det bundet om sig og blive kørt til vielsen'),('Det står i en eller anden bog om bondestanden.','Det hører til et eller andet sted i vores folketradition.')],
19:[('det materielle bevismateriale','de fysiske beviser'),('Hr. politiinspektør, tag dem.','Hr. retstjener, giv dem videre.')],
24:[('_Panem et circenses_.','Brød og skuespil!'),('Selv om jeg er én, der skal snakke!','Men jeg skal da også nødig snakke!'),('Giv mig en drik','Giv mig noget at drikke')],
25:[('hjernebetændelse','delirium'),('grådigt','intenst')],
26:[('Bekymrer Dem ikke','Vær rolig')],
27:[('kommunikerede i oprørte hviskninger','hviskede ophidset sammen'),('syntes pludselig at fatte sig','syntes pludselig at besinde sig')],
29:[('Jeg har intet bevis.','Jeg har ingen vidner.'),('sender Dem ikke beviser','sender Dem ikke en forklaring')],
31:[('det ville være uregelmæssigt','det er jo ikke efter reglerne'),("_Le diable n'existe point!_","_Le diable n'existe point!_ — Djævelen eksisterer jo ikke!"),('Bekymrer Dem ikke om det','Læg ikke mærke til ham'),('det materielle bevismateriale','de fysiske beviser'),('den geologiske kataklysme','den geologiske omvæltning'),('Det er fordi hans hjerte er let!','Det er, fordi han har det let!')],
35:[('Der er mere vidneudsagn, jeg må give','Jeg har mere at vidne om og må gøre det'),('han fantaserer!','han er i delirium! Jeg har i tre dage kunnet se, at han har febervildelser!')],
36:[('dets matematiske afgørende karakter blev anerkendt','man tillagde det netop denne matematiske beviskraft')],
38:[('sin egen smålighed','sin egen nederdrægtighed'),('for at vinde den skabning','for at forføre den skabning'),('Hvordan, hvordan kunne han have undladt at forstå','Hvordan, hvordan skulle han have kunnet undgå at forstå'),('Jeg ville bevise, hvad han var','Jeg ville afsløre ham'),('så fortabt for al æresfølelse','så blottet for ære')],
41:[('De penge var en tortur for ham','De penge pinte ham'),('Han ville betale dem tilbage til mig','Han ville betale mig tilbage'),('Jeg dræber ham, så snart Ivan er taget af sted.','Jeg dræber ham, bare Ivan er rejst.'),('opdaget hver mening, der lå bag det','gransket hver eneste detalje i det')],
42:[('hensynsløs over for alle konsekvenser for sig selv','ligeglad med alle følgerne for hende selv'),('en måned tilbage','en måned tidligere')],
43:[('Jeg burde ikke have skrevet det','Jeg ville ikke have skrevet det')],
45:[('han kan ikke mistænke noget andet end usselhed','han kan kun forestille sig usle motiver'),('altsammen','alt sammen')],
46:[('ekstraordinær klarhed','usædvanlig klarhed')],
47:[('formindske sin brors skyld','mindske sin brors skyld'),('en sart, alt for sart samvittighed','en dyb, dyb samvittighed'),('legenden cirkulerede','historien cirkulerede'),('på randen af hjernebetændelse','tæt på febervildelser')],
48:[('kastet sig på en ung udsvævers nåde','kastet sig i armene på en ung udsvæver'),('i rædsel for ham','af frygt for, hvad der skulle ske med ham')],
49:[('den enfoldige Mitja','den troskyldige Mitja'),('hysterisk, »flænset« kærlighed','hysterisk, selvpinende kærlighed'),('den flængede kærlighed','den selvpinende kærlighed'),('ville have vokset','kunne være vokset')],
51:[('et farligt anfald af hjernebetændelse','et yderst farligt anfald af febervildelser'),('ikke havde indvilliget i at blive plejet','ikke ville lade sig behandle')],
52:[('talerne fra anklagemyndigheden og forsvaret','afslutningen: anklagerens og forsvarerens taler og selve dommen')]
}
english={
17:[('They were trying to get her into her sarafan, to take her to church for her wedding','They were following her with a sarafan, or was it a skirt, so she would stand up, let them tie it on, and be taken to her wedding'),('It’s in some book about the peasantry.','It’s something from our folk customs.')],
19:[('Mr. Superintendent, take it.','Mr. Court Usher, pass it on.')],
24:[('_Panem et circenses_.','Bread and circuses!')],
25:[('brain fever','delirium')],
29:[('I have no proof.','I have no witnesses.'),('send you proofs','send you testimony')],
31:[('_Le diable n’existe point!_','_Le diable n’existe point!_ — The devil does not exist!')],
35:[('he is delirious!','he is delirious! I’ve seen him feverish for three days now!')],
47:[('a tender, too tender, conscience','a deep, deep conscience')],
52:[('for the speeches for the prosecution and the defense','for the outcome: the speeches for the prosecution and the defense, and the verdict')]
}
for lang,items in [('da',changes),('en',english)]:
 f=p/f'candidate-brothers-karamazov-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][83]
 for n,pairs in items.items():
  for a,b in pairs:
   t=c['paragraphs'][n-1];assert a in t,(lang,n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=84,paragraph=n,before=a,after=b,reason='Full Russian XII V page85 comparison; restored three-day fever testimony, folk-custom anecdote, court usher, quotation and conscience distinctions; contemporary Danish. Historical delirium/fever language retained without imposing encephalitis diagnosis.'))
 f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
