from revise import *
from copy import deepcopy
s=load('source-onboarding-en.json');d=deepcopy(s);en=deepcopy(s)
def opening(lang):
 ps=load('modern-'+lang+'.json')['chapters'][0]['paragraphs']
 return ps[0]+' '+ps[1].split('. ')[0]+'.'
en['openingText']=opening('en')
en['about']=en['about'].replace('on the Isle of Skye','in the Hebrides')
en['cast'][2]['description']=en['cast'][2]['description'].replace('near the Ramsays','with the Ramsays')
d.update(title='Til fyret',length='3 dele, 42 afsnit',estimatedTime='ca. 5 timer',openingChapterLabel='Vinduet · 1',openingText=opening('da'),about='Seksårige James vil ud til fyret. Hans mor siger ja, hvis vejret bliver godt; hans far siger, at det bliver dårligt. Afstanden mellem de to svar fylder en hel eftermiddag i familien Ramsays sommerhus på Hebriderne. Mens fru Ramsay strikker en strømpe og gør klar til middag, forsøger Lily Briscoe at male hende, som hun sidder i vinduet.\n\nRomanen udkom i 1927. Første del, »Vinduet«, følger familien og gæsterne ind i aftenen. I »Tiden går« står huset tomt, og ti år går på få sider. I sidste del, »Fyret«, vender både bådturen og det ufærdige maleri tilbage. Ofte skifter vi fra ét menneskes tanker til et andets midt i et afsnit. Den samme bemærkning, som for én er glemt næsten med det samme, kan for en anden blive siddende i årevis.')
d['angleCards']=[dict(zip(['title','text','angleObjective'],r)) for r in [
('Hvem ser vi med?','Ved middagsbordet går samtalen videre, mens tankerne bevæger sig andre steder hen. Læg mærke til, hvornår et blik eller en bemærkning fører os fra én person til en anden.','Jeg vil følge skiftene i synsvinkel og se, hvordan den samme situation opleves forskelligt.'),
('Ægteskabet','Hr. Ramsay har brug for at blive forsikret om, at han er elsket. Hvad gør hans kone, når hun ikke kan sige netop de ord, han vil høre?','Jeg vil lægge mærke til, hvad ægtefællerne beder hinanden om, og hvad de lader være usagt.'),
('Lilys billede','For Lily er det afgørende, om et træ skal flyttes ind mod midten af billedet. Samtidig kan hun stadig høre Charles Tansleys påstand om, at kvinder ikke kan male.','Jeg vil se på, hvad Lily prøver at få frem på lærredet, og hvad der forstyrrer hende.'),
('Hvad bliver tilbage?','Et enkelt måltid kan fylde adskillige sider, mens en familie mister et menneske i en parentes. Hold øje med det, personerne prøver at fastholde.','Jeg vil følge romanens skiftende tempo og se, hvilke øjeblikke der bliver ved med at leve i erindringen.')]]
d['cast']=[dict(zip(['name','role','description'],r)) for r in [
('Fru Ramsay','Moren','Mor til otte og værtinde i sommerhuset. Hun ser, hvem der sidder udenfor ved bordet, og hvem der kunne blive et par. Indimellem vil hun bare have et øjeblik helt for sig selv.'),
('Hr. Ramsay','Filosoffen','James’ far vil ikke love godt vejr, når han tror, det bliver dårligt. Selv har han svært ved at leve med usikkerheden om, hvor længe hans bøger vil blive læst.'),
('Lily Briscoe','Maleren','Lily er ugift og gæst hos familien. Hun holder af fru Ramsay, men bryder sig ikke om at få at vide, at hun bør gifte sig. Hun vil male billedet på sin egen måde.'),
('James Ramsay','Den yngste søn','James er seks år, da romanen begynder. Han klipper billeder ud, mens han lytter til sine forældres ord om morgendagens tur. I hans ører afhænger alt af deres svar.'),
('William Bankes','Den gamle ven','Botaniker og enkemand, som længe har kendt hr. Ramsay. Han går ture med Lily og tager sig tid til at høre, hvad hun vil med sit billede.'),
('Charles Tansley','Den unge beundrer','En ung akademiker med få penge og store ambitioner. Han ser op til hr. Ramsay, kommer let på kant med de andre og fortæller Lily, at kvinder hverken kan male eller skrive.')]]
d['acclaim']=[{'quote':'Det forekom mig, at du i bogens første del har tegnet et portræt af mor, der for mig ligner hende mere, end jeg nogensinde havde troet muligt. Det gør næsten ondt at se hende opstå fra de døde på den måde.','source':'Vanessa Bell','context':'Brev til Virginia Woolf efter første læsning af Til fyret, 11. maj 1927. Oversat fra engelsk.'}]
d['whyItMatters']=[dict(zip(['title','body'],r)) for r in [
('Et rum set med mange øjne','Ved middagen ser én gæst en smuk frugtopstilling, mens en anden rækker ud efter en pære. Woolf giver begge blikke plads. Som læser kan man se noget, ingen af gæsterne ser alene.'),
('En familie indefra','Woolf brugte minder om sine forældre, Leslie og Julia Stephen, og om barndommens somre i St Ives. Hendes søster Vanessa Bell genkendte deres mor i fru Ramsay. Børnene i romanen kan på samme tid elske en forælder og rase over, hvad den voksne kræver af dem.'),
('Hvem får lov at male?','Da Lily vender tilbage efter ti år, venter et uløst problem på lærredet. Det kræver tid at se det klart, og den tid må hun selv tage, også når mennesker omkring hende har brug for trøst. Til sidst er det hendes eget blik, der afgør, hvornår billedet er færdigt.')]]
write('onboarding-da.json',d);write('onboarding-en.json',en)
