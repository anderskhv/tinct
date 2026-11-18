# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('glædesrædsel','glad ængstelse')],2:[('slåningen','høslåningen')],3:[('en firspand','et firspand'),('holdende huebåndene i begge hænder, tænkende rasende på et eller andet','med kysens bindebånd i begge hænder, helt fordybet i tanker om et eller andet')],4:[('frygtelig ufiks','frygtelig pjusket')],5:[('Hvor pænt','Hvor dejligt'),('rystende bryst','krop, der rystede af latter')],9:[('blot tomt','bare ubetydeligt')],13:[('Konstantin Dmitrievitj','Konstantin Dmitritj')],14:[('vidunderligt, ædelt','vidunderligt, helt dejligt')],15:[('Jeg er ked af det, jeg er ked af det','Jeg tog fejl, jeg tog fejl')]}
EN={3:[('strings of your cap','ties of your bonnet')],5:[('shaking chest','body shaking with laughter')],13:[('Konstantin Dmitrievitch','Konstantin Dmitritch'),('about Turovtsin in the scarlet fever','about Turovtsin during the scarlet fever')],14:[('wonderful, noble','wonderful, lovely')],15:[("I'm sorry, I'm sorry","I was wrong, I was wrong")]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][111]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=112,paragraph=sn,before=a,after=b,reason='Russian IV.XI full comparison: body laughing, bonnet ties, affectionate shortened patronymic, concession of wrong judgment, modern Danish.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
