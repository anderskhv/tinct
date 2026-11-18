from prepare import *
import collections
all_edits=collections.defaultdict(dict)
for q in (p/'changes').glob('*-da.tsv'):
 n=int(q.name.split('-')[0]);all_edits[n].update((int(i),t) for i,t in (l.split('\t',1) for l in q.read_text().splitlines()))
def update(n,i,t):all_edits[n][i]=t
def current(n,i,orig):return all_edits[n].get(i,orig)
sub={
'eggede':'æggede','rakede langsomt ilden ud':'ragede langsomt ilden ud','skubbede rigelen fra':'skød slåen fra','et klirr fra':'en klirren fra','sluddet':'sludden','fakkelerne':'faklerne','træbritse':'træbriks','tavsgjorde mig fuldstændig':'gjorde mig helt tavs','kordfløjlsagtig':'fløjlsagtig','kordfløjlet':'fløjlet','kordfløjl':'riflet fløjl','ølet':'øllet','en hvid fløjls vog':'en hvid fløjlsvogn','en sort fløjls vog':'en sort fløjlsvogn','snaksalige':'snakkesalige','natthimmel':'nattehimmel','repossen':'reposen','hele grovt':'hele groft','halvtredstusinde':'halvtreds tusind','havde gnidet':'havde gnedet','formolnede':'mørnede','ærteegrønt':'ærtegrønt','stinkede':'stank','pasteibager':'postejbager','papirshue':'papirshat','laslede lintøj':'laserne på hans skjorte','indkrustede snavs':'indgroede snavs','ussle':'usle','nagelbetændelse':'neglerodsbetændelse','snaksagelig':'snakkesalig','snaksaglig':'snakkesalig','et overfyldt politiret':'en overfyldt politiret','blodsslægtning':'blodslægtning','broncher':'brocher','krampetrække':'spjætte','komprometterende':'kompromitterende','ugagn':'ugavn','påny':'på ny','grårere':'gråere','brygede':'bryggede','muggne':'mugne','at fornye':'at forny','forblive indelåst':'blive bag lås og slå','snigede sig':'sneg sig','skjulte sig':'holdt sig skjult','fisketunke':'fiskesovs','halv times forsprang':'halv times forspring','ubesluttsomme':'ubeslutsomme','et djævelsk kukkeleg':'en djævelsk gang kukkelur','selvbeherskt':'behersket','sluschuset':'slusehuset','sluschus':'slusehus','at livge os op':'at live os op','stø foran den':'støt foran den','Der lød lidt hysten':'Der blev tysset lidt','fintfølelse':'finfølelse','snaksalighed':'snakkesalighed','den bløde finfølelse':'den nænsomhed','som helsts bekostning':'som helsts bekostning','på marskene':'ude i marsken','mod marskene':'mod marsken','forrædersk':'forræderisk','truglen eller mørtlen':'murskeen eller mørtlen','mincemeat (':'krydret frugtfyld til tærter (','En smuk mincepie':'En dejlig tærte med krydret frugtfyld','uden for den inn':'uden for bygningen','fløjl. Mr. Pumblechook gik i riflet fløjl':'fløjl. Mr. Pumblechook gik i samme slags fløjl','lysesnydning':'pudsning af væger','fremmede stads af kaffe':'udenlandske stof af kaffe','svadsende syge mand':'snøvlende syge mand','hvisklere':'folk, der hviskede','gnubbede hænderne':'gned sig i hænderne','fjertot':'fjerbusk','et bagerdusin':'et bagerdusin','Jeg skal ikke have noget klinket':'Jeg skal ikke nyde at få vrøvl med ham','Åh, lad være med at skære halsen over på mig, hr.!':'Åh, gode herre, lad være med at skære halsen over på mig!'}
for c in get(src/'wip-da.json')['chapters']:
 n=c['number']
 for i,a in enumerate(c['paragraphs']):
  t=current(n,i,a); b=t
  for x,y in sub.items(): b=b.replace(x,y)
  if b!=t:update(n,i,b)
def flush():
 for n,d in all_edits.items():
  (p/'changes'/f'{n}-da.tsv').write_text(''.join(f'{i}\t{t}\n' for i,t in sorted(d.items())))
flush()
