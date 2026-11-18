# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][74]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=75,paragraph=n,before=a,after=b,reason='Russian XI VI page76 full comparison; source chronology, medical descriptions as character statements, witnesses and idiomatic Danish.'))
changes={1:[('havde været hos','var på vej hen til'),('Men hans besøg var endt med det andet','Men efter det andet besøg havde han holdt op med at besøge Smerdjakov')],
2:[('fem dage efter','på femtedagen efter'),('fire dage efter sin ankomst','på fjerdedagen efter sin ankomst'),('satte han sig naturligvis i ilfart i bevægelse mod vores by','skyndte han sig naturligvis hovedkulds tilbage til vores by'),('overdreven broderlig følelse','hans stærkt ophidsede broderfølelse')],
3:[('Hele Mitjas person, selv hans ydre, var ham yderst utiltrækkende.','Hele Mitjas person, selv hans ydre, var ham dybt imod.'),('langtfra svækket','ikke blot undladt at svække'),('nervøst opstemt','sygeligt ophidset'),('åndsfraværende','distræt')],
4:[('ville jeg have haft retten','ville jeg have været i min gode ret')],
5:[('stolt foragtelig over for anklagerne','fuld af stolt foragt for anklagerne'),('Han lo blot foragteligt','Han lo blot foragtfuldt'),('ud for at se','hen for at besøge')],
6:[('sagde Ivan intet for tiden','sagde Ivan foreløbig intet'),('på hospitalet','på byens hospital')],
7:[('forsikrede tillidsfuldt','forsikrede bestemt'),('epilepsianfald utvivlsomt var ægte','epilepsi var hævet over enhver tvivl'),('krampene vendte tilbage og varede ved flere gange','det havde varet ved og gentaget sig gennem flere dage'),('efter at midler var blevet anvendt','efter den iværksatte behandling'),('sindssyg','sindssyg')],
8:[('en feltseng','en seng'),('en næringsdrivende fra byen, oppustet af vatersot og åbenbart nær døden','en svækket småborger fra byen, helt opsvulmet af væske i kroppen og åbenbart så nær døden, at han ville dø i morgen eller overmorgen'),('grinede usikkert','smilede mistroisk'),('Hans tynde, kastraterede ansigt virkede så bittesmå; hans hår var pjusket, og hans pandekrøller stod op i en tynd dusk.','Hans magre ansigt med dets eunukagtige træk var blevet så lille; håret ved tindingerne var pjusket, og i stedet for hans hårtop strittede blot en enkelt tynd tot i vejret.'),('Men i det venstre øje, der var sammenknebet og syntes at antyde noget, viste Smerdjakov sig uforandret.','Men det sammenknebne venstre øje, der syntes at antyde noget, røbede den gamle Smerdjakov.'),('Han satte sig på skamlen ved hans fødder.','Ivan satte sig på en skammel ved fodenden.')],
11:[('For at se det rod, I alle er havnet i her.','For at rydde op i det rod, I har lavet her.')],
19:[('lade dig lege med mig','lade dig drive dit spil med mig')],
22:[('trak Smerdjakov langsomt på','trak Smerdjakov langsomt ordene ud')],
26:[('i frygtelig rædsel og tvivl','bange og fuld af ængstelige tanker'),('gennem denne frygt','på grund af denne ængstelse'),('følte den krampe, som altid kommer','blev grebet af den sædvanlige krampe i halsen'),('røg jeg afsted','faldt jeg ned'),('det er hele','det er alt sammen')],
28:[('rapporteret','fortalt')],
29:[('udtalte','sagde')],
36:[('gå af vejen for vrøvl','komme væk fra al ulykke')],
37:[('bryderier i huset komme','ulykke true huset'),('gå af vejen for elendighed','komme væk fra ulykken'),('være bryderier i huset','ske noget slemt derhjemme')],
39:[('lige så gode som sine egne','sine egne'),('Hvordan kunne De heller have gættet det','Hvordan skulle De så have kunnet gætte det')],
42:[('gættet det ud af det','gættet det ud fra det')],
44:[('være så fræk','føle sig så modig'),('de signaler','de bankesignaler'),('han måtte gøre noget','han helt sikkert ville foretage sig noget')],
47:[('De ganske gættede det','De allerede havde gennemskuet det hele')],
49:[('slippe for vrøvl','undgå ulykken'),('i angsten','af frygt')],
56:[('idet De forudså en sådan ulykke','selv om De anede en sådan ulykke')],
60:[('der lå nogen skurkestreg fra din side','du havde en eller anden skurkestreg i sinde')],
63:[('Han skælver for at redde sig selv.','Han ryster af skræk og forsøger at redde sig selv.')],
64:[('Han ophørte langsomt med at tale','Han tav lidt')],
65:[('Han vil kaste det over på mig','Han vil vælte skylden over på mig'),('så stor en tåbe at have givet et sådant vidneudsagn imod mig selv på forhånd','så stor en tåbe, at jeg på forhånd havde leveret sådan et bevis mod mig selv'),('Ved min sjæl!','Helt ærligt!'),('denne vores samtale','vores samtale her')],
66:[('Nå —','Hør her —'),('og Ivan rejste sig for at afbryde samtalen','Ivan rejste sig og afbrød samtalen'),('Imens, farvel','Farvel så længe')],
68:[('fik noget pludselig Ivan til at sige','sagde Ivan pludselig, uvist hvorfor')],
69:[('den samtale af vores','hele vores samtale')],
70:[('et dusin skridt','en halv snes skridt'),('mumlende »Vrøvl!« gik han ud af hospitalet','med et »Vrøvl!« skyndte han sig ud af hospitalet')],
71:[('Hans hovedfølelse var en lettelse over','Frem for alt følte han sig lettet over'),('en regulær afsky ved at snuse i sine egne fornemmelser','direkte afsky ved at grave i sine egne følelser'),('den fulde tyngde af beviser','hele tyngden af beviserne'),('Perchotin','Perkhotin'),('dommerne','undersøgelsesdommeren og anklageren'),('på den anden side af skillevæggen. »Han var ikke tre skridt fra vores seng,« og at hun, selv om hun var en god sover, var vågnet flere gange og havde hørt ham stønne.','bag skillevæggen — »der var ikke tre skridt til vores seng« — og at hun, selv om hun sov tungt, mange gange var vågnet ved hans stønnen.')],
72:[('et fint smil','et lille, underfundigt smil')],
73:[('en stilebog','et skrivehæfte'),('de franske ord skrevet ud i russiske bogstaver for ham af nogen','franske ord, som nogen har skrevet med russiske bogstaver for ham')],
75:[('håbløst overgivet sig','helt og uigenkaldeligt overgivet sig'),('trods karamazovsk voldsomhed i hans lidenskaber og den store fascination, han havde over hende','trods hans karamazovske, tøjlesløse begær og hele den tiltrækning, han udøvede på hende'),('hvad','hvad'),('Det var dette, han havde kaldt til Aljosja','Det var dette, han over for Aljosja havde kaldt')],
76:[('efter sit første besøg','efter hans første besøg'),('mindet sig det','husket det'),('efter at have følt dette','efter at have tænkt dette')],
79:[('jeg selv endda var rede til at hjælpe med at bringe det i stand','jeg ikke engang ville være imod selv at hjælpe lidt til')],
80:[('temmelig bleg','en smule bleg'),('på sin brors ansigt','sin bror i øjnene')],
81:[('Jeg vil frem for alt vide','Jeg vil af hele min sjæl vide'),('Jeg vil have sandheden','Jeg har brug for det. Sandheden')],
83:[('en eneste blødgørende sætning','en eneste »formildende omstændighed«')]
}
changes[7]=[x for x in changes[7] if x[0]!=x[1]];changes[75]=[x for x in changes[75] if x[0]!=x[1]]
for n,items in changes.items():
 for a,b in items:fix(n,a,b)
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print('DA75',len(r))
e=json.loads((p/'candidate-brothers-karamazov-modern-en.json').read_text())
for n in [1,2,7,8,11,26,44,64,69,70,71,75,76,80,83]:print(n,e['chapters'][74]['paragraphs'][n-1])
