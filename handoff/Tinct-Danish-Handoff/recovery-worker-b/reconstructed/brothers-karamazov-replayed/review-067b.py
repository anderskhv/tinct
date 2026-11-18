# -*- coding: utf-8 -*-
import pathlib,json,re
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][66]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=67,paragraph=n,before=a,after=b,reason='Russian X V page68 slots51–123 full comparison; natural Danish, dog command, poetry and omitted source details.'))
changes={51:[('med en forretningsagtig mine','sagligt'),('gamle mand','gamle ven')],
52:[('Den uheldige hund','Den stakkels hund'),('så længe hans herre valgte at holde ham dér','så længe hans herre forlangte'),('Men han holdt Perezvon kun et kort øjeblik','Men Perezvon skulle kun vente et ganske kort øjeblik')],
53:[('Betalt for!','Værsgo!')],
55:[('med fuldkommen enkelhed','helt troskyldigt')],
56:[('kaldte Iljusja pludselig, knipsende med sine tynde fingre og vinkende på hunden','kaldte Iljusja pludselig og knipsede med sine tynde fingre for at lokke hunden hen til sig')],
58:[('Kære, kære!','Herregud, herregud!')],
60:[('sensationen skabt af Perezvon','virkningen af Perezvons optræden'),('aldeles fortryllet','helt beruset af glæde')],
61:[('Jeg har ønsket denne ting i lang tid','Jeg har længe haft kig på den lille ting hos embedsmanden Morozov'),('gamle mand','gamle ven'),('Jeg byttede en bog fra fars bogreol for den','Jeg byttede mig til den for en bog fra fars bogreol'),('_En slægtning af Mahomet, eller Frelsende Dårskab_','_Muhameds slægtning eller Helbredende dårskab_')],
62:[('stirrede han på legetøjet i fortryllelse','betragtede han legetøjet med begejstring'),('Sensationen var endnu større','Begejstringen steg endnu mere'),('uden nogen idé om, hvad hun var blevet bedt om','uden dog at forstå, hvad man spurgte hende om'),('Kaptajnen, som en gammel militærmand,','Som tidligere militærmand'),('haglene blev udskudt til en anden gang','de gemte haglene til en anden gang'),('Kanonen blev sat på gulvet, sigtet mod en tom del af værelset','Kanonen blev sat på gulvet med mundingen vendt mod et tomt sted'),('En storartet eksplosion fulgte','Der lød et strålende brag'),('i målløs triumf','i tavs triumf')],
64:[('Kaptajnen pillede uroligt','Kaptajnen blev helt urolig')],
65:[('»Mamma, mamma,« løb han hen til hende','»Mamma, mamma!« Han skyndte sig hen til hende'),('det er lige så godt som din','den er alligevel så godt som din')],
67:[('sin gave til en anden','gaven videre til en anden')],
69:[('han er den, der elsker sin mamma','der har vi en, der elsker sin mamma')],
71:[('jeg har aldrig set sådan en charmerende fyr som denne søde dreng','den rareste unge mand, det er denne gode dreng')],
72:[('en hårsigte','et trommeskind')],
73:[('kun far siger','men far siger')],
75:[('med et skyldigt ansigt','med skyldig mine')],
76:[('du ved bedst','De ved bedst'),('en pomadekrukke','en pomadekrukke af stentøj'),('aske','sod'),('gennem en sigte','gennem skindet')],
78:[('forberedt en hel flaske','lavet en hel flaske'),('hænge ud med mig','omgås mig'),('›desperat karakter,‹','›vovehals‹')],
79:[('den bedrift af din','den bedrift, De har udført'),('du ligge','De ligge'),('du virkelig','De virkelig'),('du lå','De lå'),('du ikke','De ikke')],
81:[('Hvad der har sprængt mit ry her mere end noget andet, var','Det, der for alvor gav mig mit ry her, var'),('kontrollere sig selv','beherske sig')],
82:[('Tog de dig virkelig for retten?','Blev du virkelig stillet for retten?')],
83:[('Den mest dumme, trivielle sag','Den dummeste bagatel'),('Pludselig så en fyr, der arbejder som bydreng hos Plotnikovs nu, på mig','Pludselig så en fyr her fra byen, Visjnjakov, der nu er bud hos Plotnikovs, på mig'),('månefaceret fyr','fyr med et rundt fjæs'),('står altid på bondestandens side','vender aldrig folket ryggen'),('Vi er kommet bagud i forhold til bønderne','Vi er kommet bagefter folket'),('Jeg tror, du ler, Karamazov?','De ler vist, Karamazov?')],
84:[('den sensitive Kolja','den mistænksomme Kolja')],
85:[('give dem deres rette del','lade dem komme til deres ret'),('et _sine qua non_','en _sine qua…_ — en ufravigelig betingelse'),('jeg fortalte dig om gåsen','jeg var ved at fortælle om gåsen'),('Havren spilder ud','Havren drysser ud'),('højt henrykt','helt henrykt'),('dirigere gåsen','styre gåsen'),('som heldet ville have det','så uheldigt var det'),('indbildt','selvtilfreds'),('Fyren græd i en frygtelig forskrækkelse','Fyren var blevet frygtelig bange og græd'),('trække sådanne spilopper','lave den slags narrestreger'),('ophidsede mig','lokkede mig til det'),('ikke havde ophidset ham','ikke havde lokket ham til noget'),('Fredsdommeren smilede','Fredsdommer Nefedov smilede'),('var ærgerlig på sig selv straks','blev straks vred på sig selv over det'),('sagen blev spredt rundt','historien spredte sig'),('Klassiklæreren','Læreren i de klassiske sprog'),('vild mod alle nu som et råt æsel','gal på alle nu, som et grønt æsel'),('fik en medgift på tusind rubler','fik tusind rubler i medgift fra familien Mikhailov'),('Tredjeklasse-fyrene','Drengene i tredje klasse')],
86:[('Forbavsende nyt har nået klassen, Kolbasnikov er blevet et fjols.','Det slog tredje klasse med forbavselse:\nSlusken Kolbasnikov har giftet sig!')],
87:[('mænd som det','den slags mennesker'),('stod op for mig','forsvarede mig')],
88:[('tog ham ned af pinden','satte ham til vægs')],
89:[('Tog du ham virkelig ned af pinden?','Satte De ham virkelig til vægs?')],
90:[('toppen af klassen','den bedste i klassen')],
92:[('genvundet sin værdighed','fundet den rette tone'),('troede, han pralede for ham','troede, han fiskede efter hans ros')],
95:[('identiteten af Trojas grundlæggere','spørgsmålet om, hvem der havde grundlagt Troja'),('skamme ham ud','gøre ham til grin')],
96:[('i den generelle harmoni','i den fælles stemning')],
97:[('Teucer, Dardanos, Ilios','Teukros, Dardanos, Ilos'),('foragtelig fatning','foragtfuld ro')],
99:[('Den forulempede dreng blev fra rosa til karmosin','Den skyldige dreng gik fra at være lyserød til at være ildrød')],
100:[('grundlæggelsen af en nationalitet','et folks opståen'),('gammelkonefortællinger','gammelkonehistorier')],
102:[('menneskehedens på hinanden følgende dårskaber','en række menneskelige dumheder'),('hans var den eneste mening, han var bange for dér','det var kun hans mening, han frygtede dér')],
103:[('Du ser ud','De ser ud')],
105:[('hvis du vil have','hvis De vil have'),('de er en plage','de er kedelige'),('Det var allerede plagsomt før, så hvad kunne de gøre for at gøre tingene mere plagsomme?','Det var kedeligt i forvejen, så hvordan kunne de gøre det endnu kedeligere?')],
109:[('»Hvad så?« mente Kolja det passende at forsvare sig','»Hvad så?« Kolja fandt det nødvendigt at forsvare sig'),('rosen var meget sød for ham','rosen gjorde ham meget godt'),('jeg ville bestå min eksamen','jeg ville afslutte min skolegang'),('jeg synes, hvad du end gør, er det værd at gøre godt','jeg mener, at det, man giver sig til, skal man gøre ordentligt'),('Du er ikke enig','De er ikke enig')],
111:[('for at studere de klassiske sprog','for at studere de klassiske forfattere')],
112:[('lært dig','lært Dem')],
113:[('uden at blive lært','uden at nogen lærer mig det'),('at de klassiske sprog er oversat','at de klassiske forfattere er oversat'),('hele tredjeklasse','hele tredje klasse')],
115:[('Mrs. Khokhlakova','fru Khokhlakova')],
117:[('en vigtigt udseende person','en vigtig skikkelse'),('stoppede han slået ud af kurs','standsede han, som om han var kommet helt ud af fatning'),('sælskindshat','sælskindskasket med skygge af samme skind'),('Mængden, værelsets fattigdom, vasketøjet hængende på en snor i hjørnet','De mange mennesker, det fattige værelse, vasketøjet på en snor i hjørnet')],
122:[('kastede sin frakke af, hvilket afslørede for alle den storartede dekoration om hans hals','tog pelsfrakken af. Alle så nu den fornemme orden, der glimtede om hans hals'),('hat af','kasket af')]}
for n,pairs in changes.items():
 for a,b in pairs:fix(n,a,b)
for n in range(51,124):
 if 'Krassotkin' in c['paragraphs'][n-1]:fix(n,'Krassotkin','Krasotkin')
fix(54,'Kan du virkelig','Har De virkelig')
# Captain must remain subject after idiomatic rewrite.
fix(62,'Som tidligere militærmand påtog sig','Som tidligere militærmand påtog kaptajnen sig')
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');g=json.loads((p/'PROGRESS.json').read_text());g.update(danish_repairs=len(r),partial_chapter={'chapter':67,'danish_paragraphs_reviewed':'1–123','english_followup':'pending','remaining_paragraphs':'none'});(p/'PROGRESS.json').write_text(json.dumps(g,indent=2)+'\n');print(len(r))
