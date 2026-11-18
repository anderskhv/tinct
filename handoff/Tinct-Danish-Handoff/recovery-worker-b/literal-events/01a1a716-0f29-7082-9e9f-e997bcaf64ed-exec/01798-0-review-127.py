# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('komme ind ad hovedindgangen','komme indenfor')],2:[('hjelme','kasketter'),('alterets trin','trinene op til platformen foran alterrummet'),('messehagler og korkjoler','præstekjoler og liturgiske tunikaer'),('mængden af frakker','mængden af kjolefrakker'),('uniformer og fint klæde','uniformer og damask')],4:[('skammelbæreren','kirkesangeren'),('lilla messeklæde','lilla præstekjole'),('madame Lvov','madame Lvova'),('i en halv time ængsteligt ventet','i over en halv time forgæves ventet')],5:[('uden frakke eller vest','uden kjolefrakke eller vest')],8:[('sin krøllede skjortebryst','sit krøllede skjortebryst')],9:[('tage mine på','tage min skjorte på')],10:[('for længe siden, hvis overhovedet','for længe siden')],12:[('bragt ham frakken','bragt ham kjolefrakken')],17:[('op i vognen','op på fragtvognen')]}
EN={1:[('get in through the main entrance','get inside')],2:[('their helmets','their caps'),('the icon stand','the icon screen'),('the steps of the altar','the steps of the platform before the sanctuary'),('cassocks and surplices','cassocks and liturgical tunics'),('frock coats','tailcoats'),('uniforms and broadcloth','uniforms and damask')],4:[('the beadle','the church reader'),('her bridal mother','her ceremonial bridal mother'),('anxiously waiting for half an hour','waiting in vain for more than half an hour')],5:[('without coat or waistcoat','without tailcoat or waistcoat')],10:[('ages ago, if at all','ages ago')],12:[('brought him the coat','brought him the tailcoat')],17:[('into the van','onto the freight cart')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][126]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=127,paragraph=sn,before=a,after=b,reason='Russian V.III full comparison: caps not helmets, icon screen, platform, cassocks/tunics, tails/damask, church reader not stoolbearer, more than half hour, no if-at-all addition, freight cart, Danish agreement.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
