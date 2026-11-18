from pathlib import Path
import json,re
p=Path('/tmp/tinct-da-prep-20261104/the-aeneid'); f=p/'08.draft'; s=f.read_text(); log=json.loads((p/'DANISH-POLISH.json').read_text())
pairs=[
('da hornene stødte i hæse toner og vækkede larmen, han piskede de fyrige heste frem','da han lod hornene lyde hæst, piskede de fyrige heste frem'),
('De unge kom helt fra sans og samling; straks raser ungdommen utæmmet.','De unge mistede besindelsen; straks rasede de vildt af krigslyst.'),
('Hvad han bygger på mens han er ved at gøre klar, hvad han vil have ud af kampen,','Hvad han planlægger under sine forberedelser, hvad han ønsker at opnå med krigen,'),
('ser det hele og bliver urolig i sit store hav af bekymringer.\nFrem og tilbage deler han sit hurtige sind, sætter det ind på hver sin vej,\nvender det mod alle muligheder.','ser det hele og kastes om på et vældigt hav af bekymringer.\nHastigt flyver tankerne frem og tilbage; han prøver den ene udvej efter den anden\nog overvejer alle muligheder.'),
('fra den elskelige flods vand','fra den fredelige flods vand'),
('Når tredive år ruller bort på deres kreds,','Når tredive år har fuldendt deres kredsløb,'),
('skal du bede til Juno som det sig hør og bør,','skal du bede til Juno efter den hellige skik,'),
('Her er mit store hus, mit udspring blandt byer med høje mure.','Her ligger mit store hjem, her rejser sig mit hovedsæde blandt mægtige byer.'),
('Da lød flodens tale til ende.','Sådan sluttede flodguden sin tale.'),
('I sine hule hænder tager han retmæssigt vand af strømmen','Efter hellig skik øser han vand fra strømmen i sine hule hænder'),
('gør med din nærhed dit guddommelige løfte fast','bekræft med din nærhed dit guddommelige løfte'),
('Han veg og bredte et stille vandspejl under deres årer','Han dæmpede strømmen og bredte et stille vandspejl under deres årer'),
('henover skyggen af forskelligartede træer; gennem den fredelige flade\nkløver de de grønne skove.','under skyggen af alle slags træer; gennem det stille vand\nkløver de skovenes grønne spejlbilleder.'),
('hvorfra er jeres hjem?','Hvor har I hjemme?'),
('Du ser folk af trojansk slægt og våben som er fjendtligt stemt mod latinerne.','Du ser trojanere, væbnet til kamp mod latinerne.'),
('Hvem du end er, kom ud,','Hvem du end er, kom i land,'),
('og tager til din dør, jeg selv og mit eget liv.','og står ved din dør med mit liv i dine hænder.'),
('Vi har bryst til at kæmpe, unge folk og prøvet mod og kræfter til handling.','Vi har modige hjerter i krig, unge mænd og kræfter prøvet i kamp.'),
('Han havde talt færdig. Allerede længe havde Evander set på hans ansigt,\nhans ord, hele mandens fremtræden, lod han sit blik blive ved.','Han havde talt færdig. Evander havde længe betragtet hans ansigt,\nlyttet til hans ord og set nøje på hele hans fremtræden.'),
('skal I aflægge denne årlige højtid sammen med os','skal I fejre denne årlige højtid sammen med os'),
('Æneas og de trojanske mænd får mættet sig i okseryg\nog i den sonende offerspise af indvolde.','Æneas og hans trojanere spiser sig mætte i okseryg\nog de indvolde, der er viet til guderne.'),
('Det her er vores årlige fest, det her er måltider udført som skikken er,\nden vældige guddoms alter. Ingen overtro som ikke kender de gamle guder,\nhar pålagt os det. Reddet fra frygtelige farer bringer vi det, trojanske gæst,\nog fornyr den hæder han har fortjent.','Denne årlige fest, dette måltid efter gammel skik\nog dette alter for en mægtig gud skyldes ingen tom overtro\neller uvidenhed om de gamle guder. Vi blev reddet fra frygtelige farer,\ntrojanske gæst, og derfor gentager vi den hyldest, han har fortjent.'),
('se hvor sten er slynget vidt og bredt, hvor øde bebyggelsen står,','se de spredte klippeblokke, det forladte tilholdssted,'),
('på de stolte dørtrin hang menneskers ansigter uden farve, hængt op under råddenskab.','over den høje indgang hang blege menneskehoveder og rådnede.'),
('Hans sorte ild brækkede Cacus op af munden','Hans sorte ild spyede Cacus ud af munden'),
('Også til os bragte tiden dog endelig,\nsom vi havde håbet på så længe, en guds hjælp, en ankomst.','Men omsider bragte tiden også os\nden hjælp, vi så længe havde håbet på: en gud kom hertil.'),
('slæbte han dem i halen ind i hulen og drejede vejenes tegn i modsat retning.','slæbte han dem baglæns i halerne ind i hulen, så sporene viste den modsatte vej.'),
('gav sin lyd tilbage, brølede, bag en trofast vagt, og krydsede derved Cacus\' håb.','brølede til svar fra sit skjul og røbede derved, mod Cacus\' håb, hvor den stod.'),
('i al deres ufærdige rædsel','i al deres uhyggelige råhed'),
('Til himlen bliver det stjålne kvæg fremvist og tyvekosterne han havde nægtet med ed.','Dagslyset falder på det stjålne kvæg, det rov, han svor, han ikke havde taget.'),
('det halvt dyriske vilddyrs bryst','uhyrets halvt menneskelige bryst'),
('giv ham hans vin af lyst','udgyd vinen med glæde'),
('hang over bladene fra kronen.','og lod løvet hænge ned fra tindingerne.'),
('slagter med din hånd de skysprungne to i skikkelse, Hylaios og Folos,','fældede med din hånd de skyfødte kentaurer med deres dobbelte skikkelse, Hylaios og Folos,'),
('giver alle sig til byen.','begiver alle sig ind til byen.'),
('lader let sit blik gå hele vejen rundt og bliver fanget af stedet,','lader ivrigt blikket vandre og betages af stedet,'),
('Grene og det barske jagtliv gav dem føde.','Træernes frugt og det barske jagtliv gav dem føde.'),
('Under den konge, fortæller man om,\nkom det som kaldes guldalder.','Under den konge begyndte, fortæller man,\nden tid, vi kalder guldalderen.'),
('den skarpe Romulus','den energiske Romulus'),
('den sandsigende spåkvinde som først spåede','den sanddru spåkvinde, der først forudsagde'),
('til det tag som tilhørte den fattige Evander','til den fattige Evanders hus'),
('kom ikke som den der foragter hjælpeløs fattigdom','se ikke ned på os for vores fattigdom'),
('Men i sin omsorg som mor lod Venus sig ikke skræmme for ingenting af de laurentiske trusler,\nden hårde rejsning.','Men Venus frygtede som mor de truende laurenter\nog deres voldsomme opstand, og hendes frygt var ikke grundløs.'),
('Jeg ville ikke forgæves øve dig\neller dit slid, min kæreste mand,','Jeg ville ikke pålægge dig\net forgæves arbejde, min kære mand,'),
('beder på mine knæ om våben af den magt som er mig hellig,','bønfalder om våben fra den guddom, jeg ærer,'),
('Hvilke byer står ikke med portene låst,','Hvilke byer står ikke bag lukkede porte og'),
('Og har du nu gjort op med dig selv om krigen,\ner det dit forsæt, så holder jeg op med at gøre ophævelser.','Og hvis du nu forbereder dig på krig,\nhvis det er din hensigt,'),
('Alt hvad jeg kan love af omhu i min kunst, hvad man kan frembringe\naf jern og smeltet elektrum, hvad ild og blæsende bælge formår,\nlad være med at bede mig om det som var min evne usikker.','så stol på alt, hvad min kunst og omhu kan yde, alt, hvad man kan skabe\naf jern og smeltet elektrum, alt, hvad ild og blæsende bælge formår.\nBed mig ikke om det, som om du tvivlede på min kraft.'),
('Først, da hvilen midt i natten var gået halvvejs i sin bane og havde drevet søvnen bort,\nved den time da kvinden der skal holde liv i sit fattige hjem med væv og håndfærdighed,','Da natten var halvvejs forbi og den første hvile havde fordrevet søvnen,\nved den time, da en kvinde, der skal ernære sit fattige hjem ved at spinde og væve,'),
('lige så travlt og på ingen måde langsom til at stå op fra det bløde leje\ngik ildens hersker på arbejde i sin smedje.','rejste ildens hersker sig lige så flittigt fra det bløde leje\nog gik til sit arbejde i smedjen.'),
('Mens den lemniske far sådan får tingene til at gå hurtigt','Mens den lemniske gud fremskynder arbejdet'),
('Det er farten i din lod der kalder på dig.','Skæbnen viser dig her en uventet vej.'),
('så stykkerne randt af råd og blod','så de levende i den omfavnelse af råd og blod led'),
('og de i den lange omfavnelse døde af den ynkeligste død.','og langsomt døde en frygtelig død.'),
('Han overdrager mig mærkerne på magten, at jeg tager plads i lejren og tager ledelsen over etruskerne.','Han tilbyder mig herskermagten og beder mig komme til lejren og tage ledelsen over etruskerne.'),
('Mine kræfter kommer for sent til nogen bedrift.','Mine kræfter rækker ikke længere til store bedrifter.'),
('ham her til håbet og trøsten for mig, min Pallas.','min Pallas her, mit håb og min trøst.'),
('holdt øjnene fæstet i jorden og tænkte allerede længe, nedslåede af de mange hårde spørgsmål,','havde længe set ned i jorden, nedslåede over de mange vanskeligheder,'),
('Uventet slog det lys\nfra det klare og en lyd meldte sig.','Pludselig lynede det\nfra den klare himmel, og tordenen lød.'),
('De andre har lamslåede sind','De andre står lamslåede'),
('så lad mig nu, ja, nu sønderrive mit grusomme liv','så lad mig nu, ja, nu gøre ende på mit pinefulde liv'),
('sunket om af kræfter, og lagde ham på seng.','sunket kraftesløs om, og lagde ham i seng.'),
('Råbet stiger, og rækken af ryttere er der.','Råbet stiger, og rytterne følger i sluttet orden.'),
('hans krigsudvalgte ungdom','hans udvalgte krigere'),
('trådte uopfordret frem','trådte af sig selv frem'),
('hjelmen som er frygtelig i sin busk','hjelmen med den frygtindgydende hjelmprydelse'),
('så spyddet og den vævning af skjoldet ingen ord kan fortælle.','så spyddet og skjoldets udsmykning, der overgår enhver beskrivelse.'),
('Tvillingedrengene leger hængende rundt om hendes patter,\nslikker uforfærdet deres mor; hun strækker sig tilbage og lægger sin glatte nakke om dem,\nslikker dem på skift og former dem med tungen.','Tvillingedrengene leger uforfærdet ved hendes patter,\nog ulvemoderen slikker dem; hun drejer sin smidige hals bagud,\nkærtegner dem på skift og former deres kroppe med tungen.'),
('fordi Cocles vovede\nat rive broen væk','fordi Cocles vovede\nat bryde broen ned'),
('rene af strå','rene af strå'),
('Rene mødre førte de hellige sager','Ærbare mødre førte de hellige genstande'),
('hans glade tindinger spyr deres dobbelte flammer','om hans strålende tindinger slår to flammer op'),
('hans fars stjerne kommer til syne fra hans isse','over hans isse viser hans fars stjerne sig'),
('Sørgelige hævngudinder viger ned gennem luften','Truende hævngudinder svæver ned gennem luften'),
('og give sit sejl plads','og brede sejlet ud'),
('ind i sine lønkamre af floder','ind i sine skjulte flodarme'),
('folk, løs i dragten','folk i løse klæder'),
]
for a,b in pairs:
 if a==b:continue
 assert a in s,a
 s=s.replace(a,b);log.append(dict(book=8,before=a,after=b,reason='Full Book VIII Danish fluency pass; Latin sense retained or corrected.'))
f.write_text(s)
for f in sorted(p.glob('??.draft')):
 s=f.read_text()
 for a,b in [('Vulcan','Vulkan'),('Aiolos','Æolus')]:
  # Exclude Vulcania place-name.
  s,n=re.subn(r'\b'+a+r'(?=s?\b)',b,s)
  if n:log.append(dict(book=int(f.stem),before=a,after=b,reason='Consistent Danish proper name',occurrences=n))
 f.write_text(s)
(p/'DANISH-POLISH.json').write_text(json.dumps(log,ensure_ascii=False,indent=2)+'\n')
print('Recorded',len(log),'polish entries')
