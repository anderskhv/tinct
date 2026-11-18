from prep import *
D=rd('drafted-da.json');E=rd('source-modern-en.json')
def get(B,j,i):return B['chapters'][j-1]['paragraphs'][i-1]
def put(B,j,i,v):B['chapters'][j-1]['paragraphs'][i-1]=v
for line in (p/'polish.txt').read_text().splitlines():
 j,i,v=line.split(' ',2);j=int(j);i=int(i);s=get(D,j,i)
 if not v.startswith('!'):v=s.split('. ',1)[0]+'. '+v
 put(D,j,i,v.removeprefix('!'))
labels={'FOOL':'NARREN','NAR':'NARREN','HERRE':'ADELSMAND','MESSENGER':'BUDBRINGER','GAMMEL MAND':'DEN GAMLE MAND','LÆGE':'LÆGEN','FRANKRIG':'KONGEN AF FRANKRIG','BURGUND':'HERTUGEN AF BURGUND'}
for c in D['chapters']:
 c['title']=re.sub(r'Akt (\d), Scene (\d+) —',r'\1. akt, \2. scene —',c['title']).replace('i grev Gloucesters slot','på jarlen af Gloucesters slot').replace('i Gloucesters slot','på Gloucesters slot').replace('i Kong Lears','i kong Lears').replace('; Kent i gabestokken','. Kent sidder i stokken')
 for i,s in enumerate(c['paragraphs']):
  s=re.sub(r'^([A-ZÆØÅÉ ]+)\.',lambda m:labels.get(m[1],m[1])+'.',s)
  for a,b in [('et surt vildæble ligner et æble','et vildæble ligner et haveæble'),('I din troskabs eds navn','Ved din troskabsed'),('Hobbididans','Hobbididence'),('den hårdtprøvede hore','den skamløse hore'),('Vil buksebule først i hus','Vil buksebulen først i hus'),('jeres hunræve','I hunræve'),('Kværk ikke','Kvækken hører op nu' ),('som en bondeknægt der vogter krager','som en dreng der skal skræmme krager væk'),('brune hager','brune hellebarder'),('en vild æblekrabbe','et surt vildæble'),('Gu’ er jeg ej!','Hah!'),('grev Gloucester','jarl Gloucester'),('Hertugen af','hertugen af'),('Jarlen af','jarlen af'),('Kongen af','kongen af'),('Kongen','kongen'),('Gode sir.','Min konge.'),('gode sir','min herre'),('sir','min herre'),('Sir,','Min herre,'),('hvor er det uværdigt','hvor er det uværdigt'),('betjente','tjenere'),('Nu er vi gammel','Nu er vi gamle'),('hvor vi er gammel,','hvor vi er gamle,'),('forrække','forrække')]:s=s.replace(a,b)
  s=re.sub(r'^kongen\b','Kongen',s);s=re.sub(r'^hertugen\b','Hertugen',s);s=re.sub(r'^jarlen\b','Jarlen',s);c['paragraphs'][i]=s
fix={(1,21):('Nu hvor vi er gamle','Nu på vores gamle dage'),(13,31):('Lille pik sad på lille piks høj.','Lille Pikkel sad på Pikkelhøj.'),(15,17):('Kvækken hører op nu, sorte engel','Kvækk ikke, sorte engel'),(26,61):('kan jeg med sværdet her uden videre tvinge mit forsvar igennem.','kan din arm skaffe dig oprejsning. Her er mit.'),(26,133):('Ham der','KENT. Ham der'),(23,9):('læg det dybe brud','hel det dybe brud'),(4,77):('lån mindre ud end du har på din hånd','lån mindre ud end du ejer'),(17,38):('hver stente og låge','hver overgang over hegnene og hver låge'),(22,96):('æt','ikke'),(22,98):('æt','itte'),(22,100):('æt','itte')}
for (j,i),(a,b) in fix.items():
 s=get(D,j,i);assert a in s,(j,i,a,s[:100]);put(D,j,i,s.replace(a,b))
ens={(1,5):"GLOUCESTER. I paid to bring him up, sir. I’ve blushed so often at admitting he’s my son that I’ve grown a thick skin.",(1,21):('our deeper purpose','the purpose we’ve kept to ourselves'),(4,77):('Lend less than you owe','Lend less than you own'),(7,15):('I\'ll make a sop of moonshine out of you','I’ll beat you to mush in the moonlight'),(9,7):('over-lusty with his legs','too lively on his feet'),(14,4):"CORNWALL. I see now it wasn’t entirely your brother’s wicked nature that made him want your father dead. Your father’s own disgraceful behavior gave him a real grievance.",(14,10):"[Aside.] If I find him helping the King, it will give even more weight to",(14,11):"the suspicions against him. I’ll stay loyal, hard as it is to choose loyalty over my own flesh and blood.",(18,6):('It is the cowish terror of his spirit that dares not undertake.','He’s too frightened to act.'),(18,26):"MESSENGER. A servant he’d raised was moved to pity. He tried to stop him and turned his sword on his master. Cornwall flew at him in a rage. Between them they killed the servant, but not before he struck the blow that has now killed Cornwall too.",(20,5):"PHYSICIAN. There are ways to help him, madam. Rest is nature’s nurse, and he’s had none. There are medicinal herbs that can bring him sleep and close those anguished eyes.",(22,39):('for coining','for minting coins'),(23,9):"CORDELIA. Kind gods, heal this terrible breach in his tormented mind. His senses sound jarring and out of tune. Tune them again in this father so changed by his children.",(23,27):('foolish, fond old man, fourscore and upward','foolish, muddled old man, eighty and more'),(26,57):"EDGAR. My name is lost. Treason gnawed it bare and ate into it like a canker. But I’m as noble by birth as the man I’ve come to fight."}
for (j,i),v in ens.items():
 if isinstance(v,tuple):
  s=get(E,j,i);assert v[0] in s;v=s.replace(*v)
 put(E,j,i,v)
wr('modern-da.json',D);wr('modern-en.json',E)
