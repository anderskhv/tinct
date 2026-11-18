# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={3:[('og ikke kommet nogen vegne','uden at komme nogen vegne')],4:[('et bredere syn på kunsten','et mere ophøjet syn på kunsten')],5:[('mere end hjertelig','mere end høflig'),('dryppe fornuftige idéer om kunst ind i Mikhajlov','indpode Mikhajlov de rette forestillinger om kunst'),('gad ikke skændes med ham','modsagde ham ikke')],7:[('en velhavende mand på toppen af samfundet','en velhavende hofmand')],10:[('der ikke var nogen at standse Vronskij i','man ikke kunne forbyde Vronskij'),('som den elskede kælede','som den forelskede kælede'),('ville det skuffe den elskende','ville det være ubehageligt for den forelskede'),('den slags afsky','den slags ubehag'),('latterligt og rasende','latterligt og irriterende')],12:[('en deling af jorden','en deling af ejendommen')]}
EN={4:[('a broader outlook on art','a more elevated view of art')],5:[('more than cordial','more than polite'),('to drip sound ideas about art into Mihailov','to instill proper ideas about art in Mihailov'),("didn't bother to argue with him","did not contradict him")],7:[('a wealthy man at the top of society','a wealthy courtier')],10:[('it would disgust the lover','it would be unpleasant for the lover'),('the kind of disgust Mihailov felt','the kind of unpleasant feeling Mihailov had')],12:[('a division of the land','a division of the property')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][136]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=137,paragraph=sn,before=a,after=b,reason='Russian V.XIII full comparison: elevated not broader art view, politeness not warmth, no contradiction not motive refused argument, courtier, unpleasantness not disappointment, property not only land; Danish syntax.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
