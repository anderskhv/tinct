from review import *
from bs4 import BeautifulSoup
import copy,hashlib,difflib
def save(p,v):Path(p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def cap(new,old):
 if old.isupper():return new.upper()
 if old[0].isupper():return new[:1].upper()+new[1:]
 return new
pairs=[s.split('|') for s in Path('words.txt').read_text().splitlines()]+[('harpunerere','harpunerer'),('harpunerernes','harpunerernes'),('harpunér','harpuner'),('harpunéren','harpuneren'),('harpunérer','harpunerer'),('harpunérens','harpunerens'),('harpunérs','harpuners'),('marlespiger','merlespiger')]
byword={a:b for a,b in pairs if a!=b}
word_re=re.compile(r'\b(?:'+'|'.join(map(re.escape,byword))+r')\b',re.I)
pr=[(int(n),a,b.replace('ligger under vand','er dækket af vand').replace('\\n','\n')) for n,a,b in (s.split('|') for s in Path('prose.txt').read_text().splitlines())]
special_da={(9,5):'»Hvalens ribben, al dens rædsel,\nhvælvede et mørke over mig.\nGuds sollyse bølger rullede forbi\nog løftede mig dybere ned mod min dom.',
(9,6):'»Jeg så helvedes åbne gab\nmed endeløs pine og sorg derinde.\nKun den, der selv har følt det, ved besked.\nAk, jeg styrtede ned i fortvivlelse.',
(9,7):'»I sorteste nød kaldte jeg på min Gud,\nskønt jeg knap turde regne ham for min.\nHan bøjede øret mod min klage,\nog hvalen holdt mig ikke mere fast.',
(9,8):'»Hurtigt fløj han mig til hjælp,\nsom båret af en strålende delfin.\nFrygteligt og dog lysende som lyn\nskinnede Guds, min befriers, ansigt.',
(9,9):'»For evigt skal min sang fortælle\nom denne rædselsstund, denne glædesstund.\nJeg giver Gud al æren.\nAl nåde og al magt er hans.«',
(22,14): '»De yndige marker hinsides floden\nstår klædt i levende grønt.\nSådan så jøderne Kanaans land,\nmens Jordan strømmede mellem.«',
(35,10): '»Rul, du dybe, mørkeblå hav, rul!\nTi tusind spækjægere stryger forgæves hen over dig.«',
(39,4): 'Med lette hjerter skåler vi i nat\nfor elskov, lige så kåd og flygtig\nsom bobler, der driver ved bægerets rand\nog brister, når læberne mødes.',
(40,3): 'Farvel og adieu, I spanske damer!\nFarvel og adieu, I damer af Spanien!\nVor kaptajn har befalet –',
(40,6): 'Vor kaptajn han stod på dækket\nmed sin kikkert i sin hånd\nog spejdede efter gæve hvaler,\nder blæste langs hver strand.\nMed linebaljen i båden, drenge,\nog hver mand ved sin bras!\nSå får vi fat i en prægtig hval,\nhal ind, drenge, hånd over hånd!\n\nSå vær glade, gutter, hold modet oppe,\nmens harpuneren dristigt slår harpunen i hvalen!',
(119,5): 'Åh, hvor kulingen er kåd,\nog hvalen er en spøgefugl,\nder svinger med sin hale.\nSikke en sprælsk og spøjs, en gæv gavtyv, en spradebasse af en knægt, det hav, åh!',
(119,6): 'Skumsprøjtet flyver,\ndet er kun hans toddy, der skummer,\nnår han rører krydderiet i.\nSikke en sprælsk og spøjs, en gæv gavtyv, en spradebasse af en knægt, det hav, åh!',
(136,3): 'Det traf sig sådan, at da parseren var forsvundet og Ahabs stævnmand overtog hans plads, udpegede skæbnegudinderne mig til at tage stævnmandens. Af de tre, som på den sidste dag blev slynget ud af den krængende båd, var det mig, der blev liggende agterude. Sådan kom jeg til at drive i udkanten af det, der nu skete, med det hele lige for øjnene. Da suget fra det sunkne skib nåede mig, havde det mistet halvdelen af sin kraft, og kun langsomt blev jeg trukket ind mod malstrømmen, der allerede var ved at lukke sig. Da jeg nåede den, var der kun en dam af hvidligt skum tilbage. Rundt og rundt drejede jeg som en anden Ixion i stadig snævrere kredse om den sorte boble, der sad som en knap midt i den langsomt drejende ring. Da jeg omsider nåede selve livspunktet, brast den sorte boble opad. Kisten, vores redningsbøje, var sluppet fri af sin sindrige fjeder. Opdriften var så stor, at den skød op gennem havet på højkant, væltede om og blev liggende ved min side. På den kiste drev jeg næsten et døgn på et blidt hav, der sang som til begravelse. Hajerne gled mig fredeligt forbi, som havde de hængelås for gabet. De vilde havhøge sejlede med næbbene i skede. På andendagen kom et sejl nær, kom nærmere og tog mig omsider op. Det var Rachel, der krydsede tilbage i sit eget spor for at lede efter sine savnede børn og kun fandt endnu et forældreløst barn.'}
titles={23:'Kysten i læ',29:'Ahab kommer ind, dernæst Stubb',39:'Første nattevagt',40:'Midnat på bakken',42:'Hvalens hvidhed',45:'Den edsvorne erklæring',48:'Bådene sættes ud for første gang',50:'Ahabs båd og besætning. Fedallah',54:'Fortællingen om Town-Ho',55:'Om uhyrlige billeder af hvaler',56:'Om mindre fejlagtige billeder af hvaler og om sandfærdige billeder af hvalfangst',57:'Om hvaler i maleriet, i tænder, i træ, i jernblik, i sten, i bjerge, i stjerner',73:'Stubb og Flask dræber en rethval og får sig en snak hen over den',74:'Kaskelottens hoved i sammenligning',75:'Rethvalens hoved i sammenligning',95:'Præstekjolen',99:'Dublonen',121:'Midnat ved skanseklædningen på bakken',122:'Midnat til vejrs. Torden og lyn',133:'Jagten – første dag',134:'Jagten – anden dag',135:'Jagten – tredje dag',136:'Epilog'}
hfix={56:'Of the Less Erroneous Pictures of Whales, and the True Pictures of Whaling Scenes',57:'Of Whales in Paint; in Teeth; in Wood; in Sheet-Iron; in Stone; in Mountains; in Stars',73:'Stubb and Flask Kill a Right Whale; and Then Have a Talk over Him'}
primary=BeautifulSoup(Path('source/gutenberg-2701.html').read_bytes(),'html.parser')
verse=[t for t in primary.select('body > pre') if t.find_previous('h2').get_text(strip=True).startswith('CHAPTER')]
en_special={}
for k,n,ps in [(0,9,range(5,10)),(1,22,[14]),(2,35,[10]),(3,39,[4]),(4,40,[3]),(5,40,[6]),(7,119,[5,6,7])]:
 orig=verse[k].get_text().replace('\r\n','\n').strip()
 groups=re.split(r'\n\s*\n',orig) if len(ps)>1 else [orig]
 assert len(groups)==len(ps)
 for j,v in zip(ps,groups):en_special[n,j]='\n'.join(x.strip() for x in v.splitlines())
longer=load("qa/passages-da.json")
candidates={'da':[],'en':[]};changes=[];anchors=[];miss=[]
for n in range(1,137):
 for lang,idx in [('da',2),('en',1)]:
  old=cs[idx][n-1]; new=copy.deepcopy(old)
  if lang=='da' and n in titles:new['title']=('Kapitel '+str(n)+' — ' if n<136 else '')+titles[n]
  if lang=='en' and n in hfix:new['title']=f'Chapter {n} — '+hfix[n]
  if lang=='en' and n==136:new['title']='Epilogue'
  if old['title']!=new['title']:changes.append(dict(language=lang,chapter=n,field='title',before=old['title'],after=new['title']))
  newp=[];applied=set()
  for j,p in enumerate(old['paragraphs'],1):
   if n in (56,57,73) and j==1:
    anchors.append(dict(language=lang,old_chapter=n,old_slot=j,new_section=n+3,new_slot=None,target='title'));changes.append(dict(language=lang,chapter=n,field='paragraph',slot=j,before=p,after=None,reason='Heading continuation reunited with title'));continue
   q=p
   if lang=='da':
    for i,(ch,a,b) in enumerate(pr):
     if ch==n and a in q:q=q.replace(a,b);applied.add(i)
    q=word_re.sub(lambda m:cap(byword[m[0].lower()],m[0]),q)
    q=q.replace('Spouter-Inn','Sprøjtekroen').replace('Father Mapple','fader Mapple').replace('»fader Mapple','»Fader Mapple')
    if q.startswith('fader Mapple'):q=q[:1].upper()+q[1:]
    q=re.sub(r'\bJonahs\b',"Jonas’",q);q=re.sub(r'\bJonah\b','Jonas',q)
    q=special_da.get((n,j),q)
    q=longer.get(f'{n}.{j}',q)
   else:q=en_special.get((n,j),q)
   # Individually adjudicated semantic findings can be added without rerunning the model.
   fixes=Path('qa/semantic-edits.json')
   if fixes.exists():
    for ed in load(fixes):
     if (ed['language'],ed['chapter'],ed['slot'])==(lang,n,j):
      assert ed['before'] in q,(lang,n,j,ed)
      q=q.replace(ed['before'],ed['after'])
   if q!=p:changes.append(dict(language=lang,chapter=n,field='paragraph',slot=j,before=p,after=q))
   newp.append(q);anchors.append(dict(language=lang,old_chapter=n,old_slot=j,new_section=n+3,new_slot=len(newp),text_changed=q!=p))
  if lang=='da':miss.extend((a,b) for i,(ch,a,b) in enumerate(pr) if ch==n and i not in applied)
  new['paragraphs']=newp;new['number']=n+3;candidates[lang].append(new)
  save(f'draft-chapters/{n:03}.{lang}.json',new)
for lang,k in candidates.items():
 front=load(f'front-matter-{lang}.json')
 for i,c in enumerate(front,1):c['number']=i
 save('moby-dick-modern-'+lang+'.json',{'chapters':front+k,'sections':[]})
save('changes.json',changes);save('bookmark-map.json',anchors)
print('Unmatched:',miss)
