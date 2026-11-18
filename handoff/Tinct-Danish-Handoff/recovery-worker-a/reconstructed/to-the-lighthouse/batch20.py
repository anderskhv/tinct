from revise import *
c=17
x=load('modern-da.json')['chapters'][c-1]['paragraphs']
e={}
def r(i,*pairs):
 t=x[i-1]
 for a,b in pairs:
  assert a in t,(i,a)
  t=t.replace(a,b)
 e[i]=t
r(56,('var holdt udenfor','stod udenfor'),('de begge holdt udenfor','de begge holdt udenfor') if False else ('De var begge holdt udenfor','De stod begge udenfor'),('Lily og Charles Tansley på samme måde','både Lily og Charles Tansley'),('afhandlingen om','afhandlingen om') if False else ('afhandling om indflydelsen af en eller anden på en eller anden','afhandling om, hvilken indflydelse en eller anden havde haft på et eller andet'),('satte hende ved siden af Minta','sammenlignede hende med Minta'),('idet hun appellerede til hende om støtte','og bad om hendes støtte'),('gik mere op i sine mejerier, end hendes mand gik op i','talte mere om sine mejerier, end hendes mand talte om'),('brød sig meget om','holdt meget af'),('Men så brød han sig — ja, siden hans kone døde, tænkte fru Ramsay nogle gange, brød han sig måske om hende.','Men ham var der jo det med — ja, siden hans kone døde, tænkte fru Ramsay somme tider, holdt han måske af hende selv.'),('»forelsket,« naturligvis','»forelsket«, naturligvis'),('de uklassificerede hengivenheder, hvoraf der er så mange','de mange former for hengivenhed, man ikke har noget navn for'),('kolde og afvisende','kølige og reserverede'))
r(57,('overfor','over for'),('var hun nået frem til sikkerhed','følte hun sig tryg'),('hun flød som et flag i et element af glæde','hun bølgede som et flag i en strøm af glæde'),('Det er af øjeblikke som disse, tænkte hun, at den ting skabes, der forbliver for evigt efter. Dette ville forblive.','Af øjeblikke som disse, tænkte hun, bliver det til, som siden består for altid. Dette ville bestå.'))
r(59,('Bœuf en Daube','Hendes bœuf en daube'),('alle var blevet serveret','alle havde fået'),('jernbanebillet','togbillet'))
r(60,('kuber','kubiktal'),('hvordan jord blev besiddet i Frankrig','de franske jordbesiddelsesforhold'),('struktur af det maskuline sind','konstruktion, som mændenes forstand havde skabt,'),('over det svajende væv, understøttende verden','spændt hen over det svajende væv, og den bar verden'))
r(61,('Ind stormede han','Han brød straks ind'),('havde giftet sig med sin kone','blev gift'),('hans eftertryk','de ord, han lagde tryk på,'),('afdække hver af disse mennesker','afdække, hvem hvert af disse mennesker var,'),('de små fisk','de små elritser'),('den pludselige tavse ørred','ørreden, der lydløst dukker op,'),('og alt holdt sammen','og det hele hænger sammen'))
r(62,('fangede visse sætninger og pressede dem på hendes opmærksomhed. Dette var en.','opfangede visse sætninger, så hun ikke kunne undgå at lægge mærke til dem. Dette var en af dem.'),('skiftende moder betød intet','skiftende moder intet betød'))
r(63,('For fru Ramsay forekom hans retskaffenhed helt beundringsværdig.','Fru Ramsay beundrede hans retskaffenhed.'),('at for nu, i det mindste, ville alt gå godt','at det i hvert fald ville gå godt lidt endnu'),('De varede, sagde han.','De blev ved med at leve, sagde han.'),('Han huskede den, fordi','Han huskede navnet, fordi'),('kunne rette dem begge om bøger i et nu','kunne på et øjeblik belære dem begge om bøger'),('Hvad Paul sagde, derimod, var blot om selve tingen, ikke om ham.','Paul talte derimod bare om sagen selv, ikke om sig selv.'))
e[64]='Nej, sagde hun, hun ville ikke have en pære. Faktisk havde hun (uden at være klar over det) nidkært vogtet over frugtfadet og håbet, at ingen ville røre det. Hendes blik havde bevæget sig ind og ud mellem frugternes rundinger og skygger, mellem lavlandsdruernes dybe purpurtoner, så hen over skallens hornagtige ryg; hun satte gult op mod purpur, en buet form op mod en rund, uden at vide, hvorfor hun gjorde det, eller hvorfor hun følte sig roligere for hver gang; indtil — åh, hvor var det synd, at de skulle gøre det — en hånd rakte ud, tog en pære og ødelagde det hele. Hun så deltagende på Rose. Hun så på Rose, der sad mellem Jasper og Prue. Hvor mærkeligt, at ens eget barn kunne finde på sådan noget!'
r(65,('men delende en eller anden spøg for sig selv, gættede hun, på den måde deres læber trak','men med en spøg, de havde for sig selv. Det gættede hun på trækket om deres læber'),('Nej, tænkte hun ikke.','Nej, det troede hun ikke.'),('de gik ikke let med; de var som iagttagere, som landmålere','de blandede sig nødig; de var som iagttagere, der sad og tog det hele i øjesyn'),('overfor','over for'),('som om solen af kærligheden mellem mænd og kvinder var ved at stå op','som om kærligheden mellem mænd og kvinder var en sol, der stod op'))
r(66,('en privat spøg for sig selv','en spøg, hun har for sig selv'),('én stemme (Mintas), der talte for sig selv','en eneste stemme (Mintas), der talte'),('råbte latinen fra en gudstjeneste','råbte gudstjenestens latinske ord'))
r(67,('Den kinesiske rose er helt i blomst','Kinarosen står i fuldt flor'))
r(69,('vi nogensinde levede','vi har levet'))
r(70,('et sted udenfor hende','et sted uden for hende'),('havde været i hendes sind','havde optaget hende'))
r(71,('Jeg undres, om det forekommer dig','Mon også du synes sådan,'))
r(73,('stod på benene','havde rejst sig'))
e[74]='At se kongerne ride forbi\nover plæne og eng med tusindfryd,\nmed palmeblade og bundter af cedergrene,\nLuriana, Lurilee,'
r(77,('bukkede hun tilbage til ham','gengældte hun hans buk'))
r(78,('Nu skulle alting bæres et skridt videre.','Nu måtte det hele et skridt videre.'),('i et skue, der blegnede','i en scene, der forsvandt'))
save(c,78,e)
