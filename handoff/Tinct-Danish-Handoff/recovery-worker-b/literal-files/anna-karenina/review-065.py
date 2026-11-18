# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('med opslåede parasoller','med deres paraplyer')],2:[('den moskovitiske oberst','obersten fra Moskva')],4:[('_belle-sœur_','svigerinde')],7:[('_engouements_','begejstrede sværmerier'),('med sin ledsager og en tysk læge, alle tre talende meget højlydt og vredt','med sin ledsagerske og en tysk læge, som han talte højt og vredt med')],8:[('lægen råbte også','lægen blev også ophidset')],14:[('spurgte Kitty','spurgte Kitty glad')],16:[('Der ser du, mama','Der kan De se, mama'),('Du undrer dig','De undrer Dem')],17:[('Levin og hans ledsager','Levin og hans ledsagerske'),('sine andre _protégés_','de andre, hun tog sig af')],25:[('_sa compagne_','hans ledsagerske')],26:[('_belle-sœur_','svigerinde')],34:[('trykte langsomt og tavst sin nye venindes hånd','holdt længe sin nye venindes hånd i et tavst tryk')],37:[('et barn af en patient','døtre af en patient')]}
EN={1:[('the invalids, parasols up,','the patients, with their umbrellas,')],4:[('_belle-sœur_','sister-in-law')],7:[('_engouements_','enthusiasms'),('with his companion and a German doctor, all three talking very loudly and angrily','with his companion and a German doctor to whom he was speaking loudly and angrily')],8:[('the doctor was shouting too','the doctor was growing heated too')],14:[('Kitty asked','Kitty asked joyfully')],17:[('her other _protégés_','the others in her care')],25:[('_sa compagne_','his companion')],26:[('_belle-sœur_','sister-in-law')],34:[('slowly and silently, pressed her new friend\'s hand','silently held her new friend\'s hand in a long clasp')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][64]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=65,paragraph=sn,before=a,after=b,reason='Russian PartII.XXXI full comparison: umbrellas not parasols, Levin alone speaking to doctor not all three, joy restored, Kitty formal address mother, French meanings made accessible, long clasp not slow, two daughters not one child.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
