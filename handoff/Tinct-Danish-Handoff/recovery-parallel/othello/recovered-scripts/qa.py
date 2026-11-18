from prep import *
D=rd('drafted-da.json');E=rd('source-modern-en.json')
def get(B,c,i):return B['chapters'][c-1]['paragraphs'][i-1]
def put(B,c,i,s):B['chapters'][c-1]['paragraphs'][i-1]=s
def replace(B,c,i,a,b):
 v=get(B,c,i);assert a in v,(c,i,a,v[:100]);put(B,c,i,v.replace(a,b,1))
def body(B,c,i,s):
 v=get(B,c,i);put(B,c,i,v.split('. ',1)[0]+'. '+s)
labels={'DUKE':'DOGEN','CLOWN':'NARREN','FIRST SENATOR':'FØRSTE SENATOR','SECOND GENTLEMAN':'ANDEN HERRE','FIRST MUSICIAN':'FØRSTE MUSIKER','THIRD GENTLEMAN':'TREDJE HERRE','MESSENGER':'BUDBRINGER','SAILOR':'SØMAND','ALL':'ALLE','FIRST GENTLEMAN':'FØRSTE HERRE','HERALD':'HEROLD'}
for c in D['chapters']:
 c['title']=re.sub(r'Akt (\d), Scene (\d+) —',r'\1. akt, \2. scene —',c['title']).replace('En platform','En udkigspost på volden').replace('i slottet','på slottet')
 for i,v in enumerate(c['paragraphs']):
  v=re.sub(r'^(\[?)([A-ZÆØÅÉ ]+)\. ',lambda m:m[1]+labels.get(m[2],m[2])+'. ',v)
  for a,b in [('signior','signor'),('Signior','Signor'),('Mauren','maureren'),('Hertugen og senatorerne','Dogen og senatorerne'),('fra hertugen','fra dogen'),('betjente','følge'),('en betjent','en tjener'),('Klovn træder','Narren træder'),('Klovnen går','Narren går'),('og klovn træder','og narren træder'),(', sir',', min herre')]:v=v.replace(a,b)
  c['paragraphs'][i]=v
ed={(1,38):('Forvis Dem selv','Forvis Dem selv om det'),(2,32):('Lad de blanke sværd blive i skeden','Stik de blanke sværd i skeden'),(4,64):('Er hun lys og smuk og klog dertil','Er hun lys og smuk og klog dertil'),(6,25):('i halve gallon ad gangen','et par liter ad gangen'),(6,106):('medmindre De selv giver Dem navn af taber','medmindre De selv mener at have mistet det'),(7,20):('skal jeg se ud til at underrette hende om','skal jeg nok antydningsvis give hende underretning om'),(9,101):('kurtisanernes','salonherrernes'),(9,129):('Lad ikke som om du ved noget','Lad ingen vide at du kender til det'),(10,17):('guldkrydsere','portugisiske guldmønter'),(10,5):('Siger man sådan en på at han ligger og lyver','Beskylder man sådan en for at ligge og lyve'),(11,135):('Min herre?','Min kære?'),(13,45):('sætte skærsilden på spil','risikere en tur i skærsilden')}
for (c,i),(a,b) in ed.items():replace(D,c,i,a,b)
ds={(7,12):'Godt, herre. Så holder vi op.',(10,38):'Nej, virkelig ikke, min kære.',(10,44):'Så gid jeg ved Gud aldrig havde set det!',(10,71):'Nå, kære Cassio, hvad nyt har De?',(10,81):'Men jeg har jo aldrig givet ham grund til det!',(10,99):'Gå fra dig? Hvorfor?',(10,101):'Hvorfor dog?',(10,102):'Det er ikke fordi jeg ikke elsker dig.',(11,59):'Hun fortæller folk at De vil gifte Dem med hende. Har De tænkt Dem det?',(11,64):'Rygtet går i hvert fald at De skal giftes.',(11,79):'Hvad er der, søde Bianca? Hvad er der dog?',(11,86):'Ja, det har jeg tænkt mig.',(11,124):'Og hvad er der af nyt, kære fætter Lodovico?',(12,18):'Hvad vil du mig, min herre?',(12,26):'Hvad er du da for en?',(12,27):'Din kone, min herre, din tro og loyale kone.',(12,39):'Ved himlen, du gør mig uret.',(12,71):'Det ved jeg ikke. Jeg ved bare at det er jeg ikke.',(12,76):'Det ved kun himlen.',(12,87):'Sådan er det, det forsikrer jeg Dem.',(15,32):'Så må Herren forbarme sig over mig!',(15,61):'Åh, min herre, jeg må tale et ord med Dem!',(15,63):'Jeg beder Dem, min herre, lad mig tale med Dem!',(15,84):'Hvordan skulle hun være blevet myrdet?'}
for (c,i),v in ds.items():body(D,c,i,v)
e={(1,32):[('nephews who whinny','grandchildren who whinny')],(3,68):[('if virtue lacks no delighted beauty','if goodness brings beauty with it')],(4,75):[('keep household accounts','keep accounts of small beer')],(8,5):[("We'll wait upon your lordship.","We'll come with you, my lord.")],(9,131):[("I will lose this handkerchief","I’ll ‘lose’ this handkerchief")],(9,173):[('and to obey shall be in me remorseless, whatever bloody business it may be','and I will count obedience as compassion, however bloody the task')],(10,94):[('Take this work out for me','Copy this embroidery for me')],(11,136):[('Are you wise?','Are you in your right mind?')],(13,49):[('as many to the surplus as would store the world they played for','enough besides to populate the world they were playing for')],(14,96):[('see poor Cassio dressed','see that poor Cassio’s wounds are dressed')]}
for (c,i),rr in e.items():
 for a,b in rr:replace(E,c,i,a,b)
cues={'within':('Uden for scenen','Offstage'),'to othello':('Til Othello','To Othello'),'to brabantio':('Til Brabantio','To Brabantio'),'aside':('Afsides','Aside'),'to desdemona':('Til Desdemona','To Desdemona'),'sings':('Synger','Sings'),'singing':('Synger','Singing'),'aside to him':('Afsides til Roderigo','Aside to Roderigo'),'aside to roderigo':('Afsides til Roderigo','Aside to Roderigo'),'going':('På vej ud','Going'),'returning':('Kommer tilbage','Returning'),'snatching it':('River det til sig','Snatching it'),'kneels':('Knæler','Kneels'),'speaking lower':('Dæmper stemmen','Speaking more quietly'),'coming forward':('Træder frem','Stepping forward'),'a trumpet within':('En trompet lyder uden for scenen','A trumpet sounds offstage'),'reads':('Læser','Reads'),'to emilia':('Til Emilia','To Emilia'),'to lodovico and gratiano':('Til Lodovico og Gratiano','To Lodovico and Gratiano'),'to bianca':('Til Bianca','To Bianca'),'rising':('Rejser sig','Rising'),'to iago':('Til Iago','To Iago'),'they kiss':('De kysser hinanden','They kiss')}
anchors={(3,25):('Jeg havde ikke set Dem',"I didn't see you"),(3,68):('Og ædle signor','And, noble signior'),(4,89):('skal være den hårdeste','may be the greatest'),(6,4):('Kom, min elskede','Come, my dear love'),(9,172):('binder jeg mig her','I here engage'),(9,173):('Vær mine vidner','Witness,'),(10,23):('Åh, hvor','Oh, the hardness'),(11,51):('Hvis nu den bøn','Now, if this suit'),(11,115):('Hvad','What trumpet'),(14,47):('Hvem er I derhenne','Who are you there'),(14,96):('Det er i nat','This is the night'),(15,155):('_Syng pil','Willow, willow')}
vr=rd('source-witness-variants.json')
for x in vr:
 c,i=x['scene'],x['slot'];name=x['missingWitnessTokens']
 for k,B in enumerate((D,E)):
  v=get(B,c,i);q='['+cues[name][k]+'.] '
  if (c,i) in anchors:
   a=anchors[c,i][k];assert a in v,(c,i,a,v);v=v.replace(a,q+a,1)
  elif (c,i)==(6,30):v=q+v
  else:s,b=v.split('. ',1);v=s+'. '+q+b
  put(B,c,i,v)
wr('modern-da.json',D);wr('modern-en.json',E)
