from pathlib import Path
import json
P=Path(__file__).resolve().parent
def rd(p):return json.loads((P/p).read_text())
def wr(p,d):(P/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
g=rd('reference/middlemarch.json')
assert g['openingText']==rd('reference/original-en.json')['chapters'][0]['paragraphs'][0]
wr('onboarding-en.json',g)
g['length']='8 bøger med forspil, 86 kapitler og en afslutning'
g['estimatedTime']='Ca. 25 timer ved 200 ord i minuttet'
g['openingChapterLabel']='Forspil'
g['openingText']=rd('modern-da.json')['chapters'][0]['paragraphs'][0]
g['about']='Dorothea Brooke vil bruge sit liv på noget, der er værd at hengive sig til. Lægen Tertius Lydgate vil forny lægekunsten. De bor i en engelsk provinsby, hvor en politisk reform står for døren, og hvor ægteskaber, udsigten til arv, gammel gæld og naboernes snak får deres planer til at tage uventede drejninger.\n\nGeorge Eliot følger flere hjem på én gang. Den, man i den ene scene afskriver som latterlig eller selvoptaget, kan man i den næste forstå indefra. Hvor meget ved vi egentlig om, hvad et andet menneske ville med sit liv, når vi kun ser, hvad det blev til?'
g['acclaim'][0].update(quote='den storslåede bog, som trods alle sine mangler er en af de få engelske romaner skrevet for voksne mennesker.',context='Fra essayet »George Eliot« i The Common Reader (1925), først trykt i The Times Literary Supplement den 20. november 1919. Citatet er oversat til dansk.')
g['whyItMatters']=[dict(title=a,body=b) for a,b in [
('At se med en andens øjne','Eliot flytter os fra ét menneskes bevidsthed til et andets. En beslutning, der virker indlysende udefra, ser anderledes ud, når man mærker det håb eller den frygt, der ledte frem til den.'),
('Hvem kan handle på egen hånd?','Forskning, tro, ægteskab og reformer afhænger alle af andre mennesker. Penge og omdømme sætter grænser selv for den, der føler sig sikker på sit kald.'),
('Hvad den daglige omsorg betyder','Ved siden af de store ambitioner står arbejdet, troskaben og de små tjenester, som ingen gør noget væsen af. Kan et liv sætte dybe spor, selv om de færreste hører om det?')]]
g['angleCards']=[dict(title=a,text=b,angleObjective=c) for a,b,c in [
('Det liv, man tror, man gifter sig til','Læg mærke til, hvad hver især venter sig af ægteskabet. Hvornår viser det sig, at den anden har forestillet sig noget helt andet?','Jeg vil sammenligne frierierne og ægteskaberne og følge, hvad penge, magt, forventninger og medfølelse gør ved forholdene.'),
('Hvem tror byen på?','Følg et rygte fra det første fortrolige ord til byens dom. Hvornår ved fortælleren mere end naboerne?','Jeg vil skelne mellem det, folk ved, det, de slutter sig til, og det, de gerne vil tro.'),
('Når en reform skal føres ud i livet','Læs lægens, politikernes og godsforvalterens forsøg på at forbedre forholdene i lyset af hinanden. Hvad skal der til, før en god hensigt bliver til gavn?','Jeg vil undersøge, hvad fagkundskab, penge og samarbejdsvilje betyder for en reform, og hvor godt reformatoren kender de mennesker, det gælder.'),
('At få øje på et menneske igen','Læg mærke til de steder, hvor Eliot får dig til at se på en person, du allerede har dømt. Ændrer det din dom at kende bevæggrunden?','Jeg vil følge, hvordan fortælleren vækker medfølelse, også når et menneske bærer ansvaret for det, der er gået galt.')]]
for person,(role,desc) in zip(g['cast'],[
('Ung idealist','Dorothea vil bruge sine kræfter på noget, der rækker ud over den bekvemme tilværelse, andre har tiltænkt hende.'),
('Dorotheas søster','Celia har sans for hverdagens fornøjelser og ser tit noget, som søsterens høje idealer skygger for.'),
('Præst og lærd i Lowick','Casaubon har viet sig til et omfattende videnskabeligt værk, som han håber vil få varig betydning.'),
('Ny læge i Middlemarch','Lydgate kommer med videnskabelige ambitioner og planer om reformer til en by, hvor en læges fremtid afhænger af både anseelse og velgørere.'),
('Datter af en fabrikant','Rosamond er velopdragen og selskabsvant og drømmer om en mere fornem tilværelse end den, hun kender hjemmefra.'),
('Rosamonds bror','Fred er kærlig, men upålidelig. Han håber, at held og en arv vil fritage ham for selv at vælge en levevej.'),
('En ung kvinde med skarpt blik','Mary er vittig og har selvrespekt nok til at kunne holde af et menneske uden at undskylde dets dårlige opførsel.'),
('Godsforvalter','Caleb sætter pris på dygtigt håndværk og redelighed i forretninger. For ham måles et godt stykke arbejde på andet end fortjenesten.'),
('En ung slægtning til Casaubon','Will har sine egne meninger og stritter imod, når andre vil bestemme hans levevej, selv om han endnu ikke har fundet den selv.'),
('Bankmand og religiøs velgører','Bulstrode støtter byens institutioner økonomisk. Hans religiøse overbevisning får på den måde vægt langt ud over hjemmet.'),
('Bulstrodes hustru','Harriet er født Vincy. Hendes stolthed over familiens position går hånd i hånd med varme og troskab.'),
('Præst','Farebrother kender sine egne svagheder og lader gerne sit venskab komme ufuldkomne mennesker til gode.'),
('Godsejer i nabolaget','Sir James interesserer sig for forbedringer på godset og tager livligt del i søstrene Brookes tilværelse.')]):
 person.update(role=role,description=desc)
wr('onboarding-da.json',g)
for lang in ['da','en']:
 p=rd('reference/middlemarch.'+lang+'.json')
 for item in p['notice']:
  for a in item.get('passages',[]):
   t=rd(('reference/original-en' if a['editionKey']=='original-en' else a['editionKey'])+'.json')['chapters'][a['chapterNumber']-1]['paragraphs'][a['paragraphIndex']]
   assert a['quote'] in t
 wr('primer-'+lang+'.json',p)
