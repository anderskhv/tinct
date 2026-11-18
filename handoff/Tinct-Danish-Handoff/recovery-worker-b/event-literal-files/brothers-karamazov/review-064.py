# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][63]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=64,paragraph=n,before=a,after=b,reason='Full Russian X II page65 comparison; modern Danish, literal calques and missing distinctions in children’s and Kolya’s voices.'))
changes={1:[('frostvejrede, sneklædte og blæsende november-dag','frostklare, råkolde novembermorgen'),('det tilfældigvis var sådan, at alle dets ældre beboere var fraværende','alle husets voksne tilfældigvis var ude'),('en doktorfrue','en lægefrue'),('havde taget sit afsked tolv måneder tidligere og var først gået til Orenburg','var rejst bort for et år siden, først til Orenburg'),('ville hun bestemt være opløst i tårer fuldstændigt','ville hun have grædt sig helt i opløsning'),('var Katerina, hendes eneste tjenestepige, pludselig blevet bevæget aftenen før til at meddele, til sin frues forbavselse, at hun foreslog at bringe et barn til verden inden morgen','havde hendes eneste tjenestepige, Katerina, natten mellem lørdag og søndag pludselig meddelt sin aldeles uforberedte frue, at hun havde tænkt sig at føde et barn inden morgen'),('sandsynligheden for det','noget til det'),('se efter hende','passe hende'),('Ved morgenen var al Mrs. Krassotkins venlige sympati og energi blevet kaldt på for at yde bistand og appellere til nogen om hjælp i sagen','Om morgenen blev der af en eller anden grund også brug for al fru Krasotkinas hjælp og venlige deltagelse: Hun kunne bede nogen om et eller andet og lægge et godt ord ind')],
2:[('beskytte og se efter','vogte og passe'),('efterladt på egen hånd','helt alene tilbage'),('Kolja, gående frem og tilbage gennem værelserne, kom ind i forstuen','Kolja på sin vandring frem og tilbage gennem værelserne kom ud i forstuen'),('gav to høje, indsmigrende slag på gulvet med halen','slog to faste, indsmigrende slag i gulvet med halen'),('fløjten lød ikke for at frigive ham','det befriende fløjt lød ikke'),('Kolja ville se strengt','Kolja så strengt'),('faldt tilbage i lydig stivhed igen','atter stivnede lydigt'),('forældreløse »ungenser«','»ungerne«, der nu var overladt til sig selv'),('en billedbog','en børnebog'),('sørget for mere underholdende underholdning til dem','fundet på noget mere underholdende til dem'),('sendt dem på skjul rundt i huset','leget gemmeleg med dem rundt i hele huset'),('stanghest','sidehest i et spand'),('på dette tidspunkt','i vor tid'),('afparerede hovmodigt dette stik','afviste stolt denne beskyldning'),('at at lege heste med drenge på sin egen alder, drenge på tretten, ville bestemt være skændigt','det ganske vist ville være skammeligt at lege heste med jævnaldrende, trettenårige drenge')],
3:[('meget vigtigt forretning for sig forude','et meget vigtigt ærinde at ordne'),('hos hvem han kunne have efterladt børnene','som kunne passe børnene'),('set ængsteligt på','set bekymret ind til'),('grinede de op til ham','smilede de bredt til ham')],
4:[('tog han sin foret vinterfrakke med dens kattepelskrave på','tog han sin vatterede vinterfrakke med kattepelskraven på'),('en klagelig vinjen høre','et klagende hyl høre')],
5:[('ikke læsende, men varmt skændende om noget','men nu læste de ikke; de diskuterede ivrigt et eller andet'),('forskellige spændende problemer i livet','forskellige udfordrende spørgsmål om livet'),('stod stille i gangen','blev stående i døråbningen')],
6:[('de gamle koner finder','jordemødrene finder'),('den gamle kone ikke','jordemoderen ikke')],
9:[('funderede dybt','tænkte grundigt over det')],
12:[('Måske har hun en mand, kun han er i fængsel','Måske har hun haft en mand, men han er i fængsel')],
14:[('indtil hun nu har fået det — det vil sige, ikke en mand, men en baby','indtil hun til sidst fik — ja, ikke en mand, men en baby')],
16:[('Kom, ungenser','Nå, unger'),('I er forfærdelige mennesker, ser jeg','I er farlige folk, kan jeg se')],
18:[('det er sikkert','det er fastslået og skrevet under')],
19:[('hvad der blev bedt af dem','hvad han ville have dem til')],
21:[('Et udtryk af dyb nedslåethed kom over børnenes ansigter','Børnene så dybt ulykkelige ud')],
25:[('Ah, det skal I jo nok spørge om!','Ja, nu vil I nok se!')],
27:[('Den kan dræbe nogen; du behøver bare at sigte på nogen','Den kan dræbe hvem som helst, man skal bare sigte'),('et lille hul som et fænghul','et lille hul, der tjente som fænghul'),('den slog tilbage','den gav rekyl')],
28:[('Hvad der særligt slog deres fantasi var, at kanonen slog tilbage','Det satte især deres fantasi i gang, at kanonen gav rekyl')],
31:[('slæbte hun','trak hun ordene ud')],
32:[('dykkede tilbage i sin taske','stak igen hånden i tasken'),('en lille flaske frem indeholdende lidt rigtigt krudt','en lille flaske frem med lidt rigtigt krudt i'),('en papirsnurre','et sammenfoldet stykke papir'),('korkede endda flasken op','tog endda proppen af flasken')],
33:[('advarede Krassotkin dem sensationelt','advarede Krassotkin for at gøre indtryk')],
34:[('en ærefrygt-fyldt skræk','en ærefrygtig rædsel')],
38:[('tag det, men vis det','tag dem, men vis dem'),('tro, det er krudt','tro, at det er krudt')],
39:[('giver os aldrig prygl','slår os aldrig med et ris')],
40:[('færdiggøre sætningen','få det til at lyde flot'),('bedrage jeres mor','lyve for jeres mor'),('ungenser','unger')],
41:[('»Vi vi—il græde,« slæbte Kostja','»Vi vil græ—æde,« trak Kostja ordene ud')],
42:[('med forsigtig hast','hurtigt og forskræmt')],
43:[('hvor er jeres år fyldt med fare','hvor er jeres alder dog farlig'),('Der er ingen hjælp for det','Der er ikke andet at gøre')],
45:[('Der er ingen hjælp for det','Der er ikke andet at gøre')],
46:[('stridhåret','langhåret'),('Han vinjede','Han hvinede'),('en kraftig kvinde på fyrre, ar af kopper','en kraftig kvinde på omkring fyrre med kopar i ansigtet'),('Hun holdt posen op i sin venstre hånd','Hun lod posen hænge i venstre hånd'),('holdt Perezvon død','ladet Perezvon spille død')],
47:[('Bare tænk, en hund!','Se bare den hund!'),('sentensiøst','belærende')],
48:[('Hvorfor er du sen, kvinde?','Hvorfor kommer du så sent, kvindfolk?')],
49:[('Kvinde, så sandelig! Gå videre med dig','Kvindfolk, minsandten! Hold op med dig')],
51:[('glad for at nyde en træfning','glad for at kunne mundhugges')],
52:[('letsindige unge kvinde','letsindige gamle kone'),('våge årvågent over','holde uafbrudt øje med')],
56:[('»Unger,« vendte Kolja sig mod børnene','»Unger,« sagde Kolja og vendte sig mod børnene')],
58:[('skåne deres ømme år','tage hensyn til deres sarte alder')],
59:[('Gå videre med dig!','Gå din vej!'),('det er, hvad du fortjener','det er, hvad du gør')]}
for n,pairs in changes.items():
 for a,b in pairs:fix(n,a,b)
for n,t in enumerate(c['paragraphs'],1):
 for a,b in [('Mrs. Krassotkins','fru Krasotkinas'),('Mrs. Krassotkin','fru Krasotkina'),('Krassotkin','Krasotkin'),('doktorfrue','lægefrue')]:
  if a in c['paragraphs'][n-1]:fix(n,a,b)
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
f=p/'candidate-brothers-karamazov-modern-en.json';d=json.loads(f.read_text());r=json.loads((p/'ENGLISH-REPAIRS.json').read_text());changes=[(1,'the evening before','during the night from Saturday to Sunday'),(2,'the bereaved “kiddies”','the “kiddies,” left on their own'),(2,'a picture-book','a children’s book'),(6,'old women find babies','midwives find babies'),(6,'the old woman couldn’t','the midwife couldn’t'),(16,'You’re terrible people','You’re dangerous people'),(40,'round off the sentence','make it sound fine'),(46,'She held the bag up in her left hand','She let the bag hang from her left hand'),(52,'you frivolous young person','you frivolous old woman')]
for n,a,b in changes:
 t=d['chapters'][63]['paragraphs'][n-1];assert a in t,(n,a);d['chapters'][63]['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=64,paragraph=n,before=a,after=b,reason='Russian X II source details: birth timing, absent rather than dead parent, midwife, mock-dangerous children, fine style, bag posture and old not young woman.'))
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'ENGLISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
