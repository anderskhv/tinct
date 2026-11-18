from prep import *
import copy,hashlib,re
def nested(a,b,path=''):
 if isinstance(a,dict) and isinstance(b,dict) and a.keys()==b.keys():return [v for k in a for v in nested(a[k],b[k],path+'/'+k)]
 if isinstance(a,list) and isinstance(b,list) and len(a)==len(b):return [v for i,(x,y) in enumerate(zip(a,b)) for v in nested(x,y,path+'/'+str(i))]
 return [] if a==b else [{'path':path,'before':a,'after':b}]
d=rd('modern-da.json');e=rd('source-modern-en.json');old=copy.deepcopy(e)
fixes=[
(3,19,"Doesn't he deserve to be hated?","Doesn’t he deserve better?"),
(4,3,"Here we don't feel Adam's punishment, The difference of the seasons—when","Don't we feel Adam's punishment here, in the changing seasons? When"),
(12,128,'ROSALIND.','ORLANDO.'),
(22,28,'what another man would otherwise take','what no other man will take'),
(22,40,'Still MUSIC','Soft music plays')]
for c,i,a,b in fixes:
 t=e['chapters'][c-1]['paragraphs'][i-1];assert a in t;e['chapters'][c-1]['paragraphs'][i-1]=t.replace(a,b)
wr('modern-en.json',e);wr('modern-en-ledger.json',nested(old,e))
den=rd('source-onboarding-en.json');dda=rd('source-onboarding-da.json');orig_e=copy.deepcopy(den);orig_d=copy.deepcopy(dda)
den['cast'][0]['description']=den['cast'][0]['description'].replace("Shakespeare's longest female role","one of Shakespeare’s largest female roles")
den['whyItMatters'][0]['body']=den['whyItMatters'][0]['body'].replace('Rosalind speaks more lines than any other female character in Shakespeare — more than Cleopatra, Lady Macbeth, or Portia.','Rosalind has one of the largest female speaking roles in Shakespeare.')
den['cast'][2]['description']=den['cast'][2]['description'].replace("choosing instead to seek out Duke Frederick's sudden religious conversion","choosing to seek out the newly converted Duke Frederick")
dda.update(title='Som man behager',openingChapterLabel='Akt 1, scene 1 – Frugthaven ved Olivers hus',openingText=d['chapters'][0]['paragraphs'][2].split(' Der begynder min ulykke.')[0]+' Der begynder min ulykke.',about="""Hertug Frederick har fordrevet sin bror fra hoffet. Mens broren lever i eksil i Ardenskoven, er hans datter Rosalind blevet hos sin kusine Celia, Fredericks datter. Da Frederick også forviser Rosalind, tager kusinerne af sted sammen med hofnarren Touchstone. Rosalind klæder sig ud som en ung mand og kalder sig Ganymed. Celia kalder sig Aliena og giver sig ud for at være hans søster. I skoven lever Rosalinds far med sine trofaste følgesvende. Her kommer også Orlando, en ung adelsmand på flugt fra sin bror Oliver. Orlando er forelsket i Rosalind og hænger digte til hende op på træerne. I skikkelse af Ganymed tilbyder hun at kurere hans forelskelse. Han skal bare gøre kur til hende som om hun var Rosalind.

Shakespeare skrev Som man behager omkring 1599. I hyrdedigtningen kunne man flygte fra hoffets smiger og finde et enklere liv blandt fårene på landet. I Ardenskoven blæser der dog også en kold vintervind, og nogle af de nyankomne har ikke fået noget at spise. Jaques ser på livet som et skuespil og går sin vej da de andre vil danse. Touchstone gør nar af hyrdernes kærlighed og går selv på frierfødder. Titlen giver også tilskueren et valg. Hvem i skoven ville du helst slå følge med?""")
for card,vals in zip(dda['angleCards'],[
('Når Rosalind spiller Rosalind','Forklædt som Ganymed kan Rosalind lære Orlando at gøre kur til hende. Hvornår siger hun noget hun ellers ville have holdt for sig selv?','Jeg vil følge Rosalind og se hvad hun tør sige og gøre i sin forklædning.'),
('Hvad finder de i skoven?','Hertugen priser skovens ærlighed, Jaques finder stof til sit tungsind, og Touchstone fryser. Hvem forandrer sig efter mødet med livet i Arden?','Jeg vil undersøge hvad der ændrer sig når personerne forlader hoffet og flytter ud i skoven.'),
('Fire slags forelskelse','Rosalind prøver Orlando af. Celia og Oliver behøver kun et blik. Silvius elsker en kvinde der afviser ham, og Touchstone vil i seng med Audrey. Hvad får de fire historier frem hos hinanden?','Jeg vil sammenligne de fire par og se hvad de hver især ønsker sig af kærligheden.'),
('Ham der går fra festen','Jaques holder talen om verden som scene. Da de andre endelig vil danse, vælger han at gå. Hvad ser han som de andre overser?','Jeg vil følge Jaques og undersøge hvad hans tungsind gør ved en komedie der ender med fest.')]):
 card.update(zip(('title','text','angleObjective'),vals))
for item,(name,role,desc) in zip(dda['cast'],[
('Rosalind','Den fordrevne hertugs datter','Rosalind har en af Shakespeares største kvinderoller. Som Ganymed tør hun tale åbent og afprøve Orlandos kærlighed. Hun holder rede på både sine egne og andres forklædninger, men får alligevel brug for Celia når hendes egne følelser løber af med hende.'),
('Orlando','En forelsket ung adelsmand','Oliver nægter sin lillebror den opdragelse deres far ønskede for ham. Orlando besejrer hoffets bryder, forelsker sig i Rosalind og må flygte. I skoven hænger han sine kærlighedsdigte på træerne. Hans oprigtighed er lettere at få øje på end hans digtertalent.'),
('Jaques','En tungsindig adelsmand','Jaques følger den fordrevne hertug. Han iagttager de andre på afstand og holder talen om verden som scene. Da bryllupsfesten skal begynde, vil han hellere opsøge Frederick for at høre om hans omvendelse.'),
('Celia','Rosalinds kusine','Celia er hertug Fredericks datter. Hun trodser sin far for at holde sammen med Rosalind og tager navnet Aliena. Hun lytter, driller og hjælper sin kusine i skoven. Da hun møder den forandrede Oliver, forelsker hun sig lige så hurtigt som Rosalind gjorde.'),
('Touchstone','Hofnar','Touchstone følger kusinerne ud i skoven. Han kan gøre nar af både hoffets fine manerer og hyrdernes romantik. Selv har han ganske jordnære grunde til at gøre kur til gedehyrden Audrey.'),
('Den ældre hertug','Rosalinds far','Efter at hans bror har taget magten, bor hertugen i Ardenskoven med sine trofaste følgesvende. Vintervinden fortæller ham sandheder som ingen ved hoffet turde sige. Når han priser livet i skoven, kan man også høre et forsøg på at trøste dem der deler hans skæbne.')]):
 item.update(name=name,role=role,description=desc)
for item,(title,body) in zip(dda['whyItMatters'],[
('Rosalind tager ordet','Rosalind fører selv sit frieri og samler trådene til brylluppet. Forklædningen gør det muligt for hende at spørge Orlando direkte hvad han mener med at elske hende. På Shakespeares scene blev kvinderollerne spillet af drenge. Tilskuerne så altså en dreng spille en pige der klæder sig ud som en dreng og tilbyder at spille en pige. I epilogen lader skuespilleren endnu en gang publikum mærke alle de roller der er på spil.'),
('Et andet liv i skoven','Fra Vergil til Sidney og Spenser havde digtere forestillet sig et enklere liv på landet. Shakespeare låner deres skov og deres elskende hyrder. Samtidig lader han vinden bide og en gammel mand synke sammen af sult. Den ældre hertug kan finde en prædiken i en sten. Touchstone savner et bedre måltid. Når de ser på det samme sted, får de øje på vidt forskellige ting.'),
('En komedie der ser på sit publikum','Da Jaques siger at hele verden er en scene, sidder tilskuerne allerede og ser mennesker spille roller inde i andre roller. I epilogen vender Rosalind blikket den anden vej og taler til dem der har set på. Fire par bliver gift på én gang, men de har hver deres idé om hvad de siger ja til. Hvilken af historierne man har mest lyst til at tro på, overlader stykket til publikum.')]):item.update(title=title,body=body)
wr('onboarding-da.json',dda);wr('onboarding-en.json',den);wr('onboarding-ledger.json',{'danish':nested(orig_d,dda),'english':nested(orig_e,den)})
