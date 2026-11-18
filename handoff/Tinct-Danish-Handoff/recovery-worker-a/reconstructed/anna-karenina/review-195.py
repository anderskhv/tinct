import json,pathlib
p=pathlib.Path(__file__).parent
DA={1:[('De er måske ikke hjemme?','De tager måske ikke imod besøg?'),('Bolas','Bols')],2:[('Jo, de er','Jo, det gør de'),('overfrakke','pels')],4:[('Bola','Bol'),('smilte','smilede')],5:[('sjælemessen','mindegudstjenesten')],13:[('de havde hørt hundrede gange','han havde hørt hundrede gange'),('Bola','Bol'),('kultur','belysningen'),('Turin','Tjurin')],21:[('Sviazjskij','Svijazjskij'),('dommen over en udlænding, der var blevet dømt i Rusland','den forestående straf til en udlænding, der havde været for retten i Rusland')],22:[('en karpe','en gedde'),('en avisartikel','en avisføljeton')]}
EN={1:[("Maybe they're not at home?","Perhaps they aren't receiving visitors?"),('Bola','Bol')],2:[('They are;','They are receiving;'),('overcoat','fur coat')],4:[('Bola','Bol')],5:[('funeral service','memorial service')],13:[('what they had heard a hundred times','what he had heard a hundred times'),('Bola','Bol'),('about culture','about the lighting'),("Turin's","Tyurin's")],21:[('the sentence handed down on a foreigner who had been condemned in Russia','the punishment awaiting a foreigner who had stood trial in Russia')],22:[('a carp','a pike'),('a newspaper article','a newspaper feuilleton')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.load(open(f));rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.load(open(rf));c=d['chapters'][194]
 for sn,pairs in changes.items():
  for a,b in pairs:
   assert a in c['paragraphs'][sn-1],(lang,sn,a)
   c['paragraphs'][sn-1]=c['paragraphs'][sn-1].replace(a,b);r.append(dict(chapter=195,paragraph=sn,before=a,after=b,reason='Russian VII.VI: receiving visitors convention, Levin heard opinion not ladies, lighting not culture, pike not carp, pending punishment, countess name.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
(p/'SOURCE-NOTES-195.txt').write_text('Full Russian VII.VI DA EN read.195.1 receivingvisitors notnecessarilyathome;195.13 HEheard100times,notladiesheard; освещение lighting notculture.195.22 щука pike/gedde notcarp, Krylovfableguide needed.195.21 forthcomingpunishment notalreadyhandedsentence.195.5 панихида Orthodoxmemorialservice notmass.195.13 Tyurinvenueidentityresearchpending.195.22 feuilleton newspapercolumn genre, Danishføljeton mayneedclarifyingguide notserializedfictionclaim. Native pending.\n')
