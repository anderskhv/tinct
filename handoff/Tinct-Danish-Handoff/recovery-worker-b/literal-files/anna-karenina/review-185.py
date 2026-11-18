import json,pathlib
p=pathlib.Path(__file__).parent
DA={1:[('kan kaldes for retten','har været under efterforskning')],3:[('farvede bakkenbarter','farvet overskæg'),('gøre ud af','forstå')],4:[('og vakte i opposition den samme hævngerrighed','og som modreaktion vakte det samme vrede')],6:[('ophidselsens tilstand','ophidset tilstand'),('smuttede han ind i det andet værelse','gik han, uden at vente på debattens afslutning, ind i det andet værelse'),('vaske porcelænet','tørre servicet af'),('en gråskægget tjener','en tjener med grå bakkenbarter')],7:[('Dmitrievitj','Dmitritj')],10:[('blev rød som en blomme','rødmede'),('at han også burde have stukket venstre hånd ind, og så stak han den ind','at han burde have taget kuglen i venstre hånd, og så stak han den hånd ind')],14:[('et eller andet jaget dyr, der ser, at det er på det, der er','et jaget dyr, der ser, at det står ilde til'),('tilsynsforretning','værgemålssag'),('gamle godsens livegne, der var forblevet tro mod deres herre','tidligere livegne, som var blevet hos samme herre'),('ægte, varme ord','myndige, venlige ord')],20:[('i en kane','i en hyrevogn')]}
EN={1:[('liable to be called up for trial','having been under investigation')],3:[('dyed whiskers','a dyed mustache')],6:[('he slipped off into the other room','without waiting for the debate to end, he went into the other room'),('washing the crockery','wiping the crockery')],10:[('he should have put his left hand in too','he should have taken the ball in his left hand')],14:[('old house serfs who had stayed loyal to their master','former serfs who had stayed with the same master'),('genuine, warm words','imposing, kindly words')],20:[('in a sledge','in a hired carriage')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.load(open(f));rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.load(open(rf));c=d['chapters'][184]
 if lang=='da':
  for sn,t in enumerate(c['paragraphs'],1):
   if 'Sviazjskij' in t:changes.setdefault(sn,[]).insert(0,('Sviazjskij','Svijazjskij'))
 for sn,pairs in changes.items():
  for a,b in pairs:
   assert a in c['paragraphs'][sn-1],(lang,sn,a)
   c['paragraphs'][sn-1]=c['paragraphs'][sn-1].replace(a,b);r.append(dict(chapter=185,paragraph=sn,before=a,after=b,reason='Russian VI.XXVIII: investigation not liability for trial, mustache, omitted departure before debate ends, vote hand, hunted animal broken Danish, hired carriage not sledge.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
(p/'SOURCE-NOTES-185.txt').write_text('Full Russian VI.XXVIII DA EN read.185.1 statute literal having been under investigation, not may be called for trial; fictional historical quote.185.10 source elliptical засунуть в левую руку implies taking ball in left hand before inserting hand; repaired previous mere both-hands requirement. Historical box procedure specialist followup.185.14 severe Danish gibberish hunted animal repaired; no invented loyalty inference about former serfs.185.20 извозчик hired cab not specified sledge.185.6 departure before debate end omitted restored. Native pending.\n')
