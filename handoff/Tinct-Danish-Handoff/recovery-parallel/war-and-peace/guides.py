from collate import *
def walk(a,b,path=''):
 if isinstance(a,dict):
  for k in a:yield from walk(a[k],b[k],path+'/'+k)
 elif isinstance(a,list):
  for i,(x,y) in enumerate(zip(a,b)):yield from walk(x,y,path+'/'+str(i))
 elif a!=b:yield dict(field=path,before=a,after=b)
ledger={}
for lang in ['da','en']:
 p='upstream/war-and-peace'+('.da' if lang=='da' else '')+'.json'
 base=read(p);g=copy.deepcopy(base)
 if lang=='da':
  g.update(title='Krig og fred',author='Lev Tolstoj',length='15 bøger og to epiloger',openingChapterLabel='Første bog, kapitel 1 · Sankt Petersborg, 1805',openingText=read('modern-da.json')['chapters'][0]['paragraphs'][0].removeprefix('[På fransk] '),about='I juli 1805 holder Anna Pavlovna selskab i Sankt Petersborg. Hun vil vide, om Rusland skal i krig, og hvem der vil gifte sig med hvem. De to spørgsmål kommer til at gribe langt ind i hinanden. Pierre arver en formue, men ved stadig ikke, hvad han skal stille op med sit liv. Vennen Andrej drager i krig for at udmærke sig. Hos familien Rostov i Moskva vokser Natasja op blandt gæster og søskende, mens Andrejs søster Marja lever på landet under en far, der hvert øjeblik kan fare op.\n\nTolstoj arbejdede på bogen fra 1863 til 1869. Hans kone Sofja renskrev manuskriptet undervejs. De første dele udkom fra 1865 i tidsskriftet Russkij vestnik. Her er værket delt i femten bøger og to epiloger. I den første epilog møder vi familierne igen i 1820. I den anden tager Tolstoj spørgsmålet om fri vilje op: Hvad vil det egentlig sige, at et menneske har fået noget til at ske?')
  angles=[
   ('Pierre vil finde fred','Pierre prøver både et rigt selskabsliv og frimurernes broderskab. I fangenskabet møder han en mand, der kan dele en kartoffel med en fremmed.','Jeg vil følge med i, hvad Pierre leder efter, og hvad han faktisk finder.'),
   ('Hvem bestemmer på slagmarken?','Napoleon giver en ordre. Mens rytteren bærer den frem, har slagmarken forandret sig. Tolstoj følger både kejseren og manden, der skal lystre ham.','Jeg vil se, hvor langt en ordre rækker, når slaget først er i gang.'),
   ('Når Natasja kommer ind','Ved sit første store bal venter Natasja på, at nogen byder hende op. Senere sidder hun ved en sårets seng. Begge gange får vi tid til at mærke, hvad det betyder for hende at være netop dér.','Jeg vil følge Natasja fra pigeårene til hendes eget familieliv.'),
   ('Borodino gennem Pierres briller','Pierre dukker op på slagmarken i hvid hat. Han ser ting, som en officer ville overse, og forstår meget lidt af det, en artillerist tager for givet.','Jeg vil se, hvordan slaget tager sig ud for dem, der selv står i det.')]
  for card,row in zip(g['angleCards'],angles):card.update(zip(('title','text','angleObjective'),row))
  descriptions=[
   'En greves uægte søn, nyankommet fra udlandet. I salonen står han klodset og nærsynet og mener oprigtigt hvert ord, han siger. En stor arv gør ham pludselig til et eftertragtet parti. Han gifter sig med Hélène, udkæmper en duel og slutter sig til frimurerne. Under den franske besættelse af Moskva bliver han taget til fange og møder soldaten Platon Karatajev.',
   'Tretten år gammel stormer hun ind blandt de voksne med en dukke i hånden og latteren lige bag tænderne. Hun synger, danser, forelsker sig og sårer mennesker, hun holder af. Senere ser vi hende pleje en døende og til sidst selv være mor til fire.',
   'En stolt ung mand, der keder sig i selskabslivet. Han forlader sin gravide kone for at vinde hæder i krigen. Såret ved Austerlitz ser han op i den høje himmel og undrer sig over, at hæderen betød så meget. Han når hjem, mens hans kone er i fødsel. Senere bliver han forlovet med Natasja og såres dødeligt ved Borodino.',
   'Kejseren kan lide at se sine ordrer ført ud i livet. Ved Borodino ser han ud over røgen gennem sin kikkert. Længere fremme har tropperne allerede kæmpet om en bro og brændt den, før han giver ordre til, at de skal gå over.',
   'Den aldrende russiske øverstkommanderende falder i søvn under et krigsråd og får mere end én officer til at tvivle på sin duelighed. Da tiden kommer til at vælge mellem Moskva og hæren, tager han ansvaret for at rømme byen.',
   'Andrejs søster læser geometri med sin frygtindgydende far, beder og tager imod pilgrimme. Efter hans død, da franskmændene nærmer sig, står hun alene over for godsets bønder. Her krydser hendes vej Nikolaj Rostovs.']
  for card,desc in zip(g['cast'],descriptions):card['description']=desc
  g['cast'][3]['role']='Den franske kejser';g['cast'][4]['role']='Hærføreren'
  why=[('Hvem vandt slaget?','På kortet kan en pil vise, hvor et regiment skulle gå hen. Ved Borodino flygter mænd fremad eller bagud, alt efter hvor de tror, der er størst chance for at overleve. Da de når ud af ilden, samler officererne dem og sender dem ind igen. Det er den slags bevægelser, Tolstoj vil have historikerne til at forklare.'),('Et menneske kan nå at forandre sig','Natasja er tretten, da hun bryder ind i de voksnes samtale i Moskva. I den første epilog har hun fire børn. Når Pierre vender hjem, eller et sygt barn får det bedre, kan den gamle ild i hendes ansigt stadig blusse op. Tolstoj giver os både tiden, der er gået, og øjeblikket, hvor vi genkender hende.'),('Hvordan skal man leve?','For Andrej kan et blik op mod himlen forandre alt. Bagefter skal han stadig hjem og leve med dem, han forlod. Pierre har fundet trøst hos sin medfange Platon Karatajev, men mange år senere kan en samtale om politik ved familiens tebord stadig sætte hans sind i brand.')]
  for card,(t,b) in zip(g['whyItMatters'],why):card.update(title=t,body=b)
  g['acclaim'][0]['quote']='Tilbage er den største af alle romanforfattere – for hvad kan vi ellers kalde forfatteren til Krig og fred?'
 else:
  g.update(length='15 books and two epilogues',openingChapterLabel='Book One, Chapter 1 · St. Petersburg, 1805',openingText=read('modern-en.json')['chapters'][0]['paragraphs'][0].removeprefix('[Speaking in French] '))
  g['about']=g['about'].replace('it ends fifteen years later in a quiet country household with the survivors raising children','the family story reaches 1820, before a second epilogue takes up history and free will').replace('who copied the manuscript by hand seven times','who made fair copies as he revised').replace('He published it serially in The Russian Messenger from 1865.','Early installments appeared in The Russian Messenger from 1865.').replace('in four volumes plus two long epilogues','here divided into fifteen books and two epilogues').replace('He was in his thirties, just married, and had begun the spiritual searching that would eventually push him out of fiction altogether. ','')
  g['cast'][0]['description']=g['cast'][0]['description'].replace('returned from Paris','returned from abroad').replace('unexpected death of his father','death of his father').replace('watches the burning of Moscow as a French prisoner','witnesses the fire in Moscow and falls into French hands')
  g['cast'][1]['description']=g['cast'][1]['description'].replace("dancing in a corridor in her parents' Moscow house","bursting into the room at her parents’ Moscow house with a doll").replace('as she','as she').replace('as a','as a').replace('at thirty','as a mother of four')
  g['cast'][2]['description']=g['cast'][2]['description'].replace('He returns home to find his wife has died in childbirth.','He reaches home while his wife is in labor. She dies that night.')
  g['whyItMatters'][1]['body']=g['whyItMatters'][1]['body'].replace('by the second epilogue','by the first epilogue').replace('who has stopped singing','who rarely sings now')
  g['whyItMatters'][2]['body']=g['whyItMatters'][2]['body'].replace('at the second epilogue','in the first epilogue')
  g['acclaim'][0]['quote']='There remains the greatest of all novelists—for what else can we call the author of War and Peace?'
 put('onboarding-'+lang+'.json',g);ledger['onboarding-'+lang]=list(walk(base,g))
 primer=read('input/primer-'+lang+'.json');candidate=copy.deepcopy(primer)
 if lang=='da':candidate['people'][0]['name']='Pierre Bezukhov'
 put('primer-'+lang+'.json',candidate);ledger['primer-'+lang]=list(walk(primer,candidate))
put('guide-changes.json',ledger)
