import json,re
from pathlib import Path
def rd(f):return json.loads(Path(f).read_text())
def wr(f,d):Path(f).write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
df='walden-modern-da.partial.json';ef='walden-modern-en.partial.json'
d=rd(df);e=rd(ef)
def fix(book,c,i,a,b):
 p=book['chapters'][c-1]['paragraphs'];assert a in p[i-1],(c,i,a);p[i-1]=p[i-1].replace(a,b)
for c,i,a,b in [
 (1,11,'Hvor er ligegyldigt, om det er meget eller lidt ligeså.','Hvor det ligger, og hvor meget eller hvor lidt der er, gør ingen forskel.'),
 (1,12,'At frigøre sig selv selv i','Selv at blive fri i'),
 (1,61,'_jord_dyrkning','_jorddyrkning_'),
 (1,65,'piwien','den østlige pivi'),
 (1,71,'våbenhus foran indgangen','forhus ved indgangen'),
 (1,74,'sit hus’ arkitektoniske stil','stilen i sit eget hus'),
 (1,80,'Ved universitetet i Cambridge','På Harvard i Cambridge i Massachusetts'),
 (1,81,'en skæppe korn','ni liter korn'),
 (1,88,'brød og smør' if False else 'hvidløg og smørrebrød','hvidløg og brød med smør'),
 (1,97,'Over for udgifterne står mine indtægter fra salg af afgrøder og andet arbejde:','Til at dække udgifterne havde jeg af salg af afgrøder'),
 (1,127,'over for de folk, der','over for de oprindelige amerikanere, der'),
 (3,6,'Mærkeligt nok findes der aldrig nogen egentlig gengivelse af dem på noget moderne sprog','Mærkeligt nok er de aldrig blevet fuldt gengivet på noget moderne sprog'),
 (3,6,'med Homerer, Danter og Shakespeareskikkelser','med værker af Homer, Dante og Shakespeare'),
 (3,11,'gøre vores liv mere godt','gavne os mere'),
 (4,15,'»til mast','»for at blive mast'),
 (4,23,'en meget alvorlig kirkegårdsvisesang','en dybt alvorlig kirkegårdsvises klang'),
 (4,25,'de vilde' if False else 'det nøgne tusmørke','det dystre tusmørke'),
 (4,26,'næsten intet grøde','næsten ingen grøde'),
 (5,16,'en enlig kongelys','et enligt kongelys'),
 (7,5,'den brune spottesangfugl, eller den røde drossel, som nogle ynder at kalde den','den brune spottefugl, røddroslen, som nogle foretrækker at kalde den'),
 (9,5,'en og trekvart mil i omkreds og godt 61½ acres','en og trekvart engelsk mil i omkreds og omtrent 61½ acres'),
 (9,14,'de små sølvfisk','de små sølvblanke karpefisk'),
 (9,18,'Vender man hovedet på hovedet','Ser man med hovedet nedad'),
 (9,18,'Dette fiskemord vil for en dag!','Dette fiskemord kommer for en dag!'),
 (9,29,'en piberodslignende vandplante','en plante af slægten Eriocaulon'),
 (10,5,'pontederiaplanterne','hjertevandkærterne'),
 (12,10,'En fibi','En fibii'),
 (13,5,'sorterede jeg så mange sten fra selve ildstedet fra, som jeg kunne finde','udsøgte jeg så mange af de gamle ildstedssten som muligt'),
 (13,14,'nyhollænderen','australieren fra det daværende Nyholland'),
 (13,14,'i en afstand af tre hundrede engelske mil','i en radius på tre hundrede engelske mil'),
 (14,12,'røg i totterne på hinanden','trak uld af fåreskind'),
 (17,4,'Denne dumpfrembrusende larm','Den dumpbrusende larm'),
 (17,6,'smukt og forskelligt skatteret','i smukke, skiftende nuancer'),
 (17,29,'den brune drosselspotter, den rødbrune drossel, skovpiwien, den østlige towhee','røddroslen, den rustryggede skovdrossel, den østlige pivi, den rødsidede buskspurv'),
 (17,29,'havde jeg hørt skovdroslen. Fibien','havde jeg hørt den plettede skovdrossel. Fibiien'),
 (18,2,'På alle vores sørejser følger vi stadig jordens runding, og det eneste, lægernes rejsekur hjælper på, er hudsygdomme.','På vores sørejser sejler vi blot langs klodens storcirkler, og lægerne ordinerer kun midler mod hudsygdomme.'),
 (18,11,'_hys_ og _prr_','_stille_ og _prr_'),
 (18,21,'menneskehedens stolte kinesermine','menneskehedens kejserkinesiske stolthed'),
 (18,23,'en stor, smuk bille','en stærk, smuk bille')]:fix(d,c,i,a,b)
for c,i in [(1,100),(1,103),(8,2),(13,6)]:fix(e,c,i,'Indian meal','cornmeal')
fix(e,4,15,'“It will serve as the mast\nOf some great admiral’s ship.”','“to become the mast\nof some great flagship.”')
fix(e,14,12,'“Cato and Brister pulled wool,”','“Cato and Brister pulled wool from sheepskins,”')
fix(e,17,20,'morning rays.','morning rays.\n*  *  *  *')
fix(e,1,80,'At Cambridge College','At Harvard in Cambridge, Massachusetts') if 'At Cambridge College' in e['chapters'][0]['paragraphs'][79] else None
wr(df,d);wr(ef,e)
for f in ('walden.da.json','walden.json'):
 g=rd(f)
 if f=='walden.json':
  g['angleCards'][3]['text']='Thoreau enjoys solitude, welcomes visitors, and describes one spell of loneliness. Watch when being alone sounds like deprivation and when it feels like abundance.'
  g['cast'][1]['description']=g['cast'][1]['description'].replace('a mile south of Concord','near Concord, Massachusetts')
  g['angleCards'][0]['text']='In “Economy,” Thoreau sets the price of the cabin materials against his earnings. His counts exclude his own labor and some materials he gathered. What do the figures say about the time left to him?'
 else:
  g['angleCards'][0]['text']='I »Økonomi« holder Thoreau udgifterne til hyttens materialer op imod sin indtjening. Hans eget arbejde og nogle materialer, han selv skaffede, er ikke med i prisen. Hvad fortæller regnskabet om den tid, han har til rådighed bagefter?'
 wr(f,g)
